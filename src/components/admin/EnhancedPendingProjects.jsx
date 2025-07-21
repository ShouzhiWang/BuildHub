import React, { useEffect, useState } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import api from '../../api/config';
import { useTranslation } from '../../hooks/useTranslation';

const getFullCoverImageUrl = (coverImageUrl) => {
  if (!coverImageUrl) return null;
  if (coverImageUrl.startsWith('http')) return coverImageUrl;
  const baseURL = api.defaults.baseURL || 'http://localhost:8000';
  return `${baseURL.replace('/api', '')}${coverImageUrl}`;
};

const FilterDropdown = ({ label, options, value, onChange, icon: Icon }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="">{label}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
  </div>
);

const ProjectCard = ({ project, isSelected, onSelect, onPreview, onApprove, onReject, actionLoading, isActive }) => {
  const { t } = useTranslation();
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
    <div className={`bg-white rounded-lg border p-4 hover:border-gray-300 transition-colors ${
      isActive ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' :
      isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 
      'border-gray-200'
    }`}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 
                className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => onPreview(project)}
              >
                {project.title}
              </h3>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  {project.author?.username}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {Math.ceil((new Date() - new Date(project.created_at)) / (1000 * 60 * 60 * 24))} days ago
                </div>
              </div>
              {project.category && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  {project.category.name ? t(categoryNameToKey[project.category.name] || project.category.name) : ''}
                </span>
              )}
              {project.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onPreview(project)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Preview"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onApprove(project.id)}
                disabled={actionLoading}
                className={`p-2 rounded-lg transition-colors ${
                  actionLoading 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
                title="Approve"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(project.id)}
                disabled={actionLoading}
                className={`p-2 rounded-lg transition-colors ${
                  actionLoading 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Reject"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectPreviewPanel = ({ project, onClose, onApprove, onReject, actionLoading }) => {
  const { t } = useTranslation();
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
  if (!project) return null;

  const handleApprove = async () => {
    await onApprove(project.id);
  };

  const handleReject = async () => {
    await onReject(project.id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-96 lg:h-full lg:max-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 truncate">{project.title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Close preview"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Author:</span>
            <span className="text-gray-900">{project.author?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Category:</span>
            <span className="text-gray-900">{project.category?.name ? t(categoryNameToKey[project.category.name] || project.category.name) : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Difficulty:</span>
            <span className="text-gray-900 capitalize">{project.difficulty}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Submitted:</span>
            <span className="text-gray-900">{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Cover Image */}
        {project.cover_image && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Cover Image</h3>
            <img src={getFullCoverImageUrl(project.cover_image)} alt="Project cover" className="w-full max-h-48 object-cover rounded border" />
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
        </div>

        {/* Elevator Pitch */}
        {project.elevator_pitch && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Elevator Pitch</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{project.elevator_pitch}</p>
          </div>
        )}

        {/* Story Content */}
        {project.story_content && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Project Story</h3>
            <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: project.story_content }} />
          </div>
        )}

        {/* Team Members */}
        {project.team_members && project.team_members.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Team Members</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {project.team_members.map((member, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{member.user?.username || member.contributor_name}</span>
                  <span className="text-gray-500">{member.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Components */}
        {project.components && project.components.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Components</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {project.components.map((component, idx) => (
                <li key={idx}>• {component.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        {project.steps && project.steps.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Build Steps</h3>
            <ol className="space-y-3 text-sm">
              {project.steps.map((step, idx) => (
                <li key={idx} className="flex">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <p className="text-gray-600 mt-1">{step.instructions}</p>
                    {step.image && (
                      <img src={step.image} alt={`Step ${idx + 1}`} className="mt-2 max-h-32 rounded border" />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Bill of Materials */}
        {project.bill_of_materials && project.bill_of_materials.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Bill of Materials</h3>
            <div className="space-y-2 text-sm">
              {project.bill_of_materials.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-900">{item.name}</span>
                  <div className="text-gray-600">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded mr-2">{item.item_type}</span>
                    <span>x{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {project.attachments && project.attachments.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Attachments</h3>
            <div className="space-y-2 text-sm">
              {project.attachments.map((attachment, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{attachment.title}</div>
                  <div className="text-gray-600 text-xs">{attachment.attachment_type}</div>
                  {attachment.file_upload && (
                    <a 
                      href={attachment.file_upload} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-xs underline mt-1 inline-block"
                    >
                      Download
                    </a>
                  )}
                  {attachment.repository_link && (
                    <a 
                      href={attachment.repository_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-xs underline mt-1 inline-block ml-3"
                    >
                      Repository
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-4 flex gap-3">
        <button
          onClick={handleApprove}
          disabled={actionLoading}
          className={`flex-1 inline-flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            actionLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500'
          }`}
        >
          <CheckIcon className="w-4 h-4 mr-2" />
          {actionLoading ? 'Approving...' : 'Approve'}
        </button>
        <button
          onClick={handleReject}
          disabled={actionLoading}
          className={`flex-1 inline-flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            actionLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500'
          }`}
        >
          <XMarkIcon className="w-4 h-4 mr-2" />
          {actionLoading ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    </div>
  );
};

const EnhancedPendingProjects = ({ setPendingCount }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [previewProject, setPreviewProject] = useState(null);
  const [categories, setCategories] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectingProject, setRejectingProject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, categoriesRes] = await Promise.all([
        api.get('/projects/?status=pending'),
        api.get('/categories/')
      ]);
      const projects = projectsRes.data.results || projectsRes.data;
      setProjects(projects);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      if (setPendingCount) setPendingCount(projects.length);
      // If a project is selected, update it with the latest data
      if (previewProject) {
        const updated = projects.find(p => p.id === previewProject.id);
        setPreviewProject(updated || null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) ||
                           project.author?.username.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || project.category?.id === parseInt(categoryFilter);
      const matchesDifficulty = !difficultyFilter || project.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'author':
          return a.author?.username.localeCompare(b.author?.username);
        case 'title':
          return a.title.localeCompare(b.title);
        default: // newest
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    } else {
      setSelectedProjects(new Set());
    }
  };

  const handleSelectProject = (projectId, checked) => {
    const newSelected = new Set(selectedProjects);
    if (checked) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleIndividualApprove = async (projectId) => {
    setActionLoading(true);
    try {
      await api.patch(`/projects/${projectId}/`, { status: 'published' });
      fetchData();
    } catch (error) {
      console.error('Failed to approve project:', error);
      alert('Failed to approve project. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIndividualReject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setRejectingProject(project);
    setRejectionReason('');
  };

  const handleRejectWithMessage = async () => {
    if (!rejectingProject || !rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setActionLoading(true);
    try {
      // Update project status to rejected
      await api.patch(`/projects/${rejectingProject.id}/`, { status: 'rejected' });
      
      // Send rejection message to project author
      await api.post('/admin/send-message/', {
        recipient_id: rejectingProject.author?.id,
        title: `Project "${rejectingProject.title}" was not approved`,
        content: rejectionReason
      });

      // Reset rejection modal state
      setRejectingProject(null);
      setRejectionReason('');
      
      // Refresh the project list
      fetchData();
    } catch (error) {
      console.error('Failed to reject project:', error);
      alert('Failed to reject project. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProjects.size === 0) return;
    
    setActionLoading(true);
    try {
      const promises = Array.from(selectedProjects).map(id =>
        api.patch(`/projects/${id}/`, { status: 'published' })
      );
      await Promise.all(promises);
      setSelectedProjects(new Set());
      fetchData();
    } catch (error) {
      console.error('Failed to approve projects:', error);
      alert('Failed to approve projects. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkReject = () => {
    if (selectedProjects.size === 0) return;
    
    // For bulk reject, we'll just reject without individual messages for now
    // In a real app, you might want a different UX for bulk rejection
    const confirmMessage = `Are you sure you want to reject ${selectedProjects.size} project${selectedProjects.size > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      handleBulkRejectConfirm();
    }
  };

  const handleBulkRejectConfirm = async () => {
    setActionLoading(true);
    try {
      const promises = Array.from(selectedProjects).map(id =>
        api.patch(`/projects/${id}/`, { status: 'rejected' })
      );
      await Promise.all(promises);
      setSelectedProjects(new Set());
      fetchData();
    } catch (error) {
      console.error('Failed to reject projects:', error);
      alert('Failed to reject projects. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

    return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <FilterDropdown
              label="All Categories"
              options={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
              value={categoryFilter}
              onChange={setCategoryFilter}
              icon={FunnelIcon}
            />
            <FilterDropdown
              label="All Difficulties"
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' }
              ]}
              value={difficultyFilter}
              onChange={setDifficultyFilter}
              icon={FunnelIcon}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
              <option value="author">By Author</option>
            </select>
            <button
              onClick={() => setShowPreviewPanel(!showPreviewPanel)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                showPreviewPanel
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={showPreviewPanel ? 'Hide Preview' : 'Show Preview'}
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedProjects.size > 0 && (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <span className="text-sm text-indigo-700">
              {selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkApprove}
                disabled={actionLoading}
                className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                  actionLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Approve All'}
              </button>
              <button
                onClick={handleBulkReject}
                disabled={actionLoading}
                className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                  actionLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Reject All'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={filteredProjects.length > 0 && selectedProjects.size === filteredProjects.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">
            Showing {filteredProjects.length} of {projects.length} pending projects
          </span>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Projects List */}
        <div className={`${showPreviewPanel && previewProject ? 'lg:w-1/2' : 'w-full'} transition-all duration-300`}>
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pending projects found</p>
              </div>
            ) : (
              filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProjects.has(project.id)}
                  onSelect={(e) => handleSelectProject(project.id, e.target.checked)}
                  onPreview={setPreviewProject}
                  onApprove={handleIndividualApprove}
                  onReject={handleIndividualReject}
                  actionLoading={actionLoading}
                  isActive={previewProject?.id === project.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreviewPanel && (
          <div className="w-full lg:w-1/2">
            {previewProject ? (
              <ProjectPreviewPanel
                project={previewProject}
                onClose={() => setPreviewProject(null)}
                onApprove={handleIndividualApprove}
                onReject={handleIndividualReject}
                actionLoading={actionLoading}
              />
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 h-96 lg:h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <EyeIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Project Selected</p>
                  <p className="text-sm">Click on a project from the list to preview its details</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setRejectingProject(null)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XMarkIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reject Project
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Please provide a reason for rejecting "{rejectingProject.title}". This message will be sent to the project author.
                      </p>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Explain why this project needs improvement..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleRejectWithMessage}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    actionLoading || !rejectionReason.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject & Send Message'}
                </button>
                <button
                  onClick={() => setRejectingProject(null)}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPendingProjects; 