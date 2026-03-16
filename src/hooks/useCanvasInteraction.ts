import { useState, useEffect, useRef, useCallback } from 'react';

interface CanvasState {
  scale: number;
  position: { x: number; y: number };
  isDragging: boolean;
}

interface CanvasActions {
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: () => void;
  setScale: (scale: number | ((prev: number) => number)) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  resetView: () => void;
  recenter: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  centerTrigger: number;
  hasCentered: React.MutableRefObject<boolean>;
}

export default function useCanvasInteraction(): CanvasState & CanvasActions {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const hasCentered = useRef(false);
  const [centerTrigger, setCenterTrigger] = useState(0);

  const recenter = useCallback(() => {
    hasCentered.current = false;
    setCenterTrigger(n => n + 1);
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    recenter();
  }, [recenter]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // --- 触控支持 ---
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDistRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    if (e.touches.length === 1) {
      lastTouchRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
      lastPinchDistRef.current = null;
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      lastTouchRef.current = null;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastPinchDistRef.current = dist;
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    e.preventDefault();
    if (e.touches.length === 1 && lastTouchRef.current && lastPinchDistRef.current === null) {
      setPosition({
        x: e.touches[0].clientX - lastTouchRef.current.x,
        y: e.touches[0].clientY - lastTouchRef.current.y,
      });
    } else if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - lastPinchDistRef.current) * 0.005;
      setScale(prev => Math.min(Math.max(0.2, prev + delta), 3));
      lastPinchDistRef.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    lastTouchRef.current = null;
    lastPinchDistRef.current = null;
  }, []);

  // 滚轮缩放（使用原生事件以支持 preventDefault）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('.no-drag')) return;
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      setScale(prev => Math.min(Math.max(0.2, prev + delta), 3));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return {
    scale,
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setScale,
    setPosition,
    resetView,
    recenter,
    containerRef,
    centerTrigger,
    hasCentered,
  };
}
