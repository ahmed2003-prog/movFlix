# Generated by Django 5.0.7 on 2024-07-23 09:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0010_alter_profile_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='expiry_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
