import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  XMarkIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  LinkIcon 
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/config';

const TeamTab = ({ formData, updateFormData, errors }) => {
  const { t } = useTranslation();
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search for users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Note: You'll need to implement a user search endpoint in your backend
      const response = await api.get(`/users/search/?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (userSearch) {
        searchUsers(userSearch);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [userSearch]);

  // Team Members functions
  const addTeamMember = (user) => {
    const newMember = {
      user_id: user.id,
      user: user,
      contribution: '',
      role: 'Manage'
    };
    
    const updatedMembers = [...formData.team_members, newMember];
    updateFormData('team_members', updatedMembers);
    setShowUserSearch(false);
    setUserSearch('');
    setSearchResults([]);
  };

  const removeTeamMember = (index) => {
    const updatedMembers = formData.team_members.filter((_, i) => i !== index);
    updateFormData('team_members', updatedMembers);
  };

  const updateTeamMemberContribution = (index, contribution) => {
    const updatedMembers = [...formData.team_members];
    updatedMembers[index].contribution = contribution;
    updateFormData('team_members', updatedMembers);
  };

  const updateTeamMemberRole = (index, role) => {
    const updatedMembers = [...formData.team_members];
    updatedMembers[index].role = role;
    updateFormData('team_members', updatedMembers);
  };

  // Work Attribution functions
  const addWorkAttribution = () => {
    const newAttribution = {
      contributor_name: '',
      credit_description: '',
      link: ''
    };
    
    const updatedAttributions = [...formData.work_attributions, newAttribution];
    updateFormData('work_attributions', updatedAttributions);
  };

  const removeWorkAttribution = (index) => {
    const updatedAttributions = formData.work_attributions.filter((_, i) => i !== index);
    updateFormData('work_attributions', updatedAttributions);
  };

  const updateWorkAttribution = (index, field, value) => {
    const updatedAttributions = [...formData.work_attributions];
    updatedAttributions[index][field] = value;
    updateFormData('work_attributions', updatedAttributions);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('teamAndContributors')}</h2>
        <p className="text-gray-600 mb-8">
          {t('giveCreditToEveryone')}
        </p>
      </div>

      {/* Team Members Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('teamMembers')}</h3>
            <p className="text-sm text-gray-600">{t('addBuildHubUsers')}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowUserSearch(!showUserSearch)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('addMember')}
          </button>
        </div>

        {/* User Search */}
        {showUserSearch && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={t('searchForUsers')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Search Results */}
            {searchLoading && (
              <div className="mt-2 text-sm text-gray-500">{t('searching')}</div>
            )}
            
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => addTeamMember(user)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                    disabled={formData.team_members.some(member => member.user_id === user.id)}
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.username}</div>
                      {user.first_name && user.last_name && (
                        <div className="text-sm text-gray-500">{user.first_name} {user.last_name}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {userSearch && searchResults.length === 0 && !searchLoading && (
              <div className="mt-2 text-sm text-gray-500">{t('noUsersFound')}</div>
            )}
          </div>
        )}

        {/* Current Team Members */}
        <div className="space-y-4">
          {formData.team_members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('noTeamMembersAddedYet')}</p>
              <p className="text-sm">{t('clickAddMemberToSearch')}</p>
            </div>
          ) : (
            formData.team_members.map((member, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{member.user.username}</div>
                  {member.user.first_name && member.user.last_name && (
                    <div className="text-sm text-gray-500 mb-2">
                      {member.user.first_name} {member.user.last_name}
                    </div>
                  )}
                  {/* Role Selection */}
                  <div className="mt-2">
                    <select
                      value={member.role || 'Manage'}
                      onChange={(e) => updateTeamMemberRole(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-2"
                    >
                      <option value="Manage">{t('managerCanEdit')}</option>
                      <option value="Read">{t('viewerReadOnly')}</option>
                    </select>
                  </div>

                  <textarea
                    placeholder={t('describeMemberContribution')}
                    value={member.contribution}
                    onChange={(e) => updateTeamMemberContribution(index, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTeamMember(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Work Attribution Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('workAttribution')}</h3>
            <p className="text-sm text-gray-600">{t('creditExternalContributors')}</p>
          </div>
          <button
            type="button"
            onClick={addWorkAttribution}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('addAttribution')}
          </button>
        </div>

        <div className="space-y-4">
          {formData.work_attributions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <LinkIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('noAttributionsAddedYet')}</p>
              <p className="text-sm">{t('giveCreditToExternalContributors')}</p>
            </div>
          ) : (
            formData.work_attributions.map((attribution, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">{t('attribution', { index: index + 1 })}</h4>
                  <button
                    type="button"
                    onClick={() => removeWorkAttribution(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contributorName')}
                    </label>
                    <input
                      type="text"
                      value={attribution.contributor_name}
                      onChange={(e) => updateWorkAttribution(index, 'contributor_name', e.target.value)}
                      placeholder={t('enterContributorName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('linkOptional')}
                    </label>
                    <input
                      type="url"
                      value={attribution.link}
                      onChange={(e) => updateWorkAttribution(index, 'link', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contributionDescription')}
                  </label>
                  <textarea
                    value={attribution.credit_description}
                    onChange={(e) => updateWorkAttribution(index, 'credit_description', e.target.value)}
                    placeholder={t('describeHowPersonContributed')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">{t('teamCollaborationTips')}</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>{t('addAllCollaborators')}</li>
          <li>{t('beSpecificAboutContribution')}</li>
          <li>{t('creditExternalLibraries')}</li>
          <li>{t('includeLinksToContributors')}</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamTab; 