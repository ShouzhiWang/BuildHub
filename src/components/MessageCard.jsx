import React from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const MessageCard = ({ message, onMarkAsRead, onDelete }) => {
  const getMessageIcon = (type) => {
    switch (type) {
      case 'comment':
        return '💬';
      case 'like':
        return '❤️';
      case 'admin':
        return '👨‍💼';
      case 'system':
        return '🔔';
      default:
        return '📧';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${
      message.is_read ? 'border-gray-200' : 'border-indigo-500'
    } p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="text-2xl">{getMessageIcon(message.message_type)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {message.title}
            </h3>
            <p className="text-gray-600 mb-3">{message.content}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>From: {message.sender?.username || 'System'}</span>
              <span>{new Date(message.created_at).toLocaleDateString()}</span>
              {message.related_project && (
                <Link
                  to={`/projects/${message.related_project}`}
                  className="text-indigo-600 hover:underline"
                >
                  View Project
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {!message.is_read && (
            <button
              onClick={() => onMarkAsRead(message.id)}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Mark as read"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(message.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete message"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageCard; 