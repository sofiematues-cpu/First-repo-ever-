@method_decorator(csrf_exempt, name='dispatch')
class PinCardView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # DEBUG: Print everything about the user
        logger.info(f"=== PIN DEBUG ===")
        logger.info(f"request.user: {request.user}")
        logger.info(f"is_authenticated: {request.user.is_authenticated}")
        logger.info(f"user type: {type(request.user)}")
        logger.info(f"session: {request.session.keys()}")
        logger.info(f"cookies: {request.COOKIES.keys()}")
        
        # Try to get user from session directly
        user_id = request.session.get('_auth_user_id')
        logger.info(f"_auth_user_id from session: {user_id}")
        
        if user_id:
            from apps.accounts.models import User
            try:
                user = User.objects.get(pk=user_id)
                logger.info(f"Found user: {user.oidc_sub}")
            except User.DoesNotExist:
                logger.error(f"User {user_id} not found")
        
        # Validate input
        serializer = PinCardSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        card_id = serializer.validated_data['card_id']
        card_url = serializer.validated_data['card_url']
        
        # Get user from session
        user_id = request.session.get('_auth_user_id')
        if not user_id:
            return Response(
                {'success': False, 'error': 'Not authenticated'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        from apps.accounts.models import User
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {'success': False, 'error': 'User not found'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            PinnedCard.objects.create(
                user=user,
                card_id=card_id,
                card_url=card_url
            )
            logger.info(f"User {user.oidc_sub} pinned card {card_id}")
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
