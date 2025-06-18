import { useState, useEffect, useCallback } from "react";

interface UseZoomOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export const useZoom = ({
  initialZoom = 1,
  minZoom = 1,
  maxZoom = 2.5,
  zoomStep = 0.5,
}: UseZoomOptions = {}) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + zoomStep, maxZoom));
  }, [zoomStep, maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - zoomStep, minZoom));
  }, [zoomStep, minZoom]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  return {
    zoomLevel,
    setZoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    minZoom,
    maxZoom,
  };
};
