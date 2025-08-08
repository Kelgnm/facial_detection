import sys
import json
import base64
import numpy as np
import cv2
from cryptography.fernet import Fernet
import face_recognition
import psycopg2

def myprint(*args, **kwargs):
    print(*args, **{**kwargs, "file": sys.stderr})

def decode_image(base64_str: str):
    """Decode a base64-encoded image string to an OpenCV image (BGR)."""
    try:
        myprint("Decoding base64 image")
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        image_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(image_data, np.uint8)
        if nparr.size == 0:
            raise ValueError("Decoded buffer is empty")
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image")
        myprint("Image decoded successfully")
        return img
    except Exception as e:
        myprint(f"[ERROR] Image decode failed: {e}")
        return None

def parse_encoding_vector(vector_str: str) -> np.ndarray:
    """Parse a string representation of a vector tuple into a numpy array."""
    try:
        values = vector_str.strip("()").split(",")
        return np.array([float(x) for x in values], dtype=np.float64)
    except Exception as e:
        myprint(f"[ERROR] Failed to parse encoding vector: {e}")
        return np.array([])

def load_known_faces_from_db():
    """Load known face names, passwords, and encodings from PostgreSQL."""
    try:
        myprint("Connecting to database...")
        conn = psycopg2.connect(
            dbname="face_images",
            user="postgres",
            password="kokostelko123",
            host="localhost",
            port=5432,
        )
        with conn.cursor() as cur:
            cur.execute("SELECT name, password, vec_low, vec_high FROM facess")
            records = cur.fetchall()
        conn.close()

        myprint(f"Loaded {len(records)} known face records from DB")

        known_names = []
        known_passwords = []
        known_encodings = []
        password = None

        for name, password, vec_low, vec_high in records:
            low_vec = parse_encoding_vector(vec_low)
            high_vec = parse_encoding_vector(vec_high)
            if low_vec.size == 0 or high_vec.size == 0:
                myprint(f"Skipping record for {name}: invalid encoding vector")
                continue
            encoding = np.concatenate((low_vec, high_vec))  # 128-dim vector
            known_names.append(name)
            fernet = Fernet(load_key())
            decPass = fernet.decrypt(password.encode()).decode()
            known_passwords.append(decPass)
            known_encodings.append(encoding)

        return known_names, known_passwords, known_encodings
    except Exception as e:
        myprint(f"[ERROR] Failed to load known faces from DB: {e}")
        print(json.dumps({"error": "Database error"}))
        sys.exit(1)

def load_key():
    with open("secret.key", "rb") as f:
        return f.read()

def main():
    raw_input = sys.stdin.read()
    input_data = json.loads(raw_input)

    images_b64_list = input_data.get("images", [])
    if not images_b64_list:
        print(json.dumps({"error": "No images provided"}))
        sys.exit(1)

    embeddings = []
    for idx, base64_image in enumerate(images_b64_list):
        if not base64_image or len(base64_image) < 100:
            myprint(f"Skipping image {idx+1}: base64 string too short or empty")
            continue

        img = decode_image(base64_image)

        # New validation for decoded image
        if img is None:
            myprint(f"Skipping image {idx+1}: decode failed")
            continue
        if img.size == 0 or img.shape[0] == 0 or img.shape[1] == 0:
            myprint(f"Skipping image {idx+1}: image invalid or zero dimension {img.shape}")
            continue

        myprint(f"Image {idx+1} shape: {img.shape}")

        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        try:
            encs = face_recognition.face_encodings(rgb_img)
        except Exception as e:
            myprint(f"[ERROR] face_recognition failed on image {idx+1}: {e}")
            continue

        if encs:
            embeddings.append(encs[0])
        else:
            myprint(f"No face found in image {idx+1}")

    if not embeddings:
        print(json.dumps({"seen": None, "error": "No faces found in images"}))
        sys.exit(0)

    unknown_encoding = np.mean(embeddings, axis=0)

    known_names, known_passwords, known_encodings = load_known_faces_from_db()
    if not known_encodings:
        print(json.dumps({"seen": None, "error": "No known faces in database"}))
        sys.exit(0)

    matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.6)
    face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
    best_match_index = np.argmin(face_distances) if face_distances.size > 0 else None

    myprint(f"face distances: {face_distances}")
    myprint(f"match index: {best_match_index}")
    myprint(f"matches: {matches}")

    if best_match_index is not None and matches[best_match_index]:
        result = {
            "seen": known_names[best_match_index],
            "password": known_passwords[best_match_index]
        }
    else:
        result = {
            "seen": None,
            "error": "No match found"
        }

    print(json.dumps(result))



if __name__ == "__main__":
    main()
