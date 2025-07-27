from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.user_profile_view, name='user_profile'),
    
    # Category endpoints
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    
    # User endpoints
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:id>/', views.UserDetailView.as_view(), name='user_detail_update'),
    path('users/search/', views.user_search_view, name='user_search'),
    path('users/<str:username>/', views.user_detail_view, name='user_detail'),
    path('users/<int:user_id>/projects/', views.user_projects_view, name='user_projects'),
    
    # Project endpoints
    path('projects/', views.ProjectListCreateView.as_view(), name='project_list_create'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project_detail'),
    
    # Comment endpoints
    path('projects/<int:project_id>/comments/', views.ProjectCommentListCreateView.as_view(), name='project_comments'),
    path('comments/<int:comment_id>/replies/', views.CommentReplyCreateView.as_view(), name='comment_replies'),
    path('comments/<int:comment_id>/delete/', views.delete_comment, name='delete_comment'),

    # User involved projects endpoints
    path('user-involved-projects/', views.user_involved_projects_view, name='user_involved_projects'),
    path('user-involved-projects/<int:user_id>/', views.user_involved_projects_view, name='user_involved_projects_by_id'),
    
    # Message endpoints
    path('messages/', views.user_messages, name='user_messages'),
    path('messages/<int:message_id>/read/', views.mark_message_read, name='mark_message_read'),
    path('messages/mark-all-read/', views.mark_all_messages_read, name='mark_all_messages_read'),
    path('messages/<int:message_id>/delete/', views.delete_message, name='delete_message'),
    path('admin/send-message/', views.send_admin_message, name='send_admin_message'),
    
    # Bookmark endpoints
    path('projects/<int:project_id>/bookmark/', views.bookmark_toggle, name='bookmark_toggle'),
    path('bookmarks/', views.user_bookmarks, name='user_bookmarks'),
    path('projects/<int:project_id>/bookmark-status/', views.check_bookmark_status, name='check_bookmark_status'),
    
    # Slideshow endpoints
    path('projects/<int:project_id>/slideshow/', views.upload_slideshow, name='upload_slideshow'),
    path('projects/<int:project_id>/slideshow/get/', views.get_slideshow, name='get_slideshow'),
    path('projects/<int:project_id>/slideshow/delete/', views.delete_slideshow, name='delete_slideshow'),

    
    # Search endpoints
    path('search/', views.global_search_view, name='global_search'),
    path('components/search/', views.search_components_view, name='search_components'),
] 