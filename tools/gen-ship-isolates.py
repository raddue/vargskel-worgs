"""Step 1 of the 3D hull models: isolate each hull from its location plate onto plain white.

Uses local ComfyUI with Qwen-Image-Edit-2509 (Q4_K_M GGUF). The source is assets/<id>.png.
Output: /tmp/holomap-art/iso-<id>-s<seed>.png. Step 2 is Hi3DGen (see tools/gen-ship-meshes.sh).
Prompts and seeds here are the provenance record for assets/models/*.
"""
import json, os, shutil, sys, time, urllib.request

HOST = "http://127.0.0.1:8188"
OUT = "/tmp/holomap-art"
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMFY_IN, COMFY_OUT = os.path.expanduser("~/ComfyUI/input"), os.path.expanduser("~/ComfyUI/output")
STEPS, CFG, SHIFT = 20, 2.5, 3.0
BASE = ("Extract only the {what} from this image and show it alone, whole and uncropped, centred on a "
        "pure plain white background, three-quarter view from slightly above, even neutral studio "
        "lighting. Keep its exact shape, structure, proportions and colours. Remove everything else: "
        "the person, the railing and balcony, the planet, the stars, other ships, the asteroids and the sun.")
NEG = ("person, astronaut, railing, balcony, planet, stars, space, other ships, asteroids, debris, sun, "
       "cropped, cut off, background scenery, shadow on ground, text, watermark")
SHIPS = {
    "kessen": ("large vertical space station in the centre with its solar panels, antenna spars and "
               "horizontal docking arms", [7, 19]),
    "harrow": ("vertical space station in the centre with its spires, ring decks and long horizontal "
               "docking arms", [7, 19]),
    "rio": ("large warship flying at the top of the image, with its swept wings and ring-shaped hull section",
            [7, 19]),
}

def post(path, body):
    req = urllib.request.Request(HOST + path, json.dumps(body).encode(), {"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=30))

def run(sid, seed):
    name = f"holomap_src_{sid}.png"
    shutil.copyfile(f"{REPO}/assets/{sid}.png", os.path.join(COMFY_IN, name))
    pos = BASE.format(what=SHIPS[sid][0])
    wf = {
        "1": {"class_type": "UnetLoaderGGUF", "inputs": {"unet_name": "Qwen-Image-Edit-2509-Q4_K_M.gguf"}},
        "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "qwen_image_vae.safetensors"}},
        "4": {"class_type": "LoadImage", "inputs": {"image": name}},
        "5": {"class_type": "FluxKontextImageScale", "inputs": {"image": ["4", 0]}},
        "6": {"class_type": "VAEEncode", "inputs": {"pixels": ["5", 0], "vae": ["3", 0]}},
        "7": {"class_type": "TextEncodeQwenImageEditPlus", "inputs": {"clip": ["2", 0], "vae": ["3", 0], "image1": ["5", 0], "prompt": pos}},
        "8": {"class_type": "TextEncodeQwenImageEditPlus", "inputs": {"clip": ["2", 0], "vae": ["3", 0], "image1": ["5", 0], "prompt": NEG}},
        "9": {"class_type": "ModelSamplingAuraFlow", "inputs": {"model": ["1", 0], "shift": SHIFT}},
        "10": {"class_type": "CFGNorm", "inputs": {"model": ["9", 0], "strength": 1.0}},
        "11": {"class_type": "KSampler", "inputs": {"model": ["10", 0], "positive": ["7", 0], "negative": ["8", 0], "latent_image": ["6", 0], "seed": seed, "steps": STEPS, "cfg": CFG, "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
        "12": {"class_type": "VAEDecode", "inputs": {"samples": ["11", 0], "vae": ["3", 0]}},
        "13": {"class_type": "SaveImage", "inputs": {"images": ["12", 0], "filename_prefix": f"holomap_iso_{sid}_s{seed}"}},
    }
    pid = post("/prompt", {"prompt": wf})["prompt_id"]
    t0 = time.time()
    while time.time() - t0 < 1200:
        time.sleep(3)
        h = json.load(urllib.request.urlopen(f"{HOST}/history/{pid}", timeout=30))
        if pid in h:
            if h[pid].get("status", {}).get("status_str") == "error":
                raise RuntimeError(f"{sid} s{seed}: {json.dumps(h[pid]['status'])[:2000]}")
            im = next(i for o in h[pid]["outputs"].values() for i in o.get("images", []))
            dst = f"{OUT}/iso-{sid}-s{seed}.png"
            shutil.move(os.path.join(COMFY_OUT, im.get("subfolder", ""), im["filename"]), dst)
            print(f"{dst} ({time.time() - t0:.0f}s)", flush=True)
            return
    raise TimeoutError(f"{sid} s{seed}")

os.makedirs(OUT, exist_ok=True)
for sid in sys.argv[1:] or SHIPS:
    for s in SHIPS[sid][1]:
        if not os.path.exists(f"{OUT}/iso-{sid}-s{s}.png"):
            run(sid, s)
