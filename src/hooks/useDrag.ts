import { useState, useCallback, useRef, useLayoutEffect } from "react";
import { useRenderingRef } from "./useRenderingRef";

export type Position = { x: number; y: number };
export type Size = { height: number; width: number };
export type DragData<T> = {
  item: T;
  pos: Position;
  size: Size;
};

const INITIAL: Position = { x: 0, y: 0 };

export function useDrag<T extends HTMLElement>(
  onDrop: (dragData: DragData<T>) => void,
  onDrag?: (dragData: DragData<T>) => void
) {
  const [pos, setPos] = useState(INITIAL);
  const [client, setClient] = useState(INITIAL);
  const [isDragging, setIsDragging] = useState(false);
  const [ref, setDragRef] = useRenderingRef<T>(null);
  const offset = useRef(INITIAL);
  const size = useRef<Size>({ height: 0, width: 0 });

  const onPointerDown: React.PointerEventHandler = useCallback(
    (event) => {
      if (!ref.current || event.target !== ref.current) return;
      event.preventDefault();
      const rect = ref.current.getBoundingClientRect();
      offset.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      size.current = { height: rect.height, width: rect.width };
      setIsDragging(true);
      setPos(() => ({
        x: event.clientX - offset.current.x,
        y: event.clientY - offset.current.y,
      }));

      window.addEventListener("pointermove", handleGlobalPointerMove);
      window.addEventListener("pointerup", handleGlobalPointerUp);
    },
    [ref.current]
  );

  const handleGlobalPointerMove = useCallback((event: PointerEvent) => {
    event.preventDefault();
    setClient({ x: event.clientX, y: event.clientY });
  }, []);

  const handleGlobalPointerUp = useCallback((event: PointerEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  useLayoutEffect(() => {
    if (!isDragging) return;
    const { x, y } = offset.current;

    const { innerHeight, innerWidth } = window;
    const rootDiv = document.getElementById("root")!;
    const scrollThreshold = 20;
    const scrollSpeed = 10;
    if (client.x >= innerWidth - scrollThreshold)
      rootDiv.scrollBy({ left: scrollSpeed, behavior: "smooth" });
    if (client.x <= scrollThreshold)
      rootDiv.scrollBy({ left: -scrollSpeed, behavior: "smooth" });
    if (client.y >= innerHeight - scrollThreshold)
      rootDiv.scrollBy({ top: scrollSpeed, behavior: "smooth" });
    if (client.y <= innerWidth - scrollThreshold)
      rootDiv.scrollBy({ top: -scrollSpeed, behavior: "smooth" });

    const newPos = { x: client.x - x, y: client.y - y };
    setPos(() => newPos);
    ref.current &&
      onDrag &&
      onDrag({
        item: ref.current,
        pos: newPos,
        size: size.current,
      });
  }, [client]);

  useLayoutEffect(() => {
    if (isDragging) {
      setGlobalDragStyles(true);
      return;
    }
    const newPos = {
      x: client.x - offset.current.x,
      y: client.y - offset.current.y,
    };
    setPos(() => newPos);
    ref.current &&
      onDrop &&
      onDrop({
        item: ref.current,
        pos: newPos,
        size: size.current,
      });
    setGlobalDragStyles(false);
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, [isDragging]);

  const style: React.CSSProperties = isDragging
    ? {
        ...size.current,
        left: pos.x,
        top: pos.y,
        position: "fixed",
      }
    : {};

  return {
    setDragRef,
    isDragging,
    targetProps: {
      style,
      onPointerDown,
    },
  };
}

function setGlobalDragStyles(isDragging: boolean) {
  document.documentElement.style.setProperty(
    "--disable-on-drag",
    isDragging ? "none" : "initial"
  );
  document.documentElement.style.setProperty(
    "--scroll-on-drag",
    isDragging ? "hidden" : "auto"
  );
}
