import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { UserIcon, PlusIcon, HomeIcon, FolderIcon, BellIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../api/config';
import GlobalSearch from './GlobalSearch';
import LanguageSwitcher from './LanguageSwitcher';

// Utility function to construct full avatar URL
const getFullAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const baseURL = api.defaults.baseURL || 'http://localhost:8000';
  return `${baseURL.replace('/api', '')}${avatarUrl}`;
};

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Refetch unread count when returning from the message center
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/messages') {
      // Give the message center a moment to mark as read
      const timer = setTimeout(() => {
        fetchUnreadCount();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/');
      const unread = response.data.filter(m => !m.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get avatar from user.profile if available
  let avatarUrl = null;
  if (user && user.profile && user.profile.avatar) {
    avatarUrl = getFullAvatarUrl(user.profile.avatar);
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2 rounded-md transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">GEISP</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <GlobalSearch />
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden flex-1 mx-4">
            <GlobalSearch />
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex space-x-2">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 px-3 py-2 rounded-md transition-all duration-200 transform hover:scale-105"
              >
                <HomeIcon className="w-5 h-5" />
                <span>{t('home')}</span>
              </Link>
            )}
            <Link
              to="/projects"
              className="flex items-center space-x-1 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 px-3 py-2 rounded-md transition-all duration-200 transform hover:scale-105"
            >
              <FolderIcon className="w-5 h-5" />
              <span>{t('projects')}</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to="/messages"
                  className="flex items-center space-x-1 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 px-3 py-2 rounded-md transition-all duration-200 transform hover:scale-105 relative"
                >
                  <BellIcon className="w-5 h-5" />
                  <span>{t('messages')}</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/create-project"
                  className="flex items-center space-x-1 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 px-3 py-2 rounded-md transition-all duration-200 transform hover:scale-105"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>{t('createProject')}</span>
                </Link>
              </>
            )}
            {isAuthenticated && user?.is_staff && (
              <Link
                to="/admin-dashboard"
                className="flex items-center space-x-1 text-gray-700 hover:bg-yellow-100 hover:text-yellow-600 px-3 py-2 rounded-md transition-all duration-200 transform hover:scale-105 font-semibold"
              >
                <span className="bg-yellow-400 text-white rounded px-2 py-1 mr-2 text-xs">{t('admin')}</span>
                <span>{t('dashboard')}</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <Link to="/profile">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-indigo-200 bg-white"
                        onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-indigo-600 bg-white rounded-full p-1 border-2 border-indigo-200" />
                    )}
                  </Link>
                  <Link to="/profile" className="text-gray-700 font-medium hover:underline">
                    {t('hello', { username: user?.username })}
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md transition-all duration-200 transform hover:scale-105"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 block px-3 py-2 rounded-md transition-all duration-200"
              >
                {t('home')}
              </Link>
            )}
            <Link
              to="/projects"
              className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 block px-3 py-2 rounded-md transition-all duration-200"
            >
              {t('projects')}
            </Link>
            {isAuthenticated && user?.is_staff && (
              <Link
                to="/admin-dashboard"
                className="text-yellow-700 bg-yellow-100 font-semibold block px-3 py-2 rounded-md transition-all duration-200"
              >
                {t('admin')} {t('dashboard')}
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link
                  to="/messages"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 block px-3 py-2 rounded-md transition-all duration-200 relative"
                >
                  {t('messages')}
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/create-project"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 block px-3 py-2 rounded-md transition-all duration-200"
                >
                  {t('createProject')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 