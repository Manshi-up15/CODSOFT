import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingWidgetProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
}

const RatingWidget: React.FC<RatingWidgetProps> = ({
  rating,
  interactive = false,
  onChange,
  size = 18
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.floor(displayRating);
        const isHalf = !isFilled && star === Math.ceil(displayRating) && displayRating % 1 !== 0;

        return (
          <Star
            key={star}
            size={size}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            style={{
              cursor: interactive ? "pointer" : "default",
              fill: isFilled ? "#f59e0b" : isHalf ? "url(#halfStarGradient)" : "none",
              color: isFilled || isHalf ? "#f59e0b" : "var(--text-tertiary)",
              transition: "transform 0.1s ease"
            }}
          />
        );
      })}
      
      {/* Gradient SVG mapping for half stars */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="halfStarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="transparent" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default RatingWidget;
