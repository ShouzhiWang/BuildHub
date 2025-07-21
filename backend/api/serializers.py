from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Project, Component, Step, Comment, 
    ProjectMember, WorkAttribution, BillOfMaterialItem, Attachment, UserProfile, Message, Bookmark
)

class SkillsField(serializers.Field):
    """Custom field to handle skills as comma-separated string input, JSON array storage"""
    
    def to_internal_value(self, data):
        if isinstance(data, str):
            # Split by comma and strip whitespace, filter empty strings
            return [s.strip() for s in data.split(',') if s.strip()] if data else []
        elif isinstance(data, list):
            return data
        return []
    
    def to_representation(self, value):
        return value or []

class UserProfileSerializer(serializers.ModelSerializer):
    skills = SkillsField(required=False)
    
    class Meta:
        model = UserProfile
        fields = ['bio', 'skills', 'location', 'avatar']

        
class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'date_joined', 'profile', 'is_staff', 'is_active']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def validate_username(self, value):
        if len(value) < 7:
            raise serializers.ValidationError("Username must be at least 7 characters long.")
        return value

    def validate_password(self, value):
        import re
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not re.search(r'[^A-Za-z0-9]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value



class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    class Meta:
        model = Category
        fields = ['id', 'name']


class ComponentSerializer(serializers.ModelSerializer):
    """Serializer for Component model (legacy)"""
    class Meta:
        model = Component
        fields = ['id', 'name']


class StepSerializer(serializers.ModelSerializer):
    """Serializer for Step model"""
    class Meta:
        model = Step
        fields = ['id', 'step_number', 'title', 'instructions', 'image']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model with recursive nested replies"""
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    reply_count = serializers.ReadOnlyField()
    is_reply = serializers.ReadOnlyField()
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'body', 'created_at', 'parent', 'replies', 'reply_count', 'is_reply']
    
    def get_replies(self, obj):
        # Recursively serialize all replies
        replies = obj.replies.all().order_by('created_at')
        return CommentSerializer(replies, many=True, context=self.context).data
    
    def create(self, validated_data):
        # Set the author from the request
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class CommentReplySerializer(serializers.ModelSerializer):
    """Serializer for comment replies (simplified version)"""
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'body', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    related_project = serializers.PrimaryKeyRelatedField(read_only=True)
    related_comment = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'recipient', 'message_type', 'title', 'content',
            'related_project', 'related_comment', 'is_read', 'created_at'
        ]


class ProjectMemberSerializer(serializers.ModelSerializer):
    """Serializer for ProjectMember model"""
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    role = serializers.CharField()
    
    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'user_id', 'role', 'contribution', 'joined_at']


class WorkAttributionSerializer(serializers.ModelSerializer):
    """Serializer for WorkAttribution model"""
    class Meta:
        model = WorkAttribution
        fields = ['id', 'contributor_name', 'credit_description', 'link', 'created_at']


class BillOfMaterialItemSerializer(serializers.ModelSerializer):
    """Serializer for BillOfMaterialItem model"""
    class Meta:
        model = BillOfMaterialItem
        fields = [
            'id', 'item_type', 'name', 'description', 'quantity', 
            'image', 'link', 'created_at'
        ]


class AttachmentSerializer(serializers.ModelSerializer):
    """Serializer for Attachment model"""
    class Meta:
        model = Attachment
        fields = [
            'id', 'attachment_type', 'title', 'file_upload', 
            'repository_link', 'description', 'created_at'
        ]


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project lists"""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'elevator_pitch', 'cover_image', 
            'author', 'category', 'difficulty', 'status', 'created_at', 'comments_count', 'story_content'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual projects with all related data"""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    
    # Related models
    team_members = ProjectMemberSerializer(many=True, read_only=True)
    work_attributions = WorkAttributionSerializer(many=True, read_only=True)
    bill_of_materials = BillOfMaterialItemSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    
    # Legacy models for backward compatibility
    components = ComponentSerializer(many=True, read_only=True)
    steps = StepSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'elevator_pitch', 'story_content',
            'cover_image', 'author', 'category', 'difficulty', 'status', 'created_at', 'updated_at',
            'team_members', 'work_attributions', 'bill_of_materials', 'attachments',
            'components', 'steps', 'comments', 'comments_count'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.count()


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating projects with nested data"""
    
    # Nested data fields
    team_members_data = ProjectMemberSerializer(many=True, required=False, write_only=True)
    work_attributions_data = WorkAttributionSerializer(many=True, required=False, write_only=True)
    bill_of_materials_data = BillOfMaterialItemSerializer(many=True, required=False, write_only=True)
    attachments_data = AttachmentSerializer(many=True, required=False, write_only=True)
    
    # Write-only fields for relationships
    author_id = serializers.IntegerField(write_only=True, required=False)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'elevator_pitch', 'story_content',
            'cover_image', 'author_id', 'category_id', 'difficulty', 'status',
            'team_members_data', 'work_attributions_data', 
            'bill_of_materials_data', 'attachments_data'
        ]
    
    def to_internal_value(self, data):
        # Parse flattened multipart keys into nested structures before validation
        if hasattr(data, 'keys'):
            data = self._parse_multipart_data(data)
        
        return super().to_internal_value(data)
    
    def _parse_multipart_data(self, data):
        """Parse flattened multipart form keys into nested data structures"""
        # Convert QueryDict to regular dict for easier manipulation
        if hasattr(data, '_mutable'):
            data._mutable = True
        
        parsed_data = {}
        nested_fields = ['team_members_data', 'work_attributions_data', 'bill_of_materials_data', 'attachments_data']
        
        # Copy non-nested fields directly
        for key, value in data.items():
            if not any(key.startswith(f"{field}[") for field in nested_fields):
                parsed_data[key] = value
        
        # Parse nested fields
        for field_name in nested_fields:
            nested_list = self._parse_flattened_list_from_data(data, field_name)
            if nested_list:
                parsed_data[field_name] = nested_list
        
        return parsed_data
    
    def _parse_flattened_list_from_data(self, data, prefix):
        """Parse flattened keys from raw data dict"""
        items = {}
        for key, value in data.items():
            if not key.startswith(f"{prefix}["):
                continue

            # Strip the prefix and leading '['
            remainder = key[len(prefix) + 1:]  # e.g. '0].role' or '0][role]'

            # Split at first ']' to separate index from field section
            if ']' not in remainder:
                continue  # malformed, skip
            index_str, field_part = remainder.split(']', 1)
            if not index_str.isdigit():
                continue
            index = int(index_str)

            # Remove any leading separators ('.' or '[' or '.')
            field_name = field_part.lstrip('.[').rstrip(']')

            items.setdefault(index, {})[field_name] = value

        # Convert to ordered list
        result = [items[idx] for idx in sorted(items.keys())]
        return result
    
    def create(self, validated_data):
        # Extract nested data. If usual nested structures are missing (when
        # projects are submitted via multipart form-data), fall back to parsing
        # flattened keys like "team_members_data[0].user_id" or
        # "team_members_data[0][user_id]".

        team_members_data = validated_data.pop('team_members_data', None)
        work_attributions_data = validated_data.pop('work_attributions_data', None)
        bill_of_materials_data = validated_data.pop('bill_of_materials_data', None)
        attachments_data = validated_data.pop('attachments_data', None)

        if team_members_data is None:
            team_members_data = self._parse_flattened_list('team_members_data')
        if work_attributions_data is None:
            work_attributions_data = self._parse_flattened_list('work_attributions_data')
        if bill_of_materials_data is None:
            bill_of_materials_data = self._parse_flattened_list('bill_of_materials_data')
        if attachments_data is None:
            attachments_data = self._parse_flattened_list('attachments_data')
        
        # Create project
        project = Project.objects.create(**validated_data)
        
        # Create related objects
        self._create_related_objects(project, team_members_data, work_attributions_data, 
                                   bill_of_materials_data, attachments_data)
        
        return project
    
    def update(self, instance, validated_data):
        # Only update nested fields if present in validated_data
        team_members_data = validated_data.pop('team_members_data', None)
        work_attributions_data = validated_data.pop('work_attributions_data', None)
        bill_of_materials_data = validated_data.pop('bill_of_materials_data', None)
        attachments_data = validated_data.pop('attachments_data', None)

        # Update main fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Only update nested fields if they are present in the PATCH data
        if team_members_data is not None:
            instance.team_members.all().delete()
            self._create_team_members(instance, team_members_data)
        if work_attributions_data is not None:
            instance.work_attributions.all().delete()
            self._create_work_attributions(instance, work_attributions_data)
        if bill_of_materials_data is not None:
            instance.bill_of_materials.all().delete()
            self._create_bill_of_materials(instance, bill_of_materials_data)
        if attachments_data is not None:
            instance.attachments.all().delete()
            self._create_attachments(instance, attachments_data)

        return instance
    
    def _create_related_objects(self, project, team_members_data, work_attributions_data, 
                              bill_of_materials_data, attachments_data):
        """Helper method to create all related objects"""
        self._create_team_members(project, team_members_data)
        self._create_work_attributions(project, work_attributions_data)
        self._create_bill_of_materials(project, bill_of_materials_data)
        self._create_attachments(project, attachments_data)
    
    def _create_team_members(self, project, team_members_data):
        """Create team members for the project"""
        for member_data in team_members_data:
            ProjectMember.objects.create(project=project, **member_data)
    
    def _create_work_attributions(self, project, work_attributions_data):
        """Create work attributions for the project"""
        for attribution_data in work_attributions_data:
            WorkAttribution.objects.create(project=project, **attribution_data)
    
    def _create_bill_of_materials(self, project, bill_of_materials_data):
        """Create bill of materials items for the project"""
        for bom_data in bill_of_materials_data:
            BillOfMaterialItem.objects.create(project=project, **bom_data)
    
    def _create_attachments(self, project, attachments_data):
        """Create attachments for the project"""
        for attachment_data in attachments_data:
            Attachment.objects.create(project=project, **attachment_data) 

    ############################################################
    # Helper: flatten form-data keys into list[dict] structures #
    ############################################################

    def _parse_flattened_list(self, prefix):
        """Reconstruct an array of dicts from keys like
        "prefix[0].field" or "prefix[0][field]" that come through multipart
        form-data. Returns list of dictionaries sorted by their numeric index.
        """
        raw_data = self.context['request'].data  # QueryDict
        
        items = {}
        for key, value in raw_data.items():
            if not key.startswith(f"{prefix}["):
                continue

            # Strip the prefix and leading '['
            remainder = key[len(prefix) + 1:]  # e.g. '0].role' or '0][role]'

            # Split at first ']' to separate index from field section
            if ']' not in remainder:
                continue  # malformed, skip
            index_str, field_part = remainder.split(']', 1)
            if not index_str.isdigit():
                continue
            index = int(index_str)

            # Remove any leading separators ('.' or '[' or '.')
            field_name = field_part.lstrip('.[').rstrip(']')

            items.setdefault(index, {})[field_name] = value

        # Convert to ordered list
        result = [items[idx] for idx in sorted(items.keys())]
        return result 

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active']
        read_only_fields = ['id', 'username', 'email']


class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for Bookmark model"""
    project = ProjectListSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'project', 'created_at']
        read_only_fields = ['id', 'user', 'created_at'] 