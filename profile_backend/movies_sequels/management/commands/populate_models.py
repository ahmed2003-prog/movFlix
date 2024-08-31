import requests
from django.core.management.base import BaseCommand
from movies_sequels.models import Movie, Sequel
from enum import Enum

API_KEY = '316aaf03b6a33bb139c69970f4272133'
BASE_URL = 'https://api.themoviedb.org/3/'

class ApiEndpoint(Enum):
    GENRE_LIST = 'genre/movie/list'
    DISCOVER_MOVIE = 'discover/movie'
    MOVIE_DETAIL = 'movie/{movie_id}'

def fetch_json(url, params):
    """
    Fetch JSON data from a given URL with provided parameters.

    Args:
        url (str): The URL to fetch data from.
        params (dict): The parameters to include in the request.

    Returns:
        dict: The JSON response from the request.
    """
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

def get_genre_dict():
    """
    Fetch the genre list from TMDB and return a dictionary mapping genre IDs to names.

    Returns:
        dict: A dictionary mapping genre IDs to genre names.
    """
    genre_url = f'{BASE_URL}{ApiEndpoint.GENRE_LIST.value}'
    params = {'api_key': API_KEY, 'language': 'en-US'}
    genre_data = fetch_json(genre_url, params)
    return {genre['id']: genre['name'] for genre in genre_data['genres']}

def get_movie_details(movie_id):
    """
    Fetch detailed information about a movie including credits and collection info.

    Args:
        movie_id (int): The TMDB ID of the movie.

    Returns:
        dict: The detailed movie information.
    """
    detail_url = f'{BASE_URL}{ApiEndpoint.MOVIE_DETAIL.value.format(movie_id=movie_id)}'
    params = {'api_key': API_KEY, 'language': 'en-US', 'append_to_response': 'credits,belongs_to_collection'}
    return fetch_json(detail_url, params)

def process_movie(movie_data, genre_dict):
    """
    Process and create or update a movie record in the database.

    Args:
        movie_data (dict): The movie data from the API.
        genre_dict (dict): The dictionary mapping genre IDs to names.
    """
    movie_id = movie_data['id']
    title = movie_data['title']
    release_date = movie_data.get('release_date', '')
    genre_ids = movie_data.get('genre_ids', [])
    genre_names = [genre_dict.get(genre_id, 'Unknown') for genre_id in genre_ids]
    image_path = movie_data.get('poster_path', '')
    image_url = f"https://image.tmdb.org/t/p/w500{image_path}" if image_path else None
    description = movie_data.get('overview', '')
    tmdb_popularity = movie_data.get('popularity', 0)

    if not image_url:
        return

    detail_data = get_movie_details(movie_id)
    director = next(
        (crew_member['name'] for crew_member in detail_data.get('credits', {}).get('crew', [])
         if crew_member['job'] == 'Director'), 'Unknown'
    )
    collection = detail_data.get('belongs_to_collection', None)

    movie_defaults = {
        'release_date': release_date if release_date else None,
        'director': director,
        'genre': ', '.join(genre_names),
        'description': description,
        'image_url': image_url,
        'tmdb_popularity': tmdb_popularity
    }

    Movie.objects.update_or_create(
        title=title,
        defaults=movie_defaults
    )

    if collection:
        process_sequels(Movie.objects.get(title=title), collection, genre_dict)

def process_sequels(movie, collection, genre_dict):
    """
    Process and create or update sequel records in the database.

    Args:
        movie (Movie): The parent movie instance.
        collection (dict): The collection data from the API.
        genre_dict (dict): The dictionary mapping genre IDs to names.
    """
    for sequel_movie_id in collection.get('parts', []):
        sequel_data = get_movie_details(sequel_movie_id)
        sequel_title = sequel_data.get('title', 'Unknown')
        sequel_release_date = sequel_data.get('release_date', '')
        sequel_genres = [genre_dict.get(genre_id, 'Unknown') for genre_id in sequel_data.get('genre_ids', [])]
        sequel_image_path = sequel_data.get('poster_path', '')
        sequel_image_url = f"https://image.tmdb.org/t/p/w500{sequel_image_path}" if sequel_image_path else None
        sequel_description = sequel_data.get('overview', '')
        sequel_popularity = sequel_data.get('popularity', 0)

        if not sequel_image_url:
            continue

        director = next(
            (crew_member['name'] for crew_member in sequel_data.get('credits', {}).get('crew', [])
             if crew_member['job'] == 'Director'), 'Unknown'
        )

        sequel_defaults = {
            'release_date': sequel_release_date if sequel_release_date else None,
            'director': director,
            'genre': ', '.join(sequel_genres),
            'description': sequel_description,
            'image_url': sequel_image_url,
            'tmdb_popularity': sequel_popularity
        }

        Sequel.objects.update_or_create(
            title=sequel_title,
            defaults=sequel_defaults
        )

        Sequel.objects.update_or_create(
            movie=movie,
            title=sequel_title,
            defaults=sequel_defaults
        )

class Command(BaseCommand):
    help = 'Populate popular movies and sequels from an external API'

    def handle(self, *args, **kwargs):
        """
        Handle the command execution.

        Args:
            *args: Additional arguments.
            **kwargs: Additional keyword arguments.
        """
        genre_dict = get_genre_dict()

        page = 1
        total_pages = 1

        while page <= total_pages:
            params = {
                'api_key': API_KEY,
                'language': 'en-US',
                'sort_by': 'popularity.desc',  # Sort by popularity to get popular movies
                'page': page,
                'include_adult': 'false'
            }
            data = fetch_json(f'{BASE_URL}{ApiEndpoint.DISCOVER_MOVIE.value}', params)
            total_pages = data.get('total_pages', 1)

            if not data['results']:
                break

            for movie_data in data['results']:
                process_movie(movie_data, genre_dict)

            page += 1

        self.stdout.write(self.style.SUCCESS('Successfully populated popular movies and sequels.'))
