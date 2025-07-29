import os
import sys
import cv2 as cv
import numpy as np
import pickle
import face_recognition
import json

print("Python being used:", sys.executable, file=sys.stderr)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
threshold = 0

with open(os.path.join(BASE_DIR, "../../react_frontend/public/scripts/data.json"), "r") as f:
    metadata = json.load(f)
    print("Loaded metadata keys:", list(metadata.keys()), file=sys.stderr)

known_face_names = []
known_face_encodings = []

with open(os.path.join(BASE_DIR, "encodings.pkl"), 'rb') as file:
    data = pickle.load(file)
    known_face_encodings = data["encodings"]
    known_face_names = data["names"]

print(f"Loaded {len(known_face_names)} known face names", file=sys.stderr)
print(f"Loaded {len(known_face_encodings)} face encodings", file=sys.stderr)


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
    password = None
    if face_names and any(name != "Unknown" for name in face_names):
        valid_indices = [i for i, name in enumerate(face_names) if name != "Unknown"]
        if valid_indices:
            best_valid_index = valid_indices[np.argmax([face_closer[i] for i in valid_indices])]
            selected = face_names[best_valid_index]

            user_data = metadata.get(selected.lower())
            print(f"[DEBUG] Looking up user: {user_data}", file=sys.stderr)
            if not user_data:
                print(f"User '{selected}' not found in metadata", file=sys.stderr)
            else:
                role = user_data.get("role", "Unknown")
                password = user_data.get("password")
                print(f"[DEBUG] Found user: role={role}, password={password}", file=sys.stderr)

    # print(json.dumps({"seen": "stiliyan", "role": "CEO", "password": "123"}))
    print(f"Detected {len(face_encodings)} faces in frame", file=sys.stderr)
    result = {"seen": selected, "role": role, "password": password}
    print(json.dumps(result))
    sys.stdout.flush()
    sys.exit(0)
