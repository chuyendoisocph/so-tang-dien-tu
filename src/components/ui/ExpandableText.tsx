import { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface ExpandableTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  maxLines?: number; // Default lines to show
  className?: string;
  showMoreText?: string;
  showLessText?: string;
  buttonClassName?: string;
  textClassName?: string;
  isHtml?: boolean;
}

export const ExpandableText = forwardRef<HTMLDivElement, ExpandableTextProps>(
  (
    {
      text,
      maxLines = 4,
      className = "",
      showMoreText = "Xem thêm",
      showLessText = "Thu gọn",
      buttonClassName = "",
      textClassName = "",
      isHtml = false,
      style = {},
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (textRef.current) {
        // Check if content overflows the max lines
        // We compare scrollHeight with clientHeight when clamped
        // BUT `line-clamp` makes clientHeight smaller.
        // A reliable way is to check if scrollHeight > clientHeight
        // Note: This check usually needs the element to be rendered with line-clamp first.
        const el = textRef.current;
        setIsOverflowing(el.scrollHeight > el.clientHeight);
      }
    }, [text, maxLines, isHtml]);

    // Update overflow state on window resize
    useEffect(() => {
      const handleResize = () => {
        if (textRef.current) {
          const el = textRef.current;
          setIsOverflowing(el.scrollHeight > el.clientHeight);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Premium styling matching the Memorial theme (Gold #C5A059 / Navy #1e3a5f)
    const defaultButtonStyles = cn(
      "inline-flex items-center gap-1.5 mt-3 px-5 py-2",
      "text-sm font-semibold tracking-wide uppercase",
      "text-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059]/20",
      "rounded-full transition-all duration-300",
      "border border-[#C5A059]/20 hover:border-[#C5A059]/40",
      "group"
    );

    return (
      <div className={cn("flex flex-col items-center", className)} style={style} {...props}>
        <div
          ref={textRef}
          className={cn(
            "relative transition-all duration-500 ease-in-out overflow-hidden w-full",
            textClassName,
            !isExpanded && "line-clamp-4" // Fallback if dynamic style fails, but we use style below
          )}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: isExpanded ? "unset" : maxLines,
            WebkitBoxOrient: "vertical",
            lineClamp: isExpanded ? "unset" : maxLines, // Standard property
            ...style
          }}
        >
          {isHtml ? (
            <div
              className="[&>p:not(:last-child)]:mb-3"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
            />
          ) : (
            text
          )}
        </div>

        {/* Gradient mask for unexpanded text - optional but nice */}
        {!isExpanded && isOverflowing && (
          <div className="w-full h-8 -mt-8 relative z-10 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
        )}

        {(isOverflowing || isExpanded) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(buttonClassName || defaultButtonStyles)}
            type="button"
          >
            {isExpanded ? (
              <>
                {showLessText}
                <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              </>
            ) : (
              <>
                {showMoreText}
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </>
            )}
          </button>
        )}
      </div>
    );
  }
);

ExpandableText.displayName = "ExpandableText";
