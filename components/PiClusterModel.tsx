"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import styles from "./PiClusterModel.module.css";

// three.js is only loaded once the model is close to scrolling into view
const Scene = dynamic(() => import("./PiClusterScene"), { ssr: false });

const noop = () => () => {};
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Interactive 3D Raspberry Pi 5 in place of the Pi Cluster screenshot: drag to spin it
export default function PiClusterModel({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const still = useSyncExternalStore(noop, reducedMotion, () => false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start loading a screen early; only render frames while it's actually on screen
    const load = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "600px" });
    const view = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    load.observe(el);
    view.observe(el);
    return () => {
      load.disconnect();
      view.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${className ?? ""} ${styles.stage}`}
      role="img"
      aria-label="3D model of a Raspberry Pi 5 board. Drag to rotate it."
    >
      {near && <Scene active={visible} still={still} />}
    </div>
  );
}
