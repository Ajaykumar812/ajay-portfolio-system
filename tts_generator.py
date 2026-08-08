# tts_generator.py

"""Generate speech audio from a short text using Google Text‑to‑Speech (gTTS).

Usage:
    python tts_generator.py --text "Hello world" --output_path speech.mp3

Dependencies (installed via install_python_deps.ps1): gtts
"""

import argparse, sys
from gtts import gTTS

def main():
    parser = argparse.ArgumentParser(description="TTS generator using gTTS")
    parser.add_argument("--text", required=True, help="Text to synthesize")
    parser.add_argument("--output_path", required=True, help="Path to save the MP3 file")
    parser.add_argument("--lang", default="en", help="Language code (e.g. en, hi)")
    args = parser.parse_args()

    try:
        tts = gTTS(text=args.text, lang=args.lang)
        tts.save(args.output_path)
        print(f"Audio saved to {args.output_path}")
    except Exception as e:
        sys.stderr.write(f"Error generating TTS: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
