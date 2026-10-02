import urllib.request

urls = [
    'http://localhost:5000/api/health',
    'http://localhost:5000/assets/tnu-logo.jpg',
    'http://localhost:5000/assets/tnu-campus-banner.webp',
    'http://localhost:5000/'
]

for u in urls:
    try:
        res = urllib.request.urlopen(u)
        data = res.read()
        print(f"OK [{res.status}] {u} ({len(data)} bytes, Content-Type: {res.headers.get('Content-Type')})")
    except Exception as e:
        print(f"FAIL {u}: {e}")
