from django.db import models


class TokenBlacklist(models.Model):
    """Tabla simple para blacklist de refresh tokens"""
    token = models.TextField(unique=True)
    blacklisted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'token_blacklist'
        ordering = ['-blacklisted_at']
    
    def __str__(self):
        return f"Token blacklisted at {self.blacklisted_at}"
    
    @classmethod
    def is_blacklisted(cls, token):
        """Verifica si un token está en la blacklist"""
        return cls.objects.filter(token=token).exists()
    
    @classmethod
    def add_to_blacklist(cls, token):
        """Agrega un token a la blacklist"""
        cls.objects.get_or_create(token=token)
