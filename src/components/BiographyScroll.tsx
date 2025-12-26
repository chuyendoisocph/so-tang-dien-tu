import React, { useEffect, useRef, useState } from 'react';
import { useBiographyScroll, needsScrolling } from '@/hooks/useBiographyScroll';
import '../styles/biography-scroll.css';

interface BiographyScrollProps {
  biography: string;
  className?: string;
  seamlessLoop?: boolean;
  pauseOnHover?: boolean;
}

export const BiographyScroll: React.FC<BiographyScrollProps> = ({
  biography,
  className = '',
  seamlessLoop = true,
  pauseOnHover = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const { duration, className: scrollClass, shouldScroll } = useBiographyScroll(
    biography,
    containerHeight
  );

  // Measure container height
  useEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.offsetHeight;
      setContainerHeight(height);

      // Check if scrolling is needed
      const needsScroll = needsScrolling(biography, height);
      setShouldAnimate(needsScroll && shouldScroll);
    }
  }, [biography, shouldScroll]);

  // Prepare content for seamless loop
  const displayContent = seamlessLoop && shouldAnimate
    ? biography + '<div class="my-8"></div>' + biography
    : biography;

  const animationStyle = shouldAnimate
    ? {
      animationDuration: duration,
      animationName: seamlessLoop ? 'biography-scroll-continuous' : 'biography-scroll',
    }
    : {};

  return (
    <div
      ref={containerRef}
      className={`biography-scroll-container ${className} ${pauseOnHover ? 'pause-on-hover' : ''
        }`}
    >
      <div
        className={`biography-scroll-content ${scrollClass} ${shouldAnimate ? 'animate' : 'static'
          } ${seamlessLoop ? 'continuous' : ''}`}
        style={animationStyle}
      >
        <div
          className="biography-scroll-text text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      </div>
    </div>
  );
};

// Simple version for when you just want basic scrolling
export const SimpleBiographyScroll: React.FC<{
  children: React.ReactNode;
  duration?: string;
}> = ({ children, duration = '45s' }) => {
  return (
    <div className="biography-scroll-container">
      <div
        className="biography-scroll-content"
        style={{ animationDuration: duration }}
      >
        <div className="biography-scroll-text">{children}</div>
      </div>
    </div>
  );
};