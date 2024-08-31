from .models import RatingReview, WatchHistory, Movie, Sequel

class RecommendationEngine:
    """
    A class to provide movie recommendations based on user watch history, ratings, and search history.
    """

    def __init__(self, user_id):
        """
        Initialize the recommendation engine with the given user ID.

        Args:
            user_id (int): The ID of the user for whom recommendations are to be generated.
        """
        self.user_id = user_id

    def get_user_rated_movies(self):
        """
        Fetch movies rated by the user.

        Returns:
            QuerySet: A queryset of RatingReview objects for movies rated by the user.
        """
        # Fetch movies rated by the user
        print(self.user_id)
        rated_movies = RatingReview.objects.filter(logged_id=self.user_id)
        return rated_movies

    def recommend_sequels_based_on_genre(self):
        """
        Recommend sequels based on the genres of movies rated by the user.

        Returns:
            QuerySet: A queryset of sequels in the genres of the user's rated movies.
        """
        # Get user's rated movies
        rated_movies = self.get_user_rated_movies()

        # Get genres of movies rated by the user
        genres = rated_movies.values_list('movie__genre', flat=True).distinct()

        # Fetch sequels in the same genres
        recommended_sequels = Sequel.objects.filter(genre__in=genres)

        return recommended_sequels

    def recommend_movies_by_director(self):
        """
        Recommend movies directed by the same directors of movies rated by the user.

        Returns:
            QuerySet: A queryset of movies directed by the same directors as those rated by the user.
        """
        # Get user's rated movies
        rated_movies = self.get_user_rated_movies()

        # Get directors of movies rated by the user
        directors = rated_movies.values_list('movie__director', flat=True).distinct()

        # Fetch movies directed by the same directors, excluding already rated movies
        recommended_movies = Movie.objects.filter(director__in=directors).exclude(id__in=rated_movies.values_list('movie_id', flat=True))

        return recommended_movies.order_by('-tmdb_popularity')[:10]
