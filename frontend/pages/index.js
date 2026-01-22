import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SessionRecorder from '@/components/SessionRecorder/SessionRecorder';
// import HeatmapView from '@/components/HeatmapView/HeatmapView';
import { createSession } from '@/lib/session-manager';
import styles from '@/styles/Home.module.css';
//import ExportData from '@/components/ExportData/ExportData';
import { generateEmotionPDF } from '@/lib/pdf';

const VideoFeed = dynamic(() => import('@/components/VideoFeed/VideoFeed'), {
  ssr: false,
  loading: () => <div>Loading video feed...</div>
});

export default function Home() {
  const [sessionId, setSessionId] = useState(null);
  const [emotionData, setEmotionData] = useState([]);
  const [recordedVideo, setRecordedVideo] = useState(null);
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await createSession('user123');
        setSessionId(session._id);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    
    initSession();
  }, []);

  const handleEmotionDetected = async (emotion) => {
    if (sessionId && emotion) {
      const emotionWithPosition = {
        ...emotion,
        position: {
          x: Math.random() * window.innerWidth, // Replace with actual cursor position
          y: Math.random() * window.innerHeight
        },
        timestamp: new Date()
      };

      setEmotionData(prev => [...prev, emotionWithPosition]);

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/emotions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emotionData: emotionWithPosition })
        });
      } catch (error) {
        console.error('Failed to save emotion:', error);
      }
    }
  };

  const handleRecordingComplete = (blob) => {
    setRecordedVideo(URL.createObjectURL(blob));
  };

  const ExportData = () => {
    const blob = new Blob([JSON.stringify(emotionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion_data_${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (emotionData.length > 0) {
      generateEmotionPDF(emotionData, sessionId);
    } else {
      alert('No data to export!');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Real-time Emotion Detection</h1>
      
      <div className={styles.mainContent}>
        <div className={styles.videoSection}>
          <VideoFeed onEmotionDetected={handleEmotionDetected} />
          <SessionRecorder onRecordingComplete={handleRecordingComplete} />
        </div>
        
        {/* {emotionData.length > 0 && (
          <div className={styles.heatmapSection}>
            <h2>Emotion Heatmap</h2>
            <HeatmapView emotionData={emotionData} />
          </div>
        )} */}

        {recordedVideo && (
          <div className={styles.playbackSection}>
            <h2>Session Playback</h2>
            <video 
              src={recordedVideo} 
              controls 
              className={styles.playbackVideo}
            />
            <div>
            <button onClick={ExportData} className={styles.exportButton}>Export as CSV</button>
            <button onClick={handleExportPDF} className={styles.exportButton}>Export as PDF </button>

            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}