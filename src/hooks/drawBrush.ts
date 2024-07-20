import { MutableRefObject, useEffect, useRef } from 'react';
import { getCanvasMousePosition } from '../utils';

export function initPointDrawEvent(
  canvas: HTMLCanvasElement,
  uiState,
  cssScale: number,
  isDraggingRef: MutableRefObject<boolean>
) {
  const context = canvas.getContext('2d')!;

  const onPointerDown = () => {
    isDraggingRef.current = true;
  };
  const onPointerUp = () => {
    isDraggingRef.current = false;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (isDraggingRef.current) {
      const mousePos = getCanvasMousePosition(canvas, e);
      context.fillStyle = 'rgba(0,0,0,0.5)';
      context.beginPath();
      context.arc(
        mousePos.x,
        mousePos.y,
        uiState.brushSize * (1 / cssScale),
        0,
        Math.PI * 2
      );
      context.fill();
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
  };
}

export function usePointDraw(
  canvas: HTMLCanvasElement | null,
  uiState,
  cssScale: number
) {
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!canvas) return;
    const removeFn = initPointDrawEvent(
      canvas,
      uiState,
      cssScale,
      isDraggingRef
    );

    return removeFn;
  }, [canvas, cssScale]);
}
