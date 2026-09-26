"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { scroller } from "@/lib/scroll";

// Momentum scrolling, and every in-page link (#section) glides there instead of jumping.
// Lenis honours prefers-reduced-motion by default.
export default function SmoothScroll() {
  // The editor at /keystatic has its own scrolling; leave it alone
  const inEditor = usePathname()?.startsWith("/keystatic") ?? false;

  useEffect(() => {
    if (inEditor) return;
    const lenis = new Lenis({ lerp: 0.09, autoRaf: true });
    scroller.lenis = lenis;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute("href")?.slice(1);
      if (!link || id === undefined) return;
      const target = id ? document.getElementById(id) : document.body;
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(id === "top" || !id ? 0 : target, {
        offset: -16,
        duration: 1.4,
        force: true, // still glide if a menu paused scrolling a moment ago
        lock: true,
        easing: t => 1 - Math.pow(1 - t, 4),
      });
      history.replaceState(null, "", id && id !== "top" ? `#${id}` : location.pathname);
    };
    document.addEventListener("click", onClick);

    if (process.env.NODE_ENV === "development") (window as unknown as { lenis: Lenis }).lenis = lenis;

    return () => {
      document.removeEventListener("click", onClick);
      scroller.lenis = null;
      lenis.destroy();
    };
  }, [inEditor]);

  return null;
}
