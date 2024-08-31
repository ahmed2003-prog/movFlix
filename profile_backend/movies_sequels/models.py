"""
This module contains Django models for representing movies and their sequels.

The `Movie` model represents a movie with eesired methods and attributes.

The `Sequel` model represents a sequel to a movie, including attributes and desired methods.

"""
from django.db import models
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class Movie(models.Model):
    """
    Represents a movie with details such as title, release date, director, genre,
    description, image URL, and popularity scores.
    """
    title = models.CharField(max_length=100, blank=False, null=False)
    release_date = models.DateField(blank=True, null=True)
    director = models.CharField(max_length=100, blank=True, null=True)
    genre = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=200, blank=True, null=True)
    tmdb_popularity = models.FloatField(blank=True, null=True)
    user_popularity = models.FloatField(blank=True, null=True)

    def __str__(self) -> str:
        return str(self.title)

    @staticmethod
    def get_recently_released():
        """
        Returns movies released in the last 3 months.
        """
        # Calculate the date 3 months ago
        three_months_ago = timezone.now() - relativedelta(months=3)
        three_months_ago_date = three_months_ago.date()
        current_date = timezone.now().date()

        # Filter movies released between three months ago and now
        # pylint: disable=no-member
        return Movie.objects.filter(
            release_date__gte=three_months_ago_date,
            release_date__lte=current_date
        )

    @staticmethod
    def get_top_rated_movies():
        """
        Returns the top 30 highest-rated movies.
        """
        # pylint: disable=no-member
        return Movie.objects.order_by('-tmdb_popularity')[:32]

    @staticmethod
    def get_movie_name(movie_id):
        """
        Returns moviename for a specific movie id.
        """
        # pylint: disable=no-member
        return Movie.objects.filter(movie_id=movie_id).order_by('-created_at')

class Sequel(models.Model):
    """
    Represents a sequel of a movie with details such as title, genre, release date,
    director, description, image URL, and popularity scores.
    Links to a parent movie.
    """
    movie = models.ForeignKey(Movie, related_name='sequels', on_delete=models.CASCADE)
    title = models.CharField(max_length=100, blank=False, null=False)
    genre = models.CharField(max_length=100, blank=False, null=False)
    release_date = models.DateField(blank=True, null=True)
    director = models.CharField(max_length=100, blank=True, null=True)
    tmdb_popularity = models.FloatField(blank=True, null=True)
    user_popularity = models.FloatField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=200, blank=True, null=True)

    def __str__(self) -> str:
        return str(self.title)

    @staticmethod
    def get_recently_released():
        """
        Returns sequels released in the last 3 months.
        """
        # Calculate the date 3 months ago
        three_months_ago = timezone.now() - relativedelta(months=3)
        three_months_ago_date = three_months_ago.date()
        current_date = timezone.now().date()

        # Filter sequels released between three months ago and now
        # pylint: disable=no-member
        return Sequel.objects.filter(
            release_date__gte=three_months_ago_date,
            release_date__lte=current_date
        )

class RatingReview(models.Model):
    """
    Represents a user's rating and review for a specific movie.
    Includes fields for the rating score, review text, and timestamps.
    """
    movie = models.ForeignKey('Movie', related_name='ratings_and_reviews', on_delete=models.CASCADE)
    logged_id = models.IntegerField()
    logged_name = models.TextField(blank=True, null=True)
    rating = models.IntegerField(blank=False, null=False)
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """
        Meta data about class
        """
        unique_together = ('movie', 'logged_id')  # A user can rate/review a movie only once

    def __str__(self) -> str:
        # pylint: disable=no-member
        return f"{self.logged_id} - {self.movie.title} ({self.rating}/10)"

    @staticmethod
    def get_movie_reviews(movie_id):
        """
        Returns all reviews for a specific movie.
        """
        # pylint: disable=no-member
        return RatingReview.objects.filter(movie_id=movie_id).order_by('-created_at')

    @staticmethod
    def get_user_reviews(user):
        """
        Returns all reviews made by a specific user.
        """
        # pylint: disable=no-member
        return RatingReview.objects.filter(logged_id=user).order_by('-created_at')

class SearchHistory(models.Model):
    """_summary_

    Args:
        models (_type_): _description_
    """
    logged_id = models.IntegerField()
    logged_name = models.TextField(blank=True, null=True)
    movie = models.ForeignKey(Movie, related_name='search_histories', on_delete=models.CASCADE)
    movie_name = models.TextField(blank=True, null=True)
    watched_at = models.DateTimeField(auto_now_add=True)


class WatchHistory(models.Model):
    """_summary_

    Args:
        models (_type_): _description_
    """
    logged_id = models.IntegerField()
    logged_name = models.TextField(blank=True, null=True)
    movie = models.ForeignKey(Movie, related_name='watch_histories', on_delete=models.CASCADE)
    watched_at = models.DateTimeField(auto_now_add=True)
