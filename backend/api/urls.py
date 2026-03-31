from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import RegisterView, MeView, ClientViewSet, DocumentTypeViewSet, DocumentViewSet, PublicIntakeViewSet, SubscriptionViewSet
from .admin_views import AdminStatsView, AdminUserListView, AdminUserActionView
from .webhooks import razorpay_webhook

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'document-types', DocumentTypeViewSet, basename='documenttype')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'public', PublicIntakeViewSet, basename='public')

urlpatterns = [
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('webhooks/razorpay/', razorpay_webhook, name='razorpay_webhook'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:user_id>/manage/', AdminUserActionView.as_view(), name='admin_user_manage'),
    path('', include(router.urls)),
]
