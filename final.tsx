class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed.
        """
        # DEBUG LOGGING - Add this
        logger.info(f"=== PRE_SOCIAL_LOGIN DEBUG ===")
        logger.info(f"Provider: {sociallogin.account.provider}")
        logger.info(f"UID: {sociallogin.account.uid}")
        logger.info(f"Extra Data: {sociallogin.account.extra_data}")
        logger.info(f"Is Existing: {sociallogin.is_existing}")
        
        # Get user data from OIDC provider
        if sociallogin.account.provider == 'openid_connect':
            user_data = sociallogin.account.extra_data
            # Try to connect this social login to existing user with same email
            try:
                email = user_data.get('email')
                logger.info(f"Email from OIDC: {email}")  # Add this
                if email:
                    user = User.objects.get(email=email)
                    logger.info(f"Found existing user: {user}")  # Add this
                    sociallogin.connect(request, user)
            except User.DoesNotExist:
                logger.info(f"No existing user found for email: {email}")  # Add this
                pass
