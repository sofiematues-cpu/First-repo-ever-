from django.db import models
from apps.accounts.models import User


class PinnedCard(models.Model):
    """Store pinned Tableau cards for users"""
    
    # User relationship
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pinned_cards')
    
    # Core card identity
    card_id = models.IntegerField(db_index=True)
    customized_name = models.CharField(max_length=500, blank=True, default='')
    url_id = models.CharField(max_length=200, blank=True, default='')
    
    # View information
    view_name = models.CharField(max_length=500, blank=True, default='')
    view_repository_url = models.TextField(blank=True, default='')
    view_index = models.IntegerField(default=0)
    
    # Workbook information
    workbook_name = models.CharField(max_length=500, blank=True, default='')
    workbook_repo_url = models.CharField(max_length=500, blank=True, default='')
    
    # Site information
    site_name = models.CharField(max_length=200, blank=True, default='')
    
    # Access information
    last_accessed = models.CharField(max_length=100, blank=True, default='')
    is_public = models.BooleanField(default=False)
    
    # URL attempts
    url_attempt_1_url_id = models.TextField(blank=True, default='')
    url_attempt_2_repo = models.TextField(blank=True, default='')
    
    # Metadata
    pinned_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'pinned_cards'
        ordering = ['-pinned_at']
        unique_together = ['user', 'card_id']

    def __str__(self):
        return f"{self.user.oidc_sub} - {self.customized_name or self.view_name} ({self.card_id})"
--------
from rest_framework import serializers
from .models import PinnedCard


class PinCardSerializer(serializers.Serializer):
    """Serializer for pinning a card"""
    card_id = serializers.IntegerField(required=True)
    customized_name = serializers.CharField(required=False, allow_blank=True, default='')
    url_id = serializers.CharField(required=False, allow_blank=True, default='')
    view_name = serializers.CharField(required=False, allow_blank=True, default='')
    view_repository_url = serializers.CharField(required=False, allow_blank=True, default='')
    view_index = serializers.IntegerField(required=False, default=0)
    workbook_name = serializers.CharField(required=False, allow_blank=True, default='')
    workbook_repo_url = serializers.CharField(required=False, allow_blank=True, default='')
    site_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_accessed = serializers.CharField(required=False, allow_blank=True, default='')
    is_public = serializers.BooleanField(required=False, default=False)
    url_attempt_1_url_id = serializers.CharField(required=False, allow_blank=True, default='')
    url_attempt_2_repo = serializers.CharField(required=False, allow_blank=True, default='')


class PinnedCardSerializer(serializers.ModelSerializer):
    """Serializer for returning pinned cards"""
    class Meta:
        model = PinnedCard
        fields = [
            'card_id',
            'customized_name',
            'url_id',
            'view_name',
            'view_repository_url',
            'view_index',
            'workbook_name',
            'workbook_repo_url',
            'site_name',
            'last_accessed',
            'is_public',
            'url_attempt_1_url_id',
            'url_attempt_2_repo',
            'pinned_at',
        ]
