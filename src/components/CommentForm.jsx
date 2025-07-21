import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/config';

const CommentForm = ({ projectId, parentCommentId = null, onCommentAdded, placeholder }) => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      if (parentCommentId) {
        // Creating a reply
        await api.post(`/comments/${parentCommentId}/replies/`, {
          body: comment
        });
      } else {
        // Creating a top-level comment
        await api.post(`/projects/${projectId}/comments/`, {
          body: comment
        });
      }
      setComment('');
      onCommentAdded();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">{t('pleaseLoginToComment')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={placeholder || t('writeComment')}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        rows="3"
        disabled={submitting}
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={!comment.trim() || submitting}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? t('posting') : parentCommentId ? t('postReply') : t('postComment')}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 