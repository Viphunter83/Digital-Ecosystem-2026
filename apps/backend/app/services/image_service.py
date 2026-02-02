import io
import logging
from PIL import Image, ImageDraw, ImageFont
import requests
from apps.backend.app.core.config import settings

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        self.watermark_text = "ТД РУССТАНКОСБЫТ"
        # Font paths
        self.font_paths = [
            "apps/backend/app/static/fonts/Roboto-Bold.ttf", # Priority 1: Local project font
            "/app/app/static/fonts/Roboto-Bold.ttf",         # Docker path
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "arial.ttf"
        ]

    def _get_font(self, size):
        for path in self.font_paths:
            try:
                # Try to load font
                return ImageFont.truetype(path, size)
            except Exception:
                continue
        
        logger.warning(f"Could not load any custom font. Using default.")
        return ImageFont.load_default()

    async def add_watermark(self, image_bytes: bytes) -> bytes:
        """
        Adds a text watermark to the bottom right of the image.
        """
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            # Create watermark layer
            txt = Image.new("RGBA", img.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(txt)

            # Calculate font size based on image width (e.g., 5% of width)
            font_size = max(24, int(img.width * 0.05))
            font = self._get_font(font_size)

            # Position: bottom right with padding
            # We use textbbox for newer Pillow versions
            try:
                bbox = draw.textbbox((0, 0), self.watermark_text, font=font, stroke_width=2)
                textwidth = bbox[2] - bbox[0]
                textheight = bbox[3] - bbox[1]
            except AttributeError:
                # Fallback for older Pillow
                textwidth, textheight = draw.textsize(self.watermark_text, font)

            margin = int(img.width * 0.02) # Responsive margin
            x = img.width - textwidth - margin
            y = img.height - textheight - margin

            # Draw text with stroke for maximum contrast
            # Stroke (Black Outline)
            draw.text((x, y), self.watermark_text, font=font, fill=(255, 255, 255, 240), stroke_width=2, stroke_fill=(0, 0, 0, 255))

            # Composite
            watermarked = Image.alpha_composite(img, txt)
            
            # Convert back to original mode (usually RGB for JPEGs)
            if watermarked.mode == "RGBA":
                watermarked = watermarked.convert("RGB")

            output = io.BytesIO()
            watermarked.save(output, format="JPEG", quality=90)
            return output.getvalue()

        except Exception as e:
            logger.error(f"Watermark processing failed: {e}")
            raise e

image_service = ImageService()
