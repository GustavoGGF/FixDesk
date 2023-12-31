# Generated by Django 4.2.1 on 2023-10-31 16:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('helpdesk', '0006_alter_supportticket_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='supportticket',
            name='company_new_user',
            field=models.TextField(blank=True, max_length=15),
        ),
        migrations.AddField(
            model_name='supportticket',
            name='copy_profile_new_user',
            field=models.TextField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='supportticket',
            name='cost_center',
            field=models.IntegerField(default=False),
        ),
        migrations.AddField(
            model_name='supportticket',
            name='job_title_new_user',
            field=models.TextField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='supportticket',
            name='machine_new_user',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='supportticket',
            name='name_new_user',
            field=models.TextField(blank=True, max_length=15),
        ),
        migrations.AddField(
            model_name='supportticket',
            name='software_new_user',
            field=models.TextField(blank=True, max_length=300),
        ),
        migrations.AddField(
            model_name='supportticket',
            name='start_work_new_user',
            field=models.TextField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='supportticket',
            name='where_from',
            field=models.TextField(blank=True, max_length=30),
        ),
    ]
