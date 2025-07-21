import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChatBubbleLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import api from '../api/config';
import DashboardOverview from '../components/admin/DashboardOverview';
import AnalyticsSection from '../components/admin/AnalyticsSection';
import EnhancedPendingProjects from '../components/admin/EnhancedPendingProjects';
import EnhancedUserManagement from '../components/admin/EnhancedUserManagement';
import AdminMessagingSection from '../components/admin/AdminMessagingSection';

const NavigationTab = ({ id, label, icon: Icon, isActive, onClick, badge }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    {label}
    {badge && (
      <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate('/');
    } else {
      fetchDashboardData();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/users/')
      ]);
      
      const projects = projectsRes.data.results || projectsRes.data;
      setPendingCount(projects.filter(p => p.status === 'pending').length);
      setUserCount((usersRes.data.results || usersRes.data).length);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'pending', label: 'Pending Projects', icon: DocumentTextIcon, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'users', label: 'User Management', icon: UserGroupIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'messages', label: 'Messaging', icon: ChatBubbleLeftIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview onSectionToggle={setActiveSection} />;
      case 'pending':
        return <EnhancedPendingProjects setPendingCount={setPendingCount} />;
      case 'users':
        return <EnhancedUserManagement />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'messages':
        return <AdminMessagingSection />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <DashboardOverview onSectionToggle={setActiveSection} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
                 {/* Sidebar */}
         <div className={`${sidebarOpen ? 'w-64' : 'w-0'} lg:w-64 lg:block transition-all duration-300 overflow-hidden`}>
                   <div className="bg-white h-full shadow-sm border-r border-gray-200 p-4">
           {/* Mobile menu button and title */}
           <div className="flex items-center justify-between mb-6 lg:mb-4">
             <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
             <button
               onClick={() => setSidebarOpen(!sidebarOpen)}
               className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           </div>
           
           <nav className="space-y-2">
              {navigationItems.map((item) => (
                <NavigationTab
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={activeSection === item.id}
                  onClick={setActiveSection}
                  badge={item.badge}
                />
              ))}
            </nav>

            {/* Quick Stats in Sidebar */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-medium text-gray-900">{userCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-yellow-600">{pendingCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">System Status</span>
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Healthy
                  </span>
                </div>
              </div>
            </div>

            
          </div>
                 </div>

         {/* Main Content */}
         <div className="flex-1 p-4 lg:p-8">
           {/* Mobile menu button */}
           <div className="lg:hidden mb-4">
             <button
               onClick={() => setSidebarOpen(true)}
               className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             </button>
           </div>
           
           <div className="max-w-7xl mx-auto">
             {renderSection()}
           </div>
         </div>

         {/* Mobile sidebar overlay */}
         {sidebarOpen && (
           <div 
             className="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 lg:hidden"
             onClick={() => setSidebarOpen(false)}
           ></div>
         )}
       </div>
     );
   };

export default AdminDashboardPage; 