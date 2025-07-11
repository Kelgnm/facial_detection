import os
import sys
import cv2 as cv
import numpy as np
import pickle
import face_recognition
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
image_dir = os.path.join(BASE_DIR, "images")
threshold = 0.6  # Confidence threshold for face recognition

# Load metadata (optional)
with open(os.path.join(BASE_DIR, "data.json"), "r") as f:
    metadata = json.load(f)

# Load saved encodings
with open(os.path.join(BASE_DIR, "labels.pickle"), 'rb') as file:
    data = pickle.load(file)
    known_face_encodings = data["encodings"]
    known_face_names = data["names"]

# Optionally re-encode images from folders
for person_name in os.listdir(image_dir):
    person_folder = os.path.join(image_dir, person_name)
    if not os.path.isdir(person_folder):
        continue
    for filename in os.listdir(person_folder):
        image_path = os.path.join(person_folder, filename)
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_face_encodings.append(encodings[0])
            known_face_names.append(person_name)

# Open camera (adjust index as needed)
img = cv.VideoCapture(1)
if not img.isOpened():
    print(json.dumps({"seen": None, "error": "Camera not opened"}))
    sys.stdout.flush()
    sys.exit(1)

ret, frame = img.read()
img.release()

if not ret:
    print(json.dumps({"seen": None, "error": "No frame captured"}))
    sys.stdout.flush()
    sys.exit(1)

# Resize + convert frame
small_frame = cv.resize(frame, (0, 0), fx=0.25, fy=0.25)
rgb_frame = np.ascontiguousarray(small_frame[:, :, ::-1])

# Detect faces and encode
face_locations = face_recognition.face_locations(rgb_frame)
face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

face_names = []
face_closer = []

for face_encoding in face_encodings:
    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
    if not len(face_distances):
        continue

    best_index = np.argmin(face_distances)
    confidence = 1.0 - face_distances[best_index]

    if confidence >= threshold:
        name = known_face_names[best_index]
    else:
        name = "Unknown"

    face_names.append(name)
    face_closer.append(confidence)

# Determine best match (if any)
selected = None
if face_names and any(name != "Unknown" for name in face_names):
    valid_indices = [i for i, name in enumerate(face_names) if name != "Unknown"]
    if valid_indices:
        best_valid_index = valid_indices[np.argmax([face_closer[i] for i in valid_indices])]
        selected = face_names[best_valid_index]

# Final result to frontend
print(json.dumps({"seen": selected}))
sys.stdout.flush()
sys.exit(0)
