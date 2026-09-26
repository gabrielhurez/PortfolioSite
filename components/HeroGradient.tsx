"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import styles from "./HeroGradient.module.css";

// ShaderGradient (MIT, github.com/ruucm/shadergradient) pulls in three.js, so load it only in the browser
const Canvas = dynamic(() => import("@shadergradient/react").then(m => m.ShaderGradientCanvas), { ssr: false });
const Gradient = dynamic(() => import("@shadergradient/react").then(m => m.ShaderGradient), { ssr: false });

const noop = () => () => {};
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// On a narrow screen the sphere would sit off the right edge, so phones get it lower and centred,
// filling the space under the hero text
const NARROW = "(max-width: 800px)";
const subscribeNarrow = (onChange: () => void) => {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const isNarrow = () => window.matchMedia(NARROW).matches;
const PLACEMENT = {
  wide: { cameraZoom: 10, positionX: 1.7, positionY: 0 },
  narrow: { cameraZoom: 4, positionX: 1.3, positionY: -1.85 },
};

// A slowly moving sphere on the right of the hero, based on the package's "violaOrientalis"
// preset recoloured to the site palette
export default function HeroGradient() {
  const reduce = useSyncExternalStore(noop, reducedMotion, () => false);
  const placement = PLACEMENT[useSyncExternalStore(subscribeNarrow, isNarrow, () => false) ? "narrow" : "wide"];
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className={styles.wrap} data-shown={shown} aria-hidden="true">
      <Canvas pixelDensity={1.5} fov={45} pointerEvents="none" lazyLoad={false}>
        <Gradient
          control="props"
          type="sphere"
          animate={reduce ? "off" : "on"}
          uSpeed={0.1}
          uStrength={1}
          uDensity={1.1}
          uFrequency={5.5}
          uAmplitude={1.4}
          color1="#1e6b47"
          color2="#9cc3a4"
          color3="#d9a441"
          lightType="3d"
          brightness={1.1}
          grain="off"
          cDistance={7.1}
          cPolarAngle={140}
          cAzimuthAngle={0}
          cameraZoom={placement.cameraZoom}
          positionX={placement.positionX}
          positionY={placement.positionY}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={0}
        />
      </Canvas>
    </div>
  );
}
