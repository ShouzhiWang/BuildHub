#!/usr/bin/env python3
"""
Test script to verify slideshow conversion functionality
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
from convert_slides import convert_slideshow_to_images

def test_conversion():
    """Test the conversion functionality"""
    try:
        # Get the most recent slideshow
        slideshow = ProjectSlideshow.objects.last()
        if not slideshow:
            print("No slideshow found to test")
            return
        
        print(f"Testing conversion for slideshow ID: {slideshow.id}")
        print(f"Original file: {slideshow.original_file.name}")
        
        # Test the conversion
        success = convert_slideshow_to_images(slideshow.id)
        
        if success:
            # Check if slides were created
            slides = slideshow.slides.all()
            print(f"Conversion successful! Created {slides.count()} slides")
            for slide in slides:
                print(f"  - Slide {slide.slide_number}: {slide.image.name}")
        else:
            print("Conversion failed!")
            
    except Exception as e:
        print(f"Error during test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_conversion() 