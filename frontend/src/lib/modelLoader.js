import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export const loadRequiredModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.load(MODEL_URL),
      faceapi.nets.faceExpressionNet.load(MODEL_URL)
    ]);
    console.log('Face detection models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    return false;
  }
};