from ultralytics import YOLO
import os

def train_yolo_civic_issues():
    """
    Trains a YOLOv8 nano model on custom Indian Civic Issues datasets 
    (Potholes and Garbage). This pipeline assumes datasets are present 
    in the YOLO format under `datasets/civic_issues`.
    """
    # Load a pretrained YOLOv8 nano model (fast for local training)
    model = YOLO('yolov8n.pt')
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_yaml = os.path.join(base_dir, 'datasets', 'data.yaml')
    
    if not os.path.exists(data_yaml):
        print(f"Warning: Dataset config {data_yaml} not found.")
        print("Please ensure datasets are downloaded and formatted correctly.")
        print("To proceed for free, manually extract pothole data here and run this script.")
        return

    print("Starting YOLOv8 Training Pipeline for Indian Civic Issues...")
    results = model.train(
        data=data_yaml,
        epochs=50,
        imgsz=640,
        batch=16,
        name='civic_issues_v1'
    )
    
    print("Training complete. Model saved to 'runs/detect/civic_issues_v1/weights/best.pt'")

if __name__ == '__main__':
    train_yolo_civic_issues()
