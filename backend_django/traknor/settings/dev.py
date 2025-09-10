from .base import *

# Development specific settings
DEBUG = True

# Add debug toolbar in development
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')

# Allow all hosts in development
ALLOWED_HOSTS = ['*']

# More permissive CORS in development
CORS_ALLOW_ALL_ORIGINS = True

# Database logging in development
LOGGING['loggers']['django.db.backends'] = {
    'level': 'DEBUG',
    'handlers': ['console'],
}