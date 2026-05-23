import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warehouse_config.settings')
django.setup()

from user.models import Account

# 1. Promote and activate your existing registered account
u1 = Account.objects.filter(email='quezonnyko16@gmail.com').first()
if u1:
    u1.is_active = True
    u1.is_admin = True
    u1.is_staff = True
    u1.is_superuser = True
    u1.save()
    print("Successfully promoted and activated existing account: quezonnyko16@gmail.com")

# 2. Reset or clean-recreate the backup admin account
u2 = Account.objects.filter(email='quezon.nyko16@gmail.com').first()
if u2 and not u2.is_superuser:
    print("Deleting old non-superuser record for quezon.nyko16@gmail.com...")
    u2.delete()
    u2 = None

if not u2:
    Account.objects.create_superuser('quezon.nyko16@gmail.com', 'admin', 'admin12345')
    print("Successfully created fresh superuser account: quezon.nyko16@gmail.com with password: admin12345")
else:
    u2.is_active = True
    u2.is_admin = True
    u2.is_staff = True
    u2.is_superuser = True
    u2.set_password('admin12345')
    u2.save()
    print("Successfully reset and verified superuser account: quezon.nyko16@gmail.com")
