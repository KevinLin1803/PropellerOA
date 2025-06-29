import { useEffect } from "react";

export function usePanning(containerRef: React.RefObject<HTMLDivElement|null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let dragging = false;
    let startX = 0,
        startY = 0,
        scrollX = 0,
        scrollY = 0;

    // User clicks on the map
    const down = (e: MouseEvent) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      scrollX = el.scrollLeft;
      scrollY = el.scrollTop;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    // User drags map
    const move = (e: MouseEvent) => {
      if (!dragging) return;
      el.scrollLeft = scrollX - (e.clientX - startX);
      el.scrollTop = scrollY - (e.clientY - startY);
    };

    // User releases map
    const up = () => {
      dragging = false;
      el.style.cursor = "grab";
      el.style.removeProperty("user-select");
    };

    el.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    el.addEventListener("mouseleave", up);

    return () => {
      el.removeEventListener("mousedown", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      el.removeEventListener("mouseleave", up);
    };
  }, [containerRef]);
}
