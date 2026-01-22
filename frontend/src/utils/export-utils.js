export const exportToCSV = (data, filename) => {
    const emotions = data.emotions;
    const headers = ['Timestamp', 'Emotion', 'Confidence'];
    
    const csvContent = [
      headers.join(','),
      ...emotions.map(e => [
        new Date(e.timestamp).toISOString(),
        e.emotion,
        e.confidence
      ].join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };
  
  export const exportToPDF = async (data, filename) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Emotion Analysis Report', 20, 20);
    
    // Add session info
    doc.setFontSize(12);
    doc.text(`Session Date: ${new Date(data.createdAt).toLocaleString()}`, 20, 30);
    
    // Add emotion data
    let y = 50;
    data.emotions.forEach(e => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `${new Date(e.timestamp).toLocaleTimeString()} - ${e.emotion} (${(e.confidence * 100).toFixed(1)}%)`,
        20,
        y
      );
      y += 10;
    });
    
    doc.save(filename);
  };