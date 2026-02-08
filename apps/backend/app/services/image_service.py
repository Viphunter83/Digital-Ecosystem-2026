import io
import logging
import os
from PIL import Image, ImageDraw, ImageFont
import requests
from apps.backend.app.core.config import settings

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        # Use absolute paths relative to this file
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.logo_path = os.path.join(base_dir, "static/images/logo.png")
        self.fallback_logo_path = "/app/apps/backend/app/static/images/logo.png" # Safe container path
        self.watermark_text = "ТД РУССТАНКОСБЫТ" # Fallback
        self.font_paths = [
            os.path.join(base_dir, "static/fonts/Roboto-Bold.ttf"),
            "/app/apps/backend/app/static/fonts/Roboto-Bold.ttf",
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
                
                # Resize logo: 25% of image width
                target_logo_width = int(img.width * 0.25)
                aspect_ratio = logo.height / logo.width
                target_logo_height = int(target_logo_width * aspect_ratio)
                logo = logo.resize((target_logo_width, target_logo_height), Image.Resampling.LANCZOS)
                
                # Create watermark layer
                watermark_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
                draw = ImageDraw.Draw(watermark_layer)

                # Layout calculations
                padding_x = int(target_logo_width * 0.15)
                padding_y = int(target_logo_height * 0.25)
                box_width = target_logo_width + 2 * padding_x
                box_height = target_logo_height + 2 * padding_y
                line_height = max(2, int(img.height * 0.006))
                
                margin = int(img.width * 0.03)
                box_x = img.width - box_width - margin
                box_y = img.height - box_height - margin

                # 1. Draw dark background box (semi-transparent black)
                draw.rectangle(
                    [box_x, box_y, box_x + box_width, box_y + box_height],
                    fill=(0, 0, 0, 180) # Darker for better visibility
                )

                # 2. Add brand orange line (#FF3D00) across the ENTIRE WIDTH at the bottom
                # We align the bottom of the line with the bottom of the image plus a small padding or exactly at the bottom
                draw.rectangle(
                    [0, img.height - line_height, img.width, img.height],
                    fill=(255, 61, 0, 255)
                )

                # 3. Paste logo on top of the box
                watermark_layer.paste(logo, (box_x + padding_x, box_y + padding_y), logo)
                
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
                
                # Add full-width line even for text fallback for consistency
                line_height = max(2, int(img.height * 0.006))
                draw.rectangle(
                    [0, img.height - line_height, img.width, img.height],
                    fill=(255, 61, 0, 255)
                )

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
