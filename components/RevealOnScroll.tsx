"use client";

import { useEffect } from "react";

// Every element marked `data-reveal` fades up once, the first time it scrolls into view.
// Content stays visible if JS never runs, because the hidden state only applies after this mounts.
export default function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    targets.forEach(el => {
      // Anything already on screen at load shows immediately
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.dataset.visible = "true";
      else observer.observe(el);
    });
    root.classList.add("reveal-ready");

    return () => observer.disconnect();
  }, []);

  return null;
}
