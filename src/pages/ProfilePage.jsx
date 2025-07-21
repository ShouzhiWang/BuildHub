import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/config';
import { useNavigate } from 'react-router-dom';
import { 
  PencilSquareIcon, 
  CheckIcon, 
  XMarkIcon, 
  PhotoIcon, 
  MapPinIcon, 
  BriefcaseIcon,
  UserCircleIcon,
  CalendarIcon,
  EnvelopeIcon,
  TagIcon,
  CpuChipIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// Hardware-focused skill tags
const AVAILABLE_SKILLS = [
  'Arduino', 'Raspberry Pi', 'ESP32', 'Microcontrollers', 'Embedded C', 'FPGA', 'PCB Design',
  'Soldering', 'Oscilloscope', '3D Printing', 'Laser Cutting', 'CNC', 'SolidWorks', 'Fusion 360',
  'KiCad', 'Altium Designer', 'Eagle CAD', 'STM32', 'AVR', 'ARM Cortex', 'IoT', 'Sensors',
  'Actuators', 'Motors', 'Stepper Motors', 'Servo Motors', 'Power Electronics', 'Analog Circuits',
  'Digital Circuits', 'Wireless Communication', 'Bluetooth', 'WiFi', 'LoRa', 'Zigbee',
  'Robotics', 'ROS', 'Mechatronics', 'Machine Vision', 'Signal Processing', 'MATLAB',
  'LabVIEW', 'C', 'C++', 'Python', 'RTOS', 'VHDL', 'Verilog', 'FPGA Toolchains',
  'Battery Management', 'Power Supply Design', 'Test Equipment', 'Prototyping',
  'Mechanical Design', 'CAD', 'CAM', 'Additive Manufacturing', 'Wearables', 'Drones',
  'Autonomous Vehicles', 'Edge Computing', 'Industrial Automation', 'PLC', 'SCADA',
  'Sensors Integration', 'PCB Assembly', 'Wireless Charging', 'Thermal Management',
  'EMI/EMC', 'Signal Integrity', 'PCB Layout', 'Hardware Debugging', 'Firmware',
  'Low Power Design', 'High Speed Design', 'Schematic Capture', 'PCB Fabrication',
  'Bluetooth Low Energy', 'CAN Bus', 'LIN Bus', 'SPI', 'I2C', 'UART', 'Ethernet',
  'USB', 'HDMI', 'Display Interfaces', 'Audio Electronics', 'RF Design', 'Antenna Design',
  'Power Tools', 'Hand Tools', 'Workshop Safety', 'Reverse Engineering', 'Hardware Security'
];

// Utility function to construct full avatar URL
const getFullAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  
  // Get the base URL from the API config
  const baseURL = api.defaults.baseURL || 'http://localhost:8000';
  return `${baseURL.replace('/api', '')}${avatarUrl}`;
};

const ProfilePage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ bio: '', skills: [], location: '', avatar: null });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    let isMounted = true;
    
    const fetchProfileData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        
        // Fetch profile first
        const profileResponse = await api.get('/auth/profile/');
        if (!isMounted) return;
        setProfile(profileResponse.data);
        
        // Set form data
        const profileData = profileResponse.data.profile || {};
        if (!isMounted) return;
        setForm({
          bio: profileData.bio || '',
          skills: profileData.skills || [],
          location: profileData.location || '',
          avatar: null,
        });
        
        // Construct full avatar URL
        const avatarUrl = profileData.avatar;
        const fullAvatarUrl = getFullAvatarUrl(avatarUrl);
        if (!isMounted) return;
        setAvatarPreview(fullAvatarUrl);
        
        // Try to fetch projects, but don't fail if it doesn't work
        try {
          const projectsResponse = await api.get('/user-involved-projects/');
          if (!isMounted) return;
          setProjects(projectsResponse.data);
        } catch (projectsError) {
          console.warn('Could not fetch user projects:', projectsError);
          if (!isMounted) return;
          setProjects([]);
        }
        
      } catch (err) {
        console.error('Error fetching profile data:', err);
        if (!isMounted) return;
        setError(err.response?.data?.detail || t('failedToLoadProfileData'));
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchProfileData();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('chooseImageSmallerThan5MB'));
        return;
      }
      
      setForm(f => ({ ...f, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const addSkill = (skill) => {
    if (!form.skills.includes(skill)) {
      setForm(f => ({ ...f, skills: [...f.skills, skill] }));
    }
    setShowSkillDropdown(false);
  };

  const removeSkill = (skillToRemove) => {
    setForm(f => ({ ...f, skills: f.skills.filter(skill => skill !== skillToRemove) }));
  };

  const handleEdit = () => setEditMode(true);
  
  const handleCancel = () => {
    setEditMode(false);
    const profileData = profile.profile || {};
    setForm({
      bio: profileData.bio || '',
      skills: profileData.skills || [],
      location: profileData.location || '',
      avatar: null,
    });
    
    // Restore the original avatar preview
    const avatarUrl = profileData.avatar;
    const fullAvatarUrl = getFullAvatarUrl(avatarUrl);
    setAvatarPreview(fullAvatarUrl);
    
    setSuccessMessage('');
    setError('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('bio', form.bio);
      formData.append('skills', form.skills.join(',')); // send as comma-separated string
      formData.append('location', form.location);
      if (form.avatar) {
        formData.append('avatar', form.avatar);
      }
      
      // Update profile
      await api.put('/auth/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Refetch profile
      const res = await api.get('/auth/profile/');
      setProfile(res.data);
      
      // Update avatar preview with the new URL
      const updatedProfileData = res.data.profile || {};
      const newAvatarUrl = updatedProfileData.avatar;
      const fullAvatarUrl = getFullAvatarUrl(newAvatarUrl);
      setAvatarPreview(fullAvatarUrl);
      
      setEditMode(false);
      setSuccessMessage(t('profileUpdatedSuccessfully'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err.response?.data);
      setError(t('errorUpdatingProfile'));
    } finally {
      setSaving(false);
    }
  };

  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'published':
        return t('published');
      case 'pending':
        return t('pending');
      case 'draft':
        return t('draft');
      default:
        return status || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t('loadingYourProfile')}</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-red-600 mb-4">
              <UserCircleIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('unableToLoadProfile')}</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                // Trigger a re-fetch instead of reloading the page
                const fetchProfileData = async () => {
                  try {
                    setError(null);
                    const profileResponse = await api.get('/auth/profile/');
                    setProfile(profileResponse.data);
                    
                    const profileData = profileResponse.data.profile || {};
                    setForm({
                      bio: profileData.bio || '',
                      skills: profileData.skills || [],
                      location: profileData.location || '',
                      avatar: null,
                    });
                    
                    const avatarUrl = profileData.avatar;
                    const fullAvatarUrl = getFullAvatarUrl(avatarUrl);
                    setAvatarPreview(fullAvatarUrl);
                    
                    try {
                      const projectsResponse = await api.get('/user-involved-projects/');
                      setProjects(projectsResponse.data);
                    } catch (projectsError) {
                      console.warn('Could not fetch user projects:', projectsError);
                      setProjects([]);
                    }
                  } catch (err) {
                    console.error('Error fetching profile data:', err);
                    setError(err.response?.data?.detail || t('failedToLoadProfileData'));
                  } finally {
                    setLoading(false);
                  }
                };
                fetchProfileData();
              }} 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t('tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <UserCircleIcon className="w-16 h-16 mx-auto mb-4" />
          <p>{t('profileNotFound')}</p>
        </div>
      </div>
    );
  }

  const availableSkillsFiltered = AVAILABLE_SKILLS.filter(skill =>
    !form.skills.includes(skill) &&
    skill.toLowerCase().includes(skillInput.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XMarkIcon className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Header Background */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 sm:h-30"></div>
          
          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Avatar and Info Container */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="relative -mt-16 sm:-mt-20">
                <img
                  src={avatarPreview || '/default-avatar.svg'}
                  alt="avatar"
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.svg';
                  }}
                />
                {editMode && (
                  <button
                    className="absolute bottom-2 right-2 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors shadow-lg"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <PhotoIcon className="w-4 h-4" />
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* User Info and Actions */}
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{profile.username}</h1>
                    {(profile.first_name || profile.last_name) && (
                      <div className="flex items-center text-gray-700 mt-1">
                        <UserCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {profile.first_name} {profile.last_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 mt-1">
                      <EnvelopeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <CalendarIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{t('joined')} {profile.date_joined ? new Date(profile.date_joined).toLocaleDateString() : t('unknown')}</span>
                    </div>
                  </div>
                  
                  {/* Edit Button */}
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                    {editMode ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              {t('loading')}...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="w-4 h-4 mr-2" />
                              {t('saveChanges')}
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4 mr-2" />
                          {t('cancelEdit')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-2" />
                        {t('editProfile')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Information */}
          <div className="lg:col-span-3 space-y-8">
            {/* Bio Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <UserCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">{t('bio')}</h2>
              </div>
              {editMode ? (
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  rows={4}
                  placeholder={t('tellUsAboutYourself')}
                />
              ) : (
                <div className="text-gray-700">
                  {profile.profile?.bio ? (
                    <p className="whitespace-pre-line">{profile.profile.bio}</p>
                  ) : (
                    <p className="text-gray-400 italic">{t('noBioAddedYet')}</p>
                  )}
                </div>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CpuChipIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('skillsAndTechnologies')}</h2>
                </div>
                {editMode && (
                  <div className="relative w-64">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={handleSkillInputChange}
                      onKeyDown={handleSkillInputKeyDown}
                      placeholder={t('typeToSearchAndPressEnter')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {skillInput && availableSkillsFiltered.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {availableSkillsFiltered.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => addSkill(skill)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {form.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {skill}
                      {editMode && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-indigo-900"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">{t('noSkillsAddedYet')}</p>
              )}
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">{t('location')}</h2>
              </div>
              {editMode ? (
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  placeholder={t('whereAreYouBased')}
                />
              ) : (
                <div className="text-gray-700">
                  {profile.profile?.location ? (
                    <p>{profile.profile.location}</p>
                  ) : (
                    <p className="text-gray-400 italic">{t('noLocationSpecified')}</p>
                  )}
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <FolderIcon className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">{t('projects')}</h2>
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {profile.projects?.length || 0}
                </span>
              </div>
              
              {!profile.projects || profile.projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-4">{t('noProjectsYet')}</p>
                  <Link
                    to="/create-project"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {t('createYourFirstProject')}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.projects.map((project) => (
                    <div key={project.id} className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <img
                        src={project.cover_image || '/default-project-cover.jpg'}
                        alt="project cover"
                        className="w-16 h-16 object-cover rounded-lg mr-4"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">{project.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formatStatus(project.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium ml-2 flex-shrink-0"
                      >
                        {t('view')}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 