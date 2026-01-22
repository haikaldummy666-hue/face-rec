import * as faceapi from 'face-api.js';

let isModelLoaded = false;

const MODEL_URL = '/models';

export const initializeDetection = async () => {
  if (typeof window === 'undefined') {
    console.log('Running on server, skipping model initialization');
    return false;
  }

  if (!isModelLoaded) {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.load(MODEL_URL),
        faceapi.nets.faceExpressionNet.load(MODEL_URL)
      ]);
      console.log('Face detection models loaded successfully');
      isModelLoaded = true;
    } catch (error) {
      console.error('Error loading face detection models:', error);
      throw error;
    }
  }
  return isModelLoaded;
};

export const detectEmotion = async (videoElement) => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isModelLoaded) {
    await initializeDetection();
  }

  try {
    const detection = await faceapi
      .detectSingleFace(
        videoElement,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
      )
      .withFaceExpressions();

    if (detection) {
      const expressions = detection.expressions;
      const dominantEmotion = Object.entries(expressions)
        .reduce((prev, current) => (prev[1] > current[1] ? prev : current));
      
      return {
        emotion: dominantEmotion[0],
        confidence: dominantEmotion[1]
      };
    }
  } catch (error) {
    console.error('Error during emotion detection:', error);
  }

  return null;
};