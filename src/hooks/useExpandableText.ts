import { useState } from 'react';

export function useExpandableText(initialExpanded = false) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return {
    isExpanded,
    toggleExpanded,
    setIsExpanded
  };
}

export function truncateText(text: string, maxLength: number): { truncated: string; needsTruncation: boolean } {
  if (text.length <= maxLength) {
    return { truncated: text, needsTruncation: false };
  }
  
  // Find the last space before maxLength to avoid cutting words
  const lastSpace = text.lastIndexOf(' ', maxLength);
  const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;
  
  return {
    truncated: text.substring(0, cutPoint),
    needsTruncation: true
  };
}