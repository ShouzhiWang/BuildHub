import os
import django

# Setup Django environment
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildhub_backend.settings')
django.setup()

from api.models import Category

HARDWARE_CATEGORIES = [
    'Arduino',
    'Raspberry Pi',
    '3D Printing',
    'IoT',
    'Electronics',
    'Woodworking',
    'Automation',
    'Robotics',
    'Wearables',
    'Drones',
    'CNC',
    'PCB Design',
    'Embedded Systems',
    'Sensors',
    'Power Electronics',
    'Mechanical Design',
    'Home Automation',
    'Test Equipment',
    'Wireless Communication',
    'Edge Computing',
    'Industrial Automation',
    'Prototyping',
    'FPGA',
    'Microcontrollers',
    'Battery Management',
    'Signal Processing',
    'Mechatronics',
    'Soldering',
    'PCB Assembly',
    'Thermal Management',
    'Reverse Engineering',
    'Hardware Security',
    'Power Supply Design',
    'Analog Circuits',
    'Digital Circuits',
    'Motors',
    'Actuators',
    'Wireless Charging',
    'Display Interfaces',
    'Audio Electronics',
    'RF Design',
    'Antenna Design',
    'Workshop Safety',
    'Low Power Design',
    'High Speed Design',
    'Schematic Capture',
    'PCB Fabrication',
    'Bluetooth',
    'WiFi',
    'LoRa',
    'Zigbee',
    'CAN Bus',
    'SPI',
    'I2C',
    'UART',
    'Ethernet',
    'USB',
    'HDMI',
    'Robotics',
    'Mechatronics',
    'Additive Manufacturing',
    'SolidWorks',
    'Fusion 360',
    'KiCad',
    'Altium Designer',
    'Eagle CAD',
    'STM32',
    'AVR',
    'ARM Cortex',
    'PLC',
    'SCADA',
    'Edge Devices',
    'Prototyping',
    'Test Benches',
    'Power Tools',
    'Hand Tools',
]

def main():
    created = 0
    for cat_name in HARDWARE_CATEGORIES:
        obj, was_created = Category.objects.get_or_create(name=cat_name)
        if was_created:
            print(f'✅ Created category: {cat_name}')
            created += 1
        else:
            print(f'ℹ️  Category already exists: {cat_name}')
    print(f'\nTotal new categories created: {created}')

if __name__ == '__main__':
    main() 