import React, { useEffect, useState } from 'react';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  FunnelIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../../api/config';

const UserCard = ({ user, isSelected, onSelect, onToggleAdmin, onToggleActive, onViewDetails }) => (
  <div className={`bg-white rounded-lg border ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'} p-4 hover:border-gray-300 transition-colors`}>
    <div className="flex items-start space-x-3">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{user.username}</h3>
              <div className="flex space-x-1">
                {user.is_staff && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                  user.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-1" />
                {user.email}
              </div>
              <div className="flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                Joined {new Date(user.date_joined).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <span>Last login: </span>
              <span className="font-medium">
                {user.last_login 
                  ? new Date(user.last_login).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => onViewDetails(user)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="View Details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleAdmin(user.id, user.is_staff)}
              className={`p-2 rounded-lg transition-colors ${
                user.is_staff
                  ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                  : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title={user.is_staff ? 'Remove Admin' : 'Make Admin'}
            >
              <ShieldCheckIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleActive(user.id, user.is_active)}
              className={`p-2 rounded-lg transition-colors ${
                user.is_active
                  ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                  : 'text-green-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={user.is_active ? 'Deactivate' : 'Activate'}
            >
              {user.is_active ? <XMarkIcon className="w-4 h-4" /> : <CheckBadgeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserDetailsModal = ({ user, onClose, onUpdate }) => {
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProjects();
    }
  }, [user]);

  const fetchUserProjects = async () => {
    try {
      const response = await api.get(`/users/${user.id}/projects/`);
      setUserProjects(response.data || []);
    } catch (error) {
      console.error('Failed to fetch user projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-medium">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">{user.is_staff ? 'Administrator' : 'User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">{new Date(user.date_joined).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Activity Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects Created:</span>
                    <span className="font-medium">{userProjects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published Projects:</span>
                    <span className="font-medium">
                      {userProjects.filter(p => p.status === 'published').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Projects:</span>
                    <span className="font-medium">
                      {userProjects.filter(p => p.status === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {userProjects.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recent Projects</h3>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {userProjects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <Link 
                          to={`/projects/${project.id}`} 
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          {project.title}
                        </Link>
                        <p className="text-sm text-gray-600">{project.category?.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        project.status === 'published' ? 'bg-green-100 text-green-700' :
                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
            <Link
              to={`/users/${user.username}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              View Public Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [detailsUser, setDetailsUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/');
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase()) ||
                           user.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || 
                           (statusFilter === 'active' && user.is_active) ||
                           (statusFilter === 'inactive' && !user.is_active);
      const matchesRole = !roleFilter ||
                         (roleFilter === 'admin' && user.is_staff) ||
                         (roleFilter === 'user' && !user.is_staff);
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date_joined) - new Date(b.date_joined);
        case 'username':
          return a.username.localeCompare(b.username);
        case 'email':
          return a.email.localeCompare(b.email);
        default: // newest
          return new Date(b.date_joined) - new Date(a.date_joined);
      }
    });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId, checked) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleToggleAdmin = async (userId, isStaff) => {
    setActionLoading(true);
    try {
      await api.patch(`/users/${userId}/`, { is_staff: !isStaff });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    setActionLoading(true);
    try {
      await api.patch(`/users/${userId}/`, { is_active: !isActive });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) return;
    
    setActionLoading(true);
    try {
      const promises = Array.from(selectedUsers).map(id => {
        if (action === 'activate') {
          return api.patch(`/users/${id}/`, { is_active: true });
        } else if (action === 'deactivate') {
          return api.patch(`/users/${id}/`, { is_active: false });
        }
      });
      await Promise.all(promises);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="username">By Username</option>
              <option value="email">By Email</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedUsers.size > 0 && (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <span className="text-sm text-indigo-700">
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={actionLoading}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Activate All
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                disabled={actionLoading}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Deactivate All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>
      </div>

      {/* Users list */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No users found</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isSelected={selectedUsers.has(user.id)}
              onSelect={(e) => handleSelectUser(user.id, e.target.checked)}
              onToggleAdmin={handleToggleAdmin}
              onToggleActive={handleToggleActive}
              onViewDetails={setDetailsUser}
            />
          ))
        )}
      </div>

      {/* User Details Modal */}
      {detailsUser && (
        <UserDetailsModal
          user={detailsUser}
          onClose={() => setDetailsUser(null)}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
};

export default EnhancedUserManagement; 