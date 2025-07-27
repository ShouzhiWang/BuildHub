#!/usr/bin/env python3
"""
Utility script to convert PowerPoint and PDF files to images.
This can be used as a background task or called directly.
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildhub_backend.settings')
django.setup()

from api.models import ProjectSlideshow, SlideshowSlide
from django.core.files import File
import tempfile
import subprocess
from PIL import Image, ImageDraw, ImageFont
import fitz  # PyMuPDF for PDF processing
import io


def convert_pdf_to_images(pdf_path, output_dir):
    """Convert PDF pages to images using PyMuPDF"""
    try:
        doc = fitz.open(pdf_path)
        images = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            # Render page to image (higher DPI for better quality)
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for higher resolution
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Save image
            img_path = os.path.join(output_dir, f"slide_{page_num + 1}.png")
            img.save(img_path, "PNG")
            images.append(img_path)
        
        doc.close()
        return images
    except Exception as e:
        print(f"Error converting PDF: {e}")
        return []





def convert_slideshow_to_images(slideshow_id):
    """Convert a slideshow file to images and save to database"""
    try:
        slideshow = ProjectSlideshow.objects.get(id=slideshow_id)
        
        if not slideshow.original_file:
            print(f"No original file found for slideshow {slideshow_id}")
            return False
        
        file_path = slideshow.original_file.path
        file_extension = os.path.splitext(file_path)[1].lower()
        
        print(f"Starting conversion for slideshow {slideshow_id}")
        print(f"File path: {file_path}")
        print(f"File extension: {file_extension}")
        
        # Create temporary directory for conversion
        with tempfile.TemporaryDirectory() as temp_dir:
            print(f"Using temp directory: {temp_dir}")
            images = []
            
            if file_extension == '.pdf':
                print("Converting PDF file...")
                images = convert_pdf_to_images(file_path, temp_dir)
            else:
                print(f"Unsupported file type: {file_extension}. Only PDF files are supported.")
                return False
            
            print(f"Generated {len(images)} images")
            
            if not images:
                print(f"No images generated for slideshow {slideshow_id}")
                return False
            
            # Delete existing slides
            slideshow.slides.all().delete()
            print("Deleted existing slides")
            
            # Create new slide records
            for i, img_path in enumerate(images):
                try:
                    with open(img_path, 'rb') as img_file:
                        slide = SlideshowSlide(
                            slideshow=slideshow,
                            slide_number=i + 1
                        )
                        slide.image.save(
                            f"slide_{i + 1}.png",
                            File(img_file),
                            save=True
                        )
                        print(f"Saved slide {i + 1}")
                except Exception as e:
                    print(f"Error saving slide {i + 1}: {e}")
                    continue
            
            print(f"Successfully converted {len(images)} slides for slideshow {slideshow_id}")
            return True
            
    except ProjectSlideshow.DoesNotExist:
        print(f"Slideshow {slideshow_id} not found")
        return False
    except Exception as e:
        print(f"Error converting slideshow {slideshow_id}: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python convert_slides.py <slideshow_id>")
        sys.exit(1)
    
    slideshow_id = int(sys.argv[1])
    success = convert_slideshow_to_images(slideshow_id)
    sys.exit(0 if success else 1) 