import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/config';
import MessageCard from '../components/MessageCard';

const MessageCenterPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages/');
      setMessages(response.data);
      setUnreadCount(response.data.filter(m => !m.is_read).length);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.post(`/messages/${messageId}/read/`);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, is_read: true } : m
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/messages/mark-all-read/');
      setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}/delete/`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      // Update unread count if the deleted message was unread
      const deletedMessage = messages.find(m => m.id === messageId);
      if (deletedMessage && !deletedMessage.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('messageCenter')}</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {t('markAllAsRead')}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-xl font-semibold mb-2">{t('noMessagesYet')}</h3>
                <p className="text-gray-400">{t('noMessagesDescription')}</p>
              </div>
            ) : (
              messages.map(message => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteMessage}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCenterPage; 