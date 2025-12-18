@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_trino_data(request):
    """Get Trino data for the currently authenticated user - /me/ endpoint"""
    try:
        # Get oidc_sub from the authenticated user's session
        oidc_sub = request.user.oidc_sub
        
        if not oidc_sub:
            return Response(
                {'success': False, 'error': 'User does not have oidc_sub'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reuse your existing logic by calling get_user_profile
        from .utils import get_user_profile  # Or wherever your get_user_profile function is
        
        profile_data = get_user_profile(oidc_sub)
        
        return Response({
            'success': True,
            'data': profile_data
        })
        
    except Exception as e:
        logger.error(f"Error fetching Trino data for current user: {str(e)}")
        return Response(
            {'success': False, 'error': f'Failed to fetch Trino data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
