import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchAPI } from '../api/config';

const GlobalSearch = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults(null);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchAPI.globalSearch(query);
      setResults(searchResults);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ projects: [], users: [], total_results: 0, query });
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type, item) => {
    if (type === 'project') {
      navigate(`/projects/${item.id}`);
    } else if (type === 'user') {
      navigate(`/users/${item.username}`);
    }
    setShowDropdown(false);
    setQuery('');
  };

  const handleViewAllResults = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setQuery('');
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setShowDropdown(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="px-3 py-2 text-gray-500 text-sm border-b">
            {loading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent mr-2"></div>
                <p className="mt-2">{t('loading')}</p>
              </div>
            )}
            {!loading && results && (results.projects.length === 0 && results.users.length === 0) && (
              <p>{t('noResults')}</p>
            )}
          </div>

          {/* Projects */}
          {!loading && results && results.projects.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                {t('projects')} ({results.projects.length})
              </div>
              {results.projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleResultClick('project', project)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="font-medium text-gray-900">{project.title}</div>
                  <div className="text-sm text-gray-600">
                    by {project.author?.username} • {project.category?.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {!loading && results && results.users.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                {t('users')} ({results.users.length})
              </div>
              {results.users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleResultClick('user', user)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="font-medium text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-600">
                    {user.first_name} {user.last_name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Results */}
          {results?.total_results > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={handleViewAllResults}
                className="w-full text-center text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all {results.total_results} results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch; 