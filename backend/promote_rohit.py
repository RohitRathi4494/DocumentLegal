from django.contrib.auth.models import User
try:
    u = User.objects.get(username='Rohit')
    u.is_staff = True
    u.is_superuser = True
    u.save()
    print(f"Successfully promoted {u.username} to Admin!")
except User.DoesNotExist:
    print("User 'Rohit' not found.")
except Exception as e:
    print(f"Error: {e}")
