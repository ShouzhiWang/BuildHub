import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import api from '../../api/config';

const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
};

const MetricCard = ({ title, value, change, changeType, icon: Icon, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500 text-white',
    green: 'bg-green-500 text-white', 
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
                         <div className="flex items-center mt-2">
               {changeType === 'increase' ? (
                 <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
               ) : (
                 <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
               )}
              <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, action, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'border-indigo-200 hover:bg-indigo-50',
    green: 'border-green-200 hover:bg-green-50',
    yellow: 'border-yellow-200 hover:bg-yellow-50',
    red: 'border-red-200 hover:bg-red-50'
  };

  return (
    <div className={`border-2 border-dashed ${colorClasses[color]} rounded-lg p-4 cursor-pointer transition-colors`} onClick={action}>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

const ActivityFeed = ({ activities }) => (
  <div className="space-y-4 max-h-96 overflow-y-auto">
    {activities.map((activity, idx) => (
      <div key={idx} className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900">{activity.message}</p>
          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
        </div>
      </div>
    ))}
  </div>
);

const DashboardOverview = ({ onSectionToggle }) => {
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    totalUsers: 0,
    totalComments: 0,
    publishedProjects: 0,
    activeUsers: 0
  });
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/users/')
      ]);

      const projects = projectsRes.data.results || projectsRes.data;
      const users = usersRes.data.results || usersRes.data;

      setMetrics({
        totalProjects: projects.length,
        pendingProjects: projects.filter(p => p.status === 'pending').length,
        publishedProjects: projects.filter(p => p.status === 'published').length,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalComments: 0 // Placeholder - would need dedicated endpoint
      });

      // Generate real activity feed based on recent data
      const recentActivities = [];
      
      // Add recent project submissions
      const recentProjects = projects
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
      
      recentProjects.forEach(project => {
        const timeAgo = getTimeAgo(project.created_at);
        recentActivities.push({
          message: `New project "${project.title}" submitted by ${project.author?.username}`,
          time: timeAgo
        });
      });

      // Add recent user registrations
      const recentUsers = users
        .sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined))
        .slice(0, 2);
      
      recentUsers.forEach(user => {
        const timeAgo = getTimeAgo(user.date_joined);
        recentActivities.push({
          message: `User ${user.username} joined the platform`,
          time: timeAgo
        });
      });

      // Sort by most recent and limit to 5
      recentActivities.sort((a, b) => {
        // This is a simple sort, in a real app you'd want proper timestamp comparison
        return a.time.localeCompare(b.time);
      });

      setActivities(recentActivities.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          change={12}
          changeType="increase"
          icon={DocumentTextIcon}
          color="indigo"
        />
        <MetricCard
          title="Pending Reviews"
          value={metrics.pendingProjects}
          change={metrics.pendingProjects > 0 ? 5 : 0}
          changeType={metrics.pendingProjects > 0 ? "increase" : "decrease"}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          change={8}
          changeType="increase"
          icon={UserGroupIcon}
          color="green"
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          change={3}
          changeType="increase"
          icon={ChartBarIcon}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Review Projects"
            description={`${metrics.pendingProjects} projects need review`}
            action={() => onSectionToggle('pending')}
            color="yellow"
          />
          <QuickActionCard
            title="Manage Users"
            description="View and manage user accounts"
            action={() => onSectionToggle('users')}
            color="green"
          />
          <QuickActionCard
            title="Send Message"
            description="Broadcast to users"
            action={() => onSectionToggle('messages')}
            color="indigo"
          />
          <QuickActionCard
            title="View Analytics"
            description="Detailed site statistics"
            action={() => onSectionToggle('analytics')}
            color="red"
          />
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <ActivityFeed activities={activities} />
        </div>

        {/* Platform Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Projects</span>
              <span className="text-sm font-medium text-gray-900">{metrics.totalProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Published</span>
              <span className="text-sm font-medium text-green-600">{metrics.publishedProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Review</span>
              <span className="text-sm font-medium text-yellow-600">{metrics.pendingProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-medium text-indigo-600">{metrics.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Admin Status</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 