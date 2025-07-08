import os
import cv2 as cv

img = cv.VideoCapture(0)
img.set(3,640) # set Width
img.set(4,480) # set Height

face_cascade = cv.CascadeClassifier(
    cv.data.haarcascades + "haarcascade_frontalface_default.xml"
)

face_id = input('\n enter user id end press <return> ==>  ')
face_name = input('\n enter user name end press <return> ==>  ')
print("\n [INFO] Initializing face capture. Look the camera and wait ...")

ids_ = 0

while True:
    ret, frame = img.read()
    gray = cv.cvtColor(frame, cv.COLOR_BGRA2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    for (x,y,w,h) in faces:
        cv.rectangle(frame, (x,y), (x+w,y+h), (255, 0, 0), 2)
        ids_ += 1
        cv.imwrite(str(face_name) + str(face_id) + '.' + str(ids_) + ".png", gray[y:y+h, x:x+w])
        cv.imshow("yea", frame)
    k = cv.waitKey(100) & 0xff
    if k == 27:
        break
    elif ids_ >= 30:
        break

print("\n [INFO] Exiting Program and cleanup stuff")
img.release()
cv.destroyAllWindows()