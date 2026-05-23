from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('order', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='location',
            field=models.CharField(max_length=20, choices=[('Luzon', 'Luzon'), ('Visayas', 'Visayas'), ('Mindanao', 'Mindanao')], default='Luzon'),
        ),
        migrations.AddField(
            model_name='order',
            name='assigned_deliverer',
            field=models.CharField(max_length=20, choices=[('Mark', 'Mark'), ('Nyko', 'Nyko'), ('Dominic', 'Dominic'), ('Godwin', 'Godwin')], blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='shipped_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
