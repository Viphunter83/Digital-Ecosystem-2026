import io
import logging
import os
from PIL import Image, ImageDraw, ImageFont
import requests
from apps.backend.app.core.config import settings

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        self.logo_path = "apps/backend/app/static/images/logo.png"
        self.fallback_logo_path = "/app/app/static/images/logo.png"
        self.watermark_text = "ТД РУССТАНКОСБЫТ" # Fallback
        self.font_paths = [
            "apps/backend/app/static/fonts/Roboto-Bold.ttf",
            "/app/app/static/fonts/Roboto-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "arial.ttf"
        ]

    def _get_font(self, size):
        for path in self.font_paths:
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
        logger.warning(f"Could not load any custom font. Using default.")
        return ImageFont.load_default()

    def _get_logo(self):
        paths = [self.logo_path, self.fallback_logo_path]
        for path in paths:
            if os.path.exists(path):
                return Image.open(path)
        return None

    async def add_watermark(self, image_bytes: bytes) -> bytes:
        """
        Adds a graphical logo watermark to the bottom right of the image.
        """
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            logo = self._get_logo()
            
            if logo:
                if logo.mode != "RGBA":
                    logo = logo.convert("RGBA")
                
                # Resize logo: 20% of image width
                logo_width = int(img.width * 0.20)
                aspect_ratio = logo.height / logo.width
                logo_height = int(logo_width * aspect_ratio)
                logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
                
                # Adjust transparency (half-transparent)
                alpha = logo.split()[3]
                alpha = alpha.point(lambda p: p * 0.6) # 60% of original alpha
                logo.putalpha(alpha)

                # Create watermark layer
                watermark_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
                margin = int(img.width * 0.03)
                x = img.width - logo_width - margin
                y = img.height - logo_height - margin
                
                watermark_layer.paste(logo, (x, y))
                watermarked = Image.alpha_composite(img, watermark_layer)
            else:
                # Fallback to text if logo not found
                logger.warning("Logo not found, falling back to text watermark")
                txt_layer = Image.new("RGBA", img.size, (255, 255, 255, 0))
                draw = ImageDraw.Draw(txt_layer)
                font_size = max(24, int(img.width * 0.05))
                font = self._get_font(font_size)
                textwidth, textheight = draw.textsize(self.watermark_text, font) if hasattr(draw, 'textsize') else (0,0)
                if not textwidth:
                    bbox = draw.textbbox((0, 0), self.watermark_text, font=font)
                    textwidth, textheight = bbox[2]-bbox[0], bbox[3]-bbox[1]
                
                margin = int(img.width * 0.02)
                draw.text((img.width - textwidth - margin, img.height - textheight - margin), 
                          self.watermark_text, font=font, fill=(255, 255, 255, 128), 
                          stroke_width=2, stroke_fill=(0, 0, 0, 128))
                watermarked = Image.alpha_composite(img, txt_layer)

            # Convert back to RGB for JPEG
            if watermarked.mode == "RGBA":
                watermarked = watermarked.convert("RGB")

            output = io.BytesIO()
            watermarked.save(output, format="JPEG", quality=90)
            return output.getvalue()

        except Exception as e:
            logger.error(f"Watermark processing failed: {e}")
            raise e

image_service = ImageService()
