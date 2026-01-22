import React from 'react';
import { Line } from 'react-chartjs-2';
import styles from './AnalyticsReport.module.css';

const AnalyticsReport = ({ sessionData }) => {
  const emotionData = sessionData.emotions.map(e => ({
    emotion: e.emotion,
    confidence: e.confidence,
    timestamp: new Date(e.timestamp)
  }));

  const chartData = {
    labels: emotionData.map(d => d.timestamp.toLocaleTimeString()),
    datasets: [{
      label: 'Emotion Intensity',
      data: emotionData.map(d => d.confidence),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const frustrationPoints = emotionData.filter(d => 
    d.emotion === 'Frustrasi' && d.confidence > 0.7
  );

  return (
    <div className={styles.reportContainer}>
      <h2>Session Analysis</h2>
      <div className={styles.chart}>
        <Line data={chartData} />
      </div>
      <div className={styles.frustrationPoints}>
        <h3>High Frustration Points</h3>
        <ul>
          {frustrationPoints.map((point, index) => (
            <li key={index}>
              {point.timestamp.toLocaleTimeString()} - 
              Confidence: {(point.confidence * 100).toFixed(1)}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsReport;