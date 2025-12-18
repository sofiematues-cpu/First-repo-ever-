@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_trino_data(request):
    """Get Trino data for the currently authenticated user - /me/ endpoint"""
    try:
        # Get oidc_sub from authenticated user
        oidc_sub = request.user.oidc_sub
        
        if not oidc_sub:
            return Response(
                {'success': False, 'error': 'User does not have oidc_sub'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Query Trino directly (copy from your get_user_profile function)
        with TrinoRepository() as repo:
            query = """
            SELECT * FROM hive.silver.crm_crm_plus_dlm_emp_info 
            WHERE global_uid = '{oidc_sub}'
            """
            employee_data = repo.execute_query(query.format(oidc_sub=oidc_sub))
            
            if not employee_data:
                return Response({
                    'success': False,
                    'error': 'No employee data found for oidc_sub'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get adage data too
            adage_query = """
            SELECT * FROM hive.silver.crm_crm_plus_dlm_adage_history 
            WHERE bnpp_uid = '{oidc_sub}' ORDER BY valid_from DESC LIMIT 1
            """
            adage_data = repo.execute_query(adage_query.format(oidc_sub=oidc_sub))
            
            return Response({
                'success': True,
                'data': {
                    'job_title': employee_data[0].get('job_title'),
                    'team_name': adage_data[0].get('team_name') if adage_data else '',
                    'country': adage_data[0].get('country') if adage_data else '',
                    'metier': adage_data[0].get('metier') if adage_data else '',
                    'gbl': adage_data[0].get('gbl') if adage_data else ''
                }
            })
            
    except Exception as e:
        logger.error(f"Error fetching Trino data for current user: {str(e)}")
        return Response(
            {'success': False, 'error': f'Failed to fetch Trino data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
