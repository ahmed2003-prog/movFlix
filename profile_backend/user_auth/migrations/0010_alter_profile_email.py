# Generated by Django 5.0.7 on 2024-07-23 08:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0009_alter_profile_billing_address_alter_profile_bio_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True, unique=True),
        ),
    ]