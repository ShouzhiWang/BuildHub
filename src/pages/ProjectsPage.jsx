import React, { useState, useEffect } from 'react';
import ProjectCard from '../components/project/ProjectCard';
import api from '../api/config';
import { bookmarkAPI } from '../api/config';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { BookmarkIcon } from '@heroicons/react/24/outline';

const ProjectsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [sort, setSort] = useState('trending');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [showBookmarked, setShowBookmarked] = useState(false);

  const sortOptions = [
    { value: 'trending', label: t('trending') },
    { value: 'popular', label: t('popular') },
    { value: 'newest', label: t('newest') },
    { value: 'most_respects', label: t('mostRespects') },
  ];

  const difficultyOptions = [
    { value: '', label: t('allDifficulties') },
    { value: 'Beginner', label: t('beginner') },
    { value: 'Intermediate', label: t('intermediate') },
    { value: 'Advanced', label: t('advanced') },
  ];

  const typeOptions = [
    { value: '', label: t('anyType') },
    { value: 'Tutorial', label: t('tutorials') },
    { value: 'Work in progress', label: t('workInProgress') },
  ];

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

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/');
        const data = response.data;
        setCategories(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        // Ignore category fetch error for now
      }
    };
    fetchCategories();
  }, []);

  // Fetch projects when filters change
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        let params = [];
        if (sort) params.push(`sort=${encodeURIComponent(sort)}`);
        if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
        if (category) params.push(`category=${encodeURIComponent(category)}`);
        if (type) params.push(`type=${encodeURIComponent(type)}`);
        params.push('status=published'); // Only published projects
        const query = params.length ? `?${params.join('&')}` : '';
        const response = await api.get(`/projects/${query}`);
        setProjects(response.data.results || response.data);
      } catch (err) {
        setError(t('failedToLoadProjects'));
      } finally {
        setLoading(false);
      }
    };

    const fetchBookmarkedProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await bookmarkAPI.getUserBookmarks();
        // Extract project data from bookmark objects
        const bookmarkedProjects = response.map(bookmark => bookmark.project);
        setProjects(bookmarkedProjects);
      } catch (err) {
        setError(t('failedToLoadBookmarkedProjects'));
      } finally {
        setLoading(false);
      }
    };

    if (showBookmarked && user) {
      fetchBookmarkedProjects();
    } else {
      fetchProjects();
    }
  }, [sort, difficulty, category, type, showBookmarked, user]); // Removed 't' from dependencies

  // Reset bookmark filter when user logs out
  useEffect(() => {
    if (!user && showBookmarked) {
      setShowBookmarked(false);
    }
  }, [user, showBookmarked]);

  // Auto-refresh bookmarked projects when bookmark status changes
  useEffect(() => {
    if (!showBookmarked || !user) return;

    // Create a custom event listener for bookmark changes
    const handleBookmarkChange = () => {
      // Refetch bookmarked projects when a bookmark is added/removed
      const fetchBookmarkedProjects = async () => {
        try {
          const response = await bookmarkAPI.getUserBookmarks();
          const bookmarkedProjects = response.map(bookmark => bookmark.project);
          setProjects(bookmarkedProjects);
        } catch (err) {
          console.error('Failed to refresh bookmarked projects:', err);
        }
      };
      fetchBookmarkedProjects();
    };

    // Listen for bookmark changes
    window.addEventListener('bookmark-changed', handleBookmarkChange);

    return () => {
      window.removeEventListener('bookmark-changed', handleBookmarkChange);
    };
  }, [showBookmarked, user]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('exploreProjects')}</h1>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap gap-4 mb-10 items-center bg-white p-4 rounded-lg shadow-sm">
          {/* Sort Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('sortBy')}</label>
            <select
              className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={sort}
              onChange={e => setSort(e.target.value)}
              disabled={showBookmarked}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Difficulty Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('difficulty')}</label>
            <select
              className="block w-44 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              disabled={showBookmarked}
            >
              {difficultyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
            <select
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={showBookmarked}
            >
              <option value="">{t('allProjects')}</option>
              {Array.isArray(categories) && categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name ? t(categoryNameToKey[cat.name] || cat.name) : ''}</option>
              ))}
            </select>
          </div>
          {/* Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
            <select
              className="block w-44 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={type}
              onChange={e => setType(e.target.value)}
              disabled={showBookmarked}
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Bookmark Filter */}
          {user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('showBookmarked')}</label>
              <button
                onClick={() => setShowBookmarked(!showBookmarked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  showBookmarked
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <BookmarkIcon className="w-4 h-4" />
                {showBookmarked ? t('bookmarkedOnly') : t('allProjects')}
              </button>
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-20">
            <p>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t('noProjects')}</h3>
            <p className="text-gray-400">{t('noProjects')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage; 