import { useState, useCallback } from 'react';

export const useEmotionProcessing = (onEmotionDetected) => {
  const [currentEmotion, setCurrentEmotion] = useState(null);

  const processEmotion = useCallback((emotion) => {
    if (emotion) {
      setCurrentEmotion(emotion);
      onEmotionDetected(emotion);
    }
  }, [onEmotionDetected]);

  return {
    currentEmotion,
    processEmotion
  };
};