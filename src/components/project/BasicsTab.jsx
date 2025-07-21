import React, { useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const BasicsTab = ({ formData, updateFormData, categories, errors }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      updateFormData('cover_image', file);
    }
  };

  const removeImage = () => {
    updateFormData('cover_image', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getImagePreview = () => {
    if (!formData.cover_image) return null;
    // If it's already a URL string, return it directly; otherwise createObjectURL from File
    if (typeof formData.cover_image === 'string') {
      return formData.cover_image;
    }
    return URL.createObjectURL(formData.cover_image);
  };

  const categoryNameToKey = {
    'Arduino': 'categoryArduino',
    'Raspberry Pi': 'categoryRaspberryPi',
    '3D Printing': 'category3DPrinting',
    'IoT': 'categoryIoT',
    'Electronics': 'categoryElectronics',
    'Woodworking': 'categoryWoodworking',
    'Automation': 'categoryAutomation',
    'Robotics': 'categoryRobotics',
    'Wearables': 'categoryWearables',
    'Drones': 'categoryDrones',
    'CNC': 'categoryCNC',
    'PCB Design': 'categoryPCBDesign',
    'Embedded Systems': 'categoryEmbedded',
    'Sensors': 'categorySensors',
    'Power Electronics': 'categoryPowerElectronics',
    'Mechanical Design': 'categoryMechanical',
    'Home Automation': 'categoryHomeAutomation',
    'Test Equipment': 'categoryTestEquipment',
    'Wireless Communication': 'categoryWireless',
    'Edge Computing': 'categoryEdgeComputing',
    'Industrial Automation': 'categoryIndustrial',
    'Prototyping': 'categoryPrototyping',
    'FPGA': 'categoryFPGA',
    'Microcontrollers': 'categoryMicrocontrollers',
    'Battery Management': 'categoryBatteryManagement',
    'Signal Processing': 'categorySignalProcessing',
    'Mechatronics': 'categoryMechatronics',
    'Soldering': 'categorySoldering',
    'PCB Assembly': 'categoryPCBAssembly',
    'Thermal Management': 'categoryThermalManagement',
    'Reverse Engineering': 'categoryReverseEngineering',
    'Hardware Security': 'categoryHardwareSecurity',
    'Power Supply Design': 'categoryPowerSupply',
    'Analog Circuits': 'categoryAnalogCircuits',
    'Digital Circuits': 'categoryDigitalCircuits',
    'Motors': 'categoryMotors',
    'Actuators': 'categoryActuators',
    'Wireless Charging': 'categoryWirelessCharging',
    'Display Interfaces': 'categoryDisplayInterfaces',
    'Audio Electronics': 'categoryAudioElectronics',
    'RF Design': 'categoryRFDesign',
    'Antenna Design': 'categoryAntennaDesign',
    'Workshop Safety': 'categoryWorkshopSafety',
    'Low Power Design': 'categoryLowPower',
    'High Speed Design': 'categoryHighSpeed',
    'Schematic Capture': 'categorySchematicCapture',
    'PCB Fabrication': 'categoryPCBFabrication',
    'Bluetooth': 'categoryBluetooth',
    'WiFi': 'categoryWiFi',
    'LoRa': 'categoryLoRa',
    'Zigbee': 'categoryZigbee',
    'CAN Bus': 'categoryCANBus',
    'SPI': 'categorySPI',
    'I2C': 'categoryI2C',
    'UART': 'categoryUART',
    'Ethernet': 'categoryEthernet',
    'USB': 'categoryUSB',
    'HDMI': 'categoryHDMI',
    'Additive Manufacturing': 'categoryAdditiveManufacturing',
    'SolidWorks': 'categorySolidWorks',
    'Fusion 360': 'categoryFusion360',
    'KiCad': 'categoryKiCad',
    'Altium Designer': 'categoryAltiumDesigner',
    'Eagle CAD': 'categoryEagleCAD',
    'STM32': 'categorySTM32',
    'AVR': 'categoryAVR',
    'ARM Cortex': 'categoryARMCortex',
    'PLC': 'categoryPLC',
    'SCADA': 'categorySCADA',
    'Edge Devices': 'categoryEdgeDevices',
    'Test Benches': 'categoryTestBenches',
    'Power Tools': 'categoryPowerTools',
    'Hand Tools': 'categoryHandTools',
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('projectBasics')}</h2>
        <p className="text-gray-600 mb-8">
          {t('startWithEssentialInformation')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {t('projectName')} *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder={t('enterProjectName')}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Elevator Pitch */}
          <div>
            <label htmlFor="elevator_pitch" className="block text-sm font-medium text-gray-700 mb-2">
              {t('elevatorPitch')} *
            </label>
            <textarea
              id="elevator_pitch"
              rows={3}
              value={formData.elevator_pitch}
              onChange={(e) => updateFormData('elevator_pitch', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                errors.elevator_pitch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder={t('describeProject')}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('briefEngagingDescription')}
            </p>
            {errors.elevator_pitch && (
              <p className="mt-1 text-sm text-red-600">{errors.elevator_pitch}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('projectDescription')} *
            </label>
            <textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder={t('provideDetailedDescription')}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('explainProject')}
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('coverImage')}
            </label>
            
            {formData.cover_image ? (
              <div className="relative">
                <img
                  src={getImagePreview()}
                  alt="Project cover preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
              >
                <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 text-center">
                  {t('clickToUploadCoverImage')}
                  <br />
                  <span className="text-sm">{t('pngJpgUpTo10MB')}</span>
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              {t('category')} *
            </label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) => updateFormData('category_id', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                errors.category_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">{t('selectCategory')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name ? t(categoryNameToKey[category.name] || category.name) : ''}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              {t('difficultyLevel')}
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => updateFormData('difficulty', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <option value="Beginner">{t('beginner')}</option>
              <option value="Intermediate">{t('intermediate')}</option>
              <option value="Advanced">{t('advanced')}</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {t('howChallenging')}
            </p>
          </div>

          {/* Tips */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-indigo-800 mb-2">{t('tipsForGreatProject')}</h3>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>{t('useClearDescriptiveName')}</li>
              <li>{t('addHighQualityCoverImage')}</li>
              <li>{t('writeEngagingElevatorPitch')}</li>
              <li>{t('chooseMostAppropriateCategory')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicsTab; 