import React, { useRef, useEffect } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { useEmotionProcessing } from '../../hooks/useEmotionProcessing';
import { detectEmotion, initializeDetection } from '../../lib/emotion-detection';
import EmotionDisplay from '../EmotionDisplay/EmotionDisplay';
import styles from './VideoFeed.module.css';

const VideoFeed = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { error } = useWebcam(videoRef);
  const { currentEmotion, processEmotion } = useEmotionProcessing(onEmotionDetected);

  useEffect(() => {
    let animationFrame;
    let lastProcessTime = 0;
    const DETECTION_INTERVAL = 500; // milliseconds (500ms = 2 per second)
    
    const processFrame = async () => {
      const now = Date.now();
      if (videoRef.current?.readyState === 4 && now - lastProcessTime >= DETECTION_INTERVAL) {
        try {
          const result = await detectEmotion(videoRef.current);
          processEmotion(result);
          lastProcessTime = now;
        } catch (error) {
          console.error('Error detecting emotion:', error);
        }
      }
      animationFrame = requestAnimationFrame(processFrame);
    };

    initializeDetection().then(() => {
      processFrame();
    });

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [processEmotion]);

  if (error) {
    return <div className={styles.error}>Error accessing webcam: {error}</div>;
  }

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={styles.video}
      />
      <canvas ref={canvasRef} className={styles.canvas} />
      <EmotionDisplay emotion={currentEmotion} />
    </div>
  );
};

export default VideoFeed;