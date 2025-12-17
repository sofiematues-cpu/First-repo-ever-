from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_trino_data(request):
    """
    Get current user's Trino data (job title, team, country, metier, gbl).
    Requires authentication - gets oidc_sub from request.user automatically.
    """
    try:
        # Get oidc_sub from authenticated user
        oidc_sub = getattr(request.user, 'oidc_sub', None)
        
        if not oidc_sub:
            return Response({
                'success': False,
                'error': 'User does not have oidc_sub'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with TrinoRepository() as repo:
            # Get employee data
            emp_query = f"SELECT * FROM hive.silver.crm_crm_plus_dim_emp_info WHERE global_uid = '{oidc_sub}'"
            employee_data = repo.execute_query(emp_query)
            
            if not employee_data:
                return Response({
                    'success': False,
                    'error': 'No employee data found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            employee = employee_data[0]
            
            # Get adage data
            adage_query = f"SELECT * FROM hive.silver.crm_crm_plus_dim_adage_history WHERE bnpp_uid = '{oidc_sub}' ORDER BY valid_from DESC LIMIT 1"
            adage_data = repo.execute_query(adage_query)
            
            # Extract ONLY the 5 fields needed
            adage = adage_data[0] if adage_data else {}
            
            return Response({
                'success': True,
                'data': {
                    'job_title': employee.get('job_title'),
                    'team_name': adage.get('team_name'),
                    'country': adage.get('country'),
                    'metier': adage.get('metier'),
                    'gbl': adage.get('gbl')
                }
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error fetching Trino data: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to fetch Trino data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
-----------------
export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    oidc_sub: string;
    oidc_provider: string;
    profile_picture: string;
    last_login: string;
    date_joined: string;
    // NEW: Trino data fields
    job_title?: string;
    team_name?: string;
    country?: string;
    metier?: string;
    gbl?: string;
}
_____________________
// Add after getCurrentUser function

export const getUserTrinoData = async (): Promise<{
    success: boolean;
    data?: {
        job_title: string;
        team_name: string;
        country: string;
        metier: string;
        gbl: string;
    };
    error?: string;
}> => {
    try {
        const response = await api.get('/api/trino/me/');
        return response.data;
    } catch (error: any) {
        console.error('Failed to get Trino data:', error);
        return { success: false, error: error.message };
    }
};
_____________________
