from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import RegisterView, MeView, ClientViewSet, DocumentTypeViewSet, DocumentViewSet, PublicIntakeViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'document-types', DocumentTypeViewSet, basename='documenttype')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'public', PublicIntakeViewSet, basename='public')

urlpatterns = [
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
