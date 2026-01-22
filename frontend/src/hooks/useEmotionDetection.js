import { useState, useEffect } from 'react';
import { detectEmotion } from '../lib/emotion-detection';

export const useEmotionDetection = (videoRef) => {
  const [emotion, setEmotion] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let animationFrame;
    
    const processFrame = async () => {
      if (!videoRef.current || isProcessing) return;
      
      setIsProcessing(true);
      try {
        const result = await detectEmotion(videoRef.current);
        setEmotion(result);
      } catch (error) {
        console.error('Error in emotion detection:', error);
      } finally {
        setIsProcessing(false);
        animationFrame = requestAnimationFrame(processFrame);
      }
    };

    processFrame();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [videoRef, isProcessing]);

  return { emotion, isProcessing };
};