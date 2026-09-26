"use client";

import { useEffect, useRef } from "react";
import styles from "./Signature.module.css";

// Total time to sign, and how long a pen lift between strokes feels (as extra pen travel)
const SIGN_TIME = 3400;
const PEN_LIFT = 0.025;
const SAMPLES = 24;

// One gesture for the whole signature: a gentle start and a glide to a stop on the last
// stroke, but mostly even so no part of the signature crawls or rushes.
const momentum = (x: number) => {
  const cubic = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  return 0.12 * cubic + 0.88 * x;
};

// Inverse of momentum(): at what point in time has the pen covered `y` of the distance
const timeAt = (y: number) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (momentum(mid) < y) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

// Loads your signature SVG and draws it in stroke by stroke, like it's being signed.
// The SVG holds the real ink outline plus a mask of "pen" strokes; animating the pen reveals the ink.
// Renders nothing until the file exists.
type Props = {
  src: string;
  delay?: number;
  className?: string;
  // Sign again whenever the pointer enters the surrounding link (or the signature itself)
  replayOnHover?: boolean;
};

export default function Signature({ src, delay = 1500, className = "", replayOnHover = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const animations: Animation[] = [];
    let cleanupHover = () => {};

    fetch(src)
      .then(res => (res.ok ? res.text() : null))
      .then(markup => {
        const host = ref.current;
        if (cancelled || !host || !markup?.includes("<svg")) return;
        host.innerHTML = markup;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) return;
        const pens = host.querySelectorAll<SVGGeometryElement>(".pen");
        const strokes = Array.from(pens.length ? pens : host.querySelectorAll<SVGGeometryElement>("path"));
        const lengths = strokes.map(stroke => stroke.getTotalLength());
        // data-pace (from the trace script): detailed, curvy writing takes longer per px than long simple strokes
        const weights = strokes.map((stroke, i) => lengths[i] * Number(stroke.dataset.pace ?? 1));
        const inkTotal = weights.reduce((sum, weight) => sum + weight, 0) || 1;
        // Lay every stroke along one distance line from 0 to 1, with a short pen lift before each new
        // movement. Chunks marked data-continue are the same pen movement, so no lift before those.
        const lift = PEN_LIFT * inkTotal;
        const lifts = strokes.map((stroke, i) => (i > 0 && !stroke.dataset.continue ? lift : 0));
        const travel = inkTotal + lifts.reduce((sum, l) => sum + l, 0);

        let covered = 0;
        strokes.forEach((stroke, i) => {
          const length = lengths[i];
          covered += lifts[i];
          const from = covered / travel;
          const to = (covered + weights[i]) / travel;
          covered += weights[i];
          if (!length) return;

          // Where this stroke sits on the shared timeline
          const t0 = timeAt(from);
          const t1 = timeAt(to);
          // Sample the shared curve inside the stroke so the pen speed carries across strokes
          // Browsers still paint a round pen tip at the end of a fully "undrawn" dash, which shows up as a
          // stray dot. So an undrawn stroke is parked a pen-width past its end, inside a longer gap.
          const tip = Number(stroke.getAttribute("stroke-width") ?? 0) + 2;
          const keyframes = Array.from({ length: SAMPLES + 1 }, (_, k) => {
            const t = t0 + ((t1 - t0) * k) / SAMPLES;
            const progress = Math.min(1, Math.max(0, (momentum(t) - from) / (to - from)));
            // k === 0 is always fully parked (rounding can make its progress a hair above zero)
            const parked = k === 0 || progress <= 0;
            return { offset: k / SAMPLES, strokeDashoffset: parked ? length + tip : length * (1 - progress) };
          });

          stroke.style.strokeDasharray = `${length} ${length + 2 * tip}`;
          stroke.style.strokeDashoffset = `${length + tip}`;
          animations.push(
            stroke.animate(keyframes, {
              duration: Math.max(1, (t1 - t0) * SIGN_TIME),
              delay: delay + t0 * SIGN_TIME,
              easing: "linear",
              fill: "both",
            })
          );
        });

        // Once signed, show the ink unmasked so every last bit of the real signature is visible
        const inks = Array.from(host.querySelectorAll(".ink"));
        const masks = inks.map(ink => ink.getAttribute("mask"));
        const unmaskWhenDone = () =>
          Promise.all(animations.map(a => a.finished))
            .then(() => inks.forEach(ink => ink.removeAttribute("mask")))
            .catch(() => {});
        unmaskWhenDone();

        if (replayOnHover) {
          const target = host.closest("a") ?? host;
          const replay = () => {
            if (animations.some(a => a.playState === "running")) return;
            inks.forEach((ink, i) => masks[i] && ink.setAttribute("mask", masks[i]!));
            animations.forEach(a => {
              a.currentTime = delay; // skip the page-load delay and start signing straight away
              a.play();
            });
            unmaskWhenDone();
          };
          target.addEventListener("mouseenter", replay);
          target.addEventListener("focus", replay);
          cleanupHover = () => {
            target.removeEventListener("mouseenter", replay);
            target.removeEventListener("focus", replay);
          };
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanupHover();
      animations.forEach(a => a.cancel());
    };
  }, [src, delay, replayOnHover]);

  return <div ref={ref} className={`${styles.signature} ${className}`} aria-hidden="true" />;
}
