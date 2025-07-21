import os
import sys
import cv2 as cv
import numpy as np
import pickle
import face_recognition
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
image_dir = os.path.join(BASE_DIR, "images")
threshold = 0.6

with open(os.path.join(BASE_DIR, "../../react_frontend/public/scripts/data.json"), "r") as f:
    metadata = json.load(f)

known_face_names = []
known_face_encodings = []

with open(os.path.join(BASE_DIR, "encodings.pkl"), 'rb') as file:
    data = pickle.load(file)
    known_face_encodings = data["encodings"]
    known_face_names = data["names"]

with open(os.path.join(BASE_DIR, "encodings.pkl"), 'wb') as file:
    pickle.dump({"encodings": known_face_encodings, "names": known_face_names}, file)

img = cv.VideoCapture(1)
img.set(cv.CAP_PROP_BUFFERSIZE, 1)

for i in range(5):
    ret, frame = img.read()
    img.release()

    if not ret:
        print(json.dumps({"seen": None, "error": "No frame captured"}))
        sys.stdout.flush()
        sys.exit(1)

    small_frame = cv.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_frame = np.ascontiguousarray(small_frame[:, :, ::-1])

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

    selected = None
    role = None 
    if face_names and any(name != "Unknown" for name in face_names):
        valid_indices = [i for i, name in enumerate(face_names) if name != "Unknown"]
        if valid_indices:
            best_valid_index = valid_indices[np.argmax([face_closer[i] for i in valid_indices])]
            selected = face_names[best_valid_index]
            role = metadata.get(selected.lower(), {}).get("role", "Unknown")

    print(json.dumps({"seen": selected, "role": role}))
    sys.stdout.flush()
    sys.exit(1)
