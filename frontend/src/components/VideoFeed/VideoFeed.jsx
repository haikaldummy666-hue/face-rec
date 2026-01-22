import React, { useRef, useEffect } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { useEmotionProcessing } from '@/hooks/useEmotionProcessing';
import { detectEmotion, initializeDetection } from '@/lib/emotion-detection';
import EmotionDisplay from '@/components/EmotionDisplay/EmotionDisplay';
import styles from './VideoFeed.module.css';

const VideoFeed = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { error } = useWebcam(videoRef);
  const { currentEmotion, processEmotion } = useEmotionProcessing(onEmotionDetected);

  useEffect(() => {
    let animationFrame;
    
    const processFrame = async () => {
      if (videoRef.current?.readyState === 4) {
        try {
          const result = await detectEmotion(videoRef.current);
          processEmotion(result);
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