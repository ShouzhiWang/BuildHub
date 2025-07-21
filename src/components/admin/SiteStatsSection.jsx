import React, { useEffect, useState } from 'react';
import api from '../../api/config';

const SiteStatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, usersRes, commentsRes, categoriesRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/users/'),
        api.get('/projects/?limit=1'), // Placeholder for comments count
        api.get('/categories/')
      ]);
      const projects = projectsRes.data.results || projectsRes.data;
      const users = usersRes.data.results || usersRes.data;
      const categories = categoriesRes.data.results || categoriesRes.data;
      // For comments, you may want a dedicated endpoint or count on the backend
      setStats({
        totalProjects: projects.length,
        published: projects.filter(p => p.status === 'published').length,
        pending: projects.filter(p => p.status === 'pending').length,
        rejected: projects.filter(p => p.status === 'rejected').length,
        draft: projects.filter(p => p.status === 'draft').length,
        totalUsers: users.length,
        totalCategories: categories.length,
        // Placeholder for comments
        totalComments: 0
      });
    } catch (err) {
      setError('Failed to load site stats.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalProjects}</div>
            <div className="text-gray-500">Total Projects</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.published}</div>
            <div className="text-gray-500">Published</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-gray-500">Rejected</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-gray-500">Draft</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</div>
            <div className="text-gray-500">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalCategories}</div>
            <div className="text-gray-500">Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalComments}</div>
            <div className="text-gray-500">Comments</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SiteStatsSection; 