from django.contrib import admin
from .models import (
    Category, Project, Component, Step, Comment, Message,
    ProjectMember, WorkAttribution, BillOfMaterialItem, Attachment, UserProfile
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'bio', 'location', 'avatar']
    search_fields = ['user__username', 'bio', 'location']
    list_filter = ['location']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


class ComponentInline(admin.TabularInline):
    model = Component
    extra = 0


class StepInline(admin.TabularInline):
    model = Step
    extra = 0


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ['created_at']


class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 0
    readonly_fields = ['joined_at']


class WorkAttributionInline(admin.TabularInline):
    model = WorkAttribution
    extra = 0
    readonly_fields = ['created_at']


class BillOfMaterialItemInline(admin.TabularInline):
    model = BillOfMaterialItem
    extra = 0
    readonly_fields = ['created_at']


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'difficulty', 'status', 'created_at', 'updated_at']
    list_filter = ['category', 'difficulty', 'status', 'created_at']
    search_fields = ['title', 'description', 'elevator_pitch', 'author__username']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = [
        ('Basic Information', {
            'fields': ['title', 'description', 'elevator_pitch', 'cover_image']
        }),
        ('Project Details', {
            'fields': ['author', 'category', 'difficulty', 'status']
        }),
        ('Story Content', {
            'fields': ['story_content'],
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        })
    ]
    inlines = [
        ProjectMemberInline,
        WorkAttributionInline, 
        BillOfMaterialItemInline,
        AttachmentInline,
        ComponentInline,  # Keep for backward compatibility
        StepInline,       # Keep for backward compatibility
        CommentInline
    ]


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'joined_at']
    list_filter = ['joined_at']
    search_fields = ['project__title', 'user__username', 'contribution']
    readonly_fields = ['joined_at']


@admin.register(WorkAttribution)
class WorkAttributionAdmin(admin.ModelAdmin):
    list_display = ['project', 'contributor_name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['project__title', 'contributor_name', 'credit_description']
    readonly_fields = ['created_at']


@admin.register(BillOfMaterialItem)
class BillOfMaterialItemAdmin(admin.ModelAdmin):
    list_display = ['project', 'name', 'item_type', 'quantity', 'created_at']
    list_filter = ['item_type', 'created_at']
    search_fields = ['project__title', 'name', 'description']
    readonly_fields = ['created_at']


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['project', 'title', 'attachment_type', 'created_at']
    list_filter = ['attachment_type', 'created_at']
    search_fields = ['project__title', 'title', 'description']
    readonly_fields = ['created_at']


@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ['name', 'project']
    search_fields = ['name', 'project__title']


@admin.register(Step)
class StepAdmin(admin.ModelAdmin):
    list_display = ['project', 'step_number', 'title']
    list_filter = ['project']
    search_fields = ['title', 'instructions', 'project__title']
    ordering = ['project', 'step_number']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['project', 'author', 'parent', 'body', 'created_at']
    list_filter = ['created_at', 'parent']
    search_fields = ['body', 'author__username', 'project__title']
    readonly_fields = ['created_at']
    fieldsets = [
        ('Comment', {
            'fields': ['project', 'author', 'parent', 'body']
        }),
        ('Timestamps', {
            'fields': ['created_at'],
            'classes': ['collapse']
        })
    ]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'sender', 'message_type', 'title', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['title', 'content', 'recipient__username', 'sender__username']
    readonly_fields = ['created_at']
    fieldsets = [
        ('Message', {
            'fields': ['recipient', 'sender', 'message_type', 'title', 'content']
        }),
        ('Related Content', {
            'fields': ['related_project', 'related_comment'],
            'classes': ['collapse']
        }),
        ('Status', {
            'fields': ['is_read'],
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ['created_at'],
            'classes': ['collapse']
        })
    ] 