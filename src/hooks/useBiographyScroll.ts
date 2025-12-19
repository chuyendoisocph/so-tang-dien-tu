import { useMemo } from 'react';

interface BiographyScrollConfig {
  duration: string;
  className: string;
  shouldScroll: boolean;
}

export const useBiographyScroll = (
  biography: string,
  containerHeight: number = 400
): BiographyScrollConfig => {
  return useMemo(() => {
    if (!biography || biography.length < 100) {
      return {
        duration: '0s',
        className: 'no-scroll',
        shouldScroll: false,
      };
    }

    // Calculate based on text length and reading speed
    const wordsCount = biography.split(' ').length;
    const averageReadingSpeed = 200; // words per minute
    const readingTimeMinutes = wordsCount / averageReadingSpeed;
    
    // Add extra time for comfortable reading while scrolling
    const scrollTimeMinutes = readingTimeMinutes * 2.5;
    const scrollTimeSeconds = Math.max(30, Math.min(120, scrollTimeMinutes * 60));

    // Determine class based on content length
    let className = 'medium';
    if (wordsCount < 150) {
      className = 'short';
    } else if (wordsCount < 300) {
      className = 'medium';
    } else if (wordsCount < 500) {
      className = 'long';
    } else {
      className = 'extra-long';
    }

    return {
      duration: `${scrollTimeSeconds}s`,
      className,
      shouldScroll: true,
    };
  }, [biography, containerHeight]);
};

// Utility function to duplicate content for seamless loop
export const createSeamlessContent = (content: string): string => {
  return content + '\n\n' + content;
};

// Calculate if text needs scrolling based on estimated height
export const needsScrolling = (
  text: string,
  containerHeight: number,
  fontSize: number = 24,
  lineHeight: number = 32
): boolean => {
  const wordsCount = text.split(' ').length;
  const averageWordsPerLine = 8; // Estimate based on container width
  const estimatedLines = Math.ceil(wordsCount / averageWordsPerLine);
  const estimatedHeight = estimatedLines * lineHeight;
  
  return estimatedHeight > containerHeight;
};