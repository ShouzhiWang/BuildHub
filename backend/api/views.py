from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import Category, Project, Component, Step, Comment, Message, Bookmark, ProjectMember, ProjectSlideshow, BillOfMaterialItem
from .serializers import (
    UserSerializer, UserProfileSerializer, CategorySerializer, ProjectListSerializer,
    ProjectDetailSerializer, ProjectCreateUpdateSerializer, CommentSerializer, CommentReplySerializer, MessageSerializer,
    AdminUserSerializer, BookmarkSerializer, ProjectSlideshowSerializer, SlideshowUploadSerializer
)
from rest_framework.permissions import IsAdminUser
import subprocess
import sys
import os


# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Register a new user"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Login user"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_view(request):
    """Get or update user profile"""
    user = request.user
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    elif request.method == 'PUT':
        # Get or create profile if it doesn't exist
        from .models import UserProfile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_search_view(request):
    """Search for users by username, first name, last name, or email"""
    query = request.GET.get('q', '').strip()
    
    if not query:
        return Response([], status=status.HTTP_200_OK)
    
    # Limit search results to prevent performance issues
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(email__icontains=query)
    ).exclude(id=request.user.id)[:20]  # Exclude current user and limit results
    
    return Response(UserSerializer(users, many=True).data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def user_detail_view(request, username):
    """Get public user profile by username (no email)"""
    user = get_object_or_404(User, username=username)
    data = UserSerializer(user).data
    data.pop('email', None)  # Remove email for public view
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def user_projects_view(request, user_id):
    """Get projects by specific user"""
    user = get_object_or_404(User, id=user_id)
    
    # Filter out draft and rejected projects for public viewing
    # Only show published and pending projects
    projects = Project.objects.filter(
        author=user,
        status__in=['published', 'pending']
    )
    serializer = ProjectListSerializer(projects, many=True)
    return Response(serializer.data)


# Category Views
class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Disable pagination for categories


# Project Views
class ProjectListCreateView(generics.ListCreateAPIView):
    """List projects and create new project"""
    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectCreateUpdateSerializer
        return ProjectListSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def get_queryset(self):
        user = self.request.user if self.request.user.is_authenticated else None
        queryset = Project.objects.all()

        # Public visitors see only published projects
        if user is None:
            queryset = queryset.filter(status='published')
        # Non-staff authenticated users see their own projects, published projects, and private projects they're members of
        elif not user.is_staff:
            queryset = queryset.filter(
                Q(status='published') | 
                Q(author=user) |
                Q(team_members__user=user)  # Include private projects where user is a member
            ).distinct()
        # Staff users see everything

        # Additional optional filters
        category = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        status_filter = self.request.query_params.get('status')
        search_query = self.request.query_params.get('search', '').strip()

        if category:
            # Try to filter by category ID first, then by name
            try:
                category_id = int(category)
                queryset = queryset.filter(category__id=category_id)
            except ValueError:
                # If not a number, filter by category name
                queryset = queryset.filter(category__name=category)
        
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Search functionality
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(elevator_pitch__icontains=search_query) |
                Q(story_content__icontains=search_query) |
                Q(author__username__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )

        # Sorting
        sort_param = self.request.query_params.get('sort', 'newest')
        
        if sort_param == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_param == 'popular':
            # Order by comment count as a proxy for popularity
            queryset = queryset.annotate(comment_count=Count('comments')).order_by('-comment_count', '-created_at')
        elif sort_param == 'trending':
            # Projects with recent comments (last 7 days)
            week_ago = timezone.now() - timedelta(days=7)
            queryset = queryset.annotate(
                recent_comments=Count('comments', filter=Q(comments__created_at__gte=week_ago))
            ).order_by('-recent_comments', '-created_at')
        elif sort_param == 'most_respects':
            # For now, use comment count as proxy for "respects"
            queryset = queryset.annotate(comment_count=Count('comments')).order_by('-comment_count', '-created_at')
        else:
            # Default to newest
            queryset = queryset.order_by('-created_at')

        return queryset


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a project"""
    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProjectCreateUpdateSerializer
        return ProjectDetailSerializer
    
    def get_object(self):
        obj = super().get_object()
        # Only allow project author, staff, or manager collaborator to update/delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            user = self.request.user
            is_admin = user.is_staff
            is_author = obj.author == user
            is_manager = ProjectMember.objects.filter(project=obj, user=user, role='Manage').exists()
            if not (is_author or is_admin or is_manager):
                self.permission_denied(
                    self.request, 
                    message='You can only modify your own or managed projects.'
                )
        # Prevent non-authenticated or non-owner from viewing drafts/pending/private
        if obj.status not in ['published', 'private']:
            user = self.request.user if self.request.user.is_authenticated else None
            if user is None or (not user.is_staff and obj.author != user):
                self.permission_denied(
                    self.request,
                    message='This project is not published.'
                )
        # For private projects, check if user is a member
        elif obj.status == 'private':
            user = self.request.user if self.request.user.is_authenticated else None
            if user is None or (not user.is_staff and obj.author != user and not obj.team_members.filter(user=user).exists()):
                self.permission_denied(
                    self.request,
                    message='This project is private and you are not a member.'
                )
        return obj


# Comment Views
class ProjectCommentListCreateView(generics.ListCreateAPIView):
    """List comments for a project and create new comment"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        # Only return top-level comments (no parent)
        return Comment.objects.filter(project_id=project_id, parent=None)
    
    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        project = get_object_or_404(Project, id=project_id)
        comment = serializer.save(author=self.request.user, project=project)
        
        # Create message notification
        create_comment_message(comment)


class CommentReplyCreateView(generics.CreateAPIView):
    """Create a reply to a comment"""
    serializer_class = CommentReplySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        comment_id = self.kwargs['comment_id']
        parent_comment = get_object_or_404(Comment, id=comment_id)
        
        # Create the reply
        reply = serializer.save(
            author=self.request.user,
            project=parent_comment.project,
            parent=parent_comment
        )
        
        # Create message notification for the parent comment author
        if reply.author != parent_comment.author:
            Message.objects.create(
                recipient=parent_comment.author,
                sender=reply.author,
                message_type='comment',
                title=f'Reply to your comment on "{parent_comment.project.title}"',
                content=f'{reply.author.username} replied: "{reply.body[:100]}{"..." if len(reply.body) > 100 else ""}',
                related_project=parent_comment.project,
                related_comment=reply
            )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_involved_projects_view(request, user_id=None):
    """Get all projects where user is author or a team member"""
    if user_id is None:
        user = request.user
    else:
        from django.contrib.auth.models import User
        user = get_object_or_404(User, id=user_id)
    from .models import Project
    # Projects where user is author
    authored = Project.objects.filter(author=user)
    # Projects where user is a team member
    team_member = Project.objects.filter(team_members__user=user)
    # Union, remove duplicates
    projects = (authored | team_member).distinct()
    serializer = ProjectListSerializer(projects, many=True)
    return Response(serializer.data)

# Message utility functions
def create_comment_message(comment):
    """Create message when someone comments on a project"""
    project = comment.project
    if comment.author != project.author:  # Don't notify self
        Message.objects.create(
            recipient=project.author,
            sender=comment.author,
            message_type='comment',
            title=f'New comment on "{project.title}"',
            content=f'{comment.author.username} commented: "{comment.body[:100]}{"..." if len(comment.body) > 100 else ""}',
            related_project=project,
            related_comment=comment
        )

def create_like_message(user, project):
    """Create message when someone likes a project"""
    if user != project.author:  # Don't notify self
        Message.objects.create(
            recipient=project.author,
            sender=user,
            message_type='like',
            title=f'New like on "{project.title}"',
            content=f'{user.username} liked your project',
            related_project=project
        )

# Message Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_messages(request):
    """Get user's messages"""
    messages = Message.objects.filter(recipient=request.user)
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_message_read(request, message_id):
    """Mark message as read"""
    message = get_object_or_404(Message, id=message_id, recipient=request.user)
    message.is_read = True
    message.save()
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_messages_read(request):
    """Mark all messages as read"""
    Message.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'success': True})

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_message(request, message_id):
    """Delete a message"""
    message = get_object_or_404(Message, id=message_id, recipient=request.user)
    message.delete()
    return Response({'success': True})

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_comment(request, comment_id):
    """Allow a user to delete their own comment"""
    comment = get_object_or_404(Comment, id=comment_id)
    if comment.author != request.user:
        return Response({'detail': 'You do not have permission to delete this comment.'}, status=status.HTTP_403_FORBIDDEN)
    comment.delete()
    return Response({'success': True})

# Admin endpoints (for future use)
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def send_admin_message(request):
    """Send message to user(s) as admin"""
    recipient_id = request.data.get('recipient_id')
    title = request.data.get('title')
    content = request.data.get('content')
    
    recipient = get_object_or_404(User, id=recipient_id)
    Message.objects.create(
        recipient=recipient,
        sender=request.user,
        message_type='admin',
        title=title,
        content=content
    )
    return Response({'success': True})

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'


# Bookmark Views
@api_view(['POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def bookmark_toggle(request, project_id):
    """Toggle bookmark for a project"""
    project = get_object_or_404(Project, id=project_id)
    user = request.user
    
    try:
        bookmark = Bookmark.objects.get(user=user, project=project)
        if request.method == 'DELETE':
            bookmark.delete()
            return Response({'bookmarked': False}, status=status.HTTP_200_OK)
        else:
            return Response({'bookmarked': True}, status=status.HTTP_200_OK)
    except Bookmark.DoesNotExist:
        if request.method == 'POST':
            Bookmark.objects.create(user=user, project=project)
            return Response({'bookmarked': True}, status=status.HTTP_201_CREATED)
        else:
            return Response({'bookmarked': False}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_bookmarks(request):
    """Get user's bookmarked projects"""
    bookmarks = Bookmark.objects.filter(user=request.user).select_related('project')
    serializer = BookmarkSerializer(bookmarks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_bookmark_status(request, project_id):
    """Check if a project is bookmarked by the current user"""
    try:
        project = get_object_or_404(Project, id=project_id)
        is_bookmarked = Bookmark.objects.filter(user=request.user, project=project).exists()
        return Response({'bookmarked': is_bookmarked})
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


# Global Search Views
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
        # Search projects - include published and private projects user has access to
        user = request.user if request.user.is_authenticated else None
        if user is None:
            # Public visitors only see published projects
            projects_queryset = Project.objects.filter(status='published')
        elif user.is_staff:
            # Staff see all projects
            projects_queryset = Project.objects.all()
        else:
            # Regular users see published projects, their own projects, and private projects they're members of
            projects_queryset = Project.objects.filter(
                Q(status='published') | 
                Q(author=user) |
                Q(team_members__user=user)
            ).distinct()
        
        projects = projects_queryset.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(elevator_pitch__icontains=query) |
            Q(author__username__icontains=query) |
            Q(category__name__icontains=query)
        )[:limit]
        results['projects'] = ProjectListSerializer(projects, many=True).data
    
    if search_type in ['all', 'users']:
        # Search users
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query)
        )[:limit]
        results['users'] = UserSerializer(users, many=True).data
    
    results['total_results'] = len(results['projects']) + len(results['users'])
    return Response(results)


# Slideshow API Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_slideshow(request, project_id):
    """Upload a PowerPoint or PDF file and convert to images"""
    project = get_object_or_404(Project, id=project_id)
    if project.author != request.user:
        return Response({'error': 'You do not have permission to edit this project'}, status=status.HTTP_403_FORBIDDEN)
    slideshow, _ = ProjectSlideshow.objects.get_or_create(project=project)
    serializer = SlideshowUploadSerializer(slideshow, data=request.data, partial=True)
    if serializer.is_valid():
        slideshow = serializer.save()
        # Trigger conversion in background
        try:
            script_path = os.path.join(os.path.dirname(__file__), '..', 'convert_slides.py')
            subprocess.Popen([
                sys.executable, script_path, str(slideshow.id)
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            print(f"Error triggering conversion: {e}")
        return Response({
            'message': 'File uploaded successfully. Conversion in progress...',
            'slideshow': ProjectSlideshowSerializer(slideshow).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_slideshow(request, project_id):
    """Get slideshow data for a project"""
    project = get_object_or_404(Project, id=project_id)
    try:
        slideshow = ProjectSlideshow.objects.get(project=project)
        return Response(ProjectSlideshowSerializer(slideshow).data)
    except ProjectSlideshow.DoesNotExist:
        return Response({'error': 'Slideshow not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_slideshow(request, project_id):
    """Delete slideshow for a project"""
    project = get_object_or_404(Project, id=project_id)
    if project.author != request.user:
        return Response({'error': 'You do not have permission to edit this project'}, status=status.HTTP_403_FORBIDDEN)
    try:
        slideshow = ProjectSlideshow.objects.get(project=project)
        slideshow.delete()
        return Response({'message': 'Slideshow deleted successfully'}, status=status.HTTP_200_OK)
    except ProjectSlideshow.DoesNotExist:
        return Response({'error': 'Slideshow not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_components_view(request):
    """Search for existing components/materials by name"""
    query = request.GET.get('q', '').strip()
    item_type = request.GET.get('type', '').strip()
    
    if not query:
        return Response([], status=status.HTTP_200_OK)
    
    # Build the queryset
    queryset = BillOfMaterialItem.objects.filter(name__icontains=query)
    
    # Filter by item type if specified
    if item_type:
        queryset = queryset.filter(item_type=item_type)
    
    # Get unique components (group by name and item_type to avoid duplicates)
    from django.db.models import Max
    components = queryset.values('name', 'item_type', 'description', 'link').annotate(
        latest_id=Max('id')
    ).order_by('name')[:20]  # Limit to 20 results
    
    # Format the response
    results = []
    for component in components:
        results.append({
            'id': component['latest_id'],
            'name': component['name'],
            'item_type': component['item_type'],
            'description': component['description'],
            'link': component['link']
        })
    
    return Response(results, status=status.HTTP_200_OK)


