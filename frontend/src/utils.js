import React, { useState, useEffect, useRef } from "react";

export function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [threshold]);
  return [ref, v];
}

export function FadeIn({ children, delay = 0, up = 24 }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : `translateY(${up}px)`, transition: `opacity .65s ease ${delay}s, transform .65s ease ${delay}s` }}>
      {children}
    </div>
  );
}

export function useQuery() {
  return new URLSearchParams(window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "");
}
