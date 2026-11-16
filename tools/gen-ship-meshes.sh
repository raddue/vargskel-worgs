#!/usr/bin/env bash
# Step 2 of the 3D hull models: cut out the white background (tools/cutout.py), then Hi3DGen (local, MIT) turns each isolated hull into a mesh, then
# tools/slim-mesh.py decimates it for phones. Provenance: input picks and seeds below.
# Run: bash tools/gen-ship-meshes.sh   (free ComfyUI VRAM first: POST 127.0.0.1:8188/free)
set -euo pipefail
REPO=$(cd "$(dirname "$0")/.." && pwd)
H3=/mnt/coding/Coding/Stable3DGen
SLIM=/mnt/coding/Coding/Hunyuan3D-2.1/.venv-shape/bin/python
mkdir -p /tmp/holomap-art/mesh "$REPO/assets/models"
# id:isolate-seed  (picks from tools/gen-ship-isolates.py)
for pick in kessen:19 harrow:19 rio:7; do
  id=${pick%%:*}; s=${pick##*:}
  out=/tmp/holomap-art/mesh/$id
  "$H3/.venv-hi3dgen/bin/python" "$REPO/tools/cutout.py" "/tmp/holomap-art/iso-$id-s$s.png" "/tmp/holomap-art/cut-$id-s$s.png"
  [ -f "$out.glb" ] || (cd "$H3" && ./.venv-hi3dgen/bin/python run_hi3dgen.py "/tmp/holomap-art/cut-$id-s$s.png" "$out" 42)
  "$SLIM" "$REPO/tools/slim-mesh.py" "$out.glb" "$REPO/assets/models/$id.glb"
done
