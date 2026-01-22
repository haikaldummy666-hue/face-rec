from transformers import pipeline

class TextAnalyzer:
    def __init__(self):
        self.text_analyzer = pipeline('sentiment-analysis')
    
    def analyze_text(self, text):
        result = self.text_analyzer(text)
        return result[0]
        