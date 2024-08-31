# Generated by Django 5.0.7 on 2024-08-18 09:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies_sequels', '0003_movie_tmdb_popularity_movie_user_popularity_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='RatingReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logged_id', models.IntegerField()),
                ('rating', models.IntegerField()),
                ('review', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('movie', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings_and_reviews', to='movies_sequels.movie')),
            ],
            options={
                'unique_together': {('movie', 'logged_id')},
            },
        ),
    ]