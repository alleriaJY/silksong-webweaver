"""
Shared helpers for Silksong save tooling.

Mirrors wasm-crypto/src/lib.rs exactly: a .dat file is
    [25-byte header][Base64(AES-256-ECB(JSON), PKCS7)][1-byte trailer]
Keep HEADER_SIZE / ENCRYPTION_KEY in sync with lib.rs.
"""

import base64
import json
from pathlib import Path

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

ENCRYPTION_KEY = b"UKu52ePUBwetZ9wNX88o54dnfKRu0T1l"
HEADER_SIZE = 25
TRAILER_SIZE = 1

ROOT = Path(__file__).resolve().parent.parent
WEB_DATA_DIR = ROOT / "web" / "src" / "data"


class SaveFormatError(ValueError):
    """Raised when bytes are not a decryptable Silksong save."""


def decrypt_bytes(raw: bytes) -> dict:
    """Decrypt raw .dat bytes into the full save dict ({playerData, sceneData, ...})."""
    if len(raw) <= HEADER_SIZE + TRAILER_SIZE:
        raise SaveFormatError("Save file too small")
    body = raw[HEADER_SIZE:len(raw) - TRAILER_SIZE]
    try:
        cipher_bytes = base64.b64decode(body, validate=True)
    except (ValueError, TypeError) as e:
        raise SaveFormatError(f"Base64 decode failed: {e}") from e
    if not cipher_bytes or len(cipher_bytes) % AES.block_size:
        raise SaveFormatError("Ciphertext is not a whole number of AES blocks")
    try:
        plain = unpad(AES.new(ENCRYPTION_KEY, AES.MODE_ECB).decrypt(cipher_bytes), AES.block_size)
    except ValueError as e:
        raise SaveFormatError("Decryption failed - invalid padding or key") from e
    try:
        return json.loads(plain.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        raise SaveFormatError(f"Invalid JSON: {e}") from e


def encrypt_save(save: dict) -> bytes:
    """Inverse of decrypt_bytes. Header bytes are zeros; used for tests and fixtures only."""
    plain = json.dumps(save, separators=(",", ":")).encode("utf-8")
    cipher_bytes = AES.new(ENCRYPTION_KEY, AES.MODE_ECB).encrypt(pad(plain, AES.block_size))
    return bytes(HEADER_SIZE) + base64.b64encode(cipher_bytes) + b"\x0b"


def load_save(path) -> dict:
    """Load a save from .dat (decrypt) or .json (already decrypted)."""
    path = Path(path)
    if path.suffix.lower() == ".dat":
        return decrypt_bytes(path.read_bytes())
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data if "playerData" in data else {"playerData": data}


def player_data(save: dict) -> dict:
    return save.get("playerData", {}) or {}


def scene_entries(save: dict, kind: str = "persistentBools") -> list:
    return ((save.get("sceneData") or {}).get(kind) or {}).get("serializedList", []) or []
