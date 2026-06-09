import json
import urllib.request

url = 'http://127.0.0.1:8000/api/questions/generate_ai/'
token = '658f84085249c78946905c80f5a4cb88303a7d81'
body = json.dumps({
    'topic': 'Photosynthesis',
    'difficulty': 'Easy',
    'marks': 5,
    'question_type': 'Short Questions',
    'count': 2,
}).encode('utf-8')

req = urllib.request.Request(
    url,
    data=body,
    headers={
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json',
    },
    method='POST',
)

with urllib.request.urlopen(req) as resp:
    print('STATUS', resp.status)
    print(resp.read().decode('utf-8'))
