import React, { useRef, useState } from 'react';
import { 
  PlusIcon, 
  XMarkIcon, 
  PhotoIcon,
  CpuChipIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  LinkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import ComponentSelector from './ComponentSelector';

const ThingsTab = ({ formData, updateFormData, errors }) => {
  const { t } = useTranslation();
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const itemTypes = [
    {
      id: 'Hardware',
      name: t('hardwareComponents'),
      icon: CpuChipIcon,
      description: t('electronicComponents'),
      color: 'blue'
    },
    {
      id: 'Software',
      name: t('softwareOssApps'),
      icon: CodeBracketIcon,
      description: t('librariesFrameworks'),
      color: 'green'
    },
    {
      id: 'Tool',
      name: t('handTools'),
      icon: WrenchScrewdriverIcon,
      description: t('physicalTools'),
      color: 'orange'
    }
  ];

  const getItemsByType = (type) => {
    return formData.bill_of_materials.filter(item => item.item_type === type);
  };

  const addItem = (type) => {
    setSelectedItemType(type);
    setShowComponentSelector(true);
  };

  const handleComponentSelect = (selectedComponent) => {
    const newItem = {
      ...selectedComponent,
      quantity: selectedComponent.item_type === 'Hardware' ? 1 : 1,
      image: null
    };
    
    const updatedItems = [...formData.bill_of_materials, newItem];
    updateFormData('bill_of_materials', updatedItems);
    setShowComponentSelector(false);
    setSelectedItemType(null);
  };

  const handleComponentSelectorClose = () => {
    setShowComponentSelector(false);
    setSelectedItemType(null);
  };

  const removeItem = (index) => {
    const updatedItems = formData.bill_of_materials.filter((_, i) => i !== index);
    updateFormData('bill_of_materials', updatedItems);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.bill_of_materials];
    updatedItems[index][field] = value;
    updateFormData('bill_of_materials', updatedItems);
  };

  const handleImageUpload = (index, file) => {
    updateItem(index, 'image', file);
  };

  const removeImage = (index) => {
    updateItem(index, 'image', null);
  };

  const getImagePreview = (image) => {
    if (!image) return null;
    
    // Handle File objects (newly uploaded files)
    if (typeof image === 'object' && image instanceof File) {
      return URL.createObjectURL(image);
    }
    
    // Handle URL strings (existing images from API)
    if (typeof image === 'string') {
      return image;
    }
    
    return null;
  };

  const renderItemSection = (itemType) => {
    const items = getItemsByType(itemType.id);
    const Icon = itemType.icon;
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };

    return (
      <div key={itemType.id} className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClasses[itemType.color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{itemType.name}</h3>
              <p className="text-sm text-gray-600">{itemType.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => addItem(itemType.id)}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white transition-colors duration-200 ${
              itemType.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
              itemType.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {itemType.id === 'Software' ? t('addSoftware') : itemType.id === 'Tool' ? t('addTool') : t('addComponent')}
          </button>
        </div>

        <div className="space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>
                {itemType.id === 'Hardware' ? t('noHardwareAddedYet') :
                 itemType.id === 'Software' ? t('noSoftwareAddedYet') :
                 t('noToolsAddedYet')}
              </p>
              <p className="text-sm">{t('clickButtonToAddFirstItem')}</p>
            </div>
          ) : (
            items.map((item, itemIndex) => {
              const globalIndex = formData.bill_of_materials.findIndex(
                (globalItem, globalIdx) => globalItem === item
              );
              return (
                <ItemCard
                  key={globalIndex}
                  item={item}
                  index={globalIndex}
                  itemType={itemType}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                  getImagePreview={getImagePreview}
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('billOfMaterials')}</h2>
        <p className="text-gray-600 mb-8">
          {t('listAllComponents')}
        </p>
      </div>

      <div className="space-y-8">
        {itemTypes.map(itemType => renderItemSection(itemType))}
      </div>

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-purple-800 mb-2">{t('billOfMaterialsTips')}</h3>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>{t('beSpecificWithComponents')}</li>
          <li>{t('includePurchaseLinks')}</li>
          <li>{t('addImagesToHelp')}</li>
          <li>{t('dontForgetSoftware')}</li>
          <li>{t('specifyQuantitiesAccurately')}</li>
        </ul>
      </div>

      {/* Component Selector Modal */}
      <ComponentSelector
        itemType={selectedItemType}
        onSelect={handleComponentSelect}
        onCancel={handleComponentSelectorClose}
        isOpen={showComponentSelector}
        onClose={handleComponentSelectorClose}
      />
    </div>
  );
};

// Individual Item Card Component
const ItemCard = ({ 
  item, 
  index, 
  itemType, 
  onUpdate, 
  onRemove, 
  onImageUpload, 
  onRemoveImage, 
  getImagePreview 
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(index, file);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-900">
          {itemType.id} {t('itemType')} #{index + 1}
        </h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('image')}
          </label>
          
          {item.image ? (
            <div className="relative">
              <img
                src={getImagePreview(item.image)}
                alt="Item preview"
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
            >
              <PhotoIcon className="w-8 h-8 text-gray-400 mb-1" />
              <p className="text-xs text-gray-500 text-center">
                {t('clickToUpload')}
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Right Column - Item Details */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('itemName')} *
            </label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate(index, 'name', e.target.value)}
              placeholder={`Enter ${itemType.id.toLowerCase()} name...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('quantity')}
              </label>
              <input
                type="number"
                min="1"
                value={item.quantity || 1}
                onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('link')}
              </label>
              <input
                type="url"
                value={item.link}
                onChange={(e) => onUpdate(index, 'link', e.target.value)}
                placeholder={t('purchaseOrInfoLink')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('itemDescription')}
            </label>
            <textarea
              value={item.description}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              placeholder={
                itemType.id === 'Hardware' ? t('describeComponent') :
                itemType.id === 'Software' ? t('describeSoftware') :
                t('describeTool')
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThingsTab; 