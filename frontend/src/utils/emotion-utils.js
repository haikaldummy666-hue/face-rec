export const formatEmotionData = (emotion, timestamp = new Date()) => ({
  ...emotion,
  timestamp
});