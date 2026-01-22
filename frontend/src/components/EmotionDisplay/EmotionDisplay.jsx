import React from 'react';
import styles from './EmotionDisplay.module.css';

const EmotionDisplay = ({ emotion }) => {
  if (!emotion) return null;

  return (
    <div className={styles.emotionOverlay}>
      <span className={styles.emotionText}>
        {emotion.emotion} ({Math.round(emotion.confidence * 100)}%)
      </span>
    </div>
  );
};

export default EmotionDisplay;