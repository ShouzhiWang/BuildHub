import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchAPI } from '../api/config';
import ProjectCard from '../components/project/ProjectCard';
import { MagnifyingGlassIcon, UserIcon, FolderIcon } from '@heroicons/react/24/outline';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState({ projects: [], users: [], total_results: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, projects, users

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await searchAPI.globalSearch(query, activeTab, 50);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/users/${username}`);
  };

  const getTabCount = (type) => {
    switch (type) {
      case 'projects':
        return results.projects.length;
      case 'users':
        return results.users.length;
      default:
        return results.total_results;
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-20">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No search query</h1>
            <p className="text-gray-600">Please enter a search term to find projects and users.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600">
            Found {results.total_results} results
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 font-medium">{error}</div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <div>
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                All ({getTabCount('all')})
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FolderIcon className="w-4 h-4 mr-2" />
                Projects ({getTabCount('projects')})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Users ({getTabCount('users')})
              </button>
            </div>

            {/* No Results */}
            {results.total_results === 0 && (
              <div className="text-center py-20">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
                <p className="text-gray-600">
                  No projects or users found for "{query}". Try different keywords.
                </p>
              </div>
            )}

            {/* Projects Results */}
            {(activeTab === 'all' || activeTab === 'projects') && results.projects.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FolderIcon className="w-6 h-6 mr-2" />
                  Projects ({results.projects.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                    >
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Results */}
            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <UserIcon className="w-6 h-6 mr-2" />
                  Users ({results.users.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.users.map((user, index) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user.username)}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${(index + (results.projects.length || 0)) * 100}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            className="w-12 h-12 rounded-full"
                            src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
                            alt={user.username}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {user.username}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {user.first_name} {user.last_name}
                          </p>
                          {user.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage; 