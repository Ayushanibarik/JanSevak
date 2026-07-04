import requests
import os

def download_bhubaneswar_osm():
    # Bounding box for Bhubaneswar
    url = "https://overpass-api.de/api/map?bbox=85.75,20.25,85.88,20.35"
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dest_dir = os.path.join(base_dir, "gis_data")
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, "bhubaneswar.osm")
    
    print(f"Downloading Bhubaneswar OSM data from {url}...")
    try:
        # User-Agent header is polite and prevents 403 on some APIs
        headers = {"User-Agent": "JanMitra-Production-App/1.0"}
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()
        with open(dest_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded successfully to {dest_path}")
        print(f"File size: {os.path.getsize(dest_path) / 1024 / 1024:.2f} MB")
    except Exception as e:
        print("Failed to download:", e)

if __name__ == "__main__":
    download_bhubaneswar_osm()
