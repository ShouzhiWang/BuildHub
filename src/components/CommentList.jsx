import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import CommentForm from './CommentForm';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';

// Simple date formatting function to replace date-fns
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

const CommentItem = ({ comment, projectId, onCommentAdded, depth = 0 }) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Always use comment.replies from props, not local state
  const replies = comment.replies || [];

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    if (typeof onCommentAdded === 'function') {
      onCommentAdded(); // Always refetch the full comment list after a reply
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setDeleting(true);
    try {
      await api.delete(`/comments/${comment.id}/delete/`);
      if (typeof onCommentAdded === 'function') {
        onCommentAdded(); // Refetch comments after deletion
      }
    } catch (error) {
      alert('Failed to delete comment.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Link to={`/users/${comment.author.username}`}>
              <img
                src={comment.author.profile?.avatar || `/default-avatar.svg`}
                alt={comment.author.username}
                className="w-10 h-10 rounded-full"
              />
            </Link>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Link 
                to={`/users/${comment.author.username}`}
                className="font-semibold text-gray-900 hover:text-indigo-600"
              >
                {comment.author.username}
              </Link>
              <span className="text-gray-500 text-sm">
                {formatDistanceToNow(comment.created_at)}
              </span>
              {/* Delete button for own comments */}
              {user && user.username === comment.author.username && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete comment"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-gray-700 mb-3">{comment.body}</p>
            
            {/* Reply button and reply count */}
            <div className="flex items-center space-x-4 text-sm">
              <button
                onClick={toggleReplyForm}
                className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>Reply</span>
              </button>
              
              {comment.reply_count > 0 && (
                <button
                  onClick={toggleReplies}
                  className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {showReplies ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                  <span>{comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}</span>
                </button>
              )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
              <div className="mt-4">
                <CommentForm
                  projectId={projectId}
                  parentCommentId={comment.id}
                  onCommentAdded={handleReplyAdded}
                  placeholder="Write a reply..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-2">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              projectId={projectId}
              onCommentAdded={onCommentAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentList = ({ comments, projectId, onCommentAdded }) => {
  const safeComments = Array.isArray(comments) ? comments : [];
  return (
    <div className="space-y-4">
      {safeComments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">No comments yet</h3>
          <p className="text-gray-400">Be the first to comment on this project!</p>
        </div>
      ) : (
        safeComments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            projectId={projectId}
            onCommentAdded={onCommentAdded}
          />
        ))
      )}
    </div>
  );
};

export default CommentList; 