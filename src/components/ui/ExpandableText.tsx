import { useExpandableText, truncateText } from '@/hooks/useExpandableText';
import { sanitizeHtml } from '@/lib/sanitize';
import { useEffect, useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLength: number;
  className?: string;
  style?: React.CSSProperties;
  isHtml?: boolean;
  showOnMobile?: boolean;
}

export function ExpandableText({ 
  text, 
  maxLength, 
  className = '', 
  style = {},
  isHtml = false,
  showOnMobile = true
}: ExpandableTextProps) {
  const { isExpanded, toggleExpanded } = useExpandableText();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // For HTML content, we need to work with the text content for length calculation
  const textContent = isHtml ? text.replace(/<[^>]*>/g, '') : text;
  const { truncated, needsTruncation } = truncateText(textContent, maxLength);

  // Only show expandable behavior on mobile if showOnMobile is true and we're on mobile
  const shouldShowExpandable = showOnMobile && needsTruncation && isMobile;
  
  // For HTML content, we need to truncate the HTML properly
  let displayContent = text;
  if (isHtml && shouldShowExpandable && !isExpanded) {
    // Simple HTML truncation - find the position in original text and cut there
    const truncateIndex = truncated.length;
    let charCount = 0;
    let htmlTruncated = '';
    let inTag = false;
    
    for (let i = 0; i < text.length && charCount < truncateIndex; i++) {
      const char = text[i];
      htmlTruncated += char;
      
      if (char === '<') {
        inTag = true;
      } else if (char === '>') {
        inTag = false;
      } else if (!inTag) {
        charCount++;
      }
    }
    
    displayContent = htmlTruncated;
  }

  if (isHtml) {
    return (
      <div className={className} style={style}>
        <div 
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHtml(displayContent + (shouldShowExpandable && !isExpanded ? '...' : ''))
          }} 
        />
        {shouldShowExpandable && (
          <button
            onClick={toggleExpanded}
            className="transition-colors duration-200"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: '#C5A059', // GOLD_ACCENT
              fontWeight: 600,
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1e3a5f'; // NAVY_PRIMARY
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#C5A059'; // GOLD_ACCENT
            }}
          >
            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}
      </div>
    );
  }

  const displayText = shouldShowExpandable && !isExpanded ? truncated : text;

  return (
    <div className={className} style={style}>
      <p style={{ margin: 0 }}>
        {displayText}
        {shouldShowExpandable && !isExpanded && '...'}
      </p>
      {shouldShowExpandable && (
        <button
          onClick={toggleExpanded}
          className="transition-colors duration-200"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 0',
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: '#C5A059', // GOLD_ACCENT
            fontWeight: 600,
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            display: 'block'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1e3a5f'; // NAVY_PRIMARY
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#C5A059'; // GOLD_ACCENT
          }}
        >
          {isExpanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
}