import React, { useEffect, useState } from 'react';
import api from '../../api/config';
import { Link } from 'react-router-dom';

const UserManagementSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/');
      setUsers(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, isStaff) => {
    setActionLoading(true);
    try {
      await api.patch(`/users/${userId}/`, { is_staff: !isStaff });
      await fetchUsers();
    } catch (err) {
      alert('Failed to update admin status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    setActionLoading(true);
    try {
      await api.patch(`/users/${userId}/`, { is_active: !isActive });
      await fetchUsers();
    } catch (err) {
      alert('Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-2 font-semibold text-indigo-700">
                    <Link to={`/users/${user.username}`} className="underline hover:text-indigo-900">{user.username}</Link>
                  </td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={user.is_staff ? 'text-green-600 font-bold' : 'text-gray-400'}>{user.is_staff ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={user.is_active ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{user.is_active ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-2">{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className={`px-3 py-1 rounded ${user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'} text-white disabled:opacity-50`}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      disabled={actionLoading}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                      to={`/users/${user.username}`}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      View Projects
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementSection; 