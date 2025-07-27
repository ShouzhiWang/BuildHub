import React, { useEffect, useRef, useState } from 'react';
import { BookOpenIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/config';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useLocation } from 'react-router-dom';

/** Enhanced Toolbar component for Tiptap editor */
const TiptapToolbar = ({ editor }) => {
  const { t } = useTranslation();
  
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter link URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const setTextAlign = (align) => {
    editor.chain().focus().setTextAlign(align).run();
  };

  const setHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const isActive = (name, attributes = {}) => {
    return editor.isActive(name, attributes);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-3">
      {/* Text Formatting Group */}
      <div className="flex flex-wrap items-center gap-1 mb-3">
        <div className="flex items-center border-r border-gray-300 pr-3 mr-3">
          {/* Font Size */}
          <select 
            className="text-sm border border-gray-300 rounded px-2 py-1 mr-2 bg-white"
            onChange={(e) => {
              const size = e.target.value;
              if (size === 'paragraph') {
                editor.chain().focus().setParagraph().run();
              } else {
                setHeading(parseInt(size));
              }
            }}
            value={
              isActive('heading', { level: 1 }) ? '1' :
              isActive('heading', { level: 2 }) ? '2' :
              isActive('heading', { level: 3 }) ? '3' :
              isActive('heading', { level: 4 }) ? '4' :
              isActive('heading', { level: 5 }) ? '5' :
              isActive('heading', { level: 6 }) ? '6' : 'paragraph'
            }
          >
            <option value="paragraph">Normal</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>
        </div>

        {/* Text Style Buttons */}
        <div className="flex items-center border-r border-gray-300 pr-3 mr-3">
                     <button
             onClick={() => editor.chain().focus().toggleBold().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Bold (Ctrl+B)"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.87-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
             </svg>
           </button>
          
                     <button
             onClick={() => editor.chain().focus().toggleItalic().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Italic (Ctrl+I)"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
             </svg>
           </button>
          
                     <button
             onClick={() => editor.chain().focus().toggleUnderline().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('underline') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Underline (Ctrl+U)"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 17c3.31 0 6-2.69 6-6V3c0-.55-.45-1-1-1s-1 .45-1 1v8c0 2.21-1.79 4-4 4s-4-1.79-4-4V3c0-.55-.45-1-1-1s-1 .45-1 1v8c0 3.31 2.69 6 6 6z"/>
               <path d="M7 19h10c.55 0 1 .45 1 1s-.45 1-1 1H7c-.55 0-1-.45-1-1s.45-1 1-1z"/>
             </svg>
           </button>
           
           <button
             onClick={() => editor.chain().focus().toggleStrike().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('strike') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Strikethrough"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M7.24 8.75c-.26-.83-.15-1.84.63-2.63.77-.77 1.79-.88 2.61-.63.39.12.75.42 1.04.85l.36-.65c-.28-.51-.65-.95-1.12-1.36-.85-.85-1.98-1.05-2.94-.75-.96.3-1.6 1.1-1.75 2.2-.15 1.1.15 2.05.9 2.8.75.75 1.7 1.05 2.8.9 1.1-.15 1.9-.79 2.2-1.75.3-.96.1-2.09-.75-2.94-.41-.41-.85-.78-1.36-1.06l-.65.36c.43.29.73.65.85 1.04.25.82.14 1.84-.63 2.61-.77.77-1.79.88-2.61.63-.39-.12-.75-.42-1.04-.85l-.36.65c.28.51.65.95 1.12 1.36.85.85 1.98 1.05 2.94.75.96-.3 1.6-1.1 1.75-2.2.15-1.1-.15-2.05-.9-2.8-.75-.75-1.7-1.05-2.8-.9-1.1.15-1.9.79-2.2 1.75-.3.96-.1 2.09.75 2.94.41.41.85.78 1.36 1.06l.65-.36c-.43-.29-.73-.65-.85-1.04z"/>
             </svg>
           </button>
           
           <button
             onClick={() => editor.chain().focus().toggleHighlight().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('highlight') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Highlight"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.87-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
             </svg>
           </button>
        </div>

        {/* Text Color and Background */}
        <div className="flex items-center border-r border-gray-300 pr-3 mr-3">
                     <button
             onClick={() => {
               const color = window.prompt('Enter text color (e.g., #ff0000 or red)');
               if (color) {
                 editor.chain().focus().setColor(color).run();
               }
             }}
             className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
             title="Text Color"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 8.67 8 9.5S8.67 11 9.5 11s1.5-.67 1.5-1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
             </svg>
           </button>
           
           <button
             onClick={() => {
               const color = window.prompt('Enter background color (e.g., #ffff00 or yellow)');
               if (color) {
                 editor.chain().focus().setMark('highlight', { color }).run();
               }
             }}
             className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
             title="Background Color"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9.01c0 .34-.04.67-.11 1H19.5c-.83 0-1.5.67-1.5 1.5 0 .83.67 1.5 1.5 1.5h1.39c-.47.85-1.12 1.6-1.89 2.2-.77.6-1.67 1.08-2.67 1.44-.99.36-2.06.56-3.23.56z"/>
             </svg>
           </button>
        </div>
      </div>

      {/* Alignment and Lists Group */}
      <div className="flex flex-wrap items-center gap-1 mb-3">
        {/* Text Alignment */}
        <div className="flex items-center border-r border-gray-300 pr-3 mr-3">
                     <button
             onClick={() => setTextAlign('left')}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive({ textAlign: 'left' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Align Left"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zm0 4H3v2h12v-2z"/>
             </svg>
           </button>
           
           <button
             onClick={() => setTextAlign('center')}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive({ textAlign: 'center' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Align Center"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M7 15h10v2H7v-2zm0-8h10v2H7V7zm0 4h10v2H7v-2z"/>
             </svg>
           </button>
           
           <button
             onClick={() => setTextAlign('right')}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive({ textAlign: 'right' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Align Right"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M9 15h12v2H9v-2zm0-8h12v2H9V7zm0 4h12v2H9v-2z"/>
             </svg>
           </button>
           
           <button
             onClick={() => setTextAlign('justify')}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive({ textAlign: 'justify' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Justify"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M3 15h18v2H3v-2zm0-8h18v2H3V7zm0 4h18v2H3v-2z"/>
             </svg>
           </button>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-gray-300 pr-3 mr-3">
                     <button
             onClick={() => editor.chain().focus().toggleBulletList().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Bullet List"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
             </svg>
           </button>
           
           <button
             onClick={() => editor.chain().focus().toggleOrderedList().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Numbered List"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M2 17h3v-2H2v2zm0-4h3v-2H2v2zm0-4h3V7H2v2zm4 4h14v-2H6v2zm0 4h14v-2H6v2zM6 7v2h14V7H6z"/>
             </svg>
           </button>
        </div>


      </div>

      {/* Insert Elements Group */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Links */}
        <div className="flex items-center border-r border-gray-300 pr-3 mr-3">
                     <button
             onClick={addLink}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('link') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Insert Link"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
             </svg>
           </button>
           
           <button
             onClick={removeLink}
             className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
             title="Remove Link"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
             </svg>
           </button>
        </div>

        {/* Images */}
        <div className="flex items-center border-r border-gray-300 pr-3 mr-3">
                     <button
             onClick={addImage}
             className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
             title="Insert Image"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
             </svg>
           </button>
        </div>

        {/* Block Elements */}
        <div className="flex items-center border-r border-gray-300 pr-3 mr-3">
                     <button
             onClick={() => editor.chain().focus().toggleBlockquote().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('blockquote') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Blockquote"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
             </svg>
           </button>
           
           <button
             onClick={() => editor.chain().focus().toggleCodeBlock().run()}
             className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive('codeBlock') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
             title="Code Block"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
             </svg>
           </button>
        </div>

        

        {/* History */}
        <div className="flex items-center">
                     <button
             onClick={() => editor.chain().focus().undo().run()}
             className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
             title="Undo (Ctrl+Z)"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
             </svg>
           </button>
           
           <button
             onClick={() => editor.chain().focus().redo().run()}
             className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
             title="Redo (Ctrl+Y)"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
             </svg>
           </button>
        </div>
      </div>
    </div>
  );
};

// Slideshow Processing Animation Component
const SlideshowProcessingAnimation = ({ message, isSuccess = false }) => {
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
        {/* Success Checkmark */}
        <div className="relative mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute inset-0 w-16 h-16 bg-green-400 rounded-full animate-ping opacity-75"></div>
        </div>
        
        {/* Success Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Conversion Complete!</h3>
          <p className="text-sm text-gray-600 mb-4">Your slideshow has been successfully converted</p>
          
          {/* Success Animation */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
        
        {/* File Icon */}
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
          <PresentationChartBarIcon className="w-5 h-5 text-green-500" />
          <span>Ready to view</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
      {/* Animated Spinner */}
      <div className="relative mb-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
      </div>
      
      {/* Processing Text */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{message}</h3>
        <p className="text-sm text-gray-600 mb-4">Converting your presentation to images...</p>
        
        {/* Animated Dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-48 bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* File Icon Animation */}
      <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
        <PresentationChartBarIcon className="w-5 h-5 animate-pulse" />
        <span>Processing slides...</span>
      </div>
    </div>
  );
};

const StoryTab = ({ formData, updateFormData, errors, projectId }) => {
  const { t } = useTranslation();
  
  const [imgToolbar, setImgToolbar] = useState({ show: false, top: 0, left: 0, node: null });
  const [slideshow, setSlideshow] = useState(null);
  const [slideshowLoading, setSlideshowLoading] = useState(false);
  const [slideshowError, setSlideshowError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [uploadingSlideshow, setUploadingSlideshow] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const slideshowFileInputRef = useRef();
  const editorRef = useRef();

  // Image upload handler
  const uploadImageToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/story-images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.url || response.data.image;
    } catch (error) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  // Slideshow functions
  const fetchSlideshow = async () => {
    if (!projectId) return;
    
    try {
      const res = await api.get(`/projects/${projectId}/slideshow/get/`);
      if (res.data && res.data.slides && res.data.slides.length > 0) {
        setSlideshow(res.data);
        setCurrentSlide(0);
        setSlideshowError(null);
      } else {
        // No slideshow exists yet, this is normal
        setSlideshow(null);
        setSlideshowError(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // No slideshow exists yet, this is normal
        setSlideshow(null);
        setSlideshowError(null);
      } else {
        console.error('Error fetching slideshow:', err);
        setSlideshowError(t('slideshowFetchError'));
      }
    }
  };

  const handleSlideshowUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !projectId) return;

    const allowedTypes = ['.pdf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      setSlideshowError('Only PDF files are supported.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // 20MB
      setSlideshowError('File size must be less than 20MB.');
      return;
    }

    setUploadingSlideshow(true);
    setSlideshowError(null);

    try {
      const formData = new FormData();
      formData.append('original_file', file);
      formData.append('title', 'Project Slideshow');
      formData.append('description', 'Project presentation slides');

      await api.post(`/projects/${projectId}/slideshow/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSlideshowLoading(true);
      startPollingForConversion();
    } catch (err) {
      console.error('Error uploading slideshow:', err);
      setSlideshowError(t('slideshowUploadError'));
      setUploadingSlideshow(false);
    }
  };

  const startPollingForConversion = () => {
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts = 60 seconds max
    const pollInterval = 2000; // 2 seconds between attempts
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        setSlideshowError('Conversion timeout. Please refresh the page to check if conversion completed.');
        setSlideshowLoading(false);
        return;
      }
      
      try {
        const res = await api.get(`/projects/${projectId}/slideshow/get/`);
        console.log('Polling response:', res.data);
        if (res.data && res.data.slides && res.data.slides.length > 0) {
          console.log('Conversion completed!', res.data.slides.length, 'slides');
          setSlideshow(res.data);
          setCurrentSlide(0);
          setSlideshowError(null);
          setSlideshowLoading(false);
          setConversionSuccess(true);
          setTimeout(() => setConversionSuccess(false), 3000);
          return;
        }
        // Still processing, continue polling
        attempts++;
        setTimeout(poll, pollInterval);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // Still processing, continue polling
          attempts++;
          setTimeout(poll, pollInterval);
        } else {
          setSlideshowError(t('slideshowFetchError'));
          setSlideshowLoading(false);
        }
      }
    };
    
    setTimeout(poll, pollInterval);
  };

  const handleRemoveSlideshow = async () => {
    if (!projectId || !slideshow) return;
    
    try {
      await api.delete(`/projects/${projectId}/slideshow/`);
      setSlideshow(null);
      setCurrentSlide(0);
      setSlideshowError(null);
    } catch (err) {
      console.error('Error removing slideshow:', err);
    }
  };

  const nextSlide = () => {
    if (slideshow && slideshow.slides && currentSlide < slideshow.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    if (slideshow && slideshow.slides && index >= 0 && index < slideshow.slides.length) {
      setCurrentSlide(index);
    }
  };

  // Fetch slideshow on component mount
  useEffect(() => {
    if (projectId) {
      fetchSlideshow();
    }
  }, [projectId]);

  // Tiptap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Dropcursor,
      Gapcursor,
      Color,
      TextStyle,
      Placeholder.configure({ placeholder: t('storyPlaceholder') }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: null },
            height: { default: null },
          };
        },
        addOptions() {
          return {
            ...this.parent?.(),
            allowBase64: true,
            inline: false,
            HTMLAttributes: {
              class: 'tiptap-image',
              style: 'max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);',
              draggable: false,
            },
          };
        },
        addCommands() {
          return {
            ...this.parent?.(),
            setImage: (options) => async ({ commands }) => {
              if (options.file) {
                const url = await uploadImageToServer(options.file);
                return commands.insertContent({ type: this.name, attrs: { src: url } });
              }
              return commands.insertContent({ type: this.name, attrs: { src: options.src } });
            },
          };
        },
      }),
    ],
    content: formData.story_content || '',
    onUpdate: ({ editor }) => {
      updateFormData('story_content', editor.getHTML());
    },
    editorProps: {
      handleDrop(view, event, _slice, moved) {
        if (!event.dataTransfer || !event.dataTransfer.files?.length) return false;
        const file = Array.from(event.dataTransfer.files).find(f => f.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (pos) {
          uploadImageToServer(file).then(url => {
            editor.chain().focus().insertContentAt(pos.pos, { type: 'image', attrs: { src: url } }).run();
          });
        }
        return true;
      },
      handlePaste(view, event, _slice) {
        if (!event.clipboardData || !event.clipboardData.files?.length) return false;
        const file = Array.from(event.clipboardData.files).find(f => f.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        uploadImageToServer(file).then(url => {
          editor.chain().focus().setImage({ src: url }).run();
        });
        return true;
      },
      attributes: {
        class: 'story-editor tiptap-editor',
        spellCheck: 'true',
        style: 'min-height: 400px; outline: none;',
      },
    },
  });

  // Floating image toolbar logic
  useEffect(() => {
    if (!editor) return;
    const handleSelection = () => {
      setImgToolbar({ show: false, top: 0, left: 0, node: null });
      const { state } = editor;
      const { selection } = state;
      if (selection.empty) return;
      const pos = selection.from;
      const node = state.doc.nodeAt(pos);
      if (node && node.type.name === 'image') {
        const dom = editor.view.nodeDOM(pos);
        if (dom) {
          const rect = dom.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();
          setImgToolbar({
            show: true,
            top: rect.top - editorRect.top - 36,
            left: rect.left - editorRect.left,
            node: dom,
          });
        }
      }
    };
    editor.on('selectionUpdate', handleSelection);
    return () => editor.off('selectionUpdate', handleSelection);
  }, [editor]);

  // Image action handlers
  const deleteImage = () => {
    if (!imgToolbar.node || !editor) return;
    editor.chain().deleteSelection().run();
    editor.commands.blur();
    setImgToolbar({ show: false, top: 0, left: 0, node: null });
  };
  const resizeImage = (width) => {
    if (!imgToolbar.node || !editor) return;
    editor.chain().focus().setImage({ src: imgToolbar.node.src, width }).run();
    setImgToolbar({ show: false, top: 0, left: 0, node: null });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('projectStory')}</h2>
        <p className="text-gray-600 mb-8">
          {t('tellCompleteStory')}
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
            <BookOpenIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('richTextEditor')}</h3>
            <p className="text-sm text-gray-600">
              {t('useToolbarToFormat')}
              <span className="font-medium text-indigo-600 ml-2">{t('tipClickImageToResize')}</span>
              <br />
              <span className="text-green-600 font-medium">Drag & drop images directly into the editor</span>
            </p>
          </div>
        </div>
        <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ position: 'relative' }} ref={editorRef}>
          <TiptapToolbar editor={editor} />
          <EditorContent editor={editor} />
          {imgToolbar.show && (
            <div
              style={{
                position: 'absolute',
                top: imgToolbar.top,
                left: imgToolbar.left,
                zIndex: 1000,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                padding: '2px 8px',
                display: 'flex',
                gap: 4,
                alignItems: 'center',
                transition: 'top 0.1s, left 0.1s',
              }}
            >
              <button title="Resize to 25%" onClick={() => resizeImage('25%')}>25%</button>
              <button title="Resize to 50%" onClick={() => resizeImage('50%')}>50%</button>
              <button title="Resize to 75%" onClick={() => resizeImage('75%')}>75%</button>
              <button title="Resize to 100%" onClick={() => resizeImage('100%')}>100%</button>
              <button title="Delete image" onClick={deleteImage} style={{ fontSize: 16, cursor: 'pointer', background: 'none', border: 'none', color: '#dc2626' }}>❌</button>
            </div>
          )}
        </div>
        {errors.story_content && (
          <p className="mt-2 text-sm text-red-600">{errors.story_content}</p>
        )}
      </div>

      {/* Slideshow Section */}
      {projectId ? (
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center mb-4">
            <PresentationChartBarIcon className="w-6 h-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">{t('projectSlideshow')}</h3>
          </div>
          
          {slideshowLoading || conversionSuccess ? (
            <SlideshowProcessingAnimation 
              message={t('slideshowProcessing')} 
              isSuccess={conversionSuccess}
            />
          ) : slideshow && slideshow.slides && slideshow.slides.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Slideshow Display */}
              <div className="relative mb-4">
                <img
                  src={slideshow.slides[currentSlide].image}
                  alt={`Slide ${currentSlide + 1}`}
                  className="w-full h-auto rounded-lg shadow-md"
                />
                
                {/* Navigation Controls */}
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className={`p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all ${
                      currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === slideshow.slides.length - 1}
                    className={`p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all ${
                      currentSlide === slideshow.slides.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Slide Indicators */}
              <div className="flex justify-center space-x-2 mb-4">
                {slideshow.slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? 'bg-indigo-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              {/* Slide Counter */}
              <div className="text-center text-sm text-gray-600 mb-4">
                {t('currentSlide', { current: currentSlide + 1, total: slideshow.slides.length })}
              </div>
              
              {/* Remove Button */}
              <div className="text-center">
                <button
                  onClick={handleRemoveSlideshow}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  {t('removeSlideshow')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <PresentationChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload PDF Presentation</h4>
              <p className="text-sm text-gray-600 mb-4">Only PDF files are supported</p>
              
              <input
                ref={slideshowFileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleSlideshowUpload}
                className="hidden"
              />
              
              <button
                onClick={() => slideshowFileInputRef.current?.click()}
                disabled={uploadingSlideshow}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingSlideshow ? t('uploading') : t('chooseFile')}
              </button>
              
              {slideshowError && (
                <p className="mt-4 text-sm text-red-600">{slideshowError}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <PresentationChartBarIcon className="w-6 h-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">{t('slideshowAvailableAfterSave')}</h3>
              <p className="text-sm text-yellow-700">{t('saveProjectFirstToUploadSlideshow')}</p>
            </div>
          </div>
        </div>
      )}

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
        {t('words')}: {editor?.getText()?.split(/\s+/).filter(word => word.length > 0).length || 0}
      </div>
    </div>
  );
};

export default StoryTab; 