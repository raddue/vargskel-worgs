"""Make generated 2:1 maps wrap on a sphere, then write webp and a sphere preview.

Run: python3 tools/fix-planet-maps.py /tmp/holomap-art/<name>-s<seed>.png [...]
Writes <same>.fixed.webp (1024x512) and <same>.sphere.jpg (front + back view).
"""
import sys
import numpy as np
from PIL import Image

OUT_W, BAND, POLE = 1024, 0.08, 0.07

def wrap(a):
    """Crossfade the right edge strip into the left so column 0 continues the last column."""
    w = a.shape[1]; b = int(w * BAND)
    t = np.linspace(0, 1, b)[None, :, None]
    left = a[:, :b] * t + a[:, w - b:] * (1 - t)
    return np.concatenate([left, a[:, b:w - b]], axis=1)

def poles(a):
    """Fade the top and bottom rows to their mean colour so the poles do not pinch."""
    h = a.shape[0]; p = int(h * POLE)
    for rows in (slice(0, p), slice(h - p, h)):
        band = a[rows]; mean = band.mean(axis=(0, 1))
        r = np.linspace(1, 0, p) if rows.start == 0 else np.linspace(0, 1, p)
        k = (r ** 2)[:, None, None]
        a[rows] = band * (1 - k) + mean * k
    return a

def sphere(tex, size=384, lon0=0.0):
    """Orthographic lit sphere sampled from an equirect texture."""
    y, x = np.mgrid[-1:1:size * 1j, -1:1:size * 1j]
    r2 = x * x + y * y; inside = r2 <= 1
    z = np.sqrt(np.clip(1 - r2, 0, 1))
    lon = (np.arctan2(x, z) + lon0) % (2 * np.pi); lat = np.arcsin(np.clip(-y, -1, 1))
    th, tw = tex.shape[:2]
    u = (lon / (2 * np.pi) * tw).astype(int) % tw
    v = np.clip(((0.5 - lat / np.pi) * th).astype(int), 0, th - 1)
    lit = np.clip(0.25 + 0.85 * (x * -0.5 + -y * 0.4 + z * 0.77), 0, 1)
    img = tex[v, u] * lit[..., None]
    img[~inside] = 0
    return img

for path in sys.argv[1:]:
    a = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)
    a = poles(wrap(a))
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8)).resize((OUT_W, OUT_W // 2), Image.LANCZOS)
    stem = path.rsplit(".", 1)[0]
    im.save(stem + ".fixed.webp", quality=82, method=6)
    t = np.asarray(im, dtype=np.float32)
    # front, and back view centred on the old seam, so a bad wrap shows
    pair = np.concatenate([sphere(t), sphere(t, lon0=np.pi)], axis=1)
    Image.fromarray(pair.clip(0, 255).astype(np.uint8)).save(stem + ".sphere.jpg", quality=85)
    print(stem + ".fixed.webp")
