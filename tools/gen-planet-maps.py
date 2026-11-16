"""Generate 2:1 equirectangular surface maps for the 3D holomap through local ComfyUI.

Provenance record: model, prompts and seeds below are exactly what produced assets/maps/*.
Run: python3 tools/gen-planet-maps.py [name ...]   (ComfyUI on 127.0.0.1:8188)
Seeds listed are the picks that shipped. Output /tmp/holomap-art/<name>-s<seed>.png; then
tools/fix-planet-maps.py makes <stem>.fixed.webp, copied to assets/maps/<name>.webp.
"""
import json, os, shutil, sys, time, urllib.request

HOST = "http://127.0.0.1:8188"
OUT = "/tmp/holomap-art"
MODEL = "flux-2-klein-base-9b-fp8.safetensors"
W, H, STEPS, CFG = 2048, 1024, 24, 5.0
STYLE = ("flat equirectangular projection texture map of an entire planet surface, full 360 degree "
         "cylindrical map, seen straight down, uniform lighting, no shadows, no terminator, no stars, "
         "no space background, no horizon, no perspective, edge to edge surface, seamless wrap")
NEG = ("planet sphere, globe, ball, space, stars, black background, horizon, perspective, sky, people, "
       "spaceships, text, labels, grid lines, latitude lines, border, frame, watermark, vignette")
ART = {
    # palette matched to assets/nov-elysia.png (the site's reference view of the world)
    "cressidium": ("earthlike ocean world, deep teal blue oceans with bright turquoise shallow shelves along coasts, "
                   "continents mostly covered in lush green forests, olive grasslands and dark green jungle, "
                   "with a few smaller sandy tan and ochre desert regions in the continental interiors, "
                   "burnt orange rocky coastal fringes in places, scattered island chains, small white polar ice caps "
                   "at top and bottom edges", [61]),
    "pell": ("airless grey moon, dense overlapping impact craters, dark basalt maria plains, "
             "light grey regolith highlands, bright ray craters", [11]),
    "tarn": ("frozen icy world, white snowfields and blue glacier ice, jagged dark grey rock mountain "
             "ranges, frozen pale blue lakes, wind-carved ice ridges", [23]),
}

def post(path, body):
    req = urllib.request.Request(HOST + path, json.dumps(body).encode(), {"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=30))

def gen(name, seed):
    pos = ART[name][0] + ", " + STYLE
    wf = {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": MODEL, "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_3_8b_fp8mixed.safetensors", "type": "flux2", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "flux2-vae.safetensors"}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"text": pos, "clip": ["2", 0]}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"text": NEG, "clip": ["2", 0]}},
        "6": {"class_type": "CFGGuider", "inputs": {"model": ["1", 0], "positive": ["4", 0], "negative": ["5", 0], "cfg": CFG}},
        "7": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "euler"}},
        "8": {"class_type": "Flux2Scheduler", "inputs": {"steps": STEPS, "width": W, "height": H}},
        "9": {"class_type": "RandomNoise", "inputs": {"noise_seed": seed}},
        "10": {"class_type": "EmptyFlux2LatentImage", "inputs": {"width": W, "height": H, "batch_size": 1}},
        "11": {"class_type": "SamplerCustomAdvanced", "inputs": {"noise": ["9", 0], "guider": ["6", 0], "sampler": ["7", 0], "sigmas": ["8", 0], "latent_image": ["10", 0]}},
        "12": {"class_type": "VAEDecode", "inputs": {"samples": ["11", 0], "vae": ["3", 0]}},
        "13": {"class_type": "SaveImage", "inputs": {"images": ["12", 0], "filename_prefix": f"holomap_{name}_s{seed}"}},
    }
    pid = post("/prompt", {"prompt": wf})["prompt_id"]
    t0 = time.time()
    while time.time() - t0 < 900:
        time.sleep(3)
        h = json.load(urllib.request.urlopen(f"{HOST}/history/{pid}", timeout=30))
        if pid in h:
            if h[pid].get("status", {}).get("status_str") == "error":
                raise RuntimeError(f"{name} s{seed}: {h[pid]['status']}")
            im = next(i for o in h[pid]["outputs"].values() for i in o.get("images", []))
            src = os.path.join(os.path.expanduser("~/ComfyUI/output"), im.get("subfolder", ""), im["filename"])
            dst = f"{OUT}/{name}-s{seed}.png"
            shutil.move(src, dst)
            print(f"{dst} ({time.time() - t0:.0f}s)", flush=True)
            return
    raise TimeoutError(f"{name} s{seed}")

os.makedirs(OUT, exist_ok=True)
for n in sys.argv[1:] or ART:
    for s in ART[n][1]:
        if not os.path.exists(f"{OUT}/{n}-s{s}.png"):  # ComfyUI caches identical prompts
            gen(n, s)
