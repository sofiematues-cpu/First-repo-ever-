from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import PinnedCard
from .serializers import PinCardSerializer, PinnedCardSerializer
import logging

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class PinCardView(APIView):
    """Pin a card for the authenticated user"""
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # Validate input
        serializer = PinCardSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check authentication
        if not request.user.is_authenticated:
            logger.warning("Unauthenticated pin attempt")
            return Response(
                {'success': False, 'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        card_id = serializer.validated_data['card_id']
        card_url = serializer.validated_data['card_url']
        
        try:
            # Create pinned card for authenticated user
            PinnedCard.objects.create(
                user=request.user,
                card_id=card_id,
                card_url=card_url
            )
            logger.info(f"User {request.user.oidc_sub} pinned card {card_id}")
            return Response(
                {'success': True, 'message': 'Card pinned successfully'},
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            logger.warning(f"User {request.user.oidc_sub} attempted to pin duplicate card {card_id}")
            return Response(
                {'success': False, 'error': 'Card already pinned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error pinning card for user {request.user.oidc_sub}: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to pin card'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class UnpinCardView(APIView):
    """Unpin a card for the authenticated user"""
    permission_classes = []
    authentication_classes = []

    def delete(self, request, card_id):
        # Check authentication
        if not request.user.is_authenticated:
            logger.warning("Unauthenticated unpin attempt")
            return Response(
                {'success': False, 'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Find and delete the pinned card
            pinned_card = PinnedCard.objects.get(
                user=request.user,
                card_id=card_id
            )
            pinned_card.delete()
            logger.info(f"User {request.user.oidc_sub} unpinned card {card_id}")
            return Response(
                {'success': True, 'message': 'Card unpinned successfully'},
                status=status.HTTP_200_OK
            )
        except PinnedCard.DoesNotExist:
            logger.warning(f"User {request.user.oidc_sub} attempted to unpin non-existent card {card_id}")
            return Response(
                {'success': False, 'error': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error unpinning card for user {request.user.oidc_sub}: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to unpin card'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class PinnedCardsListView(APIView):
    """Get all pinned cards for the authenticated user"""
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        # Return empty list for unauthenticated users
        if not request.user.is_authenticated:
            return Response(
                {'success': True, 'data': []},
                status=status.HTTP_200_OK
            )
        
        try:
            # Fetch all pinned cards for this user
            pinned_cards = PinnedCard.objects.filter(user=request.user).order_by('-pinned_at')
            serializer = PinnedCardSerializer(pinned_cards, many=True)
            logger.info(f"Retrieved {len(pinned_cards)} pinned cards for user {request.user.oidc_sub}")
            return Response(
                {'success': True, 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error fetching pinned cards for user {request.user.oidc_sub}: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to fetch pinned cards'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class PinnedCardsHealthView(APIView):
    """Health check endpoint"""
    permission_classes = []
    authentication_classes = []
    
    def get(self, request):
        return Response(
            {
                'status': 'healthy',
                'message': 'Pinned cards API is operational',
                'authenticated': request.user.is_authenticated,
                'user': request.user.oidc_sub if request.user.is_authenticated else None
            },
            status=status.HTTP_200_OK
        )
