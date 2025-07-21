import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/config';
import { ArrowRightIcon, StarIcon, UserIcon, TagIcon, HeartIcon, ChatBubbleLeftIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import ProjectCard from '../components/project/ProjectCard';

const HomePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [publishedProjects, setPublishedProjects] = useState([]);
  const [unpublishedProjects, setUnpublishedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/?limit=12');
      const projects = response.data.results || response.data;

      const published = projects.filter((p) => p.status === 'published');
      const unpublished = projects.filter((p) => p.status !== 'published');

      setPublishedProjects(published);
      setUnpublishedProjects(unpublished);
    } catch (err) {
      console.error('Error fetching featured projects:', err);
      setError('Failed to load featured projects');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFullAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    const baseURL = api.defaults.baseURL || 'http://localhost:8000';
    return `${baseURL.replace('/api', '')}${avatarUrl}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
              {t('welcomeToBuildHub')}
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-indigo-100">
              {t('joinCommunity')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/projects"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center group"
              >
                {t('exploreProjects')}
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/create-project"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-indigo-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {t('createYourFirstProject')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('featuredProjects')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('discoverProjects')}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 font-medium">{error}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="text-center mt-16">
              <Link
                to="/projects"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('exploreProjects')}
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Unpublished section for owners */}
      {user && unpublishedProjects.length > 0 && (
        <section className="py-20 bg-orange-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('yourUnpublishedProjects')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('draftsOrPendingProjects')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {unpublishedProjects.map((project, index) => (
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
        </section>
      )}

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-5xl font-bold mb-2 bg-white bg-opacity-20 rounded-lg py-4">500+</div>
              <div className="text-indigo-200 text-lg">{t('projectsShared')}</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-5xl font-bold mb-2 bg-white bg-opacity-20 rounded-lg py-4">10K+</div>
              <div className="text-indigo-200 text-lg">{t('makersConnected')}</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-5xl font-bold mb-2 bg-white bg-opacity-20 rounded-lg py-4">50+</div>
              <div className="text-indigo-200 text-lg">{t('categoriesAvailable')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          {user ? (
            // Content for logged-in users
            <>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('welcomeBack', { username: user.username })}</h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('readyToShareOrExplore')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/create-project"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('createNewProject')}
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  to="/projects"
                  className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-indigo-600 hover:text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('exploreProjects')}
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </>
          ) : (
            // Content for non-logged-in users
            <>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('readyToStartBuilding')}</h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('joinThousandsOfMakers')}
              </p>
              <Link
                to="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('joinBuildHubToday')}
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 