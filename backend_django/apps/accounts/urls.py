from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, LogoutView, CurrentUserView

# Authentication URLs - matching mock server exactly
urlpatterns = [
    path('login', LoginView.as_view(), name='login'),  # No trailing slash!
    path('logout', LogoutView.as_view(), name='logout'),
    path('refresh', TokenRefreshView.as_view(), name='token-refresh'),
    path('me', CurrentUserView.as_view(), name='current-user'),
]