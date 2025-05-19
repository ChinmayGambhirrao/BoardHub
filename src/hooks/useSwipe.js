import { useEffect, useRef, useState } from "react";

// Hook for detecting swipe gestures
export default function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [swiping, setSwiping] = useState(false);

  // Set up event handlers
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.targetTouches[0].clientX;
      setSwiping(true);
    };

    const handleTouchMove = (e) => {
      if (!touchStartX.current) return;
      touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (!touchStartX.current || !touchEndX.current) {
        setSwiping(false);
        return;
      }

      const distance = touchEndX.current - touchStartX.current;

      // Check if swipe distance is greater than threshold
      if (Math.abs(distance) > threshold) {
        if (distance > 0) {
          // Swipe right
          onSwipeRight && onSwipeRight();
        } else {
          // Swipe left
          onSwipeLeft && onSwipeLeft();
        }
      }

      // Reset values
      touchStartX.current = null;
      touchEndX.current = null;
      setSwiping(false);
    };

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    // Clean up
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { swiping };
}
