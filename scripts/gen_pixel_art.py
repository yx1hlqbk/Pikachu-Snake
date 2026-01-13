from PIL import Image, ImageDraw

def create_pixel_pikachu():
    # Define colors
    T = (0, 0, 0, 0)       # Transparent
    Y = (255, 232, 0, 255) # Pikachu Yellow
    B = (0, 0, 0, 255)     # Black (Eyes/Ears/Nose)
    R = (255, 50, 50, 255) # Red (Cheeks)
    W = (255, 255, 255, 255) # White (Eye shine)

    # 24x24 Grid - Front Facing Reference Copy
    pixel_map = [
        [B, B, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, B, B, B], # Row 1: Ear Tips
        [B, B, B, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, B, B, B, B],
        [B, Y, B, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, B, B, Y, B, T],
        [T, B, Y, B, T, T, T, T, T, T, T, T, T, T, T, T, T, T, B, Y, B, B, T, T],
        [T, B, Y, Y, B, T, T, T, T, T, T, T, T, T, T, T, T, B, Y, Y, B, T, T, T], # 5
        [T, B, Y, Y, Y, B, T, T, T, T, T, T, T, T, T, T, B, Y, Y, Y, B, T, T, T],
        [T, T, B, Y, Y, B, B, B, B, B, B, B, B, B, B, B, B, Y, Y, B, T, T, T, T], # Head top line
        [T, T, B, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, B, T, T, T, T],
        [T, T, B, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, B, T, T, T, T],
        [T, T, T, B, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, B, T, T, T, T, T], # 10
        [T, T, B, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, B, T, T, T, T],
        [T, T, B, Y, Y, B, B, B, Y, Y, Y, Y, Y, B, B, B, Y, Y, Y, B, T, T, T, T], # Eyes start
        [T, T, B, Y, B, B, W, B, B, Y, Y, Y, B, B, W, B, B, Y, Y, B, T, T, T, T],
        [T, T, B, Y, B, B, B, B, B, Y, Y, B, B, B, B, B, B, Y, Y, B, T, T, T, T],
        [T, B, Y, Y, B, B, B, B, B, Y, B, Y, B, B, B, B, B, Y, Y, B, T, T, T, T], # Nose
        [T, B, Y, R, R, Y, Y, Y, Y, Y, B, B, B, Y, Y, Y, Y, R, R, Y, B, T, T, T], # Cheeks start
        [T, B, Y, R, R, R, Y, Y, Y, B, B, B, B, B, Y, Y, R, R, R, Y, B, T, T, T], # Mouth Open Top
        [T, B, Y, R, R, R, Y, Y, Y, B, R, R, R, B, Y, Y, R, R, R, Y, B, T, T, T], # Mouth Tongue
        [T, T, B, Y, R, R, Y, Y, Y, B, R, R, R, B, Y, Y, R, R, Y, B, T, T, T, T],
        [T, T, B, Y, Y, Y, Y, Y, Y, T, B, B, B, T, Y, Y, Y, Y, Y, B, T, T, T, T],
        [T, T, T, B, B, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, B, B, B, T, T, T, T, T],
        [T, T, T, T, T, B, B, B, B, B, T, T, T, B, B, B, B, T, T, T, T, T, T, T],
        [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
        [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T]
    ]

    width = len(pixel_map[0])
    height = len(pixel_map)
    scale = 10 # Scale up so each pixel is 10x10
    
    img = Image.new('RGBA', (width * scale, height * scale), T)
    draw = ImageDraw.Draw(img)

    for y, row in enumerate(pixel_map):
        for x, color in enumerate(row):
            if color != T:
                draw.rectangle(
                    [x * scale, y * scale, (x + 1) * scale - 1, (y + 1) * scale - 1],
                    fill=color
                )
    
    # Save
    output_path = 'assets/pikachu_head_pixel.png'
    img.save(output_path)
    print(f"Generated pixel art image at {output_path}")

if __name__ == "__main__":
    create_pixel_pikachu()
