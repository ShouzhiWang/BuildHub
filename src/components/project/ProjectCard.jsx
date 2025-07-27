import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TagIcon, HeartIcon, ChatBubbleLeftIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import api, { bookmarkAPI } from '../../api/config';

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getFullAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const baseURL = api.defaults.baseURL || 'http://localhost:8000';
  return `${baseURL.replace('/api', '')}${avatarUrl}`;
};

const getFullCoverImageUrl = (coverImageUrl) => {
  if (!coverImageUrl) return null;
  if (coverImageUrl.startsWith('http')) return coverImageUrl;
  const baseURL = api.defaults.baseURL || 'http://localhost:8000';
  return `${baseURL.replace('/api', '')}${coverImageUrl}`;
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

const ProjectCard = ({ project }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Check bookmark status when component mounts or user changes
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (user && project.id) {
        try {
          const response = await bookmarkAPI.checkStatus(project.id);
          setIsBookmarked(response.bookmarked);
        } catch (error) {
          console.error('Error checking bookmark status:', error);
        }
      } else {
        setIsBookmarked(false);
      }
    };

    checkBookmarkStatus();
  }, [user, project.id]);

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert(t('pleaseLoginToBookmark'));
      return;
    }

    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await bookmarkAPI.remove(project.id);
        setIsBookmarked(false);
      } else {
        await bookmarkAPI.toggle(project.id);
        setIsBookmarked(true);
      }
      
      // Dispatch custom event to notify other components about bookmark change
      window.dispatchEvent(new CustomEvent('bookmark-changed', {
        detail: {
          projectId: project.id,
          bookmarked: !isBookmarked
        }
      }));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      if (error.message) {
        alert(error.message);
      } else {
        alert(t('failedToUpdateBookmark'));
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group hover:shadow-2xl relative">
    <div className="relative overflow-hidden">
      <img
        src={getFullCoverImageUrl(project.cover_image) || 'https://placehold.co/600x400/6366f1/ffffff?text=Project'}
        alt={project.title}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        onError={e => { 
          e.target.onerror = null; 
          e.target.src = 'https://placehold.co/600x400/6366f1/ffffff?text=Project'; 
        }}
      />
      {project.status !== 'published' && (
        <span
          className={`absolute top-2 left-2 ${
            project.status === 'rejected'
              ? 'bg-red-500'
              : project.status === 'draft'
              ? 'bg-gray-500'
              : project.status === 'private'
              ? 'bg-purple-500'
              : 'bg-yellow-500'
          } text-white text-xs px-2 py-1 rounded-full uppercase`}
        >
          {project.status}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      {/* Bookmark Icon */}
      <button
        onClick={handleBookmarkClick}
        disabled={bookmarkLoading}
        className={`absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md transition-all duration-200 ${
          bookmarkLoading 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:bg-gray-100 cursor-pointer'
        }`}
        title={isBookmarked ? t('removeBookmark') : t('addBookmark')}
      >
        {isBookmarked ? (
          <BookmarkSolid className="w-6 h-6 text-indigo-600" />
        ) : (
          <BookmarkIcon className="w-6 h-6 text-gray-400 hover:text-indigo-600" />
        )}
      </button>
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${getDifficultyColor(project.difficulty)}`}>
          {project.difficulty ? t(project.difficulty.toLowerCase()) : ''}
        </span>
        <div className="flex items-center text-violet-600 text-sm bg-violet-100 px-2 py-1 rounded-full">
          <TagIcon className="w-4 h-4 mr-1" />
          {project.category?.name ? t(categoryNameToKey[project.category.name] || project.category.name) : ''}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
        {project.title}
      </h3>
      <p className="text-gray-600 mb-4 line-clamp-3">
        {project.description}
      </p>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-gray-500 text-sm">
          {project.author?.profile?.avatar ? (
            <Link to={`/users/${project.author.username}`}>
              <img
                className="w-8 h-8 rounded-full mr-2 ring-2 ring-gray-200 object-cover bg-white"
                src={getFullAvatarUrl(project.author.profile.avatar)}
                alt={project.author?.username}
                onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
              />
            </Link>
          ) : (
            <Link to={`/users/${project.author.username}`}>
              <img
                className="w-8 h-8 rounded-full mr-2 ring-2 ring-gray-200"
                src={`https://ui-avatars.com/api/?name=${project.author?.username}&background=6366f1&color=fff`}
                alt={project.author?.username}
              />
            </Link>
          )}
          <Link to={`/users/${project.author.username}`} className="font-medium hover:underline">
            {project.author?.username}
          </Link>
        </div>
        <div className="flex items-center space-x-4 text-gray-500 text-sm">
          <div className="flex items-center">
            <HeartIcon className="w-4 h-4 mr-1 text-red-500" />
            <span>{project.likes_count || Math.floor(Math.random() * 100) + 20}</span>
          </div>
          <div className="flex items-center">
            <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
            <span>{project.comments_count || 0}</span>
          </div>
        </div>
      </div>
      <Link
        to={`/projects/${project.id}`}
        className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {t('viewProject')}
      </Link>
    </div>
  </div>
  );
};

export default ProjectCard; 