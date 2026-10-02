import urllib.request
import json

endpoints = [
    'http://localhost:5000/api/health',
    'http://localhost:5000/api/employees',
    'http://localhost:5000/api/change-requests',
    'http://localhost:5000/api/recruitment/open-positions',
    'http://localhost:5000/api/performance/group-d/evaluations',
    'http://localhost:5000/api/performance/general/goals',
    'http://localhost:5000/api/performance/faculty/eligibility',
    'http://localhost:5000/api/metrics'
]

for ep in endpoints:
    try:
        req = urllib.request.urlopen(ep)
        status = req.status
        content_type = req.headers.get('Content-Type', '')
        raw = req.read()
        print(f'SUCCESS [{status}] {ep} ({len(raw)} bytes)')
    except Exception as e:
        print(f'FAIL {ep}: {e}')

try:
    req = urllib.request.urlopen('http://localhost:5000/')
    html = req.read().decode('utf-8')
    print('SUCCESS [200] Frontend SPA Index (Contains #root:', ('id="root"' in html), ')')
except Exception as e:
    print('FAIL frontend:', e)
