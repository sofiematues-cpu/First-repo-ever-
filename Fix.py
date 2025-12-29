import logging
import re
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.throttling import UserRateThrottle
from apps.trino_integration.repositories.trino_repository import TrinoRepository
from apps.trino_integration.serializers import CompassTeamPermissionSerializer

# Rate limiting for internal use - generous but prevents abuse
class TrinoRateThrottle(UserRateThrottle):
    rate = '1000/hour'  # 1000 requests per hour per user

logger = logging.getLogger(__name__)


class CompassTeamPermissionListView(APIView):
    """Get ALL the permissions"""
    permission_classes = [IsAuthenticated]
    throttle_classes = [TrinoRateThrottle]
    
    def get(self, request: Request) -> Response:
        # Audit log
        logger.info(f"User {request.user.email} requested permissions list at {timezone.now()}")
        
        try:
            limit = int(request.query_params.get('limit', 100))
            
            # Input validation - cap limit to prevent abuse
            if limit > 10000:
                limit = 10000
                
            with TrinoRepository() as repo:
                query = f"SELECT * FROM hive.bronze.compass_team_permission LIMIT {limit}"
                permissions = repo.execute_query(query)
                serializer = CompassTeamPermissionSerializer(permissions, many=True)
                return Response({
                    'success': True,
                    'count': len(permissions),
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error fetching permissions list: {str(e)}")
            return Response({
                'success': False,
                'error': 'Unable to fetch permissions data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompassTeamPermissionDetailView(APIView):
    """Get Permission by ID"""
    permission_classes = [IsAuthenticated]
    throttle_classes = [TrinoRateThrottle]
    
    def get(self, request: Request, permission_id: str) -> Response:
        # INPUT VALIDATION - prevent SQL injection
        if not permission_id or not re.match(r'^[a-zA-Z0-9\-_]+$', permission_id):
            logger.warning(f"Invalid permission_id format: {permission_id}")
            return Response({
                'success': False,
                'error': 'Invalid permission ID format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Audit log
        logger.info(f"User {request.user.email} requested permission {permission_id}")
        
        try:
            with TrinoRepository() as repo:
                query = f"SELECT * FROM hive.bronze.compass_team_permission WHERE id = '{permission_id}' LIMIT 1"
                results = repo.execute_query(query)
                
                if not results:
                    return Response({
                        'success': False,
                        'error': f'Permission {permission_id} not found'
                    }, status=status.HTTP_404_NOT_FOUND)
                    
                serializer = CompassTeamPermissionSerializer(results[0])
                return Response({
                    'success': True,
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error fetching permission {permission_id}: {str(e)}")
            return Response({
                'success': False,
                'error': 'Unable to fetch permission data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthCheckView(APIView):
    """Check Trino connection"""
    permission_classes = [IsAuthenticated]
    throttle_classes = [TrinoRateThrottle]
    
    def get(self, request: Request) -> Response:
        logger.info(f"User {request.user.email} performed Trino health check")
        
        try:
            with TrinoRepository() as repo:
                repo.execute_query("SELECT 1")
                return Response({
                    'status': 'healthy',
                    'service': 'Trino',
                    'message': 'Connection Successful'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Trino health check failed: {str(e)}")
            return Response({
                'status': 'unhealthy',
                'service': 'Trino',
                'error': 'Connection failed'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class UserProfileView(APIView):
    """Get user profile data from Trino"""
    permission_classes = [IsAuthenticated]
    throttle_classes = [TrinoRateThrottle]
    
    def get(self, request: Request, oidc_sub: str) -> Response:
        # INPUT VALIDATION - prevent SQL injection
        if not oidc_sub or not re.match(r'^[a-zA-Z0-9\-_@.]+$', oidc_sub):
            logger.warning(f"Invalid oidc_sub format: {oidc_sub}")
            return Response({
                'success': False,
                'error': 'Invalid user identifier format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Audit log
        logger.info(f"User {request.user.email} requested profile for {oidc_sub}")
        
        try:
            with TrinoRepository() as repo:
                emp_query = f"""
                SELECT * FROM hive.silver.crm_crm_plus_dim_emp_info
                WHERE global_uid = '{oidc_sub}'
                """
                employee_data = repo.execute_query(emp_query)
                
                if not employee_data:
                    return Response({
                        'success': False,
                        'error': f'No employee data found for oidc_sub : {oidc_sub}'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                employee = employee_data[0]
                
                adage_query = f"""
                SELECT * FROM hive.silver.crm_crm_plus_dim_adage_history WHERE bnpp_uid = '{oidc_sub}'
                """
                adage_data = repo.execute_query(adage_query)
                
                return Response({
                    'success': True,
                    'oidc_sub': oidc_sub,
                    'employee': {
                        'name': f"{employee.get('first_name', '')} {employee.get('last_name', '')}".strip(),
                        'email': employee.get('corporate_email_address'),
                        'status': employee.get('status'),
                        'job_title': employee.get('job_title'),
                        'contact_id': employee.get('contact_id'),
                        'marketing_client': {
                            'id': employee.get('marketing_client_id'),
                            'name': employee.get('marketing_client_name'),
                            'country': employee.get('marketing_client_country'),
                            'status': employee.get('marketing_client_status')
                        },
                        'primary_team': employee.get('primary_team'),
                        'primary_position': employee.get('primary_position'),
                        'primary_team_region': employee.get('primary_team_region'),
                        'primary_team_business_line': employee.get('primary_team_business_line'),
                        'created': employee.get('created'),
                        'last_updated': employee.get('last_update'),
                        'full_data': employee
                    },
                    'adage_history': adage_data if adage_data else [],
                    'adage_count': len(adage_data) if adage_data else 0
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error fetching user profile for {oidc_sub}: {str(e)}")
            return Response({
                'success': False,
                'error': 'Unable to fetch user profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_trino_data(request):
    """Get current user's Trino data (job title, team, country, metier, gbl)."""
    try:
        oidc_sub = getattr(request.user, 'oidc_sub', None)
        
        # INPUT VALIDATION
        if not oidc_sub:
            return Response({
                'success': False,
                'error': 'User does not have oidc_sub'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not re.match(r'^[a-zA-Z0-9\-_@.]+$', oidc_sub):
            logger.warning(f"Invalid oidc_sub for user {request.user.email}")
            return Response({
                'success': False,
                'error': 'Invalid user identifier'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Audit log
        logger.info(f"User {request.user.email} fetching own Trino data")
        
        with TrinoRepository() as repo:
            emp_query = f"SELECT * FROM hive.silver.crm_crm_plus_dim_emp_info WHERE global_uid = '{oidc_sub}'"
            employee_data = repo.execute_query(emp_query)
            
            if not employee_data:
                return Response({
                    'success': False,
                    'error': 'No employee data found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            employee = employee_data[0]
            
            adage_query = f"SELECT * FROM hive.silver.crm_crm_plus_dim_adage_history WHERE bnpp_uid = '{oidc_sub}' ORDER BY valid_from DESC LIMIT 1"
            adage_data = repo.execute_query(adage_query)
            
            adage = adage_data[0] if adage_data else {}
            
            return Response({
                'success': True,
                'data': {
                    'job_title': employee.get('job_title'),
                    'team_name': adage.get('team_name'),
                    'country': adage.get('country'),
                    'metier': adage.get('metier'),
                    'gbl': adage.get('gbl'),
                    'disabled': adage.get('disabled'),
                    'flc_flag': adage.get('flc_flag'),
                }
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error fetching Trino data: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to fetch Trino data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_trino_data(request):
    """Get Trino data for the currently authenticated user - /me/ endpoint"""
    
    # Audit log
    logger.info(f"User {request.user.email} accessing current user Trino data")
    
    try:
        oidc_sub = request.user.oidc_sub
        
        # INPUT VALIDATION
        if not oidc_sub:
            return Response({
                'success': False,
                'error': 'User does not have oidc_sub'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not re.match(r'^[a-zA-Z0-9\-_@.]+$', oidc_sub):
            logger.warning(f"Invalid oidc_sub for user {request.user.email}")
            return Response({
                'success': False,
                'error': 'Invalid user identifier'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Reuse the get_user_trino_data function
        return get_user_trino_data(request._request)
        
    except Exception as e:
        logger.error(f"Error fetching Trino data for current user: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to fetch Trino data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
