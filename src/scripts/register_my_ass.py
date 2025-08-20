import warnings
warnings.filterwarnings("ignore")

import sys
import json
import base64
import io
from PIL import Image
import numpy as np
import face_recognition
from db_ass import insert

def log(msg):
    sys.stderr.write(msg + "\n")
    sys.stderr.flush()

def respond(status, message):
    sys.stdout.write(json.dumps({"status": status, "message": message}))
    sys.stdout.flush()
    sys.exit(0)

try:
    data = json.load(sys.stdin)
except Exception as e:
    log(f"JSON parse error: {e}")
    respond("error", "Invalid JSON input")

try:
    name = data["name"]
    role = data["role"]
    password = data["password"]
    image_b64 = data["image"]
except KeyError as e:
    respond("error", f"Missing field: {e}")

try:
    image_bytes = base64.b64decode(image_b64)
    image = Image.open(io.BytesIO(image_bytes))
    img_array = np.array(image)
except Exception as e:
    log(f"Image decode error: {e}")
    respond("error", "Invalid image")

try:
    encodings = face_recognition.face_encodings(img_array)
    if not encodings:
        respond("error", "No face found in the image")
    embedding = encodings[0]
except Exception as e:
    log(f"Face encoding error: {e}")
    respond("error", "Face encoding failed")

try:
    success, msg = insert(name, role, password, embedding, log)
    respond("success" if success else "error", msg)
except Exception as e:
    log(f"Database error: {e}")
    respond("error", "Database insert failed")
