# generate_mjo_animation.py
import argparse
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw

def wrap_text(text, max_chars=30):
    words = text.split()
    lines = []
    current_line = []
    current_length = 0
    for word in words:
        if current_length + len(word) + 1 > max_chars:
            lines.append(" ".join(current_line))
            current_line = [word]
            current_length = len(word)
        else:
            current_line.append(word)
            current_length += len(word) + 1
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def draw_mjo_character(draw, x, y, scale, gender, expression, shirt_color, name):
    # Head
    draw.ellipse([x - scale, y - scale, x + scale, y + scale], fill=(255, 224, 189), outline=(0, 0, 0), width=3)
    
    # Hair
    if gender == "female":
        draw.chord([x - scale*1.2, y - scale*0.5, x - scale*0.8, y + scale*1.2], 0, 360, fill=(40, 40, 40))
        draw.chord([x + scale*0.8, y - scale*0.5, x + scale*1.2, y + scale*1.2], 0, 360, fill=(40, 40, 40))
        draw.ellipse([x - scale, y - scale*1.1, x + scale, y - scale*0.6], fill=(40, 40, 40))
    else:
        draw.chord([x - scale, y - scale*1.1, x + scale, y - scale*0.7], 180, 360, fill=(10, 10, 10))

    # Eyes
    eye_y_offset = -scale * 0.2
    # Left eye
    draw.ellipse([x - scale*0.45, y + eye_y_offset - scale*0.15, x - scale*0.15, y + eye_y_offset + scale*0.15], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.ellipse([x - scale*0.35, y + eye_y_offset - scale*0.08, x - scale*0.25, y + eye_y_offset + scale*0.08], fill=(0, 0, 0)) # pupil
    # Right eye
    draw.ellipse([x + scale*0.15, y + eye_y_offset - scale*0.15, x + scale*0.45, y + eye_y_offset + scale*0.15], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.ellipse([x + scale*0.25, y + eye_y_offset - scale*0.08, x + scale*0.35, y + eye_y_offset + scale*0.08], fill=(0, 0, 0)) # pupil

    # Eyebrows
    eb_y = y + eye_y_offset - scale*0.25
    if expression == "worried":
        draw.line([x - scale*0.45, eb_y, x - scale*0.15, eb_y - scale*0.1], fill=(0, 0, 0), width=3)
        draw.line([x + scale*0.15, eb_y - scale*0.1, x + scale*0.45, eb_y], fill=(0, 0, 0), width=3)
    elif expression == "angry":
        draw.line([x - scale*0.45, eb_y - scale*0.1, x - scale*0.15, eb_y], fill=(0, 0, 0), width=3)
        draw.line([x + scale*0.15, eb_y, x + scale*0.45, eb_y - scale*0.1], fill=(0, 0, 0), width=3)
    else:
        draw.line([x - scale*0.45, eb_y, x - scale*0.15, eb_y], fill=(0, 0, 0), width=3)
        draw.line([x + scale*0.15, eb_y, x + scale*0.45, eb_y], fill=(0, 0, 0), width=3)

    # Mouth
    mouth_y = y + scale*0.3
    if expression == "worried":
        draw.arc([x - scale*0.3, mouth_y, x + scale*0.3, mouth_y + scale*0.3], 180, 360, fill=(0, 0, 0), width=3)
    elif expression == "talking" or expression == "happy":
        draw.chord([x - scale*0.25, mouth_y - scale*0.1, x + scale*0.25, mouth_y + scale*0.2], 0, 180, fill=(0, 0, 0))
    else:
        draw.line([x - scale*0.2, mouth_y, x + scale*0.2, mouth_y], fill=(0, 0, 0), width=3)

    # Body (Shirt)
    draw.polygon([
        x - scale*0.8, y + scale*2.2,
        x + scale*0.8, y + scale*2.2,
        x + scale*0.4, y + scale*0.9,
        x - scale*0.4, y + scale*0.9
    ], fill=shirt_color, outline=(0, 0, 0), width=3)

    # Name Tag
    draw.text((x - 20, y + scale*1.2), name, fill=(0, 0, 0))

def draw_speech_bubble(draw, x, y, width, height, text, target_x=600):
    # Bubble background
    draw.ellipse([x, y, x + width, y + height], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    # Speech tail pointing to target character
    tail_start = x + width*0.5
    draw.polygon([tail_start - 10, y + height - 2, tail_start + 10, y + height - 2, target_x, y + height + 30], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    # Overwrite outline junction
    draw.line([tail_start - 10, y + height - 2, tail_start + 10, y + height - 2], fill=(255, 255, 255), width=3)
    
    # Draw Text lines inside bubble
    lines = wrap_text(text, max_chars=25)
    line_y = y + (height - len(lines)*20)/2
    for line in lines:
        draw.text((x + width*0.15, line_y), line, fill=(0, 0, 0))
        line_y += 20

def main():
    parser = argparse.ArgumentParser(description="Generate MJO comic animation slides")
    parser.add_argument("--prompt", required=True, help="Topic or text to display")
    parser.add_argument("--output_dir", required=True, help="Directory to save image slides")
    args = parser.parse_args()

    out_path = Path(args.output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # Split text into sentences for different slides
    # Replace common separators with period
    clean_text = args.prompt.replace("।", ".").replace("!", ".").replace("?", ".")
    sentences = [s.strip() for s in clean_text.split(".") if s.strip()]
    if not sentences:
        sentences = [args.prompt]

    # Generate up to 5 slides
    num_slides = min(len(sentences), 5)
    
    for i in range(num_slides):
        sentence = sentences[i]
        # Colors: alternate backgrounds to feel dynamic
        bg_colors = [(220, 240, 220), (240, 220, 220), (220, 220, 240), (240, 240, 220), (220, 240, 240)]
        color = bg_colors[i % len(bg_colors)]
        
        img = Image.new("RGB", (1280, 720), color=color)
        draw = ImageDraw.Draw(img)

        # Draw shop/mirror decoration
        draw.rectangle([400, 50, 880, 450], outline=(180, 180, 180), width=3)

        # Alternate who is talking
        is_rohan_talking = (i % 2 == 0)
        priya_expression = "worried" if is_rohan_talking else "talking"
        rohan_expression = "talking" if is_rohan_talking else "neutral"

        # Draw Priya and Rohan
        draw_mjo_character(draw, 350, 450, 100, "female", priya_expression, (239, 68, 68), "Priya")
        draw_mjo_character(draw, 930, 450, 100, "male", rohan_expression, (34, 197, 94), "Rohan")

        # Draw dialogue bubble
        if is_rohan_talking:
            draw_speech_bubble(draw, 550, 150, 380, 120, sentence, target_x=930)
        else:
            draw_speech_bubble(draw, 350, 150, 380, 120, sentence, target_x=350)

        image_path = out_path / f"image_{i+1:03d}.png"
        img.save(image_path)
        print(f"Generated {image_path}")

if __name__ == "__main__":
    main()
