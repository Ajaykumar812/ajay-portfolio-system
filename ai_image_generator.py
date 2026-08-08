# ai_image_generator.py

"""Generate images using Stable Diffusion based on a text prompt.

Usage:
    python ai_image_generator.py --prompt "A futuristic city skyline" \
        --output_dir images --num_images 5

Dependencies (install via install_python_deps.ps1):
    diffusers, transformers, torch, accelerate
"""

import argparse, os, sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="AI image generator")
    parser.add_argument("--prompt", required=True, help="Text prompt for image generation")
    parser.add_argument("--output_dir", required=True, help="Directory where images will be saved")
    parser.add_argument("--num_images", type=int, default=5, help="Number of images to generate")
    args = parser.parse_args()

    # Ensure output directory exists
    out_path = Path(args.output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # Import heavy libraries inside the function to avoid import errors if not installed
    try:
        from diffusers import StableDiffusionPipeline
        import torch
    except Exception as e:
        sys.stderr.write(f"Failed to import diffusers or torch: {e}\n")
        sys.exit(1)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = StableDiffusionPipeline.from_pretrained(
        "stabilityai/stable-diffusion-2-1-base",
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    )
    pipe = pipe.to(device)

    for i in range(args.num_images):
        image = pipe(args.prompt).images[0]
        image_path = out_path / f"image_{i+1:03d}.png"
        image.save(image_path)
        print(f"Saved {image_path}")

if __name__ == "__main__":
    main()
