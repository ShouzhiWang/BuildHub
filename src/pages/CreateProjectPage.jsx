import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/config';
import BasicsTab from '../components/project/BasicsTab';
import TeamTab from '../components/project/TeamTab';
import ThingsTab from '../components/project/ThingsTab';
import StoryTab from '../components/project/StoryTab';
import AttachmentsTab from '../components/project/AttachmentsTab';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  CubeIcon, 
  BookOpenIcon, 
  PaperClipIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import _ from 'lodash';

const CreateProjectPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basics');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [failMessage, setFailMessage] = useState('');
  const [showPreviewOption, setShowPreviewOption] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Editing mode
  const searchParams = new URLSearchParams(location.search);
  const initialEditId = searchParams.get('copyId');
  const [editId, setEditId] = useState(initialEditId);

  // Form data state
  const [formData, setFormData] = useState({
    // Basics
    title: '',
    description: '',
    elevator_pitch: '',
    cover_image: null,
    category_id: '',
    difficulty: 'Beginner',
    status: 'draft', // project is created as draft
    
    // Team
    team_members: [],
    work_attributions: [],
    
    // Things (Bill of Materials)
    bill_of_materials: [],
    
    // Story
    story_content: '',
    
    // Attachments
    attachments: []
  });

  // When the authenticated user becomes available, add them as default team member if not already present
  useEffect(() => {
    if (user && formData.team_members.length === 0) {
      updateFormData('team_members', [
        {
          user_id: user.id,
          user: user,
          contribution: '', // match backend default
          role: 'Manage',
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load existing project if editId present
  useEffect(() => {
    if (!editId) return;

    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${editId}/`);
        const p = response.data;
        // Map API response to formData structure
        const loadedData = {
          title: p.title || '',
          description: p.description || '',
          elevator_pitch: p.elevator_pitch || '',
          cover_image: p.cover_image || null,
          category_id: p.category?.id || p.category_id || '',
          difficulty: p.difficulty || 'Beginner',
          status: p.status || 'draft',
          team_members: p.team_members?.map((m) => ({
            user_id: m.user.id,
            user: m.user,
            contribution: m.contribution,
            role: m.role,
          })) || [],
          work_attributions: p.work_attributions?.map((w) => ({
            contributor_name: w.contributor_name,
            credit_description: w.credit_description,
            link: w.link,
          })) || [],
          bill_of_materials: p.bill_of_materials?.map((b) => ({
            item_type: b.item_type,
            name: b.name,
            description: b.description,
            quantity: b.quantity,
            image: b.image,
            link: b.link,
          })) || [],
          story_content: p.story_content || '',
          attachments: p.attachments?.map((a) => ({
            attachment_type: a.attachment_type,
            title: a.title,
            file_upload: a.file_upload,
            repository_link: a.repository_link,
            description: a.description,
          })) || [],
        };
        setFormData(_.cloneDeep(loadedData));
        setOriginalData(_.cloneDeep(loadedData));
      } catch (err) {
        console.error('Error loading project for edit:', err);
      }
    };

    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Pickup flash message after navigation
  useEffect(() => {
    if (location.state && location.state.flash) {
      setSuccessMessage(location.state.flash);
      window.scrollTo({ top: 0 });
      // Clear flash state so refresh doesn't show again
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generic handler to move to next tab in the wizard
  const handleNextTab = () => {
    // If we are on basics, run validation first
    if (activeTab === 'basics') {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors({});
    }

    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const tabs = [
    { id: 'basics', name: t('basics'), icon: DocumentTextIcon },
    { id: 'team', name: t('team'), icon: UserGroupIcon },
    { id: 'things', name: t('things'), icon: CubeIcon },
    { id: 'story', name: t('story'), icon: BookOpenIcon },
    { id: 'attachments', name: t('attachments'), icon: PaperClipIcon },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      // DRF returns paginated results when pagination is enabled.
      // If the response contains a "results" key, use it; otherwise, assume the response itself is an array.
      const data = response.data;
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basics validation
    if (!formData.title.trim()) {
      newErrors.title = t('projectTitleRequired');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('projectDescriptionRequired');
    }
    if (!formData.elevator_pitch.trim()) {
      newErrors.elevator_pitch = t('elevatorPitchRequired');
    }
    if (!formData.category_id) {
      newErrors.category_id = t('categoryRequired');
    }

    return newErrors;
  };

  const handleSave = async () => {
    const isFilled = (val) => typeof val === 'string' && val.trim() !== '';
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setActiveTab('basics'); // Switch to basics tab if there are validation errors
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();

      // Basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('elevator_pitch', formData.elevator_pitch);
      formDataToSend.append('story_content', formData.story_content);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('author_id', user.id);

      // Cover image - only send if user selected a new file
      if (formData.cover_image instanceof File) {
        formDataToSend.append('cover_image', formData.cover_image);
      }

      // Nested data - use bracket notation so DRF parses lists/objects

      // Ensure each team member has a contribution (backend requires non blank)
      const safeTeam = formData.team_members.map((m) => ({
        ...m,
        contribution: m.contribution?.trim() || 'Contributor',
      }));

      // Team members
      safeTeam.forEach((m, idx) => {
        formDataToSend.append(`team_members_data[${idx}].user_id`, m.user_id);
        if (m.role) formDataToSend.append(`team_members_data[${idx}].role`, m.role);
        if (m.contribution)
          formDataToSend.append(`team_members_data[${idx}].contribution`, m.contribution);
      });

      // Work attributions – keep only rows with at least contributor_name or link/description
      const safeAttributions = formData.work_attributions.filter(
        (w) => w.contributor_name || w.credit_description || w.link
      );
      safeAttributions.forEach((w, idx) => {
        if (w.contributor_name)
          formDataToSend.append(`work_attributions_data[${idx}].contributor_name`, w.contributor_name);
        if (w.credit_description)
          formDataToSend.append(`work_attributions_data[${idx}].credit_description`, w.credit_description);
        if (w.link) formDataToSend.append(`work_attributions_data[${idx}].link`, w.link);
      });

      // Bill of Materials
      const safeBoms = formData.bill_of_materials.filter(
        (b) => isFilled(b.name) && isFilled(b.item_type)
      );
      safeBoms.forEach((b, idx) => {
        formDataToSend.append(`bill_of_materials_data[${idx}].item_type`, b.item_type);
        formDataToSend.append(`bill_of_materials_data[${idx}].name`, b.name);
        if (b.description)
          formDataToSend.append(`bill_of_materials_data[${idx}].description`, b.description);
        formDataToSend.append(`bill_of_materials_data[${idx}].quantity`, b.quantity || 1);
        if (b.link)
          formDataToSend.append(`bill_of_materials_data[${idx}].link`, b.link);
        if (b.image && b.image instanceof File) {
          formDataToSend.append(`bill_of_materials_data[${idx}].image`, b.image);
        }
      });

      // Attachments
      const safeAttachments = formData.attachments.filter(
        (a) => isFilled(a.title) && isFilled(a.attachment_type)
      );
      safeAttachments.forEach((a, idx) => {
        formDataToSend.append(`attachments_data[${idx}].attachment_type`, a.attachment_type);
        formDataToSend.append(`attachments_data[${idx}].title`, a.title);
        if (a.description)
          formDataToSend.append(`attachments_data[${idx}].description`, a.description);
        if (a.repository_link)
          formDataToSend.append(`attachments_data[${idx}].repository_link`, a.repository_link);
        if (a.file_upload && a.file_upload instanceof File) {
          formDataToSend.append(`attachments_data[${idx}].file_upload`, a.file_upload);
        }
      });

      const endpoint = editId ? `/projects/${editId}/` : '/projects/';
      const method = editId ? 'put' : 'post';

      const response = await api[method](endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const wasNew = !editId;
      if (wasNew) {
        // After creating new project, switch to edit mode to prevent duplicates
        const newId = response.data.id;
        setEditId(newId.toString());
        navigate(`/create-project?copyId=${newId}`, {
          replace: true,
          state: { flash: t('projectSavedAsDraft') },
        });
      }

      setSuccessMessage(method === 'post' ? t('projectSavedAsDraft') : t('projectUpdated'));
      
      // Show preview option if in edit mode
      if (editId) {
        setShowPreviewOption(true);
      }
      
      // After successful save, update originalData to match formData
      setOriginalData(_.cloneDeep(formData));
      // Scroll to top so banner is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setFailMessage('');

    } catch (error) {
      console.error('Error creating project:', error);
      const errData = error.response?.data;
      if (errData) {
        setErrors(errData);
        const msg = typeof errData === 'string' ? errData : JSON.stringify(errData);
        setFailMessage(msg);
      } else {
        setErrors({ general: t('errorCreatingProject') });
        setFailMessage(t('errorCreatingProject'));
      }
      window.scrollTo({ top: 0 });
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm(t('confirmDiscardChanges'))) {
      navigate('/');
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!window.confirm(t('confirmDeleteProject'))) return;
    setDeleting(true);
    setFailMessage('');
    try {
      await api.delete(`/projects/${editId}/`);
      navigate('/', { replace: true, state: { flash: t('projectDeleted') } });
    } catch (err) {
      setFailMessage(t('failedToDeleteProject'));
      setDeleting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basics':
        return (
          <BasicsTab
            formData={formData}
            updateFormData={updateFormData}
            categories={categories}
            errors={errors}
          />
        );
      case 'team':
        return (
          <TeamTab
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 'things':
        return (
          <ThingsTab
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 'story':
        return (
          <StoryTab
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 'attachments':
        return (
          <AttachmentsTab
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  // Utility: normalize form data for dirty check
  function normalizeFormData(data) {
    if (!data) return data;
    // Helper to sort arrays by a key
    const sortBy = (arr, key) => [...arr].sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
    return {
      ...data,
      team_members: sortBy((data.team_members || []).map(m => ({
        user_id: m.user_id,
        contribution: m.contribution || '',
        role: m.role || '',
      })), 'user_id'),
      work_attributions: sortBy((data.work_attributions || []).map(w => ({
        contributor_name: w.contributor_name || '',
        credit_description: w.credit_description || '',
        link: w.link || '',
      })), 'contributor_name'),
      bill_of_materials: sortBy((data.bill_of_materials || []).map(b => ({
        item_type: b.item_type || '',
        name: b.name || '',
        description: b.description || '',
        quantity: b.quantity || 1,
        image: typeof b.image === 'string' ? b.image : null, // ignore File objects for dirty check
        link: b.link || '',
      })), 'name'),
      attachments: sortBy((data.attachments || []).map(a => ({
        attachment_type: a.attachment_type || '',
        title: a.title || '',
        file_upload: typeof a.file_upload === 'string' ? a.file_upload : null, // ignore File objects
        repository_link: a.repository_link || '',
        description: a.description || '',
      })), 'title'),
      cover_image: typeof data.cover_image === 'string' ? data.cover_image : null,
    };
  }

  const isFormUnchanged = editId && originalData &&
    JSON.stringify(normalizeFormData(formData)) === JSON.stringify(normalizeFormData(originalData));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {editId ? (
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" /> {t('back')}
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{t('editProject')}</h1>
              <p className="mt-2 text-gray-600">
                {t('updateProjectDetails')}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('createNewProject')}</h1>
              <p className="mt-2 text-gray-600">
                {t('shareProjectWithCommunity')}
              </p>
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700">{successMessage}</span>
            </div>
            {showPreviewOption && editId && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <button
                  onClick={() => navigate(`/projects/${editId}`)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  {t('viewProjectPreview')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Fail Message */}
        {failMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <XMarkIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{failMessage}</span>
          </div>
        )}

        {/* General Errors */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <XMarkIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex justify-between items-center px-6" aria-label="Tabs">
              <div className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        isActive
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center space-x-2 transition-colors duration-200`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Save Draft button (only in edit mode) */}
              {editId && (
                <button
                  onClick={handleSave}
                  disabled={loading || isFormUnchanged}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-lg flex items-center space-x-2 transition-colors duration-200
                    ${loading || isFormUnchanged ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>{t('saving')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{t('saveDraft')}</span>
                    </>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[500px]">
            {renderTabContent()}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={handleDiscard}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                {t('discardChanges')}
              </button>
              {editId && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`px-6 py-2 border border-red-300 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200 flex items-center space-x-2 ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                      <span>{t('deleting')}</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      <span>{t('deleteProject')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              {(() => {
                const currentIndex = tabs.findIndex((t) => t.id === activeTab);
                const isLast = currentIndex === tabs.length - 1;
                if (!isLast) {
                  return (
                    <button
                      onClick={handleNextTab}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>{t('nextTab', { tab: tabs[currentIndex + 1].name })}</span>
                    </button>
                  );
                }
                return (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>{t('saving')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>{t('saveDraft')}</span>
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage; 