
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventCategoryViewSet

router = DefaultRouter()

router.register(
    r'categories',
    EventCategoryViewSet,
    basename='event-category'
)

router.register(
    r'events',
    EventViewSet,
    basename='event'
)

urlpatterns = router.urls
