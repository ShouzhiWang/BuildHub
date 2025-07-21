import React, { useRef } from 'react';
import { 
  PlusIcon, 
  XMarkIcon, 
  DocumentTextIcon,
  CpuChipIcon,
  CubeIcon,
  CloudArrowUpIcon,
  LinkIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const AttachmentsTab = ({ formData, updateFormData, errors }) => {
  const { t } = useTranslation();
  const attachmentTypes = [
    {
      id: 'Code',
      name: t('code'),
      icon: DocumentTextIcon,
      description: t('sourceCodeFirmware'),
      color: 'blue',
      fileTypes: '.zip,.tar,.gz,.c,.cpp,.py,.js,.ino,.hex',
      examples: [t('arduinoSketches'), t('pythonScripts'), t('webApplicationCode'), t('firmwareFiles')]
    },
    {
      id: 'Schematic',
      name: t('schematicsAndCircuitDiagrams'),
      icon: CpuChipIcon,
      description: t('electronicSchematics'),
      color: 'green',
      fileTypes: '.pdf,.png,.jpg,.svg,.sch,.brd,.kicad_pcb,.kicad_sch',
      examples: [t('kicadFiles'), t('eagleFiles'), t('pdfSchematics'), t('circuitDiagrams')]
    },
    {
      id: 'CAD',
      name: t('cadFiles'),
      icon: CubeIcon,
      description: t('threeDModels'),
      color: 'purple',
      fileTypes: '.stl,.step,.stp,.iges,.dwg,.dxf,.f3d,.blend,.obj',
      examples: [t('stlFilesFor3dPrinting'), t('fusion360Files'), t('solidworksFiles'), t('blenderModels')]
    }
  ];

  const getAttachmentsByType = (type) => {
    return formData.attachments.filter(attachment => attachment.attachment_type === type);
  };

  const addAttachment = (type) => {
    const newAttachment = {
      attachment_type: type,
      title: '',
      description: '',
      file_upload: null,
      repository_link: ''
    };
    
    const updatedAttachments = [...formData.attachments, newAttachment];
    updateFormData('attachments', updatedAttachments);
  };

  const removeAttachment = (index) => {
    const updatedAttachments = formData.attachments.filter((_, i) => i !== index);
    updateFormData('attachments', updatedAttachments);
  };

  const updateAttachment = (index, field, value) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments[index][field] = value;
    updateFormData('attachments', updatedAttachments);
  };

  const handleFileUpload = (index, file) => {
    updateAttachment(index, 'file_upload', file);
  };

  const removeFile = (index) => {
    updateAttachment(index, 'file_upload', null);
  };

  const renderAttachmentSection = (attachmentType) => {
    const attachments = getAttachmentsByType(attachmentType.id);
    const Icon = attachmentType.icon;
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };

    return (
      <div key={attachmentType.id} className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClasses[attachmentType.color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{attachmentType.name}</h3>
              <p className="text-sm text-gray-600">{attachmentType.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => addAttachment(attachmentType.id)}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
              attachmentType.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
              attachmentType.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
              'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('addAttachment')} {attachmentType.id}
          </button>
        </div>

        {/* File Type Examples */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">{t('supportedFileTypes')}</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {attachmentType.examples.map((example, index) => (
              <div key={index} className="flex items-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                {example}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {attachments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>
                {attachmentType.id === 'Code' ? t('noCodeAddedYet') :
                 attachmentType.id === 'Schematic' ? t('noSchematicsAddedYet') :
                 t('noCadFilesAddedYet')}
              </p>
              <p className="text-sm">{t('uploadFilesOrAddRepositoryLinks')}</p>
            </div>
          ) : (
            attachments.map((attachment, attachmentIndex) => {
              const globalIndex = formData.attachments.findIndex(
                (globalAttachment) => globalAttachment === attachment
              );
              return (
                <AttachmentCard
                  key={globalIndex}
                  attachment={attachment}
                  index={globalIndex}
                  attachmentType={attachmentType}
                  onUpdate={updateAttachment}
                  onRemove={removeAttachment}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={removeFile}
                />
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('projectAttachments')}</h2>
        <p className="text-gray-600 mb-8">
          {t('uploadFilesOrLink')}
        </p>
      </div>

      <div className="space-y-8">
        {attachmentTypes.map(attachmentType => renderAttachmentSection(attachmentType))}
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">{t('attachmentTips')}</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>{t('useDescriptiveTitles')}</li>
          <li>{t('includeVersionInformation')}</li>
          <li>{t('linkToRepositories')}</li>
          <li>{t('compressLargeFiles')}</li>
          <li>{t('includeReadmeFiles')}</li>
        </ul>
      </div>
    </div>
  );
};

// Individual Attachment Card Component
const AttachmentCard = ({ 
  attachment, 
  index, 
  attachmentType, 
  onUpdate, 
  onRemove, 
  onFileUpload, 
  onRemoveFile 
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(index, file);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    const codeExtensions = ['js', 'py', 'c', 'cpp', 'ino', 'html', 'css'];
    
    if (codeExtensions.includes(extension)) {
      return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
    }
    return <DocumentIcon className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-900">
          {attachmentType.name} #{index + 1}
        </h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Title and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('title')}
            </label>
            <input
              type="text"
              value={attachment.title}
              onChange={(e) => onUpdate(index, 'title', e.target.value)}
              placeholder="e.g., Main Arduino Code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <input
              type="text"
              value={attachment.description}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              placeholder={t('briefDescriptionOrVersionInfo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* File Upload or Repository Link */}
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fileUpload')}
            </label>
            <div className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-3">
                <CloudArrowUpIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    {attachment.file_upload ? attachment.file_upload.name : t('clickToUpload')}
                  </p>
                  <p className="text-xs text-gray-500">Max 50MB</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                >
                  {t('uploadFile')}
                </button>
                {attachment.file_upload && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Repository Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('repositoryLink')}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={attachment.repository_link}
                onChange={(e) => onUpdate(index, 'repository_link', e.target.value)}
                placeholder={t('githubRepositoryLink')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentsTab; 