import React from 'react';
import { Line } from 'react-chartjs-2';
import { chartConfig } from './chartConfig';
import styles from './EmotionChart.module.css';

const EmotionChart = ({ emotionData }) => {
  const data = chartConfig(emotionData);

  return (
    <div className={styles.chartContainer}>
      <Line data={data} />
    </div>
  );
};

export default EmotionChart;