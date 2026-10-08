# tilefit: automatic tile placement

Places every room sprite in `web/assets/img/fullmap/*.png` on the clean Pharloom map
(`full_pharloom_clean.webp`, 4096 x 4096) and publishes the reviewed
`web/assets/img/fullmap/tile_coordinates.json` and `scene_tiles.json` that the timeline and
map viewer read. It replaced the older manual pipeline (`merge_all_tiles.py`); the old
human confirmations in `tools/confirmed_tiles.json` live on as locks.

```bash
pip install opencv-python numpy easyocr   # easyocr only for the OCR stage
python tools/tilefit/run_all.py --skip-candidates   # ~15 min; drop the flag for a full redo
```

Then review in the viewer through the review server, which saves every verdict to
`review.json`:

```bash
python tools/tilefit/review_server.py   # http://localhost:5177/tilefit_viewer.html
```

`web/tilefit_viewer.html` also opens read-only from any static server.

## Idea

The clean map is a composite of the room sprites. Every sprite is drawn at **one global
scale (0.767)** and tinted with its area colour. A tint is a per-channel gain on the
sprite's grey levels, so normalised cross-correlation on brightness is tint-invariant.
The only unknown per tile is its position.

The old matcher searched scales in 0.1 steps (0.8, 0.9, 1.1, 1.3). Every tile, including
those confirmed at 0.9 to 1.3, peaks at 0.765 to 0.770, so those scales were artefacts.

Shape alone cannot tell apart plain corridors, repeated shapes (bellshrines, stacked
bars) or tiny connector pieces. The solver adds four priors:

| Term | What it encodes |
|---|---|
| tint | Map colour under the tile matches its area (learnt from unique matches) |
| overlap | Pixels already claimed by a tile of *another* scene are penalised. A scene's own pieces (`X`, `X_top`) may stack |
| label | The OCR'd scene label on the community map (`silksong_fullmap.png`) lies in or next to the tile |
| family | A piece (`X_left`) touches an already placed piece of scene `X` |

A fifth term, **void**, penalises sprite pixels that land on pure-black map (outside every
room): correct fits put at most 11 % of their drawn pixels there, wrong ones 70-97 %.

Placement is greedy in rounds. A tile is committed only when it clearly beats its best
non-overlapping alternative. Committed pixels then remove slots for the next round.

## Stages

| Script | Output (`out/`, published to `web/assets/img/fullmap/tilefit/`) |
|---|---|
| `match_candidates.py` | `candidates.json`: top NCC peaks per tile |
| `ocr_labels.py` | `labels.json`: scene labels in clean-map coordinates |
| `solve.py` | `tile_fit.json` (+ `fit_report.txt`): position and status per tile |
| `coverage.py` | `uncovered.json/png`: map rooms no tile covers; `labels_inside` per tile |
| `merge.py` | `tile_coordinates.json` in the **old schema**: fit plus old confirmations |
| `scene_tiles.py` | `scene_tiles.json`: scene -> reviewed sprites, by `scene_aliases.json`, exact name, case-insensitive name, then the longest known scene the sprite name starts with (`Bone_East_15_left` -> `Bone_East_15`) |
| `scale_check.py` | `scale_check.json`: best uniform and x/y scale per reviewed tile (diagnostic) |
| `lock_confirmed.py` | `confirmed_locks.json` (next to the scripts): old confirmations the fit agrees with become locks; the rest are listed as `disputed` |
| `contact_sheet.py` | Diagnostic image: tile, old spot, chosen spot, labeled-map crop |

Statuses in `tile_fit.json`:
- `placed`: unique, confident.
- `weak`: confident but NCC < 0.70.
- `ambiguous`: an equally good alternative exists.
- `detached`: a piece placed far from the rest of its scene.
- `unmatched`: nowhere on the clean map (alternate states, secret areas, art that differs from the map).
- `too_small`: under 4 px or blank.
- `reviewed`: fixed by a verdict (below).
- `removed`: removed by a verdict; never published.

## Owner review

`review.json` holds the owner's verdicts and `confirmed_locks.json` the old confirmations
the fit agreed with; `solve.py` applies both before its first round (review.json wins), so
reviewed tiles claim their slots and anchor the rest. Verdicts:

| Verdict | Effect |
|---|---|
| `lock` `{x, y}` | Fixed top-left position (clean-map px) |
| `search` `{box: [x0, y0, x1, y1]}` | Best match whose top-left lies inside the box |
| `remove` | Never placed or published, even with an old confirmation |

Viewer keys: C correct (lock here), R lock at the runner-up, X remove, M move (drag or
arrows, Shift = 10 px), U clear, N next tile without a verdict.

Every tile has a verdict as of this commit: 739 positioned, 92 removed, so the published
`tile_coordinates.json` is fully reviewed.

## Results (sample run, 831 tiles)

| | Old pipeline | tilefit |
|---|---|---|
| Tiles with a position | 669 | 780 (merged file) |
| Confirmed / placed | 629 | 702 placed + 26 old confirmations re-fitted |
| Previously rejected tiles now placed | - | 51 |
| Never-placed tiles now placed | - | 56 |
| Map room pixels covered by tiles | - | 98.1 % |

- **Agreement:** 597 of 629 old confirmations agree within 25 px. The other 32 moved.
- **Moves verified:** every confidently moved tile checked against the labeled map was a fix (e.g. `Cog_05_left`, `Bone_East_15`, `Cog_08_top`, `Library_05`, `Ant_17`).

## Findings worth knowing

- **Sprite names are not always scene names.** Sprite `Dock_01b` sits in the room the
  labeled map calls `Dock_08`, with NCC 0.97. `labels_inside` in `tile_fit.json` gives a
  sprite-to-scene mapping independent of file names.
- **Most "no tile PNG" scenes are naming, not missing art.** Only about 2% of the map's
  room pixels are uncovered.
- **Timeline matching bug.** `exploration_timeline.html#getTileBaseName` strips
  `_mid/_right/...` from tile names but compares against unstripped scene names, so
  `Arborium_11_mid` never matches `Arborium_11_mid.png`. Also accepting the exact full
  name raises revealed scenes for the sample save from 416 to 532 of 686 (new
  coordinates), or 393 to 482 (old coordinates).
