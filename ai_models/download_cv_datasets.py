import os
import subprocess

def download_cv_datasets(output_dir: str):
    """
    Downloads computer vision datasets for Pothole classification
    from free public GitHub repositories without requiring any API keys.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    datasets = {
        "potholes": "https://github.com/vishwesh5/Pothole-Detection-Dataset.git"
    }
    
    for name, repo_url in datasets.items():
        print(f"Downloading {name} dataset from {repo_url}...")
        try:
            repo_dir = os.path.join(output_dir, name)
            if not os.path.exists(repo_dir):
                subprocess.run(["git", "clone", repo_url, repo_dir], check=True)
                print(f"Successfully downloaded {name} to {repo_dir}")
            else:
                print(f"Dataset {name} already exists.")
        except Exception as e:
            print(f"Failed to download {name}: {e}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "datasets")
    download_cv_datasets(dataset_dir)
