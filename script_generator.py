# script_generator.py
"""Generate a short textual script using a HuggingFace language model.

Usage:
    python script_generator.py --prompt "<topic>" [--max_length N] [--model <model>]

The script prints the generated text to STDOUT.
"""
import argparse
from transformers import pipeline, set_seed

def main():
    parser = argparse.ArgumentParser(description="Generate a short video script using a language model.")
    parser.add_argument("--prompt", required=True, help="Topic or seed text for the model")
    parser.add_argument("--max_length", type=int, default=200, help="Maximum number of tokens to generate")
    parser.add_argument("--model", default="distilgpt2", help="HuggingFace model identifier (e.g., distilgpt2, gpt2, EleutherAI/gpt-neo-125M)")
    args = parser.parse_args()

    generator = pipeline("text-generation", model=args.model)
    set_seed(42)
    result = generator(args.prompt, max_length=args.max_length, num_return_sequences=1)
    generated = result[0]["generated_text"].strip()
    if generated.lower().startswith(args.prompt.lower()):
        generated = generated[len(args.prompt):].strip()
    print(generated)

if __name__ == "__main__":
    main()
