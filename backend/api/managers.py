from django.db import models
from asgiref.local import Local

_thread_locals = Local()

def set_current_tenant(tenant):
    _thread_locals.tenant = tenant

def get_current_tenant():
    return getattr(_thread_locals, 'tenant', None)

class TenantAwareManager(models.Manager):
    def get_queryset(self):
        tenant = get_current_tenant()
        if tenant:
            # If the model has an 'is_global' field, include global records
            if hasattr(self.model, 'is_global'):
                return super().get_queryset().filter(
                    models.Q(tenant=tenant) | models.Q(is_global=True)
                )
            return super().get_queryset().filter(tenant=tenant)
        return super().get_queryset()
