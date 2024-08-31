"""
URL configuration for the movies and sequels API.

This module defines the URL patterns for the API, including the routes for
movie and sequel viewsets, as well as custom endpoints for fetching recently
released movies and sequels, the most popular movies and sequels, search
suggestions, and search results.

Endpoints:
- /movies/ - Movie viewset
- /sequels/ - Sequel viewset
- /recently-released/ - Recently released movies and sequels
- /most-popular/ - Most popular movies and sequels
- /suggestions/ - Search suggestions
- /search/ - Search movies
- /<str:movie_name>/sequels/ - Movie sequels
- /<str:movie_name>/movie-details/ - Movie details
- /rating-reviews/ - Create a new rating and review
- /rating-reviews/list/ - List all rating and review entries
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
MovieViewSet,
SequelViewSet,
RecentlyReleasedMoviesAndSequelsView,
MostPopularMoviesView,
SearchMoviesView,
SearchSuggestionsView,
MovieSequelsView,
MovieDetailsView,
RatingReviewCreateView,
RatingReviewListView,
UserRecommendationView,
SearchHistoryListCreateView,
UserWatchHistoryListView,
WatchHistoryListCreateView,
MovieListView,
ClearWatchHistoryView,
SearchHistoryDetailView,
ClearSearchHistoryView
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'movies', MovieViewSet)
router.register(r'sequels', SequelViewSet)

# The API URLs are determined automatically by the router.
urlpatterns = [

path('', include(router.urls)),
path('recently-released/', RecentlyReleasedMoviesAndSequelsView.as_view(),
     name='recently_released_movies_and_sequels'),
path('most-popular/', MostPopularMoviesView.as_view(),
     name='most_popular_movies'),
path('suggestions/', SearchSuggestionsView.as_view(), name='search_suggestions'),
path('search/', SearchMoviesView.as_view(), name='search_movies'),
path('<str:movie_name>/sequels/', MovieSequelsView.as_view(),
     name='get_movie_sequels'),
path('<str:movie_name>/movie-details/', MovieDetailsView.as_view(),
     name='get_movie_details'),
path('rating-reviews/', RatingReviewCreateView.as_view(),
     name='rating-review-create'),
path('rating-reviews/list/', RatingReviewListView.as_view(),
     name='rating-review-list'),
path('recommendations/<str:username>/', UserRecommendationView.as_view(),
     name='user-recommendations'),
path('search-history/', SearchHistoryListCreateView.as_view(),
     name='search-history-list-create'),
path('search-history/<int:pk>/', SearchHistoryDetailView.as_view(),
     name='search-history-detail'),
path('watch-history/', WatchHistoryListCreateView.as_view(),
     name='watch-history-list-create'),
path('list-watch-history/', UserWatchHistoryListView.as_view(),
     name='user-watch-history'),
path('list-search-history/', SearchHistoryDetailView.as_view(),
     name='user-search-history'),
path('movie/<int:id>/',
     MovieListView.as_view(), name='movie-detail'),
path('clear-watch-history/',
     ClearWatchHistoryView.as_view(), name='clear_watch_history'),
path('clear-search-history/',
     ClearSearchHistoryView.as_view(), name='clear_search_history'),

]
