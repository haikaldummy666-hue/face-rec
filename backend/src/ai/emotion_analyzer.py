import cv2 # pyright: ignore[reportMissingImports]
import numpy as np
from tensorflow.keras.models import load_model # pyright: ignore[reportMissingImports]
from transformers import pipeline

class EmotionAnalyzer:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.emotion_model = load_model('models/emotion_model.py')
        self.text_analyzer = pipeline('sentiment-analysis')
    
    def analyze_face(self, image_data):
        # Convert image data to OpenCV format
        nparr = np.fromstring(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Detect faces
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) > 0:
            (x, y, w, h) = faces[0]
            roi_gray = gray[y:y+h, x:x+w]
            roi_gray = cv2.resize(roi_gray, (48, 48))
            roi_gray = roi_gray / 255.0
            roi_gray = np.reshape(roi_gray, (1, 48, 48, 1))
            
            prediction = self.emotion_model.predict(roi_gray)
            return prediction[0]
        
        return None
    
    def analyze_text(self, text):
        result = self.text_analyzer(text)
        return result[0]
    