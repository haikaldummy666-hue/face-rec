import { useEffect, useState } from 'react';

export const useWebcam = (videoRef) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError(err.message);
        console.error('Error accessing webcam:', err);
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { error };
};