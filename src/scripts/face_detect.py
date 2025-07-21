import cv2 as cv
import os
import sys
import json
import face_recognition
import pickle

if len(sys.argv) < 5:
    print(json.dumps({
        "status": "error",
        "message": "missing key components: name, role, data_path"
    }))
    sys.exit(1)

user_id = sys.argv[1]
name = sys.argv[2]
role = sys.argv[3]
password = sys.argv[4]
data_path = sys.argv[5]

base_dir = os.path.join(os.path.dirname(__file__), "images")
user_dir = os.path.join(base_dir, name)
data_path = os.path.join(os.path.dirname(__file__), "../../react_frontend/public/scripts/data.json")

known_face_encodings = []
known_face_names = []

for person_name in os.listdir(base_dir):
    person_dir = os.path.join(base_dir, person_name)
    if not os.path.isdir(person_dir):
        continue

    for filename in os.listdir(person_dir):
        if filename.lower().endswith((".png", ".jpg")):
            filepath = os.path.join(person_dir, filename)
            try:
                image = face_recognition.load_image_file(filepath)
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    known_face_encodings.append(encodings[0])
                    known_face_names.append(person_name)
            except Exception as e:
                continue

with open(os.path.join(os.path.dirname(__file__), "encodings.pkl"), "wb") as f:
    pickle.dump({
        "encodings": known_face_encodings,
        "names": known_face_names
    }, f)


if not os.path.exists(data_path):
    with open(data_path, 'w') as filee:
        json.dump({}, filee)

with open(data_path, 'r') as filee:
    try:
        data = json.load(filee)
    except json.JSONDecodeError:
        data = {}

if name in data:
    print(json.dumps({
        "status": "error",
        "message": "name already exists in data.json"
    }))
    sys.exit(1)
elif any(entry.get("role") == role for entry in data.values()):
    print(json.dumps({
        "status": "error",
        "message": "role already exists in data.json"
    }))
    sys.exit(1)
elif any(entry.get("password") == password for entry in data.values()):
    print(json.dumps({
        "status": "error",
        "message": "password already exists in data.json"
    }))
    sys.exit(1)

img = cv.VideoCapture(1)

img.set(cv.CAP_PROP_FRAME_HEIGHT, 480)
img.set(cv.CAP_PROP_FRAME_WIDTH, 640)

for i in range(10):
    img.read()

ret, frame = img.read()
img.release()

if not ret:
    print(json.dumps({ "status": "error", "message": "Cannot open camera" }))
    sys.exit(1)

os.makedirs(user_dir, exist_ok=True)
last_image = os.path.join(user_dir, "temporary_file.jpg")
cv.imwrite(last_image, frame)

try:
    new_image = face_recognition.load_image_file(last_image)
    encoding_new_image = face_recognition.face_encodings(new_image)
except Exception:
    os.remove(last_image)
    print(json.dumps({"status": "error", "message": "Invalid image"}))
    sys.exit(1)

if not encoding_new_image:
    os.remove(last_image)
    print(json.dumps({ "status": "error", "message": "No face detected in camera frame" }))
    sys.exit(1)

new_encodings = encoding_new_image[0]

duplication = None

for folder in os.listdir(base_dir):
    folder_path = os.path.join(base_dir, folder)

    if folder == name or not os.path.isdir(folder_path):
        continue
    elif folder == role or not os.path.isabs(folder_path):
        continue
    elif folder == password or not os.path.isabs(folder_path):
        continue

    for file in os.listdir(folder_path):
        if not file.lower().endswith((".png", ".jpg")):
            continue

        try:
            image_path = os.path.join(folder_path, file)
            it_exists = face_recognition.load_image_file(image_path)
            it_exists_encodings = face_recognition.face_encodings(it_exists)
            
            if it_exists_encodings:
                match = face_recognition.compare_faces([it_exists_encodings[0]], new_encodings, tolerance=0.5)[0]
                if match:
                    duplication = folder
                    break
            
        except Exception:
            continue
    if duplication:
        break

if duplication:
    os.remove(last_image)
    print(json.dumps({
        "status": "error",
        "message": f"Face already registered as '{duplication}'"
    }))
    sys.exit(1)

img = cv.VideoCapture(1)

count = 0
captured_ids = []

while count < 30:
    ret, frame = img.read()
    if not ret:
        sys.exit(1)

    img_filename = f"{count}.png" 
    img_path = os.path.join(user_dir, img_filename)
    cv.imwrite(img_path, frame)
    captured_ids.append(img_filename)
    count += 1
    cv.waitKey(100)

img.release()

try:
    if os.path.exists(data_path):
        with open(data_path, 'r') as file:
            data = json.load(file)
    else:
        data = {}

except Exception:
    print(json.dumps({ "status": "error", "message": f"Failed to write data.json: {str(Exception)}" }))
    sys.exit(1)

data[name] = {         
    "name": name,
    "role": role,
    "password": password
}

result = {
    "status": "success",
    "message": f"Registered {image_path} images"
}
print(json.dumps(result))

try:
    with open(data_path, 'w') as file:
        json.dump(data, file, indent=2)
except Exception as e:
    sys.stdout.write(json.dumps({ "status": "error", "message": f"Failed to write to data.json: {str(e)}" }))
    sys.stdout.flush()
