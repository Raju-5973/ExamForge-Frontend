import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'examforge_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'examforge_backend.settings')
django.setup()

from questions.models import Question
from users.models import UserProfile

print(f"Total questions: {Question.objects.count()}")
print(f"Deleted questions: {Question.objects.filter(is_deleted=True).count()}")
print(f"Questions with department=None: {Question.objects.filter(department__isnull=True).count()}")

for q in Question.objects.all()[:10]:
    print(f"ID: {q.id}, Subject: {q.subject}, Dept: {q.department}, Deleted: {q.is_deleted}")

print("\nUser Profiles:")
for p in UserProfile.objects.all():
    print(f"User: {p.user.username}, Role: {p.role}, Dept: {p.department}")
