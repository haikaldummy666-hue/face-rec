import React, { useState, useRef, useEffect } from 'react';
import styles from './SessionRecorder.module.css';

const SessionRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingComplete(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className={styles.recorderContainer}>
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default SessionRecorder;