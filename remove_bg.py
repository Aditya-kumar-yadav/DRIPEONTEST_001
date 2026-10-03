import os
from rembg import remove
from PIL import Image

def process_image(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Failed to process {input_path}: {e}")

if __name__ == "__main__":
    public_dir = "C:/Users/bitd/OneDrive/Desktop/DRIPLAB/iamhere_project/public/images"
    
    black_in = os.path.join(public_dir, "realistic_shirt_black.png")
    black_out = os.path.join(public_dir, "transparent_shirt_black.png")
    
    white_in = os.path.join(public_dir, "realistic_shirt_white.png")
    white_out = os.path.join(public_dir, "transparent_shirt_white.png")
    
    process_image(black_in, black_out)
    process_image(white_in, white_out)
