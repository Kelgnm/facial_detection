import cv2 as cv
from flask import Flask, Response


app = Flask(__name__)
img = cv.VideoCapture(0)

def camera():
    while True:
        ret, frame = img.read()
        if not ret:
            break
        else:
            rett, buffer = cv.imencode('.png', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/png\r\n\r\n' + frame + b'\r\n')

@app.route('/video')
def video():
    return Response(camera(), mimetype='multipart/x-mixed-replace; boundary=frame')

app.run(host='0.0.0.0', port=5000)