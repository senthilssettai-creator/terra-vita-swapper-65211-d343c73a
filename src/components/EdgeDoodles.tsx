import React from 'react';

interface EdgeDoodlesProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'all';
  opacity?: number;
  animated?: boolean;
}

export const EdgeDoodles: React.FC<EdgeDoodlesProps> = ({
  position = 'all',
  opacity = 0.4,
  animated = true
}) => {
  const doodleClass = animated ? 'morph-fade-glow' : '';

  return (
    <>
      {(position === 'top-left' || position === 'all') && (
        <div
          className={`absolute top-0 left-0 w-48 h-48 pointer-events-none ${doodleClass}`}
          style={{ opacity }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-primary"
            style={{ filter: `drop-shadow(0 0 8px rgba(80, 180, 152, ${opacity * 0.3}))` }}
          >
            {/* Geometric organic lines */}
            <path
              d="M 20 50 Q 40 30 60 45 T 100 60"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity={opacity}
            />
            <circle cx="30" cy="40" r="4" fill="currentColor" opacity={opacity * 0.7} />
            <path
              d="M 10 80 L 50 100 Q 70 110 80 130"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity={opacity * 0.6}
            />
            {/* Decorative dots cluster */}
            <circle cx="60" cy="70" r="3" fill="currentColor" opacity={opacity * 0.8} />
            <circle cx="65" cy="75" r="2" fill="currentColor" opacity={opacity * 0.6} />
            <circle cx="70" cy="72" r="2.5" fill="currentColor" opacity={opacity * 0.7} />
            {/* Sketch marks */}
            <path
              d="M 40 150 Q 50 140 60 150"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity={opacity * 0.5}
            />
            <path
              d="M 120 20 Q 140 15 150 35"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity={opacity * 0.7}
            />
          </svg>
        </div>
      )}

      {(position === 'top-right' || position === 'all') && (
        <div
          className={`absolute top-0 right-0 w-48 h-48 pointer-events-none transform scale-x-[-1] ${doodleClass}`}
          style={{ opacity }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-primary"
            style={{ filter: `drop-shadow(0 0 8px rgba(80, 180, 152, ${opacity * 0.3}))` }}
          >
            {/* Geometric organic lines */}
            <path
              d="M 20 50 Q 40 30 60 45 T 100 60"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity={opacity}
            />
            <circle cx="30" cy="40" r="4" fill="currentColor" opacity={opacity * 0.7} />
            <path
              d="M 10 80 L 50 100 Q 70 110 80 130"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity={opacity * 0.6}
            />
            {/* Decorative dots cluster */}
            <circle cx="60" cy="70" r="3" fill="currentColor" opacity={opacity * 0.8} />
            <circle cx="65" cy="75" r="2" fill="currentColor" opacity={opacity * 0.6} />
            <circle cx="70" cy="72" r="2.5" fill="currentColor" opacity={opacity * 0.7} />
            {/* Sketch marks */}
            <path
              d="M 40 150 Q 50 140 60 150"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity={opacity * 0.5}
            />
            <path
              d="M 120 20 Q 140 15 150 35"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity={opacity * 0.7}
            />
          </svg>
        </div>
      )}

      {(position === 'bottom-left' || position === 'all') && (
        <div
          className={`absolute bottom-0 left-0 w-48 h-48 pointer-events-none transform scale-y-[-1] ${doodleClass}`}
          style={{ opacity }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-primary"
            style={{ filter: `drop-shadow(0 0 8px rgba(80, 180, 152, ${opacity * 0.3}))` }}
          >
            {/* Geometric organic lines */}
            <path
              d="M 20 50 Q 40 30 60 45 T 100 60"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity={opacity}
            />
            <circle cx="30" cy="40" r="4" fill="currentColor" opacity={opacity * 0.7} />
            <path
              d="M 10 80 L 50 100 Q 70 110 80 130"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity={opacity * 0.6}
            />
            {/* Decorative dots cluster */}
            <circle cx="60" cy="70" r="3" fill="currentColor" opacity={opacity * 0.8} />
            <circle cx="65" cy="75" r="2" fill="currentColor" opacity={opacity * 0.6} />
            <circle cx="70" cy="72" r="2.5" fill="currentColor" opacity={opacity * 0.7} />
            {/* Sketch marks */}
            <path
              d="M 40 150 Q 50 140 60 150"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity={opacity * 0.5}
            />
            <path
              d="M 120 20 Q 140 15 150 35"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity={opacity * 0.7}
            />
          </svg>
        </div>
      )}

      {(position === 'bottom-right' || position === 'all') && (
        <div
          className={`absolute bottom-0 right-0 w-48 h-48 pointer-events-none transform scale-x-[-1] scale-y-[-1] ${doodleClass}`}
          style={{ opacity }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full text-primary"
            style={{ filter: `drop-shadow(0 0 8px rgba(80, 180, 152, ${opacity * 0.3}))` }}
          >
            {/* Geometric organic lines */}
            <path
              d="M 20 50 Q 40 30 60 45 T 100 60"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity={opacity}
            />
            <circle cx="30" cy="40" r="4" fill="currentColor" opacity={opacity * 0.7} />
            <path
              d="M 10 80 L 50 100 Q 70 110 80 130"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity={opacity * 0.6}
            />
            {/* Decorative dots cluster */}
            <circle cx="60" cy="70" r="3" fill="currentColor" opacity={opacity * 0.8} />
            <circle cx="65" cy="75" r="2" fill="currentColor" opacity={opacity * 0.6} />
            <circle cx="70" cy="72" r="2.5" fill="currentColor" opacity={opacity * 0.7} />
            {/* Sketch marks */}
            <path
              d="M 40 150 Q 50 140 60 150"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity={opacity * 0.5}
            />
            <path
              d="M 120 20 Q 140 15 150 35"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity={opacity * 0.7}
            />
          </svg>
        </div>
      )}
    </>
  );
};
