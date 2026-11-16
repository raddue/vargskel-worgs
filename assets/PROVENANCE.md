# Asset provenance

Every generated asset is listed with how it was made, so the public repo accounts for its art (#32).

## assets/maps/ — 3D holomap surface maps (1024×512 equirectangular webp)

Generated locally with ComfyUI, model `flux-2-klein-base-9b-fp8` (text encoder
`qwen_3_8b_fp8mixed`, VAE `flux2-vae`), 2048×1024, 24 steps, CFG 5.0, euler. Exact prompts,
negative prompt and seeds are in `tools/gen-planet-maps.py`; reproduce with
`python3 tools/gen-planet-maps.py <name>`, then `python3 tools/fix-planet-maps.py <png>`
(edge wrap crossfade, pole fade, resize, webp q82).

| File | Seed | Picked | Notes |
|---|---|---|---|
| `maps/cressidium.webp` | 61 | 2026-10-21 | palette matched to `nov-elysia.png`, greener per operator |
| `maps/pell.webp` | 11 | 2026-10-21 | |
| `maps/tarn.webp` | 23 | 2026-10-21 | |

## Older location plates (`assets/<id>.png`, `-thumb.webp`)

Per operator on #32 (2026-10-20): generated with an image model through 9router. Model, prompt and
seed were not recorded. Record them here if they turn up.

## assets/models/ — 3D holomap hull models (GLB, ~12k faces, no texture, unit-scaled, centred)

Two local steps, both recorded in scripts:
1. `tools/gen-ship-isolates.py`: Qwen-Image-Edit-2509 (Q4_K_M GGUF, ComfyUI) redraws the hull from
   `assets/<id>.png` alone on white. Prompt, negative and seeds are in the script.
2. `tools/gen-ship-meshes.sh`: `tools/cutout.py` makes the white transparent, Hi3DGen
   (Stable3DGen, MIT, trellis-normal-v0-1, mesh seed 42) builds the mesh, and `tools/slim-mesh.py`
   decimates, centres and scales it.

| File | Source plate | Isolate seed | Picked |
|---|---|---|---|
| `models/kessen.glb` | `kessen.png` | 19 | 2026-10-21 |
| `models/harrow.glb` | `harrow.png` | 19 | 2026-10-21 |
| `models/rio.glb` | `rio.png` | 7 | 2026-10-21 |
