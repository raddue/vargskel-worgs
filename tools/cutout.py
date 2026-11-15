"""White-background isolate -> RGBA cutout, so Hi3DGen skips its BiRefNet download.
Alpha = distance from white, flood-limited to the border-connected background.
Run: python cutout.py IN.png OUT.png
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

a = np.asarray(Image.open(sys.argv[1]).convert("RGB"), dtype=np.int16)
near_white = (255 - a).max(axis=2) < 18
lab, _ = ndimage.label(near_white)
edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, edge[edge > 0])
alpha = ndimage.gaussian_filter((~bg).astype(np.float32), 0.8)  # soft 1px edge
out = np.dstack([a.astype(np.uint8), (alpha * 255).astype(np.uint8)])
Image.fromarray(out, "RGBA").save(sys.argv[2])
print(sys.argv[2], f"{(~bg).mean():.0%} subject")
