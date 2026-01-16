from django.db import models
from apps.accounts.models import User


class PinnedCard(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_index=True,
        related_name='pinned_cards'
    )
    card_id = models.IntegerField()
    card_url = models.TextField()
    pinned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pinned_cards'
        unique_together = [['user', 'card_id']]
        indexes = [
            models.Index(fields=['user', 'pinned_at']),
            models.Index(fields=['card_id']),
        ]
        ordering = ['-pinned_at']

    def __str__(self):
        return f"{self.user.email} - Card {self.card_id}"
-------------
from rest_framework import serializers
from .models import PinnedCard


class PinCardSerializer(serializers.Serializer):
    card_id = serializers.IntegerField(required=True)
    card_url = serializers.CharField(required=True, max_length=2000)

    def validate_card_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Invalid card_id")
        return value


class PinnedCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PinnedCard
        fields = ['card_id', 'card_url', 'pinned_at']
--------------------
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from .models import PinnedCard
from .serializers import PinCardSerializer, PinnedCardSerializer
import logging

logger = logging.getLogger(__name__)


class PinCardView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PinCardSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        card_id = serializer.validated_data['card_id']
        card_url = serializer.validated_data['card_url']

        try:
            PinnedCard.objects.create(
                user=request.user,
                card_id=card_id,
                card_url=card_url
            )
            return Response(
                {'success': True, 'message': 'Card pinned successfully'},
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            return Response(
                {'success': False, 'error': 'Card already pinned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error pinning card: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to pin card'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UnpinCardView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, card_id):
        try:
            pinned_card = PinnedCard.objects.get(
                user=request.user,
                card_id=card_id
            )
            pinned_card.delete()
            return Response(
                {'success': True, 'message': 'Card unpinned successfully'},
                status=status.HTTP_200_OK
            )
        except PinnedCard.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error unpinning card: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to unpin card'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PinnedCardsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            pinned_cards = PinnedCard.objects.filter(user=request.user)
            serializer = PinnedCardSerializer(pinned_cards, many=True)
            return Response(
                {'success': True, 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error fetching pinned cards: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to fetch pinned cards'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
-------------------------
from django.urls import path
from .views import PinCardView, UnpinCardView, PinnedCardsListView

app_name = 'pinned_cards'

urlpatterns = [
    path('', PinnedCardsListView.as_view(), name='list'),
    path('pin/', PinCardView.as_view(), name='pin'),
    path('unpin/<int:card_id>/', UnpinCardView.as_view(), name='unpin'),
]
--------------------------
default_app_config = 'apps.pinned_cards.apps.PinnedCardsConfig'
------------------------
from django.apps import AppConfig


class PinnedCardsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.pinned_cards'
------------