# Generated by Django 5.0.7 on 2024-07-23 18:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0011_alter_profile_expiry_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='expiry_date',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
