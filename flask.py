from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import PinnedCard
from .serializers import PinCardSerializer, PinnedCardSerializer
from apps.accounts.models import User
import logging

logger = logging.getLogger(__name__)


def get_user_from_session(request):
    """
    Helper function to get authenticated user from session.
    Returns (user, error_response) tuple.
    """
    user_id = request.session.get('_auth_user_id')
    if not user_id:
        return None, Response(
            {'success': False, 'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        user = User.objects.get(pk=user_id)
        logger.info(f"Authenticated user: {user.oidc_sub} ({user.email})")
        return user, None
    except User.DoesNotExist:
        logger.error(f"User ID {user_id} not found in database")
        return None, Response(
            {'success': False, 'error': 'User not found'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@method_decorator(csrf_exempt, name='dispatch')
class PinCardView(APIView):
    """
    Pin a card for the authenticated user.
    POST /api/pinned-cards/pin/
    Body: {"card_id": 123, "card_url": "https://..."}
    """
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # Validate request data
        serializer = PinCardSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid pin request: {serializer.errors}")
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get authenticated user
        user, error_response = get_user_from_session(request)
        if error_response:
            return error_response

        card_id = serializer.validated_data['card_id']
        card_url = serializer.validated_data['card_url']
        
        try:
            # Create pinned card in PostgreSQL
            pinned_card = PinnedCard.objects.create(
                user=user,
                card_id=card_id,
                card_url=card_url
            )
            logger.info(
                f"✓ User {user.oidc_sub} ({user.full_name}) pinned card {card_id} "
                f"- Saved to DB with ID {pinned_card.id}"
            )
            return Response(
                {'success': True, 'message': 'Card pinned successfully'},
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            logger.warning(
                f"User {user.oidc_sub} attempted to pin duplicate card {card_id}"
            )
            return Response(
                {'success': False, 'error': 'Card already pinned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error pinning card for {user.oidc_sub}: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to pin card'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class UnpinCardView(APIView):
    """
    Unpin a card for the authenticated user.
    DELETE /api/pinned-cards/unpin/<card_id>/
    """
    permission_classes = []
    authentication_classes = []

    def delete(self, request, card_id):
        # Get authenticated user
        user, error_response = get_user_from_session(request)
        if error_response:
            return error_response
        
        try:
            # Find the pinned card in PostgreSQL
            pinned_card = PinnedCard.objects.get(
                user=user,
                card_id=card_id
            )
            # Delete from database
            pinned_card.delete()
            logger.info(
                f"✓ User {user.oidc_sub} ({user.full_name}) unpinned card {card_id} "
                f"- Deleted from DB"
            )
            return Response(
                {'success': True, 'message': 'Card unpinned successfully'},
                status=status.HTTP_200_OK
            )
        except PinnedCard.DoesNotExist:
            logger.warning(
                f"User {user.oidc_sub} attempted to unpin non-existent card {card_id}"
            )
            return Response(
                {'success': False, 'error': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error unpinning card for {user.oidc_sub}: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to unpin card'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class PinnedCardsListView(APIView):
    """
    Get all pinned cards for the authenticated user.
    Called on page load to restore pinned state.
    GET /api/pinned-cards/
    """
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        # Get user from session
        user_id = request.session.get('_auth_user_id')
        
        # Return empty list for unauthenticated users
        if not user_id:
            logger.info("Unauthenticated user requested pinned cards - returning empty list")
            return Response(
                {'success': True, 'data': []},
                status=status.HTTP_200_OK
            )
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            logger.error(f"User ID {user_id} not found")
            return Response(
                {'success': True, 'data': []},
                status=status.HTTP_200_OK
            )
        
        try:
            # Fetch all pinned cards from PostgreSQL for this user
            pinned_cards = PinnedCard.objects.filter(user=user).order_by('-pinned_at')
            serializer = PinnedCardSerializer(pinned_cards, many=True)
            
            logger.info(
                f"✓ Loaded {len(pinned_cards)} pinned cards for user {user.oidc_sub} "
                f"({user.full_name}) from PostgreSQL"
            )
            
            return Response(
                {'success': True, 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error fetching pinned cards for {user.oidc_sub}: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to fetch pinned cards'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class PinnedCardsHealthView(APIView):
    """
    Health check endpoint with user info.
    GET /api/pinned-cards/health/
    """
    permission_classes = []
    authentication_classes = []
    
    def get(self, request):
        user_id = request.session.get('_auth_user_id')
        user_info = None
        
        if user_id:
            try:
                user = User.objects.get(pk=user_id)
                user_info = {
                    'oidc_sub': user.oidc_sub,
                    'email': user.email,
                    'full_name': user.full_name
                }
            except User.DoesNotExist:
                pass
        
        return Response(
            {
                'status': 'healthy',
                'message': 'Pinned cards API is operational',
                'database': 'PostgreSQL',
                'authenticated': user_id is not None,
                'user': user_info
            },
            status=status.HTTP_200_OK
        )
