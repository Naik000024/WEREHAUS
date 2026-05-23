import os
import sys
import django

# Add the 'warehouse_config' subdirectory to Python's system path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'warehouse_config'))

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

# 3. Purge stale standard user records for 'quezonnyko@gmail.com' and username 'naiku'
# so you can register them completely fresh and test the secure SMTP activation flow!
stale_email = Account.objects.filter(email='quezonnyko@gmail.com').first()
if stale_email and not stale_email.is_superuser:
    print("Purging stale standard user record for: quezonnyko@gmail.com")
    stale_email.delete()

stale_username = Account.objects.filter(username='naiku').first()
if stale_username and not stale_username.is_superuser:
    print("Purging stale standard username 'naiku'")
    stale_username.delete()

stale_mimo = Account.objects.filter(username='MIMO').first()
if stale_mimo and not stale_mimo.is_superuser:
    print("Purging stale standard username 'MIMO'")
    stale_mimo.delete()
