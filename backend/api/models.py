from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


class Category(models.Model):
    """Category model for organizing projects"""
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"


class Project(models.Model):
    """Main project model"""
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),         # User is still editing / private
        ('pending', 'Pending'),     # User requested publish, awaiting admin approval
        ('published', 'Published'), # Visible to everyone
        ('rejected', 'Rejected'),   # Admin rejected the project
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    elevator_pitch = models.TextField(blank=True, help_text="Brief description of your project")
    story_content = models.TextField(blank=True, help_text="Rich text content for project story")
    cover_image = models.ImageField(upload_to='project_covers/', blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='projects')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']


class ProjectMember(models.Model):
    """Team members for projects"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='team_members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_memberships')
    ROLE_CHOICES = [
        ('Manage', 'Manage'),
        ('Read', 'Read'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='Read')
    contribution = models.TextField(help_text="Describe this member's contribution to the project")
    joined_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.project.title}"
    
    class Meta:
        unique_together = ['project', 'user']


class WorkAttribution(models.Model):
    """External contributors and work attribution"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='work_attributions')
    contributor_name = models.CharField(max_length=200, help_text="Name of the external contributor")
    credit_description = models.TextField(help_text="Description of their contribution")
    link = models.URLField(blank=True, help_text="Optional link to their work or profile")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.contributor_name} - {self.project.title}"


class BillOfMaterialItem(models.Model):
    """Items in the bill of materials"""
    ITEM_TYPE_CHOICES = [
        ('Hardware', 'Hardware'),
        ('Software', 'Software'),
        ('Tool', 'Tool'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='bill_of_materials')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, help_text="Optional description of the item")
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    image = models.ImageField(upload_to='bom_images/', blank=True, null=True, help_text="Optional image of the item")
    link = models.URLField(blank=True, help_text="Optional purchase or reference link")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.item_type}) - {self.project.title}"
    
    class Meta:
        ordering = ['item_type', 'name']


class Attachment(models.Model):
    """File attachments for projects"""
    ATTACHMENT_TYPE_CHOICES = [
        ('Code', 'Code'),
        ('Schematic', 'Schematic'),
        ('CAD', 'CAD'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='attachments')
    attachment_type = models.CharField(max_length=20, choices=ATTACHMENT_TYPE_CHOICES)
    title = models.CharField(max_length=200, help_text="Title for this attachment")
    file_upload = models.FileField(upload_to='attachments/', blank=True, null=True)
    repository_link = models.URLField(blank=True, help_text="Link to external repository (e.g., GitHub)")
    description = models.TextField(blank=True, help_text="Optional description of the attachment")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.attachment_type}) - {self.project.title}"
    
    class Meta:
        ordering = ['attachment_type', 'title']


# Keep existing models for backward compatibility
class Component(models.Model):
    """Component model for project parts/materials (legacy)"""
    name = models.CharField(max_length=200)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='components')
    
    def __str__(self):
        return f"{self.name} - {self.project.title}"


class Step(models.Model):
    """Step model for project instructions"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField(validators=[MinValueValidator(1)])
    title = models.CharField(max_length=200)
    instructions = models.TextField()
    image = models.ImageField(upload_to='step_images/', blank=True, null=True)
    
    def __str__(self):
        return f"Step {self.step_number}: {self.title} - {self.project.title}"
    
    class Meta:
        ordering = ['step_number']
        unique_together = ['project', 'step_number']


class Comment(models.Model):
    """Comment model for project discussions with nested replies"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.project.title}"
    
    @property
    def is_reply(self):
        return self.parent is not None
    
    @property
    def reply_count(self):
        return self.replies.count()
    
    class Meta:
        ordering = ['-created_at']


class Message(models.Model):
    """Message model for user notifications and communications"""
    MESSAGE_TYPES = [
        ('comment', 'Comment'),
        ('like', 'Like'),
        ('admin', 'Admin Message'),
        ('system', 'System Message'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', null=True, blank=True)
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    related_project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    related_comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.message_type} message to {self.recipient.username}: {self.title}"
    
    class Meta:
        ordering = ['-created_at']

# Extended user profile for additional info
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list, blank=True)
    location = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class Bookmark(models.Model):
    """Bookmark model for users to save projects"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'project']  # Prevent duplicate bookmarks
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} bookmarked {self.project.title}"

# Signals to auto-create/update profile
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        instance.profile.save()