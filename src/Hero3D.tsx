import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { NAME_PATHS, NAME_BOX } from "./data/namePath";
import { burst } from "./lib/device";

/**
 * "Lavanya" as a real extruded, bevelled gold mesh, built the same way as the AlphaReal hero:
 * font outline -> SVG path -> ExtrudeGeometry. Drag to spin it; tap it for a full twirl and confetti.
 */
export default function Hero3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 1, 5000);
    cam.position.set(0, 0, 1500);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    // Metal needs something to reflect, or gold reads as brown.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // Warm key, cool rim, gold fill: reads as polished trophy metal on navy.
    scene.add(new THREE.AmbientLight(0xfff3dc, 0.55));
    const key = new THREE.DirectionalLight(0xfff4e0, 2.2);
    key.position.set(-0.6, 0.9, 1.1);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xf3d48a, 1.0);
    fill.position.set(1, -0.4, 0.6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x8fa2ff, 1.2);
    rim.position.set(0.3, 0.5, -1.2);
    scene.add(rim);

    const data = new SVGLoader().parse(
      `<svg viewBox="${NAME_BOX.x} ${NAME_BOX.y} ${NAME_BOX.w} ${NAME_BOX.h}">${NAME_PATHS.map((d) => `<path d="${d}"/>`).join("")}</svg>`,
    );
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 38,
      bevelEnabled: true,
      bevelThickness: 7,
      bevelSize: 3.2,
      bevelSegments: 6,
      curveSegments: 10,
    });
    geo.center();
    geo.computeVertexNormals();

    const face = new THREE.MeshStandardMaterial({ color: 0xf5c65e, metalness: 0.75, roughness: 0.22 });
    const side = new THREE.MeshStandardMaterial({ color: 0xc8922f, metalness: 0.85, roughness: 0.3 });
    const mesh = new THREE.Mesh(geo, [face, side]);
    const group = new THREE.Group();
    group.add(mesh);
    group.scale.set(1, -1, 1); // SVG y runs down; flip it upright.
    scene.add(group);

    let rx = 0.08, ry = -0.12, tx = rx, ty = ry;
    let dragging = false, moved = false, lx = 0, ly = 0, dx = 0, dy = 0;
    let twirl = 0, twirling = false;
    const t0 = performance.now();

    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = false;
      lx = dx = e.clientX;
      ly = dy = e.clientY;
      wrap.classList.add("grabbing");
      try {
        wrap.setPointerCapture(e.pointerId);
      } catch {
        // Older browsers: dragging still works while the pointer stays over the name.
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      if (Math.hypot(e.clientX - dx, e.clientY - dy) > 6) moved = true;
      ty += (e.clientX - lx) * 0.01;
      tx = Math.max(-0.9, Math.min(0.9, tx + (e.clientY - ly) * 0.01));
      lx = e.clientX;
      ly = e.clientY;
    };
    const onUp = () => {
      if (dragging && !moved && !twirling) {
        twirling = true;
        twirl = 0;
        burst();
      }
      dragging = false;
      wrap.classList.remove("grabbing");
    };
    wrap.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width) return;
      renderer.setSize(r.width, r.height, false);
      cam.aspect = r.width / r.height;
      // Keep the whole name in frame at any width.
      const fitW = (NAME_BOX.w * 1.45) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect);
      const fitH = (NAME_BOX.h * 1.5) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
      cam.position.z = Math.max(fitW, fitH);
      cam.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      // Gentle idle sway when nobody is touching it.
      if (!dragging && !reduced) {
        ty += (Math.sin(t * 0.6) * 0.22 - ty) * 0.01;
        tx += (Math.sin(t * 0.8) * 0.06 + 0.06 - tx) * 0.01;
      }
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      let spin = 0;
      if (twirling) {
        twirl += 0.018;
        const k = Math.min(twirl, 1);
        spin = (1 - Math.pow(1 - k, 3)) * Math.PI * 2;
        if (twirl >= 1) twirling = false;
      }
      group.rotation.x = rx;
      group.rotation.y = ry + (twirling ? spin : 0);
      group.position.y = reduced ? 0 : Math.sin(t * 1.4) * 6;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", resize);
      geo.dispose();
      envTex.dispose();
      pmrem.dispose();
      face.dispose();
      side.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="hero3d" ref={wrapRef} role="img" aria-label="Lavanya in 3D gold letters">
      <div className="hero3d-glow" />
      <canvas ref={canvasRef} />
    </div>
  );
}
