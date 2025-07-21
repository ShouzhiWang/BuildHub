import React, { useEffect, useState } from 'react';
import { 
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import api from '../../api/config';

const SimpleBarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-500" />
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center">
            <div className="w-20 text-sm text-gray-600 flex-shrink-0">{item.label}</div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-12 text-sm font-medium text-gray-900 text-right">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimeSeriesChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-500" />
        {title}
      </h3>
      <div className="h-48 flex items-end space-x-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div 
              className="bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t w-full transition-all duration-500 hover:from-indigo-600 hover:to-indigo-400"
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
            ></div>
            <div className="text-xs text-gray-600 mt-2 text-center">{item.label}</div>
            <div className="text-xs font-medium text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-indigo-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-2 rounded-lg mr-4`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState({
    projectsByCategory: [],
    projectsByDifficulty: [],
    userRegistrations: [],
    projectSubmissions: [],
    stats: {
      avgProjectsPerUser: 0,
      topCategory: '',
      mostActiveDay: '',
      completionRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [projectsRes, usersRes, categoriesRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/users/'),
        api.get('/categories/')
      ]);

      const projects = projectsRes.data.results || projectsRes.data;
      const users = usersRes.data.results || usersRes.data;
      const categories = categoriesRes.data.results || categoriesRes.data;

      // Projects by Category
      const categoryStats = categories.map(cat => ({
        label: cat.name,
        value: projects.filter(p => p.category?.id === cat.id).length
      }));

      // Projects by Difficulty
      const difficultyStats = [
        { label: 'Beginner', value: projects.filter(p => p.difficulty === 'beginner').length },
        { label: 'Intermediate', value: projects.filter(p => p.difficulty === 'intermediate').length },
        { label: 'Advanced', value: projects.filter(p => p.difficulty === 'advanced').length }
      ];

      // Generate sample time series data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: Math.floor(Math.random() * 10) + 1
        };
      });

      const last7DaysProjects = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.floor(Math.random() * 5) + 1
        };
      });

      // Calculate stats
      const topCategory = categoryStats.reduce((max, cat) => cat.value > max.value ? cat : max, categoryStats[0] || { label: 'None', value: 0 });
      
      setAnalytics({
        projectsByCategory: categoryStats,
        projectsByDifficulty: difficultyStats,
        userRegistrations: last7Days,
        projectSubmissions: last7DaysProjects,
        stats: {
          avgProjectsPerUser: users.length > 0 ? (projects.length / users.length).toFixed(1) : 0,
          topCategory: topCategory.label,
          mostActiveDay: 'Monday',
          completionRate: 78
        }
      });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Avg Projects/User"
          value={analytics.stats.avgProjectsPerUser}
          subtitle="Active contributors"
          icon={UserGroupIcon}
          color="indigo"
        />
        <StatsCard
          title="Top Category"
          value={analytics.stats.topCategory}
          subtitle="Most popular"
          icon={FunnelIcon}
          color="green"
        />
        <StatsCard
          title="Most Active Day"
          value={analytics.stats.mostActiveDay}
          subtitle="Peak submissions"
          icon={CalendarDaysIcon}
          color="yellow"
        />
        <StatsCard
          title="Completion Rate"
          value={`${analytics.stats.completionRate}%`}
          subtitle="Published projects"
          icon={ArrowTrendingUpIcon}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={analytics.projectsByCategory}
          title="Projects by Category"
        />
        <SimpleBarChart
          data={analytics.projectsByDifficulty}
          title="Projects by Difficulty"
        />
        <TimeSeriesChart
          data={analytics.userRegistrations}
          title="User Registrations (Last 7 Days)"
        />
        <TimeSeriesChart
          data={analytics.projectSubmissions}
          title="Project Submissions (Last 7 Days)"
        />
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="space-y-3">
            {analytics.projectsByCategory
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{cat.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{cat.value} projects</span>
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(cat.value / Math.max(...analytics.projectsByCategory.map(c => c.value))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Trends */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Trends & Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Project submissions up 15%</p>
                <p className="text-xs text-gray-600">Compared to last week</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Electronics category trending</p>
                <p className="text-xs text-gray-600">25% increase in projects</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Weekend submissions peak</p>
                <p className="text-xs text-gray-600">Saturday most active day</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">User engagement high</p>
                <p className="text-xs text-gray-600">Average 3.2 projects per user</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection; 