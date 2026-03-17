import urllib.request
import json

def test_api():
    base_url = "http://127.0.0.1:8000/api/"
    endpoints = ["public/admin/", "document-types/"]
    
    for ep in endpoints:
        url = base_url + ep
        print(f"Fetching {url}...")
        try:
            with urllib.request.urlopen(url) as response:
                status = response.getcode()
                body = response.read().decode('utf-8')
                print(f"Status: {status}")
                print(f"Body: {body[:100]}...")
        except urllib.error.HTTPError as e:
            print(f"HTTP Error {e.code}: {e.reason}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
