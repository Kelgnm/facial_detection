import sys
import json
import base64
import io
import cv2
import numpy as np
import face_recognition
from PIL import Image
from db_ass import insert

raw_input = sys.stdin.read()
if not raw_input.strip():
    print(json.dumps({"status": "error", "message": "No input data"}))

data = json.loads(raw_input)

user_id = data["user_id"]
name = data["name"]
role = data["role"]
password = data["password"]
image_b64 = data["image"]

print(f"[DEBUG] Got data: id={user_id}, name={name}, role={role}", file=sys.stderr)

try:
    image_bytes = base64.b64decode(image_b64)
    if not image_bytes:
        raise ValueError("Image decode failed (empty bytes)")
except Exception as e:
    print(json.dumps({"status": "error", "message": f"Base64 decode failed: {e}"}))

image = Image.open(io.BytesIO(image_bytes))
img_array = np.array(image)

print("[DEBUG] Image decoded, running face_recognition...", file=sys.stderr)

encodings = face_recognition.face_encodings(img_array)
if not encodings:
    print(json.dumps({"status": "error", "message": "No face found"}))

embedding = encodings[0]
success, message = insert(name, role, password, embedding)


print("[DEBUG] Insert successful!", file=sys.stderr)
print(json.dumps({"status": success, "message": message}))
