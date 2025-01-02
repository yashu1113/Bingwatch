import { useState, useEffect } from 'react';

type NetworkQuality = 'high' | 'medium' | 'low';

export const useNetworkQuality = () => {
  const [quality, setQuality] = useState<NetworkQuality>('high');

  useEffect(() => {
    const updateNetworkQuality = () => {
      const connection = (navigator as any).connection;
      
      if (!connection) {
        setQuality('high');
        return;
      }

      const effectiveType = connection.effectiveType;
      const saveData = connection.saveData;

      if (saveData) {
        setQuality('low');
      } else if (effectiveType === '4g') {
        setQuality('high');
      } else if (effectiveType === '3g') {
        setQuality('medium');
      } else {
        setQuality('low');
      }
    };

    updateNetworkQuality();

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkQuality);
      return () => connection.removeEventListener('change', updateNetworkQuality);
    }
  }, []);

  return quality;
};