import React, { useEffect, useState } from 'react';
import api from '../../api/config';
import { useTranslation } from '../../hooks/useTranslation';

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

const ProjectPreview = ({ project }) => {
  const { t } = useTranslation();
  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a project to preview.
      </div>
    );
  }
  return (
    <div className="p-4 overflow-y-auto max-h-[80vh]">
      <h2 className="text-2xl font-bold mb-2 text-indigo-700">{project.title}</h2>
      <div className="mb-2 text-gray-600">By <span className="font-semibold">{project.author?.username}</span></div>
      {project.cover_image && (
        <img src={getFullCoverImageUrl(project.cover_image)} alt="cover" className="w-full max-h-48 object-cover rounded mb-4" />
      )}
      <div className="mb-2 text-gray-700"><span className="font-semibold">Category:</span> {project.category?.name ? t(categoryNameToKey[project.category.name] || project.category.name) : ''}</div>
      <div className="mb-2 text-gray-700"><span className="font-semibold">Difficulty:</span> {project.difficulty}</div>
      <div className="mb-2 text-gray-700"><span className="font-semibold">Status:</span> {project.status}</div>
      <div className="mb-2 text-gray-700"><span className="font-semibold">Created:</span> {new Date(project.created_at).toLocaleString()}</div>
      <div className="mb-2 text-gray-700"><span className="font-semibold">Updated:</span> {new Date(project.updated_at).toLocaleString()}</div>
      <div className="mb-4 text-gray-700"><span className="font-semibold">Description:</span> {project.description}</div>
      {project.elevator_pitch && (
        <div className="mb-4 text-gray-700"><span className="font-semibold">Elevator Pitch:</span> {project.elevator_pitch}</div>
      )}
      {/* Always show full story content if present */}
      {project.story_content && (
        <div className="prose max-w-none border-t pt-4 mt-4 bg-white rounded shadow-inner p-4" style={{ background: '#fff' }}>
          <h3 className="font-bold text-lg mb-2">Project Story</h3>
          <div dangerouslySetInnerHTML={{ __html: project.story_content }} />
        </div>
      )}
      {/* Team Members */}
      {project.team_members && project.team_members.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Team Members</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {project.team_members.map((m, i) => (
              <li key={i}>{m.user?.username || m.contributor_name} ({m.role || ''})</li>
            ))}
          </ul>
        </div>
      )}
      {/* Work Attributions */}
      {project.work_attributions && project.work_attributions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Work Attributions</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {project.work_attributions.map((w, i) => (
              <li key={i}>{w.contributor_name}: {w.credit_description} {w.link && (<a href={w.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 underline">Link</a>)}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Components */}
      {project.components && project.components.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Components</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {project.components.map((c, i) => (
              <li key={i}>{c.name}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Steps */}
      {project.steps && project.steps.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Steps</h3>
          <ol className="list-decimal ml-6 text-gray-700">
            {project.steps.map((s, i) => (
              <li key={i} className="mb-2">
                <span className="font-semibold">{s.title}</span>: {s.instructions}
                {s.image && <img src={s.image} alt="step" className="max-h-32 mt-2 rounded" />}
              </li>
            ))}
          </ol>
        </div>
      )}
      {/* Attachments */}
      {project.attachments && project.attachments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Attachments</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {project.attachments.map((a, i) => (
              <li key={i}>
                <span className="font-semibold">{a.title}</span> ({a.attachment_type})
                {a.file_upload && (
                  <a href={a.file_upload} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 underline">Download</a>
                )}
                {a.repository_link && (
                  <a href={a.repository_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 underline">Repository</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Bill of Materials */}
      {project.bill_of_materials && project.bill_of_materials.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Bill of Materials</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {project.bill_of_materials.map((b, i) => (
              <li key={i}>{b.name} ({b.item_type}) x{b.quantity}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Comments */}
      {project.comments && project.comments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Comments</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {project.comments.map((c, i) => (
              <li key={i}><span className="font-semibold">{c.author?.username}:</span> {c.body}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Show any extra fields for completeness */}
      {Object.entries(project).map(([key, value]) => {
        if ([
          'id','title','author','cover_image','category','difficulty','status','created_at','updated_at','description','elevator_pitch','story_content','team_members','work_attributions','components','steps','attachments','bill_of_materials','comments'
        ].includes(key)) return null;
        if (typeof value === 'string' && value.trim() !== '') {
          return <div key={key} className="mt-2 text-gray-700"><span className="font-semibold">{key}:</span> {value}</div>;
        }
        if (typeof value === 'number') {
          return <div key={key} className="mt-2 text-gray-700"><span className="font-semibold">{key}:</span> {value}</div>;
        }
        return null;
      })}
    </div>
  );
};

const PendingProjectsSection = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/projects/?status=pending');
      const projects = response.data.results || response.data;
      setPendingProjects(projects);
      // If a project is selected, update it with the latest data
      if (selectedProject) {
        const updated = projects.find(p => p.id === selectedProject.id);
        setSelectedProject(updated || null);
      }
    } catch (err) {
      setError('Failed to load pending projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId) => {
    setActionLoading(true);
    try {
      await api.patch(`/projects/${projectId}/`, { status: 'published' });
      await fetchPendingProjects();
    } catch (err) {
      alert('Failed to approve project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (projectId) => {
    setRejectingId(projectId);
    setRejectionReason('');
    setModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      // Set project status to 'rejected'
      await api.patch(`/projects/${rejectingId}/`, { status: 'rejected' });
      // Send rejection message to the project author
      await api.post('/admin/send-message/', {
        recipient_id: pendingProjects.find(p => p.id === rejectingId)?.author?.id,
        title: 'Your project was rejected',
        content: rejectionReason
      });
      setModalOpen(false);
      setRejectingId(null);
      setRejectionReason('');
      await fetchPendingProjects();
    } catch (err) {
      alert('Failed to reject project.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Preview Panel */}
      <div className="md:w-1/2 w-full bg-gray-50 rounded-lg shadow-inner min-h-[400px]">
        <ProjectPreview project={selectedProject} />
      </div>
      {/* Table Panel */}
      <div className="md:w-1/2 w-full">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : pendingProjects.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No pending projects.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingProjects.map(project => (
                  <tr key={project.id} className={selectedProject?.id === project.id ? 'bg-indigo-50' : ''}>
                    <td className="px-4 py-2 font-semibold text-indigo-700 cursor-pointer underline hover:text-indigo-900" onClick={() => setSelectedProject(project)}>
                      {project.title}
                    </td>
                    <td className="px-4 py-2">{project.author?.username}</td>
                    <td className="px-4 py-2">{new Date(project.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                        onClick={() => handleApprove(project.id)}
                        disabled={actionLoading}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                        onClick={() => handleReject(project.id)}
                        disabled={actionLoading}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reject Project</h3>
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              disabled={actionLoading}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                onClick={handleRejectConfirm}
                disabled={actionLoading}
              >
                Reject & Send Reason
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProjectsSection; 