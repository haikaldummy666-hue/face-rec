import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SessionRecorder from '../src/components/SessionRecorder/SessionRecorder';
// import HeatmapView from '../src/components/HeatmapView/HeatmapView';
import { createSession } from '../src/lib/session-manager';
import styles from '../src/styles/Home.module.css';
//import ExportData from '../src/components/ExportData/ExportData';
import { generateEmotionPDF } from '../src/lib/pdf';

const VideoFeed = dynamic(() => import('../src/components/VideoFeed/VideoFeed'), {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className={styles.title}>Real-time Emotion Detection</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/dashboard">
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Back to Dashboard
            </button>
          </Link>
          <Link href="/analytics">
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Analytics
            </button>
          </Link>
        </div>
      </div>
      
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
