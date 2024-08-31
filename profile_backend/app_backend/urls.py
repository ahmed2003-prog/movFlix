from django.contrib import admin
from django.urls import path, include

from user_auth.views import (
    logout_view,
    login_view,
    SignUpView,
    VerifyEmailView,
    profile_view,
    check_user,
)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/<str:username>/', profile_view, name='profile'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('check-user/', check_user, name='check-user'),
    path('admin/', admin.site.urls),
    path('api/', include('movies_sequels.urls')),
]
