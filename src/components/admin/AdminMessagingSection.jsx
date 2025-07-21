import React, { useState } from 'react';
import api from '../../api/config';

const AdminMessagingSection = () => {
  const [usernameQuery, setUsernameQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const handleUserSearch = async (q) => {
    setUsernameQuery(q);
    setSelectedUser(null);
    setUserResults([]);
    setSearching(true);
    if (q.length < 2) {
      setSearching(false);
      return;
    }
    try {
      const res = await api.get(`/users/search/?q=${encodeURIComponent(q)}`);
      setUserResults(res.data);
    } catch (err) {
      setUserResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUsernameQuery(user.username);
    setUserResults([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!selectedUser || !title || !content) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/send-message/', {
        recipient_id: selectedUser.id,
        title,
        content
      });
      setSuccess('Message sent successfully!');
      setTitle('');
      setContent('');
      setSelectedUser(null);
      setUsernameQuery('');
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="max-w-lg mx-auto">
      <div className="mb-4 relative">
        <label className="block text-gray-700 font-semibold mb-1">Recipient Username</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={usernameQuery}
          onChange={e => handleUserSearch(e.target.value)}
          placeholder="Type username..."
          disabled={loading}
          autoComplete="off"
        />
        {userResults.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
            {userResults.map(user => (
              <li
                key={user.id}
                className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                onClick={() => handleSelectUser(user)}
              >
                {user.username} <span className="text-gray-400 text-xs">({user.email})</span>
              </li>
            ))}
          </ul>
        )}
        {searching && <div className="absolute right-2 top-2 text-xs text-gray-400">Searching...</div>}
        {selectedUser && (
          <div className="mt-1 text-green-600 text-sm">Selected: {selectedUser.username} (ID: {selectedUser.id})</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Title</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Message title"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-1">Content</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows={4}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Message content"
          disabled={loading}
        />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <button
        type="submit"
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default AdminMessagingSection; 