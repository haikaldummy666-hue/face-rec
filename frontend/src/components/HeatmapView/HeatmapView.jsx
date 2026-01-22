import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const HeatmapView = ({ emotionData }) => {
  const containerRef = useRef(null);
  const heatmapRef = useRef(null);

  useEffect(() => {
    const initHeatmap = async () => {
      if (typeof window !== 'undefined' && containerRef.current && !heatmapRef.current) {
        const h337 = (await import('heatmap.js')).default;
        heatmapRef.current = h337.create({
          container: containerRef.current,
          radius: 30,
          maxOpacity: 0.6,
          minOpacity: 0,
          blur: 0.75
        });
      }
    };
    initHeatmap();
  }, []);

  useEffect(() => {
    if (heatmapRef.current && emotionData.length > 0) {
      const points = emotionData.map(data => ({
        x: Math.floor(data.position.x),
        y: Math.floor(data.position.y),
        value: data.confidence
      }));

      heatmapRef.current.setData({
        max: 1,
        data: points
      });
    }
  }, [emotionData]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '300px', position: 'relative' }}
    />
  );
};

export default dynamic(() => Promise.resolve(HeatmapView), {
  ssr: false
});