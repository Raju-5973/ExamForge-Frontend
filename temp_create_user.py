import os
import sys

sys.path.append(r'C:\ExamForge\examforge_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'examforge_backend.settings')

import django

django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile, Institution

u, created = User.objects.get_or_create(
    username='ai_test_user',
    defaults={'email': 'ai_test_user@example.com', 'first_name': 'AI Test'}
)
u.set_password('TestPass123!')
u.save()

p, _ = UserProfile.objects.get_or_create(
    user=u,
    defaults={'role': 'staff', 'display_username': 'AI Tester', 'department': 'Computer Science'}
)
p.role = 'staff'
p.display_username = 'AI Tester'
p.department = 'Computer Science'
inst, _ = Institution.objects.get_or_create(name='Default Institution', defaults={'code': 'DEFAULT'})
p.institution = inst
p.save()

print('USER', u.email, 'PASS', 'TestPass123!', 'ROLE', p.role)
