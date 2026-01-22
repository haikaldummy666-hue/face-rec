import React, { useRef, useEffect } from 'react';
import { detectEmotion } from '../../lib/emotion-detection';
import styles from './VideoFeed.module.css';

export const VideoFeed = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    startVideo();
  }, []);

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={styles.video}
      />
    </div>
  );
};