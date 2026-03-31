from .managers import set_current_tenant
from django.http import JsonResponse

class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Try to get tenant from user profile
            try:
                profile = getattr(request.user, 'profile', None)
                if profile and profile.tenant:
                    set_current_tenant(profile.tenant)
                else:
                    set_current_tenant(None)
            except Exception:
                set_current_tenant(None)
        else:
            set_current_tenant(None)

        response = self.get_response(request)
        
        # Clear tenant after request
        set_current_tenant(None)
        return response


class SubscriptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only check subscriptions for authenticated users on destructive/generator actions
        if request.user.is_authenticated and not request.user.is_superuser:
            try:
                profile = getattr(request.user, 'profile', None)
                if profile and profile.tenant:
                    tenant = profile.tenant
                    subscription = getattr(tenant, 'subscription', None)
                    
                    if not subscription:
                        # Auto-fix: Create FREE subscription if missing
                        from .models import Subscription
                        subscription = Subscription.objects.create(tenant=tenant, plan='FREE', status='ACTIVE')
                    
                    if subscription.status not in ['ACTIVE']: # Allow only active
                         if request.path.startswith('/api/documents/generate/') or request.path.startswith('/api/documents/preview/'):
                             return JsonResponse(
                                 {"error": f"Subscription {subscription.get_status_display()} - Please complete payment to continue."}, 
                                 status=403
                             )
            except Exception:
                pass

        return self.get_response(request)
