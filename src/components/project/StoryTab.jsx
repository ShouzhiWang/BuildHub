import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const StoryTab = ({ formData, updateFormData, errors }) => {
  const { t } = useTranslation();
  
  // Rich text editor configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'script',
    'code-block'
  ];

  const handleStoryChange = (content) => {
    updateFormData('story_content', content);
  };

  // Add image resize functionality after component mounts
  React.useEffect(() => {
    // Add click handlers to images for resizing
    const addImageResizeHandlers = () => {
      const images = document.querySelectorAll('.story-editor .ql-editor img');
      images.forEach(img => {
        img.style.cursor = 'pointer';
        img.onclick = (e) => {
          e.preventDefault();
          const currentWidth = img.style.width || '100%';
          const sizes = ['25%', '50%', '75%', '100%'];
          const currentIndex = sizes.findIndex(size => currentWidth.includes(size.slice(0, -1)));
          const nextIndex = (currentIndex + 1) % sizes.length;
          img.style.width = sizes[nextIndex];
          img.style.height = 'auto';
        };
        
        // Add resize tooltip
        img.title = t('tipClickImageToResize');
      });
    };

    // Run after content changes
    const timer = setTimeout(addImageResizeHandlers, 100);
    return () => clearTimeout(timer);
  }, [formData.story_content, t]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('projectStory')}</h2>
        <p className="text-gray-600 mb-8">
          {t('tellCompleteStory')}
        </p>
      </div>

      {/* Story Editor */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
            <BookOpenIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('richTextEditor')}</h3>
            <p className="text-sm text-gray-600">
              {t('useToolbarToFormat')}
              <span className="font-medium text-indigo-600">{t('tipClickImageToResize')}</span>
            </p>
          </div>
        </div>

        {/* React Quill Editor */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <ReactQuill
            theme="snow"
            value={formData.story_content}
            onChange={handleStoryChange}
            modules={modules}
            formats={formats}
            placeholder={t('storyPlaceholder')}
            style={{ minHeight: '400px' }}
            className="story-editor"
          />
        </div>

        {errors.story_content && (
          <p className="mt-2 text-sm text-red-600">{errors.story_content}</p>
        )}
      </div>

      {/* Story Writing Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-3">{t('whatMakesGreatStory')}</h3>
          <ul className="text-sm text-green-700 space-y-2">
            <li><strong>{t('startWithInspiration')}</strong></li>
            <li><strong>{t('shareYourProcess')}</strong></li>
            <li><strong>{t('includeChallenges')}</strong></li>
            <li><strong>{t('showSolutions')}</strong></li>
            <li><strong>{t('addVisuals')}</strong></li>
            <li><strong>{t('shareLearnings')}</strong></li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-3">{t('formattingTips')}</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li><strong>{t('useHeadings')}</strong></li>
            <li><strong>{t('addBulletPoints')}</strong></li>
            <li><strong>{t('includeCodeBlocks')}</strong></li>
            <li><strong>{t('insertImages')}</strong></li>
            <li><strong>{t('addLinks')}</strong></li>
            <li><strong>{t('useQuotes')}</strong></li>
          </ul>
        </div>
      </div>

      {/* Example Story Structure */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('exampleStoryStructure')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">{t('introduction')}</h4>
            <p className="text-gray-600">{t('whatIsProject')}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">{t('designProcess')}</h4>
            <p className="text-gray-600">{t('howDidYouPlan')}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">{t('implementation')}</h4>
            <p className="text-gray-600">{t('whatWasBuildProcess')}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">{t('resultsAndFuture')}</h4>
            <p className="text-gray-600">{t('howDidItTurnOut')}</p>
          </div>
        </div>
      </div>

      {/* Word Count */}
      <div className="text-sm text-gray-500 text-right">
        {t('words')}: {formData.story_content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length}
      </div>
    </div>
  );
};

export default StoryTab; 