import face_recognition
import cv2 as cv
import os

def recording(cam_index=1):
    img = cv.VideoCapture(cam_index)
    img.set(cv.CAP_PROP_FRAME_HEIGHT, 480)
    img.set(cv.CAP_PROP_FRAME_WIDTH, 640)


    for i in range(5):
        img.read()

    ret, frame = img.read()
    img.release()

    if not ret:
        raise RuntimeError("Failed to capture image from camera.")
    
    return frame

def encoding(image):
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        raise ValueError("No face detected")
    return encodings[0]

def split(embedding):
    return embedding[:64], embedding[64:]
        