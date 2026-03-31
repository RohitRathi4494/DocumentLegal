from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Promotes a user to superuser and staff'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='The username to promote')

    def handle(self, *args, **options):
        username = options['username']
        try:
            u = User.objects.get(username=username)
            u.is_staff = True
            u.is_superuser = True
            u.save()
            self.stdout.write(self.style.SUCCESS(f"Successfully promoted {username} to Admin!"))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User '{username}' not found."))
