import jsPDF from 'jspdf';

export const generateEmotionPDF = (emotionData, sessionId) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Emotion Data Export', 14, 20);
  
  doc.setFontSize(12);
  let yPos = 30;
  
  emotionData.forEach((emotion, index) => {
    const emotionText = `
      ${index + 1}. Emotion: ${emotion.type}
      Confidence: ${emotion.confidence}%
      Position: (${emotion.position.x.toFixed(2)}, ${emotion.position.y.toFixed(2)})
      Timestamp: ${new Date(emotion.timestamp).toLocaleString()}
    `;
    
    doc.text(emotionText, 14, yPos);
    yPos += 30;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  doc.save(`emotion_data_${sessionId}.pdf`);
};
