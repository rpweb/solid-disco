import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupTouchListeners } from "../touch.utils";

describe("touch.utils", () => {
  let container: HTMLElement;
  let handlers: {
    onTouchStart: ReturnType<typeof vi.fn>;
    onTouchMove: ReturnType<typeof vi.fn>;
    onTouchEnd: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    container = document.createElement("div");
    handlers = {
      onTouchStart: vi.fn(),
      onTouchMove: vi.fn(),
      onTouchEnd: vi.fn(),
    };
  });

  describe("setupTouchListeners", () => {
    it("should add touch event listeners to container", () => {
      const addEventListenerSpy = vi.spyOn(container, "addEventListener");

      setupTouchListeners(container, handlers);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "touchstart",
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "touchmove",
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "touchend",
        expect.any(Function)
      );
    });

    it("should call onTouchStart with minimal touch event data", () => {
      setupTouchListeners(container, handlers);

      const touchEvent = new TouchEvent("touchstart");

      container.dispatchEvent(touchEvent);

      expect(handlers.onTouchStart).toHaveBeenCalledWith({
        touches: expect.anything(),
        changedTouches: expect.anything(),
      });
    });

    it("should call onTouchMove without arguments", () => {
      setupTouchListeners(container, handlers);

      const touchEvent = new TouchEvent("touchmove");
      container.dispatchEvent(touchEvent);

      expect(handlers.onTouchMove).toHaveBeenCalledWith();
      expect(handlers.onTouchMove).toHaveBeenCalledTimes(1);
    });

    it("should call onTouchEnd with minimal touch event data", () => {
      setupTouchListeners(container, handlers);

      const touchEvent = new TouchEvent("touchend");

      container.dispatchEvent(touchEvent);

      expect(handlers.onTouchEnd).toHaveBeenCalledWith({
        touches: expect.anything(),
        changedTouches: expect.anything(),
      });
    });

    it("should return cleanup function that removes event listeners", () => {
      const removeEventListenerSpy = vi.spyOn(container, "removeEventListener");

      const cleanup = setupTouchListeners(container, handlers);
      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "touchstart",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "touchmove",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "touchend",
        expect.any(Function)
      );
    });

    it("should not call handlers after cleanup", () => {
      const cleanup = setupTouchListeners(container, handlers);
      cleanup();

      const touchEvent = new TouchEvent("touchstart");
      container.dispatchEvent(touchEvent);

      expect(handlers.onTouchStart).not.toHaveBeenCalled();
    });
  });
});
