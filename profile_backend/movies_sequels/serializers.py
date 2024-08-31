"""
This module contains serializers for the Movie, Sequel, and RatingReview models,
as well as custom serializers for handling search suggestions and search results.

The serializers included are:
- `SequelSerializer`: Serializes the Sequel model.
- `MovieSerializer`: Serializes the Movie model and includes related sequels.
- `SearchSuggestionSerializer`: Serializes search suggestions, returning a list of
    suggestion strings.
- `SearchResultSerializer`: Serializes search results, returning a list of
    MovieSerializer instances.
- `RatingReviewSerializer`: Serializes the RatingReview model, including rating and
    review data for a movie.

These serializers are designed to be used with Django REST Framework to facilitate
the conversion of model instances and other complex data types to native Python datatypes
that can then be easily rendered into JSON, XML, or other content types.
"""
from rest_framework import serializers
from .models import Movie, Sequel, RatingReview, WatchHistory, SearchHistory
from .messages import ERROR_MESSAGES

class SequelSerializer(serializers.ModelSerializer):
    """
    Serializer for the Sequel model.
    Serializes all fields of the Sequel model.
    """
    class Meta:
        """
        Meta data about serializer
        """
        model = Sequel
        fields = '__all__'

class MovieSerializer(serializers.ModelSerializer):
    """
    Serializer for the Movie model.
    Includes related sequels using the SequelSerializer.
    Serializes all fields of the Movie model.
    """
    sequels = SequelSerializer(many=True, read_only=True)

    class Meta:
        """
        Meta data about class movie serializer
        """
        model = Movie
        fields = '__all__'

class SearchSuggestionSerializer(serializers.Serializer):
    """
    Serializer for search suggestions.
    Returns a list of suggestion strings.
    """
    suggestions = serializers.ListField(child=serializers.CharField())

    def create(self, validated_data):
        """
        Method not implemented for this serializer.
        """
        raise NotImplementedError(ERROR_MESSAGES['create_not_implemented'])

    def update(self, instance, validated_data):
        """
        Method not implemented for this serializer.
        """
        raise NotImplementedError(ERROR_MESSAGES['update_not_implemented'])

class SearchResultSerializer(serializers.Serializer):
    """
    Serializer for search results.
    Returns a list of MovieSerializer instances.
    """
    results = MovieSerializer(many=True)

    def create(self, validated_data):
        """
        Method not implemented for this serializer.
        """
        raise NotImplementedError(ERROR_MESSAGES['create_not_implemented'])

    def update(self, instance, validated_data):
        """
        Method not implemented for this serializer.
        """
        raise NotImplementedError(ERROR_MESSAGES['update_not_implemented'])

class RatingReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for the RatingReview model.
    Serializes the rating and review data for a movie.
    """
    class Meta:
        """
        Meta data about the class
        """
        model = RatingReview
        fields = ['movie', 'logged_id', 'logged_name', 'rating',
                'review', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class SearchHistorySerializer(serializers.ModelSerializer):
    """_summary_

    Args:
        serializers (_type_): _description_
    """
    class Meta:
        """_summary_
        """
        model = SearchHistory
        fields = ['id', 'logged_id', 'logged_name', 'movie','movie_name', 'watched_at']

class WatchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WatchHistory
        fields = ['logged_id', 'logged_name', 'movie', 'watched_at']

