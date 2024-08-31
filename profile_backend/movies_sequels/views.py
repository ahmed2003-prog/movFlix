import logging

from django.db.models import Q
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from django.http import  JsonResponse
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Movie, Sequel, RatingReview, SearchHistory, WatchHistory
from .serializers import (
    MovieSerializer,
    SequelSerializer,
    SearchResultSerializer,
    SearchSuggestionSerializer,
    RatingReviewSerializer,
    SearchHistorySerializer,
    WatchHistorySerializer
)
from .movieRecommendation import RecommendationEngine

# Set up logging
logger = logging.getLogger(__name__)

class MovieViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Movie instances.
    """
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer

class SequelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Sequel instances.
    """
    queryset = Sequel.objects.all()
    serializer_class = SequelSerializer

class RecentlyReleasedMoviesAndSequelsView(APIView):
    """
    API view to retrieve recently released movies and sequels.
    """
    def get(self, request):
        """
        Get method for recently released movies and sequels.
        """
        movies = Movie.get_recently_released()
        sequels = Sequel.get_recently_released()
        movie_serializer = MovieSerializer(movies, many=True)
        sequel_serializer = SequelSerializer(sequels, many=True)
        return Response({
            'recently_released_movies': movie_serializer.data,
            'recently_released_sequels': sequel_serializer.data
        })

class MostPopularMoviesView(APIView):
    """
    API view to retrieve the most popular movies.
    """
    def get(self, request):
        """
        Get method for most popular movies view.
        """
        movies = Movie.get_top_rated_movies()
        movie_serializer = MovieSerializer(movies, many=True)
        return Response({
            'tmdb_popular_movies': movie_serializer.data,
        })

class SearchSuggestionsView(APIView):
    """
    API view to provide search suggestions based on a query.
    """
    def get(self, request):
        """
        Get method for search suggestions.
        """
        query = request.GET.get('q', '')
        suggestions = []
        if query:
            suggestions = (
                Movie.objects.filter(Q(title__icontains=query))
                .values_list('title', flat=True)[:4]
                | Movie.objects.filter(Q(director__icontains=query))
                .values_list('title', flat=True)[:4]
            )
        serializer = SearchSuggestionSerializer({'suggestions': suggestions})
        return Response(serializer.data)

class SearchMoviesView(APIView):
    """
    API view to return movies matching a search query in title or description.
    """
    def get(self, request):
        """
        Get method for search movies view.
        """
        query = request.GET.get('q', '')
        movies = []
        if query:
            movies = Movie.objects.filter(
                Q(title__icontains=query) | Q(description__icontains=query))
        serializer = SearchResultSerializer(
            {'results': list(movies.values('title', 'description', 'image_url'))})
        return Response(serializer.data)

class MovieSequelsView(APIView):
    """
    API view to retrieve all sequels of a given movie.
    """
    def get(self, request, movie_name):
        """
        Get method for movie sequels view.
        """
        movie = get_object_or_404(Movie, title=movie_name)
        sequels = movie.sequels.all()
        serializer = SequelSerializer(sequels, many=True)
        return Response(serializer.data)

class MovieDetailsView(APIView):
    """
    API view to return movie details matching a movie title.
    """
    def get(self, request, movie_name):
        """
        Get method for movie details view.
        """
        if movie_name:
            try:
                movie = Movie.objects.get(title=movie_name)
                serializer = MovieSerializer(movie)
                return Response(serializer.data)
            except Movie.DoesNotExist:
                return Response({'error': 'Movie not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'No movie name provided'}, status=status.HTTP_400_BAD_REQUEST)

class RatingReviewCreateView(generics.CreateAPIView):
    """
    API view to create a new RatingReview instance.
    """
    queryset = RatingReview.objects.all()
    serializer_class = RatingReviewSerializer

    def perform_create(self, serializer):
        serializer.save(
            logged_id=self.request.data.get('logged_id'),
            logged_name=self.request.data.get('logged_name')
        )

class RatingReviewListView(generics.ListAPIView):
    """
    List all rating and review entries for a specific movie or user.
    """
    serializer_class = RatingReviewSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned reviews to a given movie or user,
        by filtering against query parameters in the URL.
        """
        movie_id = self.request.query_params.get('movie_id')
        user_id = self.request.query_params.get('user_id')
        if movie_id:
            return RatingReview.objects.filter(movie_id=movie_id).order_by('-created_at')
        elif user_id:
            return RatingReview.objects.filter(logged_id=user_id).order_by('-created_at')
        else:
            return RatingReview.objects.all()

    def list(self, request, *args, **kwargs):
        """
        Handle GET requests to list reviews.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class UserRecommendationView(APIView):
    def get(self, request, username):
        user_id = self.request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'User ID is required'}, status=400)
        print(f"user id is {user_id}")
        engine = RecommendationEngine(user_id=user_id)
        recommended_sequels = engine.recommend_sequels_based_on_genre()
        recommended_movies_by_director = engine.recommend_movies_by_director()


        movie_serializer = MovieSerializer(recommended_movies_by_director, many=True)
        sequel_serializer = SequelSerializer(recommended_sequels, many=True)

        return Response({
            'recommended_movies': movie_serializer.data,
            'recommended_sequels': sequel_serializer.data,
        })

class SearchHistoryListCreateView(generics.ListCreateAPIView):
    """
    API view to list and create search history entries.
    """
    queryset = SearchHistory.objects.all()
    serializer_class = SearchHistorySerializer

class SearchHistoryDetailView(generics.ListAPIView):
    """
    API view to retrieve, update, or delete a specific search history entry.
    """
    serializer_class = SearchHistorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return SearchHistory.objects.filter(logged_id=user_id).order_by('-watched_at')

class WatchHistoryListCreateView(generics.ListCreateAPIView):
    """
    API view to list and create watch history entries.
    """
    queryset = WatchHistory.objects.all()
    serializer_class = WatchHistorySerializer
    permission_classes = [AllowAny]


class UserWatchHistoryListView(generics.ListAPIView):
    """
    API view to list watch history for the authenticated user.
    """
    serializer_class = WatchHistorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return WatchHistory.objects.filter(logged_id=user_id).order_by('-watched_at')

class MovieListView(generics.RetrieveAPIView):
    """
    API view to retrieve the name of a movie by its ID.
    """
    serializer_class = MovieSerializer
    lookup_field = 'id'
    queryset = Movie.objects.all()

    def get(self, request, *args, **kwargs):
        movie = self.get_object()
        return Response({
            'id': movie.id,
            'name': movie.title})

class ClearWatchHistoryView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        user = request.user
        WatchHistory.objects.filter(logged_id=user.id).delete()
        return Response({'message': 'Watch history cleared successfully.'})

class ClearSearchHistoryView(APIView):
    """
    API view to clear the watch history for the authenticated user.
    """
    serializer_class = SearchHistorySerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        user_id = self.request.query_params.get('user_id')
        print(user_id)
        SearchHistory.objects.filter(logged_id=user_id).delete()
        return JsonResponse({'message': 'Watch history cleared successfully.'})

