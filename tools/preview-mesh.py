"""Headless preview of holomap GLBs: three views per model, flat-shaded, no GPU.
Run: python preview-mesh.py OUT.jpg a.glb [b.glb ...]   (needs trimesh, numpy, PIL)
"""
import sys
import numpy as np
import trimesh
from PIL import Image, ImageDraw

S = 320
LIGHT = np.array([0.4, 0.7, 0.6]); LIGHT /= np.linalg.norm(LIGHT)

def rot(yaw, pitch):
    cy, sy, cp, sp = np.cos(yaw), np.sin(yaw), np.cos(pitch), np.sin(pitch)
    ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
    return rx @ ry

def view(m, yaw, pitch):
    v = m.vertices @ rot(yaw, pitch).T
    tri = v[m.faces]
    n = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
    shade = np.clip(np.abs(n @ LIGHT), 0, 1) * 0.8 + 0.2
    img = Image.new("RGB", (S, S), (8, 14, 20)); d = ImageDraw.Draw(img)
    for i in np.argsort(tri[:, :, 2].mean(axis=1)):  # painter's algorithm, far first
        c = int(255 * shade[i])
        pts = [((p[0] * 0.9 + 0.5) * S, (0.5 - p[1] * 0.9) * S) for p in tri[i]]
        d.polygon(pts, fill=(int(c * 0.55), int(c * 0.9), c))
    return img

out, paths = sys.argv[1], sys.argv[2:]
rows = []
for p in paths:
    m = trimesh.load(p, force="mesh")
    row = Image.new("RGB", (S * 3, S))
    for k, (y, x) in enumerate([(0.6, -0.35), (2.4, -0.2), (0, -1.45)]):
        row.paste(view(m, y, x), (k * S, 0))
    ImageDraw.Draw(row).text((6, 6), f"{p.rsplit('/', 1)[-1]}  {len(m.faces)} faces", fill=(200, 230, 255))
    rows.append(row)
sheet = Image.new("RGB", (S * 3, S * len(rows)))
for i, r in enumerate(rows):
    sheet.paste(r, (0, i * S))
sheet.save(out, quality=85)
print(out)
