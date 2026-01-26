import io
import logging
from PIL import Image, ImageDraw, ImageFont
import requests
from apps.backend.app.core.config import settings

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        self.watermark_text = "ТД РУССТАНКОСБЫТ"
        # Standard linux font paths, adjust if needed
        self.font_paths = [
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/system/library/fonts/supplemental/arial bold.ttf", # Mac fallback
            "arial.ttf" # Windows/generic fallback
        ]

    def _get_font(self, size):
        for path in self.font_paths:
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
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
            font_size = max(20, int(img.width * 0.04))
            font = self._get_font(font_size)

            # Position: bottom right with padding
            # We use textbbox for newer Pillow versions
            try:
                bbox = draw.textbbox((0, 0), self.watermark_text, font=font)
                textwidth = bbox[2] - bbox[0]
                textheight = bbox[3] - bbox[1]
            except AttributeError:
                # Fallback for older Pillow
                textwidth, textheight = draw.textsize(self.watermark_text, font)

            margin = 20
            x = img.width - textwidth - margin
            y = img.height - textheight - margin

            # Draw white text with low alpha (semi-transparent)
            draw.text((x, y), self.watermark_text, font=font, fill=(255, 255, 255, 80))

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
