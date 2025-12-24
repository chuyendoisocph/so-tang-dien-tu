import { useEffect } from 'react';

export const useImagePreloader = (imageUrl: string | undefined) => {
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.src = imageUrl;
    
    // Optional: Add loading states or error handling
    img.onload = () => {
      // Image loaded successfully
    };
    
    img.onerror = () => {
      // Handle image loading error
      console.warn('Failed to preload image:', imageUrl);
    };
  }, [imageUrl]);
};