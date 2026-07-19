import { useEffect, useRef } from "react";

export function useAutoScroll<T>(items: T[]) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  return bottomRef;
}
