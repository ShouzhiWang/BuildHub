# Search Implementation Plan for BuildHub

## Overview
This document outlines the implementation plan for a comprehensive search tool that allows users to search across projects and users throughout the BuildHub website.

## Current State Analysis

### Existing Search Functionality
- **User Search**: Basic user search exists at `/users/search/` endpoint
- **Admin Search**: Admin messaging section has user search functionality
- **Project Filtering**: Projects page has category, difficulty, and type filters
- **No Global Search**: No unified search interface across the entire website

### Backend Infrastructure
- Django REST Framework with PostgreSQL
- Existing models: User, Project, Category, Bookmark, etc.
- Basic search endpoints already exist

## Implementation Plan

### Phase 1: Backend Search Infrastructure

#### 1.1 Enhanced Project Search
**File**: `backend/api/views.py`
- Add search parameter to `ProjectListCreateView`
- Implement full-text search across project fields:
  - Title
  - Description
  - Elevator pitch
  - Story content
  - Author username
  - Category name

**Implementation**:
```python
# In ProjectListCreateView.get_queryset()
search_query = self.request.query_params.get('search', '').strip()
if search_query:
    queryset = queryset.filter(
        Q(title__icontains=search_query) |
        Q(description__icontains=search_query) |
        Q(elevator_pitch__icontains=search_query) |
        Q(story_content__icontains=search_query) |
        Q(author__username__icontains=search_query) |
        Q(category__name__icontains=search_query)
    )
```

#### 1.2 Enhanced User Search
**File**: `backend/api/views.py`
- Improve existing `user_search_view`
- Add search across:
  - Username
  - First name
  - Last name
  - Email (partial)
  - User profile fields (if available)

#### 1.3 Global Search Endpoint
**File**: `backend/api/views.py`
- Create new `global_search_view`
- Search across both projects and users
- Return structured results with type indicators
- Support pagination and result limits

**API Endpoint**: `GET /api/search/?q=<query>&type=<projects|users|all>&limit=<number>`

**Response Format**:
```json
{
  "projects": [
    {
      "id": 1,
      "title": "Project Title",
      "author": "username",
      "category": "Category Name",
      "match_type": "title|description|author"
    }
  ],
  "users": [
    {
      "id": 1,
      "username": "username",
      "first_name": "First",
      "last_name": "Last",
      "match_type": "username|name|email"
    }
  ],
  "total_results": 25,
  "query": "search term"
}
```

### Phase 2: Frontend Search Components

#### 2.1 Global Search Component
**File**: `src/components/GlobalSearch.jsx`
- Search input with autocomplete
- Real-time search suggestions
- Search results dropdown
- Keyboard navigation support
- Search history (localStorage)

**Features**:
- Debounced search input
- Loading states
- Error handling
- Responsive design
- Accessibility support

#### 2.2 Search Results Page
**File**: `src/pages/SearchResultsPage.jsx`
- Dedicated page for search results
- Filter by type (projects/users)
- Sort options
- Pagination
- Advanced filters

#### 2.3 Search Integration
**Files**: 
- `src/components/Navigation.jsx` - Add search bar to header
- `src/App.jsx` - Add search results route
- `src/api/config.js` - Add search API functions

### Phase 3: Advanced Search Features

#### 3.1 Search Filters
- **Project Filters**:
  - Category
  - Difficulty level
  - Status (published/draft)
  - Date range
  - Author

- **User Filters**:
  - User type (regular/admin)
  - Registration date
  - Activity level

#### 3.2 Search Analytics
- Track popular search terms
- Search result click-through rates
- Search performance metrics

#### 3.3 Search Suggestions
- Popular searches
- Recent searches
- Related searches
- Autocomplete suggestions

### Phase 4: UI/UX Enhancements

#### 4.1 Search Interface Design
- Clean, modern search bar
- Search icon and clear button
- Loading animations
- Empty state designs
- Error state handling

#### 4.2 Search Results Design
- Card-based layout for projects
- User profile cards
- Highlighted search terms
- Quick actions (bookmark, follow, etc.)

#### 4.3 Mobile Optimization
- Touch-friendly search interface
- Responsive search results
- Mobile-specific search features

## Technical Implementation Details

### Backend Implementation

#### 1. Search Endpoints
```python
# New endpoints to add
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def global_search_view(request):
    """Global search across projects and users"""
    query = request.GET.get('q', '').strip()
    search_type = request.GET.get('type', 'all')  # all, projects, users
    limit = int(request.GET.get('limit', 20))
    
    results = {
        'projects': [],
        'users': [],
        'total_results': 0,
        'query': query
    }
    
    if not query:
        return Response(results)
    
    if search_type in ['all', 'projects']:
        projects = Project.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(author__username__icontains=query)
        ).filter(status='published')[:limit]
        results['projects'] = ProjectListSerializer(projects, many=True).data
    
    if search_type in ['all', 'users']:
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )[:limit]
        results['users'] = UserSerializer(users, many=True).data
    
    results['total_results'] = len(results['projects']) + len(results['users'])
    return Response(results)
```

#### 2. Enhanced Project Search
```python
# Modify existing ProjectListCreateView
def get_queryset(self):
    # ... existing code ...
    
    # Add search functionality
    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
        queryset = queryset.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(elevator_pitch__icontains=search_query) |
            Q(author__username__icontains=search_query) |
            Q(category__name__icontains=search_query)
        )
    
    return queryset
```

### Frontend Implementation

#### 1. Search API Functions
```javascript
// Add to src/api/config.js
export const searchAPI = {
  globalSearch: async (query, type = 'all', limit = 20) => {
    try {
      const response = await api.get(`/search/?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  searchProjects: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({ search: query, ...filters });
      const response = await api.get(`/projects/?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users/search/?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
```

#### 2. Global Search Component
```jsx
// src/components/GlobalSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchAPI } from '../api/config';

const GlobalSearch = () => {
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

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchAPI.globalSearch(query);
      setResults(searchResults);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
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

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects and users..."
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
      {showDropdown && results && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.total_results === 0 ? (
            <div className="p-4 text-center text-gray-500">No results found</div>
          ) : (
            <div>
              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                    Projects ({results.projects.length})
                  </div>
                  {results.projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleResultClick('project', project)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    >
                      <div className="font-medium text-gray-900">{project.title}</div>
                      <div className="text-sm text-gray-600">by {project.author.username}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                    Users ({results.users.length})
                  </div>
                  {results.users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleResultClick('user', user)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
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
              <div className="px-4 py-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setShowDropdown(false);
                  }}
                  className="w-full text-center text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all {results.total_results} results
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
```

## Implementation Timeline

### Week 1: Backend Foundation
- [ ] Implement enhanced project search
- [ ] Improve user search functionality
- [ ] Create global search endpoint
- [ ] Add search API functions to frontend

### Week 2: Basic Search UI
- [ ] Create GlobalSearch component
- [ ] Integrate search into Navigation
- [ ] Create SearchResultsPage
- [ ] Add search route to App.jsx

### Week 3: Advanced Features
- [ ] Add search filters
- [ ] Implement search suggestions
- [ ] Add search analytics
- [ ] Mobile optimization

### Week 4: Polish & Testing
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Documentation

## Success Metrics

### User Engagement
- Search usage frequency
- Search result click-through rates
- Time spent on search results page
- Search query patterns

### Technical Performance
- Search response time (< 200ms)
- Search accuracy
- Search result relevance
- Mobile search performance

### Business Impact
- Increased project discovery
- Improved user engagement
- Reduced bounce rate
- Higher user retention

## Future Enhancements

### Advanced Search Features
- Full-text search with PostgreSQL
- Search result ranking
- Search result highlighting
- Search history and favorites
- Advanced filters and facets

### AI-Powered Features
- Search suggestions based on user behavior
- Personalized search results
- Semantic search capabilities
- Search result recommendations

### Analytics & Insights
- Search analytics dashboard
- Popular search terms
- Search performance metrics
- User search behavior analysis

## Conclusion

This comprehensive search implementation will significantly improve the user experience on BuildHub by providing quick and easy access to projects and users. The phased approach ensures a solid foundation while allowing for future enhancements and optimizations.

The search functionality will be a key differentiator for BuildHub, making it easier for users to discover relevant content and connect with other makers in the community. 