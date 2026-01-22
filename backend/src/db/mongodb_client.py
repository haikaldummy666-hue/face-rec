from pymongo import MongoClient # pyright: ignore[reportMissingImports]
from dotenv import load_dotenv # pyright: ignore[reportMissingImports]
import os
import datetime

load_dotenv()

class MongoDBClient:
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGODB_URI'))
        self.db = self.client.sentiweb
        
    def create_session(self, user_id):
        return self.db.sessions.insert_one({
            'userId': user_id,
            'emotions': [],
            'createdAt': datetime.utcnow() 
        })
    
    def save_emotion(self, session_id, emotion_data):
        return self.db.sessions.update_one(
            {'_id': session_id},
            {'$push': {'emotions': emotion_data}}
        )
    
    def get_session(self, session_id):
        return self.db.sessions.find_one({'_id': session_id})
    