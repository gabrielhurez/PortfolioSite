"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A Raspberry Pi 5, built from simple shapes and laid out in millimetres from the real board
// (85 x 56 mm). Axes: x along the long edge, z along the short edge, y up. The PCB top is y = T.

const T = 1.4; // PCB thickness

function makeMaterials() {
  const std = (color: string, roughness: number, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return {
    pcb: std("#1d6b45", 0.55),
    silver: std("#d9dedb", 0.4, 0.3),
    black: std("#1a1e1c", 0.65),
    fins: std("#26292b", 0.5, 0.35),
    hole: std("#070908", 0.9),
    gold: std("#d9a441", 0.35, 0.5),
    blue: std("#2e6fd4", 0.45),
    cream: std("#e8e2cf", 0.6),
    red: new THREE.MeshStandardMaterial({ color: "#ff3b30", emissive: "#ff2a1f", emissiveIntensity: 1.2 }),
    act: new THREE.MeshStandardMaterial({ color: "#3ddc84", emissive: "#2bd46d", emissiveIntensity: 1.4 }),
  };
}
type Materials = ReturnType<typeof makeMaterials>;
type Mat = keyof Materials;

// Shared shapes: every part is one of these, scaled and placed
const cube = new THREE.BoxGeometry(1, 1, 1);
const round = new THREE.CylinderGeometry(1, 1, 1, 28);

type Vec3 = [number, number, number];

// A box from its min and max corners, in millimetres
function Box({ from, to, m, mats }: { from: Vec3; to: Vec3; m: Mat; mats: Materials }) {
  return (
    <mesh
      geometry={cube}
      material={mats[m]}
      position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]}
      scale={[to[0] - from[0], to[1] - from[1], to[2] - from[2]]}
    />
  );
}

function Round({ at, radius, height, m, mats }: { at: Vec3; radius: number; height: number; m: Mat; mats: Materials }) {
  return <mesh geometry={round} material={mats[m]} position={at} scale={[radius, height, radius]} />;
}

// Two rows of 20 GPIO pins as one instanced mesh
function GpioPins({ material }: { material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let i = 0;
    for (const z of [51.27, 53.81]) {
      for (let n = 0; n < 20; n++) {
        m.compose(new THREE.Vector3(8.13 + n * 2.54, T + 4.6, z), new THREE.Quaternion(), new THREE.Vector3(0.64, 6.4, 0.64));
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={ref} args={[cube, material, 40]} />;
}

function RaspberryPi5({ mats }: { mats: Materials }) {
  const B = (from: Vec3, to: Vec3, m: Mat) => <Box from={from} to={to} m={m} mats={mats} />;
  const usb = (z: number, tongue: Mat) => (
    <group key={z}>
      {B([70, T, z - 6.6], [87.5, T + 16, z + 6.6], "silver")}
      {[T + 4.2, T + 11.8].map(y => (
        <group key={y}>
          {B([87.3, y - 2.9, z - 6], [87.6, y + 2.9, z + 6], "hole")}
          {B([87.4, y - 0.9, z - 5.2], [87.7, y + 0.9, z + 5.2], tongue)}
        </group>
      ))}
    </group>
  );

  return (
    <>
      {/* Board and gold mounting rings */}
      {B([0, 0, 0], [85, T, 56], "pcb")}
      {[
        [3.5, 3.5],
        [61.5, 3.5],
        [3.5, 52.5],
        [61.5, 52.5],
      ].map(([x, z]) => (
        <Round key={`${x}-${z}`} at={[x, T + 0.05, z]} radius={3} height={0.1} m="gold" mats={mats} />
      ))}

      {/* GPIO header */}
      {B([6.9, T, 50], [58.1, T + 2.5, 55.1], "black")}
      <GpioPins material={mats.gold} />

      {/* Right edge: Ethernet (at the bottom on the Pi 5), then USB 3 (blue) and USB 2 */}
      {B([66.5, T, 2.5], [87.5, T + 13.5, 18], "silver")}
      {B([87.3, T + 1.5, 5], [87.6, T + 10.5, 15.5], "hole")}
      {B([87.4, T + 11, 5.3], [87.7, T + 12.8, 7.1], "act")}
      {B([87.4, T + 11, 13.4], [87.7, T + 12.8, 15.2], "gold")}
      {usb(29.1, "blue")}
      {usb(47, "black")}

      {/* Bottom edge: USB-C power and two micro HDMI */}
      {B([6.7, T, -1], [15.7, T + 3.2, 6.5], "silver")}
      {B([7.6, T + 0.8, -1.1], [14.8, T + 2.4, -0.9], "hole")}
      {[26, 39.5].map(x => (
        <group key={x}>
          {B([x - 3.75, T, -1], [x + 3.75, T + 3, 5.5], "silver")}
          {B([x - 3, T + 0.8, -1.1], [x + 3, T + 2.2, -0.9], "hole")}
        </group>
      ))}

      {/* Two camera/display connectors, the RP1 I/O chip, and the PCIe connector on the left edge */}
      {[45, 50.5].map(x => (
        <group key={x}>
          {B([x, T, 1.5], [x + 3.5, T + 5.5, 21.5], "black")}
          {B([x + 0.3, T + 5.5, 2], [x + 3.2, T + 6, 21], "cream")}
        </group>
      ))}
      {B([57, T, 24], [64, T + 1, 31], "black")}
      {B([0.5, T, 18], [4, T + 2, 38], "black")}
      {B([0.7, T + 2, 18.5], [3.8, T + 2.4, 37.5], "cream")}

      {/* Power button in the corner and the status LEDs */}
      {B([0.6, T, 43], [4.4, T + 2.4, 47], "silver")}
      <Round at={[2.5, T + 2.9, 45]} radius={1.3} height={1} m="black" mats={mats} />
      {B([0.8, T, 6], [2.4, T + 0.8, 7.6], "red")}
      {B([0.8, T, 9], [2.4, T + 0.8, 10.6], "act")}

      {/* The official Active Cooler: a finned heatsink with a fan set into it */}
      {B([16, T + 3, 17], [59, T + 5, 48], "fins")}
      {Array.from({ length: 11 }, (_, i) => (
        <group key={i}>{B([17 + i * 3.8, T + 5, 18], [18.4 + i * 3.8, T + 11, 47], "fins")}</group>
      ))}
      <Round at={[40, T + 11.3, 32.5]} radius={12} height={0.8} m="black" mats={mats} />
      <Round at={[40, T + 11.9, 32.5]} radius={4.5} height={0.8} m="silver" mats={mats} />
      {[
        [18, 19],
        [57, 19],
        [18, 46],
        [57, 46],
      ].map(([x, z]) => (
        <Round key={`${x}-${z}`} at={[x, T + 1.5, z]} radius={1.2} height={3} m="silver" mats={mats} />
      ))}

      {/* microSD slot underneath */}
      {B([1, -1.4, 22], [13, 0, 34], "silver")}
    </>
  );
}

// A soft round shadow under the board, drawn once to a small canvas
function useShadowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(0,0,0,0.4)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

const BASE_TILT = 0.55;
const DRIFT = 0.2; // idle spin, radians per second

// Rotation, momentum and dragging for the model, kept outside React state since it changes every frame
class Spinner {
  rotX = BASE_TILT;
  rotY = -0.6;
  private velX = 0;
  private velY = 0;
  private dragging = false;
  private last: { x: number; y: number; t: number; touch: boolean } | null = null;

  grab(x: number, y: number, touch: boolean) {
    this.dragging = true;
    this.velX = this.velY = 0;
    this.last = { x, y, t: performance.now(), touch };
  }

  drag(x: number, y: number) {
    const prev = this.last;
    if (!prev || !this.dragging) return;
    const now = performance.now();
    const dt = Math.max((now - prev.t) / 1000, 1 / 240);
    const dx = (x - prev.x) * 0.012;
    // On touch screens only sideways drags turn it, so vertical swipes still scroll the page
    const dy = prev.touch ? 0 : (y - prev.y) * 0.008;
    this.rotY += dx;
    this.rotX = THREE.MathUtils.clamp(this.rotX + dy, -0.3, 1.3);
    this.velY = dx / dt;
    this.velX = dy / dt;
    this.last = { ...prev, x, y, t: now };
  }

  release() {
    this.dragging = false;
    this.last = null;
    // A throw keeps its speed, but not a wild one
    this.velY = THREE.MathUtils.clamp(this.velY, -9, 9);
    this.velX = THREE.MathUtils.clamp(this.velX, -3, 3);
  }

  step(dt: number, still: boolean) {
    if (this.dragging) return;
    // Momentum fades out, then an easy idle spin takes over and the tilt settles back
    const fade = Math.pow(0.04, dt);
    this.velY = this.velY * fade + (still ? 0 : DRIFT) * (1 - fade);
    this.velX *= fade;
    this.rotY += this.velY * dt;
    this.rotX += this.velX * dt;
    this.rotX += (BASE_TILT - this.rotX) * Math.min(1, dt * 1.5);
  }
}

// The green activity LEDs, flickering like the board is busy
class Blinker {
  constructor(private material: THREE.MeshStandardMaterial) {}

  update(time: number, still: boolean) {
    const on = still || Math.sin(time * 3.1) + Math.sin(time * 7.3) > 0.4;
    this.material.emissiveIntensity = on ? 1.4 : 0.05;
  }
}

function Model({ spinner, still }: { spinner: Spinner; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const shadow = useShadowTexture();
  const { mats, blinker } = useMemo(() => {
    const mats = makeMaterials();
    return { mats, blinker: new Blinker(mats.act) };
  }, []);

  useFrame((state, delta) => {
    spinner.step(Math.min(delta, 0.05), still);
    const g = group.current;
    if (g) {
      g.rotation.set(spinner.rotX, spinner.rotY, 0);
      g.position.y = still ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.08;
    }
    blinker.update(state.clock.elapsedTime, still);
  });

  return (
    <>
      <group ref={group}>
        {/* Centre the board on the origin and scale millimetres down */}
        <group scale={0.1} position={[-4.25, -0.6, -2.8]}>
          <RaspberryPi5 mats={mats} />
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
    </>
  );
}

export default function PiClusterScene({ active, still }: { active: boolean; still: boolean }) {
  const [spinner] = useState(() => new Spinner());

  return (
    <div
      style={{ position: "absolute", inset: 0, touchAction: "pan-y", cursor: "grab" }}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        spinner.grab(e.clientX, e.clientY, e.pointerType === "touch");
      }}
      onPointerMove={e => spinner.drag(e.clientX, e.clientY)}
      onPointerUp={() => spinner.release()}
      onPointerCancel={() => spinner.release()}
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 2, 18.5], fov: 30 }}
      >
        <hemisphereLight args={["#ffffff", "#3b4a40", 1.3]} />
        <directionalLight position={[5, 8, 6]} intensity={2} />
        <directionalLight position={[-6, 3, -4]} intensity={0.6} />
        <directionalLight position={[2, -3, 6]} intensity={0.35} />
        <Model spinner={spinner} still={still} />
      </Canvas>
    </div>
  );
}
