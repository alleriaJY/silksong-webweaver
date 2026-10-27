"""
Local server for reviewing tilefit placements: serves the review page
(tools/tilefit/viewer.html, not part of the website) at /tilefit_viewer.html, the
source sprites from tools/tilefit/sprites/ and the other map assets from web/, and lets the page save verdicts straight into
tools/tilefit/review.json.

  GET  /api/review              -> {"tiles": {...}} current review.json entries
  POST /api/review              -> body {"name": "<tile.png>", "entry": {...} | null}
                                   sets (or with null, clears) one verdict

Binds to 127.0.0.1 only. Run, then open http://localhost:5177/tilefit_viewer.html
Usage: python tools/tilefit/review_server.py [--port 5177]
"""

import argparse
import json
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

from common import PUBLISHED_DIR, ROOT, SPRITES_DIR, tile_files

HERE = Path(__file__).resolve().parent
REVIEW = HERE / "review.json"
WEB = ROOT / "web"
VERDICTS = {"remove", "lock", "search"}
DOC = ("Owner review of tilefit placements, applied by solve.py on every run. "
       "remove: never placed or published. lock: fixed top-left x,y (clean-map px). "
       "search: placed at the best match whose top-left lies inside box [x0, y0, x1, y1].")
_lock = threading.Lock()
_tiles = set(tile_files())


def load():
    if not REVIEW.exists():
        return {"_doc": DOC, "tiles": {}}
    return json.loads(REVIEW.read_text(encoding="utf-8"))


def validate(name, entry):
    if name not in _tiles:
        raise ValueError(f"unknown tile {name!r}")
    if entry is None:
        return None
    verdict = entry.get("verdict")
    if verdict not in VERDICTS:
        raise ValueError(f"bad verdict {verdict!r}")
    clean = {"verdict": verdict}
    if verdict == "lock":
        clean["x"], clean["y"] = int(entry["x"]), int(entry["y"])
        clean["from"] = str(entry.get("from", "viewer"))[:40]
    elif verdict == "search":
        box = [int(v) for v in entry["box"]]
        if len(box) != 4 or box[0] > box[2] or box[1] > box[3]:
            raise ValueError("box must be [x0, y0, x1, y1]")
        clean["box"] = box
    if entry.get("note"):
        clean["note"] = str(entry["note"])[:300]
    return clean


def save(name, entry):
    with _lock:
        data = load()
        tiles = data.setdefault("tiles", {})
        if entry is None:
            tiles.pop(name, None)
        else:
            tiles[name] = entry
        data["tiles"] = dict(sorted(tiles.items()))
        tmp = REVIEW.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(data, indent=1) + "\n", encoding="utf-8")
        os.replace(tmp, REVIEW)
        return data


VIEWER = HERE / "viewer.html"
PUBLISHED_URL = "/assets/img/fullmap/tilefit/"   # where viewer.html asks for the outputs
SPRITES_URL = "/assets/img/fullmap/"               # viewer.html asks for <tile>.png here


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # the review page lives with the tools; everything else comes from web/
        clean = unquote(path.split("?")[0])
        if clean in ("/", "/tilefit_viewer.html"):
            return str(VIEWER)
        if clean.startswith(PUBLISHED_URL):               # review outputs, kept out of web/
            rel = Path(clean[len(PUBLISHED_URL):])
            if ".." in rel.parts:
                return str(PUBLISHED_DIR / "__invalid__")
            return str(PUBLISHED_DIR / rel)
        if clean.startswith(SPRITES_URL) and clean.endswith(".png"):   # source sprites, kept out of web/
            rel = Path(clean[len(SPRITES_URL):])
            if len(rel.parts) == 1:
                return str(SPRITES_DIR / rel)
        return super().translate_path(path)

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache")   # always show the latest tilefit output
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == "/api/review":
            with _lock:
                return self._json(200, load())
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/review":
            return self._json(404, {"error": "not found"})
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > 64 * 1024:
                raise ValueError("body too large")
            req = json.loads(self.rfile.read(length))
            name = req["name"]
            data = save(name, validate(name, req.get("entry")))
            return self._json(200, {"ok": True, "count": len(data["tiles"])})
        except (ValueError, KeyError, TypeError, json.JSONDecodeError) as e:
            return self._json(400, {"error": str(e)})

    def log_message(self, fmt, *args):
        if self.path.startswith("/api/"):
            super().log_message(fmt, *args)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=5177)
    args = ap.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=str(WEB)))
    print(f"tilefit review: http://localhost:{args.port}/tilefit_viewer.html  (saves to {REVIEW})", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
