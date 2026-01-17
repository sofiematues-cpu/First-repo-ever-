from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from .models import PinnedCard
from .serializers import PinCardSerializer, PinnedCardSerializer
from apps.accounts.models import User
import logging

logger = logging.getLogger(__name__)


class PinCardView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PinCardSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        card_id = serializer.validated_data['card_id']
        card_url = serializer.validated_data['card_url']
        
        if not request.user.is_authenticated:
            return Response(
                {'success': False, 'error': 'User not authenticated'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
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
    permission_classes = []

    def delete(self, request, card_id):
        if not request.user.is_authenticated:
            return Response(
                {'success': False, 'error': 'User not authenticated'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
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
    permission_classes = []

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'success': True, 'data': []},
                status=status.HTTP_200_OK
            )
        
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


class PinnedCardsHealthView(APIView):
    permission_classes = []
    
    def get(self, request):
        return Response(
            {'status': 'healthy', 'message': 'Pinned cards API is working!'},
            status=status.HTTP_200_OK
        )
