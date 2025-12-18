@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_trino_data_me(request):
    """Get Trino data for the currently authenticated user"""
    try:
        # Get oidc_sub from authenticated user
        oidc_sub = request.user.oidc_sub
        
        if not oidc_sub:
            return Response(
                {'success': False, 'error': 'User does not have oidc_sub'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call your existing get_user_profile function
        profile_data = get_user_profile(oidc_sub)
        
        return Response({
            'success': True,
            'data': profile_data
        })
        
    except Exception as e:
        logger.error(f"Error in get_user_trino_data_me: {str(e)}")
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
