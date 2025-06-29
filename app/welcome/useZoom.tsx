import { useState, useCallback } from "react";

export function useZoom(  
	viewRef: React.RefObject<HTMLDivElement | null>,
  gridRef: React.RefObject<HTMLDivElement | null>,
  min = 0,
  max = 3
) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  const triggerZoom = async (zoomIn: boolean) => {
    if ((zoomIn && zoom >= max) || (!zoomIn && zoom <= min)) return;

    const nextZoom   = zoom + (zoomIn ? 1 : -1);
    const zoomFactor = zoomIn? 2 : 1/2;

    const view = viewRef.current;
    const grid = gridRef.current;
    if (!view || !grid) return;

    // Current viewport center
    const cx = view.scrollLeft + view.clientWidth  / 2;
    const cy = view.scrollTop  + view.clientHeight / 2;

    // Applying gradual zoom animation
    grid.style.transition = 'transform 1500ms ease-out';
    grid.style.transformOrigin = `${cx}px ${cy}px`;
    await new Promise(r => requestAnimationFrame(r));
    grid.style.transform = `scale(${zoomFactor})`;

    grid.addEventListener(
      'transitionend',
      () => {
        grid.style.transition = '';
        grid.style.transform  = 'scale(1)';
        setZoom(nextZoom);
      },
      { once: true }
    );

    // Saving coordinates of previous map center on current map
    setCenter({
      x: cx * zoomFactor - view.clientWidth  / 2,
      y: cy * zoomFactor - view.clientHeight / 2,
    });
  }

  return { zoom, center, triggerZoom };
}
