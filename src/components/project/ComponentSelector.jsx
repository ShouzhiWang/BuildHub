import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/config';

const ComponentSelector = ({ 
  itemType, 
  onSelect, 
  onCancel, 
  isOpen, 
  onClose 
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search for components
  useEffect(() => {
    const searchComponents = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/components/search/', {
          params: {
            q: query,
            type: itemType
          }
        });
        setResults(response.data);
      } catch (error) {
        console.error('Error searching components:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchComponents, 300);
    return () => clearTimeout(timeoutId);
  }, [query, itemType]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Handle component selection
  const handleSelect = (component) => {
    onSelect({
      item_type: component.item_type,
      name: component.name,
      description: component.description,
      quantity: 1,
      image: null,
      link: component.link
    });
    onClose();
  };

  // Handle adding new component
  const handleAddNew = () => {
    onSelect({
      item_type: itemType,
      name: query.trim(),
      description: '',
      quantity: 1,
      image: null,
      link: ''
    });
    onClose();
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={resultsRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-96 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {t('selectExistingComponent')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('searchComponents')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              {t('searching')}...
            </div>
          ) : results.length === 0 && query ? (
            <div className="p-4 text-center text-gray-500">
              {t('noComponentsFound')}
            </div>
          ) : results.length === 0 && query ? (
            <div className="p-4">
              <div className="text-center text-gray-500 mb-4">
                {t('noComponentsFound')}
              </div>
              <button
                onClick={handleAddNew}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
              >
                {t('addNewComponent')}: "{query}"
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t('startTypingToSearch')}
            </div>
          ) : (
            <div>
              {results.map((component, index) => (
                <div
                  key={component.id}
                  onClick={() => handleSelect(component)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    index === selectedIndex ? 'bg-indigo-50 border-indigo-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{component.name}</h4>
                      {component.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {component.description}
                        </p>
                      )}
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          component.item_type === 'Hardware' ? 'bg-blue-100 text-blue-800' :
                          component.item_type === 'Software' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {component.item_type}
                        </span>
                        {component.link && (
                          <span className="ml-2 text-xs text-gray-500">
                            {t('hasLink')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add New Option */}
              <div className="border-t border-gray-200">
                <button
                  onClick={handleAddNew}
                  className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 text-indigo-600 font-medium"
                >
                  {t('addNewComponent')}: "{query}"
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {t('useArrowKeysToNavigate')} • {t('pressEnterToSelect')}
            </div>
            <button
              onClick={handleAddNew}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {t('addNewComponentDirectly')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentSelector; 