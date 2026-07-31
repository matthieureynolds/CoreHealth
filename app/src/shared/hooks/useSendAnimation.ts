import { useRef } from "react";

type Point = { x: number; y: number; w: number; h: number };

export function useSendAnimation() {
  const startRef = useRef<Point | null>(null);
  const endRefMap = useRef<Map<string, Point>>(new Map()); // clientId -> rect

  return {
    setStartRect: (rect: Point) => (startRef.current = rect),
    setEndRect: (id: string, rect: Point) => endRefMap.current.set(id, rect),
    consumeRects: (id: string) => {
      const start = startRef.current;
      const end = endRefMap.current.get(id) ?? null;
      // reset start after consumption to avoid stale reuse
      startRef.current = null;
      return { start, end };
    },
    clearEndRect: (id: string) => endRefMap.current.delete(id),
  };
}
