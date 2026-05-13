#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python warehouse_config/manage.py collectstatic --no-input
python warehouse_config/manage.py migrate
