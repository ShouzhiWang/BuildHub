import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { useTranslation } from '../hooks/useTranslation';
import { 
  UserCircleIcon, CalendarIcon, TagIcon, MapPinIcon, BriefcaseIcon, XMarkIcon
} from '@heroicons/react/24/outline';

const getFullAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const baseURL = api.defaults.baseURL || 'http://localhost:8000';
  return `${baseURL.replace('/api', '')}${avatarUrl}`;
};

const getFullCoverImageUrl = (coverImageUrl) => {
  if (!coverImageUrl) return null;
  if (coverImageUrl.startsWith('http')) return coverImageUrl;
  const baseURL = api.defaults.baseURL || 'http://localhost:8000';
  return `${baseURL.replace('/api', '')}${coverImageUrl}`;
};

const UserProfilePage = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch user profile by username
        const userRes = await api.get(`/users/${username}/`);
        setProfile(userRes.data);
        // Fetch projects for this user
        const projectsRes = await api.get(`/users/${userRes.data.id}/projects/`);
        setProjects(projectsRes.data);
      } catch (err) {
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const formatStatus = (status) => {
    switch (status) {
      case 'published':
        return t('published');
      case 'pending':
        return t('pendingReview');
      case 'draft':
        return t('draft');
      default:
        return status || t('unknown');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t('loadingProfile')}</p>
        </div>
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-red-600 mb-4">
              <UserCircleIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('unableToLoadProfile')}</h3>
            <p className="text-gray-600 mb-4">{error || t('profileNotFound')}</p>
            <button 
              onClick={() => navigate(-1)} 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t('goBack')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = getFullAvatarUrl(profile.profile?.avatar);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 sm:h-40"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative -mt-16 sm:-mt-20">
                <img
                  src={avatarUrl || '/default-avatar.svg'}
                  alt="avatar"
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
                />
              </div>
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{profile.username}</h1>
                    {(profile.first_name || profile.last_name) && (
                      <div className="flex items-center text-gray-700 mt-1">
                        <UserCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {profile.first_name} {profile.last_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <CalendarIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{t('joined')} {profile.date_joined ? new Date(profile.date_joined).toLocaleDateString() : t('unknown')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Bio Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <UserCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">{t('about')}</h2>
            </div>
            <div className="text-gray-700">
              {profile.profile?.bio ? (
                <p className="whitespace-pre-line">{profile.profile.bio}</p>
              ) : (
                <p className="text-gray-400 italic">{t('noBioAddedYet')}</p>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <TagIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">{t('skillsAndTechnologies')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.profile?.skills && profile.profile.skills.length > 0 ? (
                profile.profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 italic">{t('noSkillsAddedYet')}</p>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">{t('location')}</h2>
            </div>
            <div className="text-gray-700">
              {profile.profile?.location ? (
                <p>{profile.profile.location}</p>
              ) : (
                <p className="text-gray-400 italic">{t('noLocationSpecified')}</p>
              )}
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">{t('projects')}</h2>
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {projects.filter(project => project.status === 'published' || project.status === 'pending').length}
              </span>
            </div>
            {projects.filter(project => project.status === 'published' || project.status === 'pending').length === 0 ? (
              <div className="text-center py-8">
                <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t('noProjectsYet')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects
                  .filter(project => project.status === 'published' || project.status === 'pending')
                  .map(project => {
                  const coverUrl = project.cover_image
                    ? getFullCoverImageUrl(project.cover_image)
                    : '/default-avatar.svg';
                  return (
                    <div key={project.id} className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <img
                        src={coverUrl}
                        alt="project cover"
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 mr-4 bg-white flex-shrink-0"
                        onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">{project.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {project.role || t('member')}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(project.status)}`}>
                            {formatStatus(project.status)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium ml-2 flex-shrink-0"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        {t('view')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage; 