import { useCallback, useEffect, useState } from "react";

interface ResizeHandleProps {
  orientation: "horizontal" | "vertical";
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
}

/**
 * ResizeHandle Component
 *
 * A draggable divider that enables resizing adjacent panels.
 * Supports both horizontal (left/right) and vertical (top/bottom) orientations.
 */
export default function ResizeHandle({
  orientation,
  onResize,
  onResizeEnd,
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (orientation === "horizontal") {
        onResize(e.movementY);
      } else {
        onResize(e.movementX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd?.();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      orientation === "horizontal" ? "ns-resize" : "ew-resize";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, orientation, onResize, onResizeEnd]);

  const isHorizontal = orientation === "horizontal";

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        group relative flex items-center justify-center
        ${isHorizontal ? "h-2 cursor-ns-resize" : "w-2 cursor-ew-resize"}
        ${isDragging ? "bg-blue-500" : "bg-slate-200 hover:bg-blue-400"}
        transition-colors
      `}
      role="separator"
      aria-orientation={isHorizontal ? "horizontal" : "vertical"}
      tabIndex={0}
    >
      {/* Visual grip indicator */}
      <div
        className={`
          ${isHorizontal ? "w-12 h-1" : "h-12 w-1"}
          rounded-full
          ${isDragging ? "bg-white" : "bg-slate-400 group-hover:bg-blue-600"}
          transition-colors
        `}
      />
    </div>
  );
}
