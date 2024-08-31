"""
Admin interface configuration for the movies and sequels models.

This module registers the Movie and Sequel models with the Django admin site,
allowing for the management of movies and sequels through the Django admin interface.

It includes:

- MovieAdmin: Customizes the admin interface for the Movie model, including:
  - List display of movie titles, release dates, directors, genres, and TMDB popularity.
  - Inline interface for adding and editing related sequels.
  - Search functionality for movie titles, directors, and genres.
  - List filters for release dates, genres, and TMDB popularity.

- SequelAdmin: Customizes the admin interface for the Sequel model, including:
  - List display of sequel titles, parent movies, release dates, directors, and TMDB popularity.
  - Search functionality for sequel titles and parent movie titles.
  - List filters for release dates, directors, and TMDB popularity.
"""

from django.contrib import admin
from .models import Movie, Sequel, RatingReview, WatchHistory, SearchHistory


class SequelInline(admin.TabularInline):
    """
    Inline admin interface for the Sequel model.
    Allows adding and editing sequels directly within the Movie admin interface.
    """
    model = Sequel
    extra = 1


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    """
    Admin interface for the Movie model.
    Displays a list of movies with their titles, release dates, directors, and genres.
    Includes an inline interface for related sequels.
    """
    list_display = ('id','title', 'release_date', 'director', 'genre', 'tmdb_popularity')
    inlines = [SequelInline]
    search_fields = ('title', 'director', 'genre')
    list_filter = ('release_date', 'genre', 'tmdb_popularity')


@admin.register(Sequel)
class SequelAdmin(admin.ModelAdmin):
    """
    Admin interface for the Sequel model.
    Displays a list of sequels with their titles, parent movies, release dates, and directors.
    Provides search functionality on sequel and parent movie titles.
    """
    list_display = ('title', 'movie', 'release_date', 'director', 'tmdb_popularity')
    search_fields = ('title', 'movie__title')
    list_filter = ('release_date', 'director', 'tmdb_popularity')

@admin.register(RatingReview)
class RateAdmin(admin.ModelAdmin):
    """
    Rating interface for the Movies and Sequels models.
    Displays a list of reviews with the titles,and date of creation.
    Provides search functionality on sequel and parent movie titles.
    """
    list_display = ('logged_id', 'logged_name', 'movie')
    search_fields = ('movie', 'logged_name')

@admin.register(WatchHistory)
class HistoryAdmin(admin.ModelAdmin):
    """
    Rating interface for the Movies and Sequels models.
    Displays a list of reviews with the titles,and date of creation.
    Provides search functionality on sequel and parent movie titles.
    """
    list_display = ('logged_id', 'logged_name', 'movie')
    search_fields = ('movie', 'logged_name')

@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    """
    Rating interface for the Movies and Sequels models.
    Displays a list of reviews with the titles,and date of creation.
    Provides search functionality on sequel and parent movie titles.
    """
    list_display = ('logged_id', 'logged_name', 'movie')
    search_fields = ('movie', 'logged_name')
