import requests

def test_public_api():
    base_url = "http://127.0.0.1:8000/api/public/"
    writer_slug = "admin"
    
    # Test retrieve
    url = f"{base_url}{writer_slug}/"
    print(f"Testing GET {url}")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

    # Test with slash
    url_slash = f"{base_url}{writer_slug}"
    print(f"\nTesting GET {url_slash}")
    try:
        response = requests.get(url_slash)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_public_api()
