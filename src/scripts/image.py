import os
import cv2 as cv
import numpy as np
import pickle
import face_recognition
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "data.json"), "r") as f:
    metadata = json.load(f)

# recognizer = cv.face.LBPHFaceRecognizer_create()
# recognizer.read("trainner.yml")


# labels = {"person_name": 1}
with open(os.path.join(BASE_DIR, "labels.pickle"), 'rb') as file:
    data = pickle.load(file)
    known_face_encodings = data["encodings"]
    known_face_names = data["names"]


ip = "rtsp://admin:Hik123456@192.168.10.135:554/Streaming/Channels/102/"
img = cv.VideoCapture(0)

image_dir = os.path.join(BASE_DIR, "images")

# kamen = face_recognition.load_image_file("images/kamen_1/Kamen.png")
# kamen_encoded = face_recognition.face_encodings(kamen)[0]

# stile = face_recognition.load_image_file("images/stiliyan-penchev/Stile.png")
# stilde_encoded = face_recognition.face_encodings(stile)[0]

# face_classifier = cv.CascadeClassifier(
#     cv.data.haarcascades + "haarcascade_frontalface_default.xml"
# )

# if not img.isOpened():
#     print("No streaming :(, existing. . .")
#     exit()

known_face_encodings = []
known_face_names = []

person_data = {}
seen_people = set()
face_locations = []
face_encodings = []
face_names = []
processed = True

while True:
    # capture frame-by-frame
    ret, frame = img.read()
    # gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    # faces = face_classifier.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(20, 20))

    for person_name in os.listdir(image_dir):
        person_folder = os.path.join(image_dir, person_name)

        if not os.path.isdir(person_folder):
            continue

        for filename in os.listdir(person_folder):
            image_path = os.path.join(person_folder, filename)

            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)

            if len(encodings) > 0:
                known_face_encodings.append(encodings[0])
                known_face_names.append(person_name)

    if processed:

        small_frame = cv.resize(frame, (0, 0), fx=0.25, fy=0.25)

        rgb_frame = np.ascontiguousarray(small_frame[:, :, ::-1])

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        face_names = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            name = "Unknown"
            

            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            best_match = np.argmin(face_distances)
            if matches[best_match]:
                name = known_face_names[best_match]
                person_data = metadata.get(name.lower(), {})

            face_names.append(name)
    processed = not processed

    if person_data and name not in seen_people:
        print(f"[INFO] {name} - {person_data['role']}")
        print(f"Facebook: {person_data['facebook']}")
        print(f"Camera has seen {name}")
        seen_people.add(name)


    for(top, right, bottom, left), name in zip(face_locations, face_names):
        
        # roi_gray = gray[y:y+h, x:x+w]
        # roi_color = frame[y:y+h, x:x+w]
        #print(x,y,w,h)        
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        # recognizer
        # id_, conf = recognizer.predict(roi_gray)
        # if conf >= 4  and conf <= 85:
            #print(id_)
        cv.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
        cv.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv.FILLED)
        font = cv.FONT_HERSHEY_DUPLEX
        cv.putText(frame, name, (left + 6, bottom), font, 1.0, (255, 255, 255), 1)
        # BOX TO CAPTURE MY FACE
        
        img_item = "my-image.png"
        # cv.imwrite(img_item, roi_gray)

        # if it fucking exists
    if not ret:
        print("No frame :(, exiting. . .")
        break

    cv.imshow("Work dammit", frame)
    if cv.waitKey(1) & 0xff == ord('q'):
        break

img.release()
cv.destroyAllWindows()
print("I see youuuuu *spy noises*", json.dumps({"seen": name}))
