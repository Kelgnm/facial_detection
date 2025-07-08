import os
import face_recognition
import cv2 as cv
import pickle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
image_dir = os.path.join(BASE_DIR, "images")

face_cascade = cv.CascadeClassifier(
    cv.data.haarcascades + "haarcascade_frontalface_default.xml"
)
recognizer = cv.face.LBPHFaceRecognizer_create()

known_face_encodings = []
known_face_names = []

# def getimagesandlabels(image_dir):
#     imagesPath = [os.path.join(image_dir,f) for f in os.listdir(image_dir)]
#     for imagePath in imagesPath:
#         PIL_image = Image.open(imagePath).convert('L')
#         img_numpy = np.array(PIL_image,'uint8')
#         id = int(os.path.split(imagePath)[-1].split(".")[1])
#         faces = face_cascade.detectMultiScale(img_numpy)
#         for(x,y,w,h) in faces:
#             y_labels.append(img_numpy[y:y+h,x:x+w])
#             x_train.append(id)
#     return y_labels, x_train
    

for root, dirs, files in os.walk(image_dir):
    for file in files:
        if file.endswith("png") or file.endswith("jpg"):
            path = os.path.join(root, file)
            label = os.path.basename(root).replace(" ", "-").lower()
            #print(label, path)
            # if not label in label_ids:
            #     label_ids[label] = current_id
            #     current_id += 1
            # id_ = label_ids[label]
            #print(label_ids)
            #y_labels.append(label) # some number
            #x_train.append(path) # verify this image, turn into NUMPY array

            image = face_recognition.load_image_file(path)
            encodings = face_recognition.face_encodings(image)

            if len(encodings) > 0:
                known_face_encodings.append(encodings[0])
                known_face_names.append(label)
            else:
                print(f"[WARNING] No faces found in {path}")

#             pil_image = Image.open(path).convert("L") #grayscale
#             size = (550, 550)
#             final_image = pil_image.resize(size, PIL.Image.LANCZOS)
#             image_array = np.array(final_image, "uint8")
#             #print(image_array)
#             faces = face_cascade.detectMultiScale(image_array, scaleFactor=1.5, minNeighbors=5)

#             for (x,y,w,h) in faces:
#                 roi = image_array[y:y+h, x:x+w]
#                 x_train.append(roi)
#                 y_labels.append(id_)

#print(x_train)
#print(y_labels) # printing for ids/details

data = {"encodings": known_face_encodings, "names": known_face_names}
with open("labels.pickle", 'wb') as file:
    pickle.dump(data, file)

print (f"[INFO] Saved {len(known_face_encodings)} face encodings.")
# Save the model into trainer/trainer.ymls
