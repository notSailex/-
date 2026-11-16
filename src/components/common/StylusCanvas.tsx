import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Check,
  Maximize2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface StylusCanvasProps {
  initialDataUrl?: string;
  onSave?: (dataUrl: string) => void;
  onClear?: () => void;
  className?: string;
  height?: number | string;
  readOnly?: boolean;
}

const PALETTE_COLORS = [
  { id: 'gold', color: '#D49838', label: 'ذهبي عنبري' },
  { id: 'white', color: '#F5F0E6', label: 'أبيض ناعم' },
  { id: 'slate', color: '#94A3B8', label: 'رمادي هادئ' },
  { id: 'blue', color: '#38BDF8', label: 'أزرق سماوي' },
  { id: 'dark', color: '#1E293B', label: 'حبري داكن' },
];

const STROKE_WIDTHS = [
  { id: 'fine', size: 2, label: 'دقيق' },
  { id: 'medium', size: 4, label: 'متوسط' },
  { id: 'bold', size: 8, label: 'عريض' },
];

export const StylusCanvas: React.FC<StylusCanvasProps> = ({
  initialDataUrl,
  onSave,
  onClear,
  className,
  height = 380,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#D49838');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvas with proper resolution and scale
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set display size
    const w = rect.width || 600;
    const h = typeof height === 'number' ? height : parseInt(String(height), 10) || 380;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If initial image exists, draw it
    if (initialDataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        // Save initial snapshot to history
        try {
          const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setHistory([snapshot]);
        } catch {
          // Cross-origin fallback
        }
      };
      img.src = initialDataUrl;
    } else {
      ctx.clearRect(0, 0, w, h);
      try {
        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([snapshot]);
      } catch {
        // Fallback
      }
    }
  }, [height, initialDataUrl]);

  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      // Avoid clearing drawn content on resize by not full re-init if drawing exists
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  const saveStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev.slice(-15), snapshot]);
    } catch {
      // Fallback
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastPoint({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (tool === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 5;
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;

      // Smooth midpoint curve
      const midPoint = {
        x: (lastPoint.x + currentX) / 2,
        y: (lastPoint.y + currentY) / 2,
      };

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midPoint.x, midPoint.y);
      ctx.stroke();
      ctx.restore();
    }

    setLastPoint({ x: currentX, y: currentY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }

    setIsDrawing(false);
    setLastPoint(null);
    saveStateToHistory();

    // Trigger save callback with export data
    if (onSave && canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousSnapshot = newHistory[newHistory.length - 1];

    if (previousSnapshot) {
      ctx.putImageData(previousSnapshot, 0, 0);
      setHistory(newHistory);
      if (onSave) {
        onSave(canvas.toDataURL('image/png'));
      }
    }
  };

  const handleClearAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    saveStateToHistory();
    if (onClear) onClear();
    if (onSave) onSave('');
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full flex flex-col rounded-2xl bg-black/[0.02] dark:bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)] overflow-hidden transition-all select-none",
        className
      )}
    >
      {/* Floating Stylus Toolbar */}
      {!readOnly && (
        <div className="flex-shrink-0 flex items-center justify-between p-2.5 bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] flex-wrap gap-2 text-xs">
          {/* Tool Switcher: Pen vs Eraser */}
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-[var(--color-bg-card)] p-1 rounded-xl border border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all",
                tool === 'pen'
                  ? "bg-[var(--color-accent-warm)] text-white shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
              title="قلم ذكي حر"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>القلم</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all",
                tool === 'eraser'
                  ? "bg-[var(--color-accent-warm)] text-white shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
              title="ممحاة"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>ممحاة</span>
            </button>
          </div>

          {/* Color Palette (Active when tool === 'pen') */}
          {tool === 'pen' && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/[0.03] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
              {PALETTE_COLORS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setColor(p.color)}
                  style={{ backgroundColor: p.color }}
                  className={cn(
                    "w-5 h-5 rounded-full transition-transform border border-black/20 dark:border-white/20 shadow-xs",
                    color === p.color ? "scale-125 ring-2 ring-[var(--color-accent-warm)]" : "hover:scale-110 opacity-80"
                  )}
                  title={p.label}
                />
              ))}
            </div>
          )}

          {/* Stroke Thickness */}
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-[var(--color-bg-card)] p-1 rounded-xl border border-[var(--color-border-subtle)]">
            {STROKE_WIDTHS.map(sw => (
              <button
                key={sw.id}
                type="button"
                onClick={() => setStrokeWidth(sw.size)}
                className={cn(
                  "px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all",
                  strokeWidth === sw.size
                    ? "bg-[var(--color-accent-warm)] text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {sw.label}
              </button>
            ))}
          </div>

          {/* Undo & Clear */}
          <div className="flex items-center gap-1 ms-auto">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-1.5 rounded-xl border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="تراجع عن آخر خطوة (Undo)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="p-1.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="مسح كامل اللوحة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Touch-Action None Drawing Surface */}
      <div className="relative flex-1 w-full overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
          className="block w-full h-full"
        />

        {/* Subtle Watermark Hint */}
        {!initialDataUrl && history.length <= 1 && !isDrawing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 dark:opacity-20 text-xs text-[var(--color-text-muted)] font-display">
            ✍️ ارسم أو اكتب هنا بحرية تامة بالقلم أو اللمس
          </div>
        )}
      </div>
    </div>
  );
};
