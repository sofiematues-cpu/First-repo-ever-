@method_decorator(csrf_exempt, name='dispatch')
class PinCardView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = PinCardSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        card_id = serializer.validated_data['card_id']
        card_url = serializer.validated_data['card_url']
        
        # TEMPORARY: Use a default user for testing
        from apps.accounts.models import User
        try:
            user = User.objects.first()  # Get any user for testing
            if not user:
                return Response(
                    {'success': False, 'error': 'No users in database'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            PinnedCard.objects.create(
                user=user,
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
