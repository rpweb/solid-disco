export interface MinimalTouchEvent {
  touches: TouchList;
  changedTouches: TouchList;
}

export function setupTouchListeners(
  container: HTMLElement,
  handlers: {
    onTouchStart: (e: MinimalTouchEvent) => void;
    onTouchMove: () => void;
    onTouchEnd: (e: MinimalTouchEvent) => void;
  }
) {
  const handleTouchStart = (e: TouchEvent) => {
    handlers.onTouchStart({
      touches: e.touches,
      changedTouches: e.changedTouches,
    });
  };

  const handleTouchMove = () => {
    handlers.onTouchMove();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    handlers.onTouchEnd({
      touches: e.touches,
      changedTouches: e.changedTouches,
    });
  };

  container.addEventListener("touchstart", handleTouchStart);
  container.addEventListener("touchmove", handleTouchMove);
  container.addEventListener("touchend", handleTouchEnd);

  return () => {
    container.removeEventListener("touchstart", handleTouchStart);
    container.removeEventListener("touchmove", handleTouchMove);
    container.removeEventListener("touchend", handleTouchEnd);
  };
}
