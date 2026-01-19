from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import Usuario


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that works with the Usuario model
    instead of Django's default User model
    """
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token.get('user_id')
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')
        
        try:
            user = Usuario.objects.get(id=user_id, activo=True)
        except Usuario.DoesNotExist:
            raise InvalidToken('User not found or inactive')
        
        # Add required attributes for DRF permissions
        user.is_authenticated = True
        user.is_active = user.activo
        
        return user
