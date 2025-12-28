# How to generate icons

For a production extension, you need proper PNG icons at 16x16, 48x48, and 128x128 pixels.

For development, you can use a simple approach:

## Option 1: Create simple icons with ImageMagick

```bash
# Install ImageMagick if needed
brew install imagemagick

# Create a simple colored square icon
convert -size 16x16 xc:#e94560 icon16.png
convert -size 48x48 xc:#e94560 icon48.png
convert -size 128x128 xc:#e94560 icon128.png
```

## Option 2: Use an online tool

1. Go to https://favicon.io/ or similar
2. Create an icon with the text "QR" or similar
3. Download in various sizes
4. Place in this folder

## Option 3: Create with code

Use the HTML canvas to generate icons - see the generate-icons.html file.

For now, placeholder files are created that will work for development.
