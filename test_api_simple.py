import urllib.request
import json

def test_api():
    url = "http://127.0.0.1:8000/api/public/admin/"
    print(f"Fetching {url}...")
    try:
        with urllib.request.urlopen(url) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(f"Body: {body}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
