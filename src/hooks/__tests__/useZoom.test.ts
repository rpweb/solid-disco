import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useZoom } from "../useZoom";

describe("useZoom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useZoom());

      expect(result.current.zoomLevel).toBe(1);
      expect(result.current.minZoom).toBe(1);
      expect(result.current.maxZoom).toBe(2.5);
    });

    it("should initialize with custom values", () => {
      const { result } = renderHook(() =>
        useZoom({
          initialZoom: 1.5,
          minZoom: 0.5,
          maxZoom: 3,
          zoomStep: 0.25,
        })
      );

      expect(result.current.zoomLevel).toBe(1.5);
      expect(result.current.minZoom).toBe(0.5);
      expect(result.current.maxZoom).toBe(3);
    });
  });

  describe("zoom controls", () => {
    it("should zoom in", () => {
      const { result } = renderHook(() => useZoom());

      act(() => {
        result.current.handleZoomIn();
      });

      expect(result.current.zoomLevel).toBe(1.5);
    });

    it("should zoom out", () => {
      const { result } = renderHook(() => useZoom({ initialZoom: 2 }));

      act(() => {
        result.current.handleZoomOut();
      });

      expect(result.current.zoomLevel).toBe(1.5);
    });

    it("should reset zoom to 1", () => {
      const { result } = renderHook(() => useZoom({ initialZoom: 2.5 }));

      act(() => {
        result.current.handleResetZoom();
      });

      expect(result.current.zoomLevel).toBe(1);
    });

    it("should not zoom in beyond max zoom", () => {
      const { result } = renderHook(() =>
        useZoom({ initialZoom: 2.5, maxZoom: 2.5 })
      );

      act(() => {
        result.current.handleZoomIn();
      });

      expect(result.current.zoomLevel).toBe(2.5);
    });

    it("should not zoom out beyond min zoom", () => {
      const { result } = renderHook(() =>
        useZoom({ initialZoom: 1, minZoom: 1 })
      );

      act(() => {
        result.current.handleZoomOut();
      });

      expect(result.current.zoomLevel).toBe(1);
    });

    it("should use custom zoom step", () => {
      const { result } = renderHook(() => useZoom({ zoomStep: 0.25 }));

      act(() => {
        result.current.handleZoomIn();
      });

      expect(result.current.zoomLevel).toBe(1.25);
    });

    it("should allow manual zoom level setting", () => {
      const { result } = renderHook(() => useZoom());

      act(() => {
        result.current.setZoomLevel(2);
      });

      expect(result.current.zoomLevel).toBe(2);
    });
  });

  describe("keyboard shortcuts", () => {
    it("should zoom in with Ctrl/Cmd + =", () => {
      const { result } = renderHook(() => useZoom());

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "=",
          ctrlKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.zoomLevel).toBe(1.5);
    });

    it("should zoom in with Ctrl/Cmd + +", () => {
      const { result } = renderHook(() => useZoom());

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "+",
          metaKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.zoomLevel).toBe(1.5);
    });

    it("should zoom out with Ctrl/Cmd + -", () => {
      const { result } = renderHook(() => useZoom({ initialZoom: 2 }));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "-",
          ctrlKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.zoomLevel).toBe(1.5);
    });

    it("should reset zoom with Ctrl/Cmd + 0", () => {
      const { result } = renderHook(() => useZoom({ initialZoom: 2.5 }));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "0",
          metaKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.zoomLevel).toBe(1);
    });

    it("should prevent default behavior for zoom shortcuts", () => {
      renderHook(() => useZoom());

      const preventDefaultSpy = vi.fn();
      const event = new KeyboardEvent("keydown", {
        key: "=",
        ctrlKey: true,
      });
      Object.defineProperty(event, "preventDefault", {
        value: preventDefaultSpy,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should ignore shortcuts when typing in input", () => {
      const { result } = renderHook(() => useZoom());

      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "=",
          ctrlKey: true,
        });
        Object.defineProperty(event, "target", {
          value: input,
          writable: false,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.zoomLevel).toBe(1);

      document.body.removeChild(input);
    });

    it("should ignore shortcuts when typing in textarea", () => {
      const { result } = renderHook(() => useZoom());

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.focus();

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "=",
          ctrlKey: true,
        });
        Object.defineProperty(event, "target", {
          value: textarea,
          writable: false,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.zoomLevel).toBe(1);

      document.body.removeChild(textarea);
    });

    it("should clean up event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useZoom());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });
  });
});
