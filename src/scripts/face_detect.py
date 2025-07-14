import cv2
import os
import sys
import json
import time
from PIL import Image

# Read arguments
user_id = sys.argv[1]
name = sys.argv[2]

# Folder where images will be stored
base_dir = os.path.join(os.path.dirname(__file__), "images")
user_dir = os.path.join(base_dir, name)

# Create directory if it doesn't exist
os.makedirs(user_dir, exist_ok=True)

# Start webcam
cap = cv2.VideoCapture(1)
if not cap.isOpened():
    print(json.dumps({ "status": "error", "message": "Cannot open camera" }))
    sys.exit(1)

count = 0
captured_ids = []

while count < 30:
    ret, frame = cap.read()
    if not ret:
        print(json.dumps({ "status": "error", "message": "Failed to grab frame" }))
        sys.exit(1)

    img_filename = f"{int(time.time())}.png" 
    img_path = os.path.join(user_dir, img_filename)
    cv2.imwrite(img_path, frame)
    captured_ids.append(img_filename)

    count += 1
    cv2.waitKey(100)


if captured_ids in user_dir:
    print("Its the same picture, stopping recording")
    sys.exit(1)

cap.release()


print(json.dumps({
    "status": "success",
    "message": f"Captured {count} images for {name}",
    "files": captured_ids
}))
sys.stdout.flush()
