# generate_barber_animation.py
import argparse
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

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

def draw_barber_chacha(draw, x, y, scale, expression):
    # Barber Chacha (Amrendra Chacha) — Bald head with mustache & apron
    # Head
    draw.ellipse([x - scale, y - scale, x + scale, y + scale], fill=(253, 215, 178), outline=(0, 0, 0), width=3)
    
    # Gray Side Hair (Bald on top)
    draw.chord([x - scale*1.1, y - scale*0.2, x - scale*0.7, y + scale*0.8], 0, 360, fill=(180, 180, 180))
    draw.chord([x + scale*0.7, y - scale*0.2, x + scale*1.1, y + scale*0.8], 0, 360, fill=(180, 180, 180))

    # Eyes
    eye_y = y - scale * 0.2
    draw.ellipse([x - scale*0.4, eye_y - scale*0.1, x - scale*0.1, eye_y + scale*0.1], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.ellipse([x - scale*0.28, eye_y - scale*0.05, x - scale*0.18, eye_y + scale*0.05], fill=(0, 0, 0)) # Pupil
    draw.ellipse([x + scale*0.1, eye_y - scale*0.1, x + scale*0.4, eye_y + scale*0.1], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.ellipse([x + scale*0.18, eye_y - scale*0.05, x + scale*0.28, eye_y + scale*0.05], fill=(0, 0, 0)) # Pupil

    # Glasses (Funny Chacha frame)
    draw.rectangle([x - scale*0.45, eye_y - scale*0.15, x - scale*0.05, eye_y + scale*0.15], outline=(0, 0, 0), width=3)
    draw.rectangle([x + 0.05*scale, eye_y - scale*0.15, x + scale*0.45, eye_y + scale*0.15], outline=(0, 0, 0), width=3)
    draw.line([x - scale*0.05, eye_y, x + scale*0.05, eye_y], fill=(0, 0, 0), width=3)

    # Mustache (Classic Amrendra Chacha Mustache)
    mustache_y = y + scale*0.15
    draw.polygon([
        x - scale*0.6, mustache_y + scale*0.2,
        x, mustache_y,
        x + scale*0.6, mustache_y + scale*0.2,
        x, mustache_y + scale*0.3
    ], fill=(20, 20, 20), outline=(0, 0, 0), width=2)

    # Mouth
    mouth_y = y + scale*0.45
    if expression == "talking":
        draw.chord([x - scale*0.2, mouth_y - scale*0.05, x + scale*0.2, mouth_y + scale*0.15], 0, 180, fill=(0, 0, 0))
    else:
        draw.line([x - scale*0.15, mouth_y, x + scale*0.15, mouth_y], fill=(0, 0, 0), width=3)

    # Body with Apron
    draw.polygon([
        x - scale*0.8, y + scale*2.2,
        x + scale*0.8, y + scale*2.2,
        x + scale*0.4, y + scale*0.9,
        x - scale*0.4, y + scale*0.9
    ], fill=(45, 85, 155), outline=(0, 0, 0), width=3) # Blue Apron
    
    # White Stripe on Apron
    draw.rectangle([x - scale*0.15, y + scale*1.2, x + scale*0.15, y + scale*2.0], fill=(255, 255, 255), outline=(0, 0, 0))

    # Name Tag
    draw.text((x - 40, y + scale*1.1), "Amrendra Chacha", fill=(255, 255, 255))

def draw_customer_rohan(draw, x, y, scale, expression, hair_style):
    # Customer Rohan sitting in chair
    # Head
    draw.ellipse([x - scale, y - scale, x + scale, y + scale], fill=(255, 224, 189), outline=(0, 0, 0), width=3)

    # Hair style changing dynamically
    if hair_style == "normal":
        # Full black hair
        draw.chord([x - scale, y - scale*1.1, x + scale, y - scale*0.6], 180, 360, fill=(10, 10, 10))
    elif hair_style == "bowl_cut":
        # Funny bowl shape with bald center (Katora cut)
        draw.chord([x - scale, y - scale*1.1, x - scale*0.4, y - scale*0.7], 180, 360, fill=(10, 10, 10))
        draw.chord([x + scale*0.4, y - scale*1.1, x + scale, y - scale*0.7], 180, 360, fill=(10, 10, 10))
        # Bald spot skin patch
        draw.ellipse([x - scale*0.35, y - scale*1.15, x + scale*0.35, y - scale*0.85], fill=(255, 224, 189))

    # Eyes (Wide in shock if worried/angry)
    eye_y = y - scale * 0.2
    eye_radius = scale * 0.15 if (expression == "worried" or expression == "angry") else scale * 0.12
    draw.ellipse([x - scale*0.45, eye_y - eye_radius, x - scale*0.15, eye_y + eye_radius], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.ellipse([x - scale*0.33, eye_y - scale*0.05, x - scale*0.27, eye_y + scale*0.05], fill=(0, 0, 0)) # Pupil
    
    draw.ellipse([x + scale*0.15, eye_y - eye_radius, x + scale*0.45, eye_y + eye_radius], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.ellipse([x + scale*0.27, eye_y - scale*0.05, x + scale*0.33, eye_y + scale*0.05], fill=(0, 0, 0)) # Pupil

    # Eyebrows (Slanted in anger/worry)
    eb_y = y - scale * 0.4
    if expression == "angry":
        draw.line([x - scale*0.4, eb_y - 5, x - scale*0.15, eb_y + 5], fill=(0, 0, 0), width=3)
        draw.line([x + scale*0.15, eb_y + 5, x + scale*0.4, eb_y - 5], fill=(0, 0, 0), width=3)
    elif expression == "worried":
        draw.line([x - scale*0.4, eb_y + 5, x - scale*0.15, eb_y - 5], fill=(0, 0, 0), width=3)
        draw.line([x + scale*0.15, eb_y - 5, x + scale*0.4, eb_y + 5], fill=(0, 0, 0), width=3)
    else:
        draw.line([x - scale*0.4, eb_y, x - scale*0.15, eb_y], fill=(0, 0, 0), width=3)
        draw.line([x + scale*0.15, eb_y, x + scale*0.4, eb_y], fill=(0, 0, 0), width=3)

    # Mouth
    mouth_y = y + scale*0.35
    if expression == "angry" or expression == "worried":
        # Wobbly line
        draw.arc([x - scale*0.25, mouth_y, x + scale*0.25, mouth_y + scale*0.15], 180, 360, fill=(0, 0, 0), width=3)
    elif expression == "talking":
        draw.chord([x - scale*0.2, mouth_y - scale*0.05, x + scale*0.2, mouth_y + scale*0.15], 0, 180, fill=(0, 0, 0))
    else:
        draw.line([x - scale*0.15, mouth_y, x + scale*0.15, mouth_y], fill=(0, 0, 0), width=3)

    # Barber Chair Cape (Red wrapping over body)
    draw.polygon([
        x - scale*1.2, y + scale*2.2,
        x + scale*1.2, y + scale*2.2,
        x + scale*0.5, y + scale*0.9,
        x - scale*0.5, y + scale*0.9
    ], fill=(220, 50, 50), outline=(0, 0, 0), width=3)

    # Name Tag
    draw.text((x - 20, y + scale*1.1), "Rohan", fill=(0, 0, 0))

def draw_speech_bubble(draw, x, y, width, height, text, target_x=600):
    draw.ellipse([x, y, x + width, y + height], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    tail_start = x + width*0.5
    draw.polygon([tail_start - 10, y + height - 2, tail_start + 10, y + height - 2, target_x, y + height + 30], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.line([tail_start - 10, y + height - 2, tail_start + 10, y + height - 2], fill=(255, 255, 255), width=3)
    
    lines = wrap_text(text, max_chars=25)
    line_y = y + (height - len(lines)*20)/2
    for line in lines:
        draw.text((x + width*0.15, line_y), line, fill=(0, 0, 0))
        line_y += 20

def main():
    parser = argparse.ArgumentParser(description="Generate Barber Shop MJO style slides")
    parser.add_argument("--prompt", required=True, help="Comedy script dialogue sentences")
    parser.add_argument("--output_dir", required=True, help="Directory to save image storyboard slides")
    args = parser.parse_args()

    out_path = Path(args.output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # Standard Barber Skit script sentences
    barber_dialogues = [
        "Rohan: Chacha, thoda side se cut karna... bas decent lagna chahiye.",
        "Chacha: Arey beta! Amrendra Hair salon me aaye ho... bilkul hero bana denge!",
        "Chacha: *kat-kat-kat-kat* Arey re... thoda haath slip ho gaya... par koi baat nahi...",
        "Rohan: Arey chacha! Yeh kya kiya? Katora cut bana diya! Mujhe ganja nahi hona tha!",
        "Chacha: Arey fikar mat karo beta... is cut me dhoop me bhi thandak milegi... style ka style!"
    ]

    # Render slides
    for i, line in enumerate(barber_dialogues):
        # Background: Salon Interior (warm yellow wall color)
        img = Image.new("RGB", (1280, 720), color=(255, 250, 230))
        draw = ImageDraw.Draw(img)

        # Draw Barber Mirror & Scissors/Combs shelf
        draw.rectangle([350, 40, 930, 420], fill=(240, 240, 250), outline=(150, 75, 0), width=6) # Mirror
        draw.rectangle([200, 300, 320, 320], fill=(130, 130, 130), outline=(0, 0, 0)) # Shelf
        draw.line([220, 270, 230, 300], fill=(0,0,0), width=4) # Comb outline
        draw.ellipse([270, 280, 290, 300], fill=None, outline=(0,0,0), width=3) # Scissors ring

        # Animations states
        is_chacha_talking = ("Chacha:" in line)
        speaker_dialogue = line.replace("Rohan:", "").replace("Chacha:", "").strip()

        # Expression & Hair states changing per slide
        if i < 2:
            rohan_expr = "talking" if i == 0 else "neutral"
            rohan_hair = "normal"
            chacha_expr = "neutral" if i == 0 else "talking"
        elif i == 2:
            rohan_expr = "worried"
            rohan_hair = "normal"
            chacha_expr = "talking"
        else:
            rohan_expr = "angry"
            rohan_hair = "bowl_cut" # Cut hair completed
            chacha_expr = "talking"

        # Draw Amrendra Chacha & Rohan
        draw_barber_chacha(draw, 380, 440, 100, chacha_expr)
        draw_customer_rohan(draw, 880, 440, 100, rohan_expr, rohan_hair)

        # Draw Dialogue speech bubbles pointing to characters
        if is_chacha_talking:
            draw_speech_bubble(draw, 400, 130, 380, 120, speaker_dialogue, target_x=380)
        else:
            draw_speech_bubble(draw, 500, 130, 380, 120, speaker_dialogue, target_x=880)

        image_path = out_path / f"image_{i+1:03d}.png"
        img.save(image_path)
        print(f"Generated {image_path}")

if __name__ == "__main__":
    main()
