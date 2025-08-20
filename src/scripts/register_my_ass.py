import sys
import json
import base64
import io
from PIL import Image
import numpy as np
import face_recognition
from db_ass import insert
from server import register

def respond(status: str, message: str):
    print(json.dumps({"status": status, "message": message}))
    sys.exit()

try:
    data = json.load(sys.stdin)
except Exception:
    respond("error", "Invalid JSON input")

name = data.get("name")
role = data.get("role")
password = data.get("password")
image_b64 = data.get("image")
client_ip = data.get("ip")

if not all([name, role, password, image_b64]):
    respond("error", "Missing required fields")

try:
    image_bytes = base64.b64decode(image_b64)
    image = Image.open(io.BytesIO(image_bytes))
    img_array = np.array(image)
except Exception as e:
    respond("error", f"Image decode failed: {e}")

encodings = face_recognition.face_encodings(img_array)
if not encodings:
    respond("error", "No face found")

embedding = encodings[0]

success, message = insert(name, role, password, embedding)
status_str = "success" if success else "error"
respond(status_str, message)
