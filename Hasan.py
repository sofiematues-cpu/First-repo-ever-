"""
Pinned Cards Models
Stores user-specific pinned insight cards with proper data integrity
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import json


class PinnedCard(models.Model):
    """
    Model to store pinned insight cards for users.
    Each user can pin multiple cards with unique identifiers.
    """
    
    # Foreign key to User model with CASCADE delete
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pinned_cards',
        db_index=True,
        help_text="User who pinned this card"
    )
    
    # Card identifier from frontend (must be unique per user)
    card_id = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Unique identifier for the card from frontend"
    )
    
    # Card type/category for filtering
    card_type = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Type of insight card (e.g., 'dashboard', 'metric', 'report')"
    )
    
    # Store complete card data as JSON for flexibility
    card_data = models.JSONField(
        help_text="Complete card data including title, description, metrics, etc."
    )
    
    # Order/position for sorting pinned cards
    order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Display order of pinned cards"
    )
    
    # Timestamps
    pinned_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="When the card was pinned"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last update timestamp"
    )
    
    class Meta:
        db_table = 'pinned_cards'
        verbose_name = 'Pinned Card'
        verbose_name_plural = 'Pinned Cards'
        ordering = ['order', '-pinned_at']
        
        # CRITICAL: Ensure one user cannot pin same card twice
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'card_id'],
                name='unique_user_card'
            )
        ]
        
        # Indexes for performance
        indexes = [
            models.Index(fields=['user', 'card_type']),
            models.Index(fields=['user', 'order']),
            models.Index(fields=['user', '-pinned_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.card_id}"
    
    def clean(self):
        """Validate model data"""
        super().clean()
        
        # Validate card_data structure
        if not isinstance(self.card_data, dict):
            raise ValidationError("card_data must be a valid JSON object")
        
        # Ensure essential fields exist in card_data
        required_fields = ['title', 'id']
        for field in required_fields:
            if field not in self.card_data:
                raise ValidationError(f"card_data must contain '{field}' field")
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def card_title(self):
        """Helper property to get card title from JSON data"""
        return self.card_data.get('title', 'Untitled Card')
    
    @classmethod
    def get_user_pinned_cards(cls, user):
        """Get all pinned cards for a specific user"""
        return cls.objects.filter(user=user).select_related('user')
    
    @classmethod
    def is_card_pinned(cls, user, card_id):
        """Check if a card is already pinned by user"""
        return cls.objects.filter(user=user, card_id=card_id).exists()
--------------
"""
Custom Exceptions for Pinned Cards
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class CardAlreadyPinnedException(APIException):
    """Raised when user tries to pin an already pinned card"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'This card is already pinned.'
    default_code = 'card_already_pinned'


class CardNotPinnedException(APIException):
    """Raised when user tries to unpin a card that isn't pinned"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'This card is not pinned.'
    default_code = 'card_not_pinned'


class InvalidCardDataException(APIException):
    """Raised when card data is invalid"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid card data provided.'
    default_code = 'invalid_card_data'


class UnauthorizedCardAccessException(APIException):
    """Raised when user tries to access another user's pinned card"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to access this card.'
    default_code = 'unauthorized_card_access'
-------------------
"""
Custom Permissions for Pinned Cards
Ensures users can only access their own pinned cards
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a pinned card to edit/delete it.
    This prevents IDOR vulnerabilities.
    """
    
    message = 'You do not have permission to access this pinned card.'
    
    def has_permission(self, request, view):
        """Check if user is authenticated"""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user owns the pinned card object.
        CRITICAL: This prevents users from accessing other users' pinned cards.
        """
        # Only the owner can access their pinned cards
        return obj.user == request.user


class IsAuthenticatedOwner(permissions.BasePermission):
    """
    Ensures user is authenticated and can only access their own data.
    Used for list/create operations.
    """
    
    def has_permission(self, request, view):
        """User must be authenticated"""
        return request.user and request.user.is_authenticated
----------------
"""
Serializers for Pinned Cards
Handles data validation and serialization
"""
from rest_framework import serializers
from .models import PinnedCard
from .exceptions import InvalidCardDataException


class PinnedCardSerializer(serializers.ModelSerializer):
    """
    Serializer for PinnedCard model with comprehensive validation
    """
    
    # Read-only fields
    pinned_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    card_title = serializers.CharField(read_only=True)
    
    class Meta:
        model = PinnedCard
        fields = [
            'id',
            'card_id',
            'card_type',
            'card_data',
            'order',
            'pinned_at',
            'updated_at',
            'user_email',
            'card_title',
        ]
        read_only_fields = ['id', 'pinned_at', 'updated_at']
    
    def validate_card_id(self, value):
        """Validate card_id format"""
        if not value or not value.strip():
            raise serializers.ValidationError("card_id cannot be empty")
        
        if len(value) > 255:
            raise serializers.ValidationError("card_id is too long (max 255 characters)")
        
        return value.strip()
    
    def validate_card_type(self, value):
        """Validate card_type"""
        if not value or not value.strip():
            raise serializers.ValidationError("card_type cannot be empty")
        
        # Optional: Define allowed card types
        allowed_types = [
            'dashboard', 'metric', 'report', 'chart', 
            'table', 'kpi', 'insight', 'analysis'
        ]
        
        if value.lower() not in allowed_types:
            # Just warning, don't fail - allow flexibility
            pass
        
        return value.strip().lower()
    
    def validate_card_data(self, value):
        """Validate card_data structure"""
        if not isinstance(value, dict):
            raise InvalidCardDataException("card_data must be a JSON object")
        
        # Validate required fields
        required_fields = ['id', 'title']
        for field in required_fields:
            if field not in value:
                raise InvalidCardDataException(
                    f"card_data must contain '{field}' field"
                )
        
        # Validate title is not empty
        if not value.get('title', '').strip():
            raise InvalidCardDataException("card_data.title cannot be empty")
        
        return value
    
    def validate_order(self, value):
        """Validate order field"""
        if value < 0:
            raise serializers.ValidationError("order must be non-negative")
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        # Ensure card_id matches card_data.id if both present
        if 'card_id' in attrs and 'card_data' in attrs:
            if attrs['card_id'] != attrs['card_data'].get('id'):
                raise serializers.ValidationError({
                    'card_id': 'card_id must match card_data.id'
                })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create pinned card with user association.
        User is automatically set from request context.
        """
        # Get user from context (set in view)
        user = self.context['request'].user
        validated_data['user'] = user
        
        return super().create(validated_data)


class PinnedCardListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing pinned cards
    """
    
    class Meta:
        model = PinnedCard
        fields = [
            'id',
            'card_id',
            'card_type',
            'card_data',
            'order',
            'pinned_at',
        ]


class PinCardRequestSerializer(serializers.Serializer):
    """
    Serializer for pin card request payload
    """
    card_id = serializers.CharField(max_length=255, required=True)
    card_type = serializers.CharField(max_length=100, required=True)
    card_data = serializers.JSONField(required=True)
    order = serializers.IntegerField(default=0, required=False, min_value=0)
    
    def validate_card_data(self, value):
        """Validate card_data structure"""
        if not isinstance(value, dict):
            raise InvalidCardDataException("card_data must be a JSON object")
        
        required_fields = ['id', 'title']
        for field in required_fields:
            if field not in value:
                raise InvalidCardDataException(
                    f"card_data must contain '{field}' field"
                )
        
        return value


class UnpinCardRequestSerializer(serializers.Serializer):
    """
    Serializer for unpin card request payload
    """
    card_id = serializers.CharField(max_length=255, required=True)
----------------------
"""
Business Logic Service Layer for Pinned Cards
Encapsulates all business logic and database operations
"""
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import PinnedCard
from .exceptions import (
    CardAlreadyPinnedException,
    CardNotPinnedException,
    InvalidCardDataException,
    UnauthorizedCardAccessException
)
import logging

logger = logging.getLogger(__name__)


class PinnedCardService:
    """
    Service class handling all pinned card operations.
    Provides clean separation of concerns and encapsulation.
    """
    
    @staticmethod
    def get_user_pinned_cards(user, card_type=None):
        """
        Retrieve all pinned cards for a user.
        
        Args:
            user: User instance
            card_type: Optional filter by card type
        
        Returns:
            QuerySet of PinnedCard objects
        """
        queryset = PinnedCard.objects.filter(user=user).select_related('user')
        
        if card_type:
            queryset = queryset.filter(card_type=card_type)
        
        return queryset.order_by('order', '-pinned_at')
    
    @staticmethod
    @transaction.atomic
    def pin_card(user, card_id, card_type, card_data, order=0):
        """
        Pin a card for a user.
        
        Args:
            user: User instance
            card_id: Unique card identifier
            card_type: Type of card
            card_data: Complete card data (dict)
            order: Display order
        
        Returns:
            PinnedCard instance
        
        Raises:
            CardAlreadyPinnedException: If card already pinned
            InvalidCardDataException: If card data is invalid
        """
        # Check if card is already pinned
        if PinnedCard.objects.filter(user=user, card_id=card_id).exists():
            logger.warning(
                f"User {user.email} attempted to pin already pinned card: {card_id}"
            )
            raise CardAlreadyPinnedException(
                f"Card '{card_id}' is already pinned."
            )
        
        # Validate card_data structure
        if not isinstance(card_data, dict):
            raise InvalidCardDataException("card_data must be a dictionary")
        
        required_fields = ['id', 'title']
        for field in required_fields:
            if field not in card_data:
                raise InvalidCardDataException(
                    f"card_data must contain '{field}' field"
                )
        
        # Create pinned card
        try:
            pinned_card = PinnedCard.objects.create(
                user=user,
                card_id=card_id,
                card_type=card_type,
                card_data=card_data,
                order=order
            )
            
            logger.info(
                f"User {user.email} pinned card: {card_id} (type: {card_type})"
            )
            
            return pinned_card
            
        except ValidationError as e:
            logger.error(f"Validation error pinning card: {e}")
            raise InvalidCardDataException(str(e))
        except Exception as e:
            logger.error(f"Error pinning card for user {user.email}: {e}")
            raise
    
    @staticmethod
    @transaction.atomic
    def unpin_card(user, card_id):
        """
        Unpin a card for a user.
        
        Args:
            user: User instance
            card_id: Card identifier to unpin
        
        Returns:
            bool: True if successfully unpinned
        
        Raises:
            CardNotPinnedException: If card is not pinned
        """
        try:
            pinned_card = PinnedCard.objects.get(user=user, card_id=card_id)
            pinned_card.delete()
            
            logger.info(f"User {user.email} unpinned card: {card_id}")
            return True
            
        except PinnedCard.DoesNotExist:
            logger.warning(
                f"User {user.email} attempted to unpin non-pinned card: {card_id}"
            )
            raise CardNotPinnedException(
                f"Card '{card_id}' is not pinned."
            )
    
    @staticmethod
    def is_card_pinned(user, card_id):
        """
        Check if a card is pinned by user.
        
        Args:
            user: User instance
            card_id: Card identifier
        
        Returns:
            bool: True if pinned, False otherwise
        """
        return PinnedCard.objects.filter(user=user, card_id=card_id).exists()
    
    @staticmethod
    @transaction.atomic
    def update_card_order(user, card_id, new_order):
        """
        Update the display order of a pinned card.
        
        Args:
            user: User instance
            card_id: Card identifier
            new_order: New order value
        
        Returns:
            PinnedCard: Updated instance
        
        Raises:
            CardNotPinnedException: If card is not pinned
            UnauthorizedCardAccessException: If user doesn't own card
        """
        try:
            pinned_card = PinnedCard.objects.get(user=user, card_id=card_id)
            
            # Verify ownership (extra safety check)
            if pinned_card.user != user:
                raise UnauthorizedCardAccessException()
            
            pinned_card.order = new_order
            pinned_card.save(update_fields=['order', 'updated_at'])
            
            logger.info(
                f"User {user.email} updated order for card {card_id} to {new_order}"
            )
            
            return pinned_card
            
        except PinnedCard.DoesNotExist:
            raise CardNotPinnedException(f"Card '{card_id}' is not pinned.")
    
    @staticmethod
    @transaction.atomic
    def update_card_data(user, card_id, new_card_data):
        """
        Update card data for a pinned card.
        
        Args:
            user: User instance
            card_id: Card identifier
            new_card_data: New card data (dict)
        
        Returns:
            PinnedCard: Updated instance
        
        Raises:
            CardNotPinnedException: If card is not pinned
            InvalidCardDataException: If new data is invalid
        """
        if not isinstance(new_card_data, dict):
            raise InvalidCardDataException("card_data must be a dictionary")
        
        try:
            pinned_card = PinnedCard.objects.get(user=user, card_id=card_id)
            
            # Verify ownership
            if pinned_card.user != user:
                raise UnauthorizedCardAccessException()
            
            pinned_card.card_data = new_card_data
            pinned_card.save(update_fields=['card_data', 'updated_at'])
            
            logger.info(f"User {user.email} updated data for card {card_id}")
            
            return pinned_card
            
        except PinnedCard.DoesNotExist:
            raise CardNotPinnedException(f"Card '{card_id}' is not pinned.")
    
    @staticmethod
    @transaction.atomic
    def bulk_update_order(user, card_orders):
        """
        Bulk update card orders.
        
        Args:
            user: User instance
            card_orders: Dict mapping card_id to order {card_id: order, ...}
        
        Returns:
            list: Updated PinnedCard instances
        """
        updated_cards = []
        
        for card_id, order in card_orders.items():
            try:
                card = PinnedCard.objects.get(user=user, card_id=card_id)
                card.order = order
                updated_cards.append(card)
            except PinnedCard.DoesNotExist:
                logger.warning(
                    f"Card {card_id} not found for user {user.email} during bulk update"
                )
                continue
        
        # Bulk update
        if updated_cards:
            PinnedCard.objects.bulk_update(
                updated_cards, 
                ['order', 'updated_at']
            )
            logger.info(
                f"Bulk updated {len(updated_cards)} card orders for user {user.email}"
            )
        
        return updated_cards
    
    @staticmethod
    def get_pinned_card_count(user):
        """
        Get total count of pinned cards for user.
        
        Args:
            user: User instance
        
        Returns:
            int: Count of pinned cards
        """
        return PinnedCard.objects.filter(user=user).count()
------------------
"""
API Views for Pinned Cards
RESTful endpoints with proper authentication and authorization
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from .models import PinnedCard
from .serializers import (
    PinnedCardSerializer,
    PinnedCardListSerializer,
    PinCardRequestSerializer,
    UnpinCardRequestSerializer
)
from .services import PinnedCardService
from .permissions import IsAuthenticatedOwner, IsOwnerOrReadOnly
from .exceptions import (
    CardAlreadyPinnedException,
    CardNotPinnedException,
    InvalidCardDataException,
    UnauthorizedCardAccessException
)
import logging

logger = logging.getLogger(__name__)


class PinnedCardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing pinned cards.
    
    Endpoints:
    - GET    /api/pinned-cards/          - List user's pinned cards
    - POST   /api/pinned-cards/          - Pin a new card
    - GET    /api/pinned-cards/{id}/     - Get specific pinned card
    - PUT    /api/pinned-cards/{id}/     - Update pinned card
    - DELETE /api/pinned-cards/{id}/     - Unpin card
    - POST   /api/pinned-cards/pin/      - Pin card (custom action)
    - POST   /api/pinned-cards/unpin/    - Unpin card (custom action)
    - GET    /api/pinned-cards/check/{card_id}/ - Check if card is pinned
    """
    
    serializer_class = PinnedCardSerializer
    permission_classes = [IsAuthenticated, IsAuthenticatedOwner]
    service = PinnedCardService()
    
    def get_queryset(self):
        """
        CRITICAL: Return only the authenticated user's pinned cards.
        This prevents IDOR vulnerabilities by ensuring users can only
        access their own data.
        """
        user = self.request.user
        
        # Filter by card_type if provided
        card_type = self.request.query_params.get('card_type', None)
        
        return self.service.get_user_pinned_cards(user, card_type=card_type)
    
    def get_serializer_class(self):
        """Use lightweight serializer for list action"""
        if self.action == 'list':
            return PinnedCardListSerializer
        return PinnedCardSerializer
    
    def list(self, request, *args, **kwargs):
        """
        GET /api/pinned-cards/
        
        List all pinned cards for the authenticated user.
        Query params:
        - card_type: Filter by card type (optional)
        """
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            return Response({
                'success': True,
                'count': queryset.count(),
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error listing pinned cards: {e}")
            return Response({
                'success': False,
                'error': 'Failed to retrieve pinned cards',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request, *args, **kwargs):
        """
        POST /api/pinned-cards/
        
        Pin a new card for the authenticated user.
        
        Request body:
        {
            "card_id": "dashboard-1",
            "card_type": "dashboard",
            "card_data": {
                "id": "dashboard-1",
                "title": "Sales Dashboard",
                ...
            },
            "order": 0
        }
        """
        try:
            serializer = PinnedCardSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                pinned_card = serializer.save()
                
                logger.info(
                    f"Card pinned successfully: {pinned_card.card_id} "
                    f"by user {request.user.email}"
                )
                
                return Response({
                    'success': True,
                    'message': 'Card pinned successfully',
                    'data': PinnedCardSerializer(pinned_card).data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'error': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except CardAlreadyPinnedException as e:
            return Response({
                'success': False,
                'error': str(e),
                'code': 'card_already_pinned'
            }, status=status.HTTP_409_CONFLICT)
            
        except InvalidCardDataException as e:
            return Response({
                'success': False,
                'error': str(e),
                'code': 'invalid_card_data'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error pinning card: {e}")
            return Response({
                'success': False,
                'error': 'Failed to pin card',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, *args, **kwargs):
        """
        GET /api/pinned-cards/{id}/
        
        Retrieve a specific pinned card.
        """
        try:
            instance = self.get_object()
            
            # Double-check ownership (permission class should handle this)
            if instance.user != request.user:
                raise UnauthorizedCardAccessException()
            
            serializer = self.get_serializer(instance)
            
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except PinnedCard.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Pinned card not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except UnauthorizedCardAccessException:
            return Response({
                'success': False,
                'error': 'Unauthorized access to pinned card'
            }, status=status.HTTP_403_FORBIDDEN)
    
    def update(self, request, *args, **kwargs):
        """
        PUT /api/pinned-cards/{id}/
        
        Update a pinned card (order or card_data).
        """
        try:
            instance = self.get_object()
            
            # Verify ownership
            if instance.user != request.user:
                raise UnauthorizedCardAccessException()
            
            serializer = self.get_serializer(
                instance,
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                
                return Response({
                    'success': True,
                    'message': 'Pinned card updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'error': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except UnauthorizedCardAccessException:
            return Response({
                'success': False,
                'error': 'Unauthorized access'
            }, status=status.HTTP_403_FORBIDDEN)
            
        except Exception as e:
            logger.error(f"Error updating pinned card: {e}")
            return Response({
                'success': False,
                'error': 'Failed to update pinned card'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/pinned-cards/{id}/
        
        Delete (unpin) a pinned card.
        """
        try:
            instance = self.get_object()
            
            # Verify ownership
            if instance.user != request.user:
                raise UnauthorizedCardAccessException()
            
            card_id = instance.card_id
            instance.delete()
            
            logger.info(f"Card unpinned: {card_id} by user {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Card unpinned successfully'
            }, status=status.HTTP_200_OK)
            
        except UnauthorizedCardAccessException:
            return Response({
                'success': False,
                'error': 'Unauthorized access'
            }, status=status.HTTP_403_FORBIDDEN)
            
        except Exception as e:
            logger.error(f"Error unpinning card: {e}")
            return Response({
                'success': False,
                'error': 'Failed to unpin card'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def pin(self, request):
        """
        POST /api/pinned-cards/pin/
        
        Custom action to pin a card.
        
        Request body:
        {
            "card_id": "dashboard-1",
            "card_type": "dashboard",
            "card_data": {...},
            "order": 0
        }
        """
        try:
            serializer = PinCardRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Pin card using service
            pinned_card = self.service.pin_card(
                user=request.user,
                card_id=validated_data['card_id'],
                card_type=validated_data['card_type'],
                card_data=validated_data['card_data'],
                order=validated_data.get('order', 0)
            )
            
            return Response({
                'success': True,
                'message': 'Card pinned successfully',
                'data': PinnedCardSerializer(pinned_card).data
            }, status=status.HTTP_201_CREATED)
            
        except CardAlreadyPinnedException as e:
            return Response({
                'success': False,
                'error': str(e),
                'code': 'card_already_pinned'
            }, status=status.HTTP_409_CONFLICT)
            
        except InvalidCardDataException as e:
            return Response({
                'success': False,
                'error': str(e),
                'code': 'invalid_card_data'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error in pin action: {e}")
            return Response({
                'success': False,
                'error': 'Failed to pin card',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def unpin(self, request):
        """
        POST /api/pinned-cards/unpin/
        
        Custom action to unpin a card.
        
        Request body:
        {
            "card_id": "dashboard-1"
        }
        """
        try:
            serializer = UnpinCardRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            card_id = serializer.validated_data['card_id']
            
            # Unpin card using service
            self.service.unpin_card(
                user=request.user,
                card_id=card_id
            )
            
            return Response({
                'success': True,
                'message': 'Card unpinned successfully'
            }, status=status.HTTP_200_OK)
            
        except CardNotPinnedException as e:
            return Response({
                'success': False,
                'error': str(e),
                'code': 'card_not_pinned'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            logger.error(f"Error in unpin action: {e}")
            return Response({
                'success': False,
                'error': 'Failed to unpin card'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='check/(?P<card_id>[^/.]+)')
    def check_pinned(self, request, card_id=None):
        """
        GET /api/pinned-cards/check/{card_id}/
        
        Check if a specific card is pinned by the user.
        """
        try:
            is_pinned = self.service.is_card_pinned(
                user=request.user,
                card_id=card_id
            )
            
            return Response({
                'success': True,
                'card_id': card_id,
                'is_pinned': is_pinned
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error checking pinned status: {e}")
            return Response({
                'success': False,
                'error': 'Failed to check pinned status'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        GET /api/pinned-cards/count/
        
        Get count of pinned cards for the user.
        """
        try:
            count = self.service.get_pinned_card_count(request.user)
            
            return Response({
                'success': True,
                'count': count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting pinned card count: {e}")
            return Response({
                'success': False,
                'error': 'Failed to get card count'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
-------------------
"""
URL Configuration for Pinned Cards API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PinnedCardViewSet

# Create router and register viewset
router = DefaultRouter()
router.register(r'pinned-cards', PinnedCardViewSet, basename='pinned-card')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

# Available endpoints:
# GET    /api/pinned-cards/                    - List user's pinned cards
# POST   /api/pinned-cards/                    - Pin a new card
# GET    /api/pinned-cards/{id}/               - Get specific pinned card
# PUT    /api/pinned-cards/{id}/               - Update pinned card
# PATCH  /api/pinned-cards/{id}/               - Partial update
# DELETE /api/pinned-cards/{id}/               - Unpin card
# POST   /api/pinned-cards/pin/                - Pin card (custom action)
# POST   /api/pinned-cards/unpin/              - Unpin card (custom action)
# GET    /api/pinned-cards/check/{card_id}/    - Check if card is pinned
# GET    /api/pinned-cards/count/              - Get count of pinned cards
------------------
"""
Django Admin Configuration for Pinned Cards
"""
from django.contrib import admin
from .models import PinnedCard


@admin.register(PinnedCard)
class PinnedCardAdmin(admin.ModelAdmin):
    """Admin interface for PinnedCard model"""
    
    list_display = [
        'id',
        'user_email',
        'card_id',
        'card_type',
        'card_title',
        'order',
        'pinned_at',
    ]
    
    list_filter = [
        'card_type',
        'pinned_at',
        'updated_at',
    ]
    
    search_fields = [
        'user__email',
        'user__username',
        'card_id',
        'card_type',
        'card_data__title',
    ]
    
    readonly_fields = [
        'id',
        'pinned_at',
        'updated_at',
    ]
    
    ordering = ['-pinned_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Card Information', {
            'fields': ('card_id', 'card_type', 'card_data', 'order')
        }),
        ('Timestamps', {
            'fields': ('pinned_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'
    
    def card_title(self, obj):
        """Display card title from JSON data"""
        return obj.card_title
    card_title.short_description = 'Card Title'
    
    def has_delete_permission(self, request, obj=None):
        """Allow deletion"""
        return True
    
    def has_change_permission(self, request, obj=None):
        """Allow editing"""
        return True
-------------------
"""
App Configuration for Pinned Cards
"""
from django.apps import AppConfig


class PinnedCardsConfig(AppConfig):
    """Configuration for the pinned_cards app"""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pinned_cards'
    verbose_name = 'Pinned Cards'
    
    def ready(self):
        """
        Initialize app when Django starts.
        Import signals, etc.
        """
        # Import signals if you have any
        # import pinned_cards.signals
        pass
-------------------
"""
Pinned Cards Django App
Handles user-specific pinned insight cards with security and data integrity
"""

default_app_config = 'pinned_cards.apps.PinnedCardsConfig'
----------------
