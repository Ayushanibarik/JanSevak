import os
import requests
from tqdm import tqdm

def download_file(url: str, dest_path: str):
    """
    Downloads a file with a progress bar.
    """
    response = requests.get(url, stream=True)
    response.raise_for_status()
    total_size = int(response.headers.get('content-length', 0))
    
    with open(dest_path, 'wb') as file, tqdm(
        desc=os.path.basename(dest_path),
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            bar.update(size)

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    gis_dir = os.path.join(base_dir, "gis_data")
    os.makedirs(gis_dir, exist_ok=True)
    
    # URL for India OSM PBF (Free from Geofabrik)
    osm_url = "https://download.geofabrik.de/asia/india-latest.osm.pbf"
    dest_path = os.path.join(gis_dir, "india-latest.osm.pbf")
    
    print("Downloading India OSM Data (This may take a while)...")
    try:
        download_file(osm_url, dest_path)
        print(f"Successfully downloaded to {dest_path}")
        print("Note: Run 'osm2pgsql' to import this into your PostGIS database.")
    except Exception as e:
        print(f"Failed to download GIS data: {e}")

if __name__ == "__main__":
    main()
