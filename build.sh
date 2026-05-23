#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python warehouse_config/manage.py collectstatic --no-input
python warehouse_config/manage.py migrate

# Automatically create a superuser for Render's free tier
python warehouse_config/manage.py shell -c "from user.models import Account; Account.objects.filter(email='quezon.nyko16@gmail.com').exists() or Account.objects.create_superuser('quezon.nyko16@gmail.com', 'admin', 'admin12345')"

# Automatically promote your existing account to admin
python warehouse_config/manage.py shell -c "from user.models import Account; Account.objects.filter(email='quezonnyko16@gmail.com').update(is_admin=True, is_staff=True, is_superuser=True)"
