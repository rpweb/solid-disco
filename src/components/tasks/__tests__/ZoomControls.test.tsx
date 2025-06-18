import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ZoomControls } from "../ZoomControls";

describe("ZoomControls", () => {
  const defaultProps = {
    zoomLevel: 1,
    minZoom: 1,
    maxZoom: 2.5,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onResetZoom: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render all zoom controls", () => {
      render(<ZoomControls {...defaultProps} />);

      expect(screen.getByTitle("Zoom out")).toBeInTheDocument();
      expect(screen.getByTitle("Reset zoom")).toBeInTheDocument();
      expect(screen.getByTitle("Zoom in")).toBeInTheDocument();
    });

    it("should display current zoom level as percentage", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={1.5} />);

      expect(screen.getByText("150%")).toBeInTheDocument();
    });

    it("should round zoom level percentage", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={1.236} />);

      expect(screen.getByText("124%")).toBeInTheDocument();
    });
  });

  describe("button interactions", () => {
    it("should call onZoomOut when zoom out button is clicked", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={2} />);

      fireEvent.click(screen.getByTitle("Zoom out"));

      expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(1);
    });

    it("should call onZoomIn when zoom in button is clicked", () => {
      render(<ZoomControls {...defaultProps} />);

      fireEvent.click(screen.getByTitle("Zoom in"));

      expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(1);
    });

    it("should call onResetZoom when reset button is clicked", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={2} />);

      fireEvent.click(screen.getByTitle("Reset zoom"));

      expect(defaultProps.onResetZoom).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled states", () => {
    it("should disable zoom out button when at minimum zoom", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={1} minZoom={1} />);

      const zoomOutButton = screen.getByTitle("Zoom out");

      expect(zoomOutButton).toBeDisabled();
      expect(zoomOutButton).toHaveClass("disabled:opacity-50");
      expect(zoomOutButton).toHaveClass("disabled:cursor-not-allowed");
    });

    it("should disable zoom in button when at maximum zoom", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={2.5} maxZoom={2.5} />);

      const zoomInButton = screen.getByTitle("Zoom in");

      expect(zoomInButton).toBeDisabled();
      expect(zoomInButton).toHaveClass("disabled:opacity-50");
      expect(zoomInButton).toHaveClass("disabled:cursor-not-allowed");
    });

    it("should not call handlers when disabled buttons are clicked", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={1} minZoom={1} />);

      const zoomOutButton = screen.getByTitle("Zoom out");
      fireEvent.click(zoomOutButton);

      expect(defaultProps.onZoomOut).not.toHaveBeenCalled();
    });

    it("should enable both buttons when zoom is between min and max", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={1.5} />);

      expect(screen.getByTitle("Zoom out")).not.toBeDisabled();
      expect(screen.getByTitle("Zoom in")).not.toBeDisabled();
    });
  });

  describe("styling", () => {
    it("should have proper container styling", () => {
      const { container } = render(<ZoomControls {...defaultProps} />);

      const controlsContainer = container.firstChild;

      expect(controlsContainer).toHaveClass("flex");
      expect(controlsContainer).toHaveClass("items-center");
      expect(controlsContainer).toHaveClass("gap-1");
      expect(controlsContainer).toHaveClass("bg-gray-100");
      expect(controlsContainer).toHaveClass("rounded-md");
      expect(controlsContainer).toHaveClass("p-1");
    });

    it("should have hover styles on enabled buttons", () => {
      render(<ZoomControls {...defaultProps} zoomLevel={1.5} />);

      const zoomOutButton = screen.getByTitle("Zoom out");
      const resetButton = screen.getByTitle("Reset zoom");
      const zoomInButton = screen.getByTitle("Zoom in");

      expect(zoomOutButton).toHaveClass("hover:bg-gray-200");
      expect(resetButton).toHaveClass("hover:bg-gray-200");
      expect(zoomInButton).toHaveClass("hover:bg-gray-200");
    });
  });

  describe("accessibility", () => {
    it("should have proper SVG attributes for zoom icons", () => {
      const { container } = render(<ZoomControls {...defaultProps} />);

      const svgs = container.querySelectorAll("svg");

      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute("fill", "none");
        expect(svg).toHaveAttribute("stroke", "currentColor");
        expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
        expect(svg).toHaveClass("w-5");
        expect(svg).toHaveClass("h-5");
      });
    });

    it("should have descriptive titles for all buttons", () => {
      render(<ZoomControls {...defaultProps} />);

      expect(screen.getByTitle("Zoom out")).toBeInTheDocument();
      expect(screen.getByTitle("Reset zoom")).toBeInTheDocument();
      expect(screen.getByTitle("Zoom in")).toBeInTheDocument();
    });
  });
});
