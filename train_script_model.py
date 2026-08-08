# train_script_model.py
import os
import torch
from torch.utils.data import Dataset
from transformers import GPT2LMHeadModel, GPT2Tokenizer, Trainer, TrainingArguments

class MJODataset(Dataset):
    def __init__(self, txt_path, tokenizer, max_length=16):
        self.tokenizer = tokenizer
        self.input_ids = []
        self.attn_masks = []
        if not os.path.exists(txt_path):
            raise FileNotFoundError(f"Dataset file not found at {txt_path}")
        with open(txt_path, 'r', encoding='utf-8') as f:
            lines = [line.strip() for line in f if line.strip()]
        for line in lines:
            encodings = tokenizer(line, truncation=True, max_length=max_length, padding="max_length")
            self.input_ids.append(torch.tensor(encodings['input_ids']))
            self.attn_masks.append(torch.tensor(encodings['attention_mask']))

    def __len__(self):
        return len(self.input_ids)

    def __getitem__(self, idx):
        return {
            'input_ids': self.input_ids[idx],
            'attention_mask': self.attn_masks[idx],
            'labels': self.input_ids[idx]
        }

def main():
    print("Initializing tokenizer and base model...")
    model_name = "distilgpt2"
    tokenizer = GPT2Tokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    model = GPT2LMHeadModel.from_pretrained(model_name)
    
    dataset = MJODataset("mjo_dataset.txt", tokenizer)
    
    training_args = TrainingArguments(
        output_dir="./mjo_training_results",
        num_train_epochs=3,
        per_device_train_batch_size=2,
        save_strategy="no",
        logging_steps=2,
        learning_rate=5e-5,
        weight_decay=0.01,
        remove_unused_columns=False,
        use_cpu=True
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset
    )
    
    print("Starting training process...")
    trainer.train()
    
    output_dir = "./fine_tuned_mjo_model"
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Model successfully fine-tuned and saved to {output_dir}!")

if __name__ == "__main__":
    main()
