import { useEffect } from "react";

export function useScrollRestore(key: string) {
  useEffect(() => {
    const stored = sessionStorage.getItem(`scroll:${key}`);
    if (stored) {
      const y = parseInt(stored, 10);
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" }));
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        sessionStorage.setItem(`scroll:${key}`, String(Math.round(window.scrollY)));
      }, 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      sessionStorage.setItem(`scroll:${key}`, String(Math.round(window.scrollY)));
    };
  }, [key]);
}
