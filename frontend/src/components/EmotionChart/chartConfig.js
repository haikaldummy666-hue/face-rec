import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const chartConfig = (emotionData) => ({
  labels: emotionData.map(d => d.timestamp),
  datasets: [{
    label: 'Emotion Intensity',
    data: emotionData.map(d => d.intensity),
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
});