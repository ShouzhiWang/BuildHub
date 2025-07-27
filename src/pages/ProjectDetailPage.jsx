import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/config';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';

import { 
  PencilSquareIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon,
  CpuChipIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  LinkIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CubeIcon,
  PaperClipIcon,
  ListBulletIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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

const ProjectDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableOfContents, setTableOfContents] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  
  // Slideshow state
  const [slideshow, setSlideshow] = useState(null);
  const [slideshowLoading, setSlideshowLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchProjectAndComments();
    fetchSlideshow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Extract headings from story content for table of contents
  useEffect(() => {
    if (project?.story_content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(project.story_content, 'text/html');
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      
      const toc = headings.map((heading, index) => ({
        id: `heading-${index}`,
        level: parseInt(heading.tagName.substring(1)),
        text: heading.textContent.trim(),
        element: heading
      }));
      
      setTableOfContents(toc);
    }
  }, [project?.story_content]);

  // Add IDs to headings and set up intersection observer
  useEffect(() => {
    if (tableOfContents.length > 0) {
      // Add IDs to headings in the rendered content
      const storySection = document.querySelector('.story-content');
      if (storySection) {
        const headings = storySection.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading, index) => {
          heading.id = `heading-${index}`;
        });

        // Set up intersection observer for active section tracking
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(entry.target.id);
              }
            });
          },
          { rootMargin: '-80px 0px -35% 0px' }
        );

        headings.forEach((heading) => observer.observe(heading));

        return () => observer.disconnect();
      }
    }
  }, [tableOfContents]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Navigation bar height (h-16 = 4rem = 64px)
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight - 20, // Extra 20px spacing
        behavior: 'smooth'
      });
    }
  };

  const fetchProjectAndComments = async () => {
    try {
      const [projectRes, commentsRes] = await Promise.all([
        api.get(`/projects/${id}/`),
        api.get(`/projects/${id}/comments/`)
      ]);
      setProject(projectRes.data);
      const commentsData = commentsRes.data;
      setComments(Array.isArray(commentsData) ? commentsData : commentsData.results || []);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(
        err.response?.data?.detail || 'Failed to load project. It may be private.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    // Refresh comments after new comment is added
    fetchComments();
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/projects/${id}/comments/`);
      const commentsData = response.data;
      setComments(Array.isArray(commentsData) ? commentsData : commentsData.results || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Slideshow functions
  const fetchSlideshow = async () => {
    if (!id) return;
    setSlideshowLoading(true);
    try {
      const response = await api.get(`/projects/${id}/slideshow/get/`);
      setSlideshow(response.data);
      setCurrentSlide(0);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching slideshow:', error);
      }
      setSlideshow(null);
    } finally {
      setSlideshowLoading(false);
    }
  };

  const nextSlide = () => {
    if (slideshow?.slides && currentSlide < slideshow.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    if (slideshow?.slides && index >= 0 && index < slideshow.slides.length) {
      setCurrentSlide(index);
    }
  };

  // Fullscreen functions
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Determine if the user can edit: admin, author, or manager collaborator
  const canEdit = user && project && (
    user.id === project.author?.id ||
    user.is_staff ||
    (Array.isArray(project.team_members) && project.team_members.some(m => m.user?.id === user.id && m.role === 'Manage'))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> {t('goBack')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> {t('back')}
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mt-2">
              {project.title}
            </h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              {project.elevator_pitch}
            </p>
            <div className="mt-3 flex items-center space-x-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                {project.category?.name ? t(categoryNameToKey[project.category.name] || project.category.name) : ''}
              </span>
              <span
                className={`px-3 py-1 rounded-full ${
                  project.difficulty === 'Beginner'
                    ? 'bg-green-100 text-green-800'
                    : project.difficulty === 'Intermediate'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {project.difficulty ? t(project.difficulty.toLowerCase()) : ''}
              </span>
              {project.status !== 'published' && (
                <span
                  className={`px-3 py-1 rounded-full uppercase ${
                    project.status === 'private'
                      ? 'bg-purple-100 text-purple-800'
                      : project.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : project.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {project.status === 'private' ? t('private') : project.status}
                </span>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="space-x-2 flex items-center">
              {/* Edit Draft button */}
              <Link
                to={`/create-project?copyId=${project.id}`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <PencilSquareIcon className="w-5 h-5 mr-2" /> {t('editDraft')}
              </Link>
              {/* Request Publish button for unpublished projects */}
              {project.status !== 'published' && (
                project.status === 'pending' ? (
                  <button
                    disabled
                    className="inline-flex items-center px-4 py-2 bg-yellow-400 text-white rounded-lg cursor-not-allowed opacity-70"
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" /> {t('pendingReview')}
                  </button>
                ) : project.status === 'private' ? (
                  <button
                    onClick={async () => {
                      if (!window.confirm(t('confirmRequestPublish'))) return;
                      try {
                        await api.patch(`/projects/${project.id}/`, { status: 'pending' });
                        alert(t('publishRequestSent'));
                        // Optionally, refetch project data
                        fetchProjectAndComments();
                      } catch (err) {
                        alert(t('failedToRequestPublish'));
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" /> {t('makePublic')}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      if (!window.confirm(t('confirmRequestPublish'))) return;
                      try {
                        await api.patch(`/projects/${project.id}/`, { status: 'pending' });
                        alert(t('publishRequestSent'));
                        // Optionally, refetch project data
                        fetchProjectAndComments();
                      } catch (err) {
                        alert(t('failedToRequestPublish'));
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" /> {t('requestPublish')}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Cover Image */}
        {project.cover_image && (
          <div className="mb-12">
            <img
              src={getFullCoverImageUrl(project.cover_image)}
              alt="Cover"
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Slideshow Section */}
            {slideshowLoading ? (
              <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="flex items-center mb-6">
                  <PresentationChartBarIcon className="w-6 h-6 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">{t('projectSlideshow')}</h2>
                </div>
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
                </div>
              </section>
            ) : slideshow && slideshow.slides && slideshow.slides.length > 0 ? (
              <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <PresentationChartBarIcon className="w-6 h-6 text-purple-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">{t('projectSlideshow')}</h2>
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
                    title={t('closeFullscreen')}
                  >
                    <ArrowsPointingOutIcon className="w-4 h-4 mr-2" />
                    {t('fullscreen')}
                  </button>
                </div>
                
                {/* Slideshow Carousel */}
                <div className="relative">
                  {/* Main Slide */}
                  <div className="relative mb-4">
                    <img
                      src={slideshow.slides[currentSlide].image}
                      alt={`Slide ${slideshow.slides[currentSlide].slide_number}`}
                      className="w-full rounded-lg shadow-lg max-h-96 object-contain bg-white"
                    />
                    
                    {/* Navigation Buttons */}
                    {slideshow.slides.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          disabled={currentSlide === 0}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-purple-600 rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          aria-label={t('previousSlide')}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextSlide}
                          disabled={currentSlide === slideshow.slides.length - 1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-purple-600 rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          aria-label={t('nextSlide')}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  {slideshow.slides.length > 1 && (
                    <div className="flex justify-center gap-2 mb-4">
                      {slideshow.slides.map((slide, idx) => (
                        <button
                          key={slide.id}
                          onClick={() => goToSlide(idx)}
                          className={`w-16 h-10 object-cover rounded border-2 transition-all ${
                            idx === currentSlide 
                              ? 'border-purple-600 opacity-100' 
                              : 'border-gray-300 opacity-60 hover:opacity-80'
                          }`}
                        >
                          <img
                            src={slide.image}
                            alt={`Slide ${slide.slide_number}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Slide Counter */}
                  <div className="text-center text-sm text-gray-600">
                    {t('currentSlide', { current: currentSlide + 1, total: slideshow.slides.length })}
                  </div>
                </div>
              </section>
            ) : null}

            {/* Story Section */}
            <section className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">{t('projectStory')}</h2>
              </div>
              <div className="story-content prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:mb-6 prose-ul:list-disc prose-ul:ml-0 prose-ul:pl-8 prose-ul:mb-6 prose-ol:list-decimal prose-ol:ml-0 prose-ol:pl-8 prose-ol:mb-6 prose-li:mb-2 prose-li:pl-2 prose-li:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-indigo-200 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-6 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-img:rounded-lg prose-img:shadow-md prose-strong:font-semibold prose-em:italic overflow-hidden">
                {project.story_content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: project.story_content }}
                  />
                ) : (
                  <p className="text-lg leading-8">{project.description}</p>
                )}
              </div>
            </section>



            {/* Bill of Materials */}
            {project.bill_of_materials?.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center mb-6">
                  <CubeIcon className="w-6 h-6 text-indigo-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">{t('billOfMaterials')}</h2>
                </div>
                
                {/* Group items by type */}
                {['Hardware', 'Software', 'Tool'].map(itemType => {
                  const items = project.bill_of_materials.filter(item => item.item_type === itemType);
                  if (items.length === 0) return null;
                  
                  const Icon = itemType === 'Hardware' ? CpuChipIcon : 
                              itemType === 'Software' ? CodeBracketIcon : WrenchScrewdriverIcon;
                  const colorClass = itemType === 'Hardware' ? 'text-blue-600' : 
                                   itemType === 'Software' ? 'text-green-600' : 'text-orange-600';
                  
                  return (
                    <div key={itemType} className="mb-6 last:mb-0">
                      <div className="flex items-center mb-4">
                        <Icon className={`w-5 h-5 ${colorClass} mr-2`} />
                        <h3 className="text-lg font-semibold text-gray-800">{t(itemType.toLowerCase())}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            {/* Item Image */}
                            {item.image && (
                              <div className="mb-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-32 object-cover rounded-md"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              {item.quantity > 1 && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  ×{item.quantity}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            )}
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                <LinkIcon className="w-4 h-4 mr-1" />
                                {t('viewLink')}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
                <div className="flex items-center mb-4">
                  <ListBulletIcon className="w-5 h-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{t('contents')}</h3>
                </div>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left text-sm transition-colors ${
                        activeSection === item.id
                          ? 'text-indigo-600 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      style={{
                        paddingLeft: `${(item.level - 1) * 0.75}rem`,
                      }}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </section>
            )}

            {/* Team Members */}
            {project.team_members?.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <UserGroupIcon className="w-5 h-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{t('teamMembers')}</h3>
                </div>
                <div className="space-y-3">
                  {project.team_members.map((m) => {
                    const avatarUrl = m.user.profile?.avatar ? getFullAvatarUrl(m.user.profile.avatar) : null;
                    return (
                      <div key={m.id} className="flex items-center space-x-3">
                        <Link to={`/users/${m.user.username}`}>
                          <img
                            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 bg-white"
                            src={avatarUrl || '/default-avatar.svg'}
                            alt={m.user.username}
                            onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/users/${m.user.username}`} className="font-medium text-gray-900 truncate hover:underline">
                            {m.user.username}
                          </Link>
                          <p className="text-xs text-gray-500 truncate">
                            {m.role} • {m.contribution}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Attachments */}
            {project.attachments?.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <PaperClipIcon className="w-5 h-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{t('attachments')}</h3>
                </div>
                <div className="space-y-3">
                  {project.attachments.map((a) => (
                    <div key={a.id} className="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {a.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {a.attachment_type}
                          </p>
                          {a.description && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {a.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-3">
                          {a.file_upload ? (
                            <a
                              href={a.file_upload}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              {t('download')}
                            </a>
                          ) : (
                            a.repository_link && (
                                                          <a
                              href={a.repository_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              {t('view')}
                            </a>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Work Attributions */}
            {project.work_attributions?.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('acknowledgments')}</h3>
                <div className="space-y-3">
                  {project.work_attributions.map((attribution, index) => (
                    <div key={index} className="border-l-4 border-indigo-200 pl-4">
                      <p className="font-medium text-gray-900">{attribution.contributor_name}</p>
                      <p className="text-sm text-gray-600">{attribution.credit_description}</p>
                      {attribution.link && (
                        <a
                          href={attribution.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          {t('viewLink')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Publish status */}
        {canEdit && project.status === 'draft' && (
          <div className="text-center mt-12 bg-white rounded-xl shadow-sm p-8">
            <p className="text-gray-600 mb-4">
              {t('readyToShareProject')}
            </p>
            <button
              onClick={async () => {
                if (!window.confirm(t('confirmRequestPublish'))) return;
                try {
                  await api.patch(`/projects/${id}/`, { status: 'pending' });
                  await fetchProjectAndComments();
                } catch (err) {
                  console.error('Error requesting publish:', err);
                  alert(t('failedToRequestPublish'));
                }
              }}
              className="inline-flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" /> {t('requestPublish')}
            </button>
          </div>
        )}

        {/* Comments Section */}
        <section className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('comments')} ({comments.length})
          </h2>
          
          <CommentForm 
            projectId={id} 
            onCommentAdded={handleCommentAdded}
          />
          
          <CommentList 
            comments={comments} 
            projectId={id}
            onCommentAdded={handleCommentAdded}
          />
        </section>
      </div>

      {/* Fullscreen Slideshow Modal */}
      {isFullscreen && slideshow && slideshow.slides && slideshow.slides.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all"
              aria-label={t('closeFullscreen')}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Fullscreen Image */}
            <div className="relative max-w-full max-h-full">
              <img
                src={slideshow.slides[currentSlide].image}
                alt={`Slide ${slideshow.slides[currentSlide].slide_number}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Navigation Controls */}
              {slideshow.slides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label={t('previousSlide')}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === slideshow.slides.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label={t('nextSlide')}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  </button>
                </>
              )}
            </div>

            {/* Slide Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              {t('currentSlide', { current: currentSlide + 1, total: slideshow.slides.length })}
            </div>

            {/* Thumbnails */}
            {slideshow.slides.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {slideshow.slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    className={`w-12 h-8 object-cover rounded border-2 transition-all ${
                      idx === currentSlide 
                        ? 'border-white opacity-100' 
                        : 'border-gray-400 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={`Slide ${slide.slide_number}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;   