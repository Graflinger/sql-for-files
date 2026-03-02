import { useCallback } from "react";

import type { ChartRendererHandle } from "./ChartRenderer";

interface ChartExportBarProps {
  chartRef: React.RefObject<ChartRendererHandle | null>;
}

/**
 * Trigger a file download from a data URL.
 */
function downloadDataURL(dataURL: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert an SVG data URL to a PNG blob via an offscreen canvas.
 */
function svgToPngBlob(
  svgDataURL: string,
  pixelRatio: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * pixelRatio;
      canvas.height = img.height * pixelRatio;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2d context"));
        return;
      }
      ctx.scale(pixelRatio, pixelRatio);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create PNG blob"));
        }
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load SVG image"));
    img.src = svgDataURL;
  });
}

/**
 * ChartExportBar provides export buttons for SVG, PNG, and clipboard copy.
 */
export default function ChartExportBar({ chartRef }: ChartExportBarProps) {
  const handleExportSVG = useCallback(() => {
    const instance = chartRef.current?.getEChartsInstance();
    if (!instance) return;

    const svgDataURL = instance.getDataURL({ type: "svg" });
    downloadDataURL(svgDataURL, "chart.svg");
  }, [chartRef]);

  const handleExportPNG = useCallback(async () => {
    const instance = chartRef.current?.getEChartsInstance();
    if (!instance) return;

    try {
      const svgDataURL = instance.getDataURL({ type: "svg" });
      const blob = await svgToPngBlob(svgDataURL, 2);
      const url = URL.createObjectURL(blob);
      downloadDataURL(url, "chart.png");
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  }, [chartRef]);

  const handleCopyToClipboard = useCallback(async () => {
    const instance = chartRef.current?.getEChartsInstance();
    if (!instance) return;

    try {
      const svgDataURL = instance.getDataURL({ type: "svg" });
      const blob = await svgToPngBlob(svgDataURL, 2);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  }, [chartRef]);

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-t border-slate-200 bg-slate-50/80">
      <span className="text-[10px] text-slate-400 mr-1 select-none">Export:</span>

      <button
        onClick={handleExportSVG}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
        title="Download as SVG (vector)"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
        SVG
      </button>

      <button
        onClick={handleExportPNG}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
        title="Download as PNG (2x resolution)"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
        PNG
      </button>

      <button
        onClick={handleCopyToClipboard}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
        title="Copy chart image to clipboard"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10" />
        </svg>
        Copy
      </button>
    </div>
  );
}
