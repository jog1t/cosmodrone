import { extend, useApplication, useTick } from "@pixi/react";
import { Container, Graphics, Text, TextStyle, type GraphicsContext } from "pixi.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

extend({ Container, Graphics, Text });

// Palette
const TEAL = 0x00cfc0;
const AMBER = 0xf0a030;
const GRID_COLOR = 0x58a6ff;
const BG = 0x02070d;

const GRID_CELL = 32;
const GRID_OFFSET = 16;
const BORDER_PAD = 48;
// Feather zone width in pixels — how wide the soft fog edge is
const FEATHER_W = 24;
// Number of stroke steps to approximate the radial gradient in the mask
const FEATHER_STEPS = 24;

function snap(v: number): number {
  return Math.round((v - GRID_OFFSET) / GRID_CELL) * GRID_CELL + GRID_OFFSET;
}

const ORE_REL = [
  { rx: 0.62, ry: 0.28 },
  { rx: 0.55, ry: 0.38 },
  { rx: 0.68, ry: 0.44 },
  { rx: 0.48, ry: 0.5 },
];

const BASE_REL = { rx: 0.12, ry: 0.78 };
const BASE_SIZE = 72;
const BRACKET = 14;

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rock = { rx: number; ry: number; pts: Array<{ a: number; r: number }>; size: number };
type Dust = { rx: number; ry: number; r: number };
type Crack = { rx: number; ry: number; angle: number; len: number };
type PolyVert = { nx: number; ny: number };

const DEPOSIT_SEED = 42;

function genDepositRocks(count: number): Rock[] {
  const rng = seededRng(DEPOSIT_SEED);
  return Array.from({ length: count }, () => {
    const sides = 4 + Math.floor(rng() * 3);
    const size = 2.5 + rng() * 5;
    const pts = Array.from({ length: sides }, (_, j) => ({
      a: (j / sides) * Math.PI * 2 + rng() * 0.5,
      r: size * (0.65 + rng() * 0.7),
    }));
    return { rx: rng() * 2 - 1, ry: rng() * 2 - 1, pts, size };
  });
}

function genDepositDust(count: number): Dust[] {
  const rng = seededRng(DEPOSIT_SEED + 1);
  return Array.from({ length: count }, () => ({
    rx: rng() * 2 - 1,
    ry: rng() * 2 - 1,
    r: 0.7 + rng() * 1.4,
  }));
}

function genDepositCracks(count: number): Crack[] {
  const rng = seededRng(DEPOSIT_SEED + 2);
  return Array.from({ length: count }, () => ({
    rx: rng() * 1.6 - 0.8,
    ry: rng() * 1.6 - 0.8,
    angle: rng() * Math.PI,
    len: 8 + rng() * 18,
  }));
}

function genDepositBoundary(sides: number): PolyVert[] {
  const rng = seededRng(DEPOSIT_SEED + 3);
  return Array.from({ length: sides }, (_, i) => {
    const base = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const a = base + (rng() - 0.5) * ((Math.PI * 2) / sides) * 0.45;
    const rx = 0.82 + rng() * 0.4;
    const ry = 0.78 + rng() * 0.44;
    return { nx: Math.cos(a) * rx, ny: Math.sin(a) * ry };
  });
}

const DEPOSIT_ROCKS = genDepositRocks(28);
const DEPOSIT_DUST = genDepositDust(60);
const DEPOSIT_CRACKS = genDepositCracks(14);
const DEPOSIT_BOUNDARY = genDepositBoundary(8);

// Draw a feathered circle into a mask Graphics: solid fill + concentric stroke rings fading out.
function drawFeatheredCircle(gfx: Graphics, cx: number, cy: number, hardR: number) {
  gfx.circle(cx, cy, hardR).fill({ color: 0xffffff, alpha: 1 });
  const strokeW = FEATHER_W / FEATHER_STEPS + 1;
  for (let i = 0; i < FEATHER_STEPS; i++) {
    const frac = (i + 0.5) / FEATHER_STEPS;
    const alpha = (1 - frac) * (1 - frac);
    gfx.circle(cx, cy, hardR + frac * FEATHER_W).stroke({ color: 0xffffff, alpha, width: strokeW });
  }
}

function octagon(g: GraphicsContext, cx: number, cy: number, r: number) {
  const sides = 8;
  const offset = Math.PI / 8;
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 + offset;
    if (i === 0) g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.closePath();
}

function brackets(g: GraphicsContext, cx: number, cy: number, half: number, arm: number) {
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ] as const;
  for (const [sx, sy] of corners) {
    const ox = cx + sx * half;
    const oy = cy + sy * half;
    g.moveTo(ox, oy + sy * -arm)
      .lineTo(ox, oy)
      .lineTo(ox + sx * -arm, oy);
  }
}

type DronePos = { x: number; y: number; color: number; label: string; senseR: number };

type OreNodeVisibility = {
  nodeIndex: number;
  visibility: "sense" | "memory" | "fog";
};

type DepositVisibility = {
  depositId: string;
  nodes: OreNodeVisibility[];
};

type DroneInput = {
  droneId: string;
  position: { x: number; y: number }; // 0..1 relative to canvas
  senseRadius: number; // normalised 0..1
  color: number;
};

type Props = {
  width: number;
  height: number;
  showSense: boolean;
  showTrail: boolean;
  depositVisibility: DepositVisibility;
  drones: DroneInput[];
};

export function MapPixiScene({
  width,
  height,
  showSense,
  showTrail,
  depositVisibility,
  drones,
}: Props) {
  const nodeVisMap = useMemo(() => {
    const m: Record<number, "sense" | "memory" | "fog"> = {};
    for (const n of depositVisibility.nodes) m[n.nodeIndex] = n.visibility;
    return m;
  }, [depositVisibility.nodes]);
  const [pulse, setPulse] = useState(0);
  const timeRef = useRef(0);
  useApplication();

  useTick((ticker) => {
    timeRef.current += ticker.deltaMS;
    setPulse((Math.sin(timeRef.current / 700) + 1) / 2);
  });

  const bx = snap(width * BASE_REL.rx);
  const by = snap(height * BASE_REL.ry);

  const orePositions = useMemo(
    () => ORE_REL.map((o) => ({ x: width * o.rx, y: height * o.ry })),
    [width, height],
  );

  const dronePositions: DronePos[] = useMemo(
    () =>
      drones.map((d) => ({
        x: width * d.position.x,
        y: height * d.position.y,
        color: d.color,
        label: d.droneId,
        senseR: d.senseRadius * Math.min(width, height),
      })),
    [drones, width, height],
  );

  const deposit = useMemo(() => {
    const xs = orePositions.map((p) => p.x);
    const ys = orePositions.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const hw = (maxX - minX) / 2 + 48;
    const hh = (maxY - minY) / 2 + 48;
    return { cx, cy, hw, hh };
  }, [orePositions]);

  const depositVerts = useMemo(() => {
    const { cx, cy, hw, hh } = deposit;
    return DEPOSIT_BOUNDARY.map((v) => ({
      x: cx + v.nx * (hw + 18),
      y: cy + v.ny * (hh + 18),
    }));
  }, [deposit]);

  // Mask Graphics — not in scene graph, used only for stencil masking
  const maskGfxRef = useRef<Graphics | null>(null);
  useEffect(() => {
    const gfx = new Graphics();
    maskGfxRef.current = gfx;
    return () => {
      gfx.destroy();
      maskGfxRef.current = null;
    };
  }, []);

  // Update mask every frame — drone sense circles only
  useTick(() => {
    const gfx = maskGfxRef.current;
    if (!gfx) return;
    gfx.clear();
    for (const d of dronePositions) {
      drawFeatheredCircle(gfx, d.x, d.y, d.senseR);
    }
  });

  // Grid
  const drawGrid = useCallback(
    (g: GraphicsContext) => {
      g.clear();
      g.rect(0, 0, width, height).fill({ color: BG });
      for (let x = GRID_OFFSET; x <= width; x += GRID_CELL) {
        g.moveTo(x, 0).lineTo(x, height);
      }
      for (let y = GRID_OFFSET; y <= height; y += GRID_CELL) {
        g.moveTo(0, y).lineTo(width, y);
      }
      g.stroke({ color: GRID_COLOR, alpha: 0.12, width: 1 });
      g.rect(BORDER_PAD, BORDER_PAD, width - BORDER_PAD * 2, height - BORDER_PAD * 2).stroke({
        color: 0x10b981,
        alpha: 0.32,
        width: 1,
      });
    },
    [width, height],
  );

  // Base
  const drawBase = useCallback(
    (g: GraphicsContext) => {
      g.clear();
      const half = BASE_SIZE / 2;
      g.rect(bx - half, by - half, BASE_SIZE, BASE_SIZE).fill({
        color: TEAL,
        alpha: 0.04 + pulse * 0.04,
      });
      brackets(g, bx, by, half, BRACKET);
      g.stroke({ color: TEAL, alpha: 0.55 + pulse * 0.35, width: 1.5 });
      const ch = 10;
      g.moveTo(bx - ch, by)
        .lineTo(bx + ch, by)
        .moveTo(bx, by - ch)
        .lineTo(bx, by + ch);
      g.stroke({ color: TEAL, alpha: 0.3 + pulse * 0.3, width: 1 });
      g.circle(bx, by, 2.5).fill({ color: TEAL, alpha: 0.7 + pulse * 0.3 });
      g.circle(bx, by, 18 + pulse * 12).stroke({
        color: TEAL,
        alpha: 0.15 + pulse * 0.25,
        width: 1.5,
      });
    },
    [bx, by, pulse],
  );

  // Polygon boundary + survey marker — always visible (outside masked container)
  const drawDepositBoundary = useCallback(
    (g: GraphicsContext) => {
      g.clear();
      const verts = depositVerts;

      // Faint fill
      verts.forEach((v, i) => (i === 0 ? g.moveTo(v.x, v.y) : g.lineTo(v.x, v.y)));
      g.closePath().fill({ color: AMBER, alpha: 0.018 + pulse * 0.01 });

      // Dashed stroke
      const DASH = 7;
      const GAP = 5;
      for (let i = 0; i < verts.length; i++) {
        const a = verts[i];
        const b = verts[(i + 1) % verts.length];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;
        let d = 0;
        let drawing = true;
        while (d < len) {
          const sl = Math.min(drawing ? DASH : GAP, len - d);
          if (drawing)
            g.moveTo(a.x + ux * d, a.y + uy * d).lineTo(a.x + ux * (d + sl), a.y + uy * (d + sl));
          d += sl;
          drawing = !drawing;
        }
      }
      g.stroke({ color: AMBER, alpha: 0.2 + pulse * 0.08, width: 1 });

      // Vertex ticks
      for (const v of verts) {
        const T = 3;
        g.moveTo(v.x - T, v.y)
          .lineTo(v.x + T, v.y)
          .moveTo(v.x, v.y - T)
          .lineTo(v.x, v.y + T);
      }
      g.stroke({ color: AMBER, alpha: 0.32, width: 1 });
    },
    [depositVerts, pulse],
  );

  const anyKnown = orePositions.some((_, i) => (nodeVisMap[i] ?? "fog") !== "fog");
  // Background terrain — dust + rocks, always drawn when any node is known (sense or memory)
  const drawDepositTerrain = useCallback(
    (g: GraphicsContext) => {
      g.clear();
      const { cx, cy, hw, hh } = deposit;
      for (const d of DEPOSIT_DUST) {
        g.circle(cx + d.rx * hw, cy + d.ry * hh, d.r).fill({ color: 0x78350f, alpha: 0.18 });
      }
      for (const c of DEPOSIT_CRACKS) {
        const px = cx + c.rx * hw;
        const py = cy + c.ry * hh;
        g.moveTo(px, py).lineTo(px + Math.cos(c.angle) * c.len, py + Math.sin(c.angle) * c.len);
      }
      g.stroke({ color: 0x3a2a10, alpha: 0.35, width: 0.5 });
      for (const rock of DEPOSIT_ROCKS) {
        const px = cx + rock.rx * hw;
        const py = cy + rock.ry * hh;
        rock.pts.forEach((pt, j) => {
          const vx = px + Math.cos(pt.a) * pt.r;
          const vy = py + Math.sin(pt.a) * pt.r;
          if (j === 0) g.moveTo(vx, vy);
          else g.lineTo(vx, vy);
        });
        g.closePath()
          .fill({ color: 0x1e2d3a, alpha: 0.65 })
          .stroke({ color: 0x3a5060, alpha: 0.4, width: 0.5 });
      }
    },
    [anyKnown, deposit],
  );

  // Per-node ore rendering: sense = bright, memory = dim, fog = hidden
  const drawDepositNodes = useCallback(
    (g: GraphicsContext) => {
      g.clear();
      orePositions.forEach(({ x, y }, i) => {
        const vis = nodeVisMap[i] ?? "fog";
        if (vis === "fog") return;
        if (vis === "memory") {
          octagon(g, x, y, 8);
          g.fill({ color: 0x5a4010, alpha: 0.45 });
          return;
        }
        // sense — full bright
        octagon(g, x, y, 8);
        g.fill({ color: AMBER, alpha: 0.85 }).stroke({ color: 0xfbbf24, alpha: 0.9, width: 1 });
        octagon(g, x, y, 4);
        g.fill({ color: 0xfde68a, alpha: 0.5 });
        g.circle(x, y, 14 + pulse * 5).stroke({
          color: AMBER,
          alpha: 0.12 + pulse * 0.2,
          width: 1,
        });
      });
    },
    [deposit, orePositions, pulse],
  );

  // Trail
  const trailPoints = useMemo(
    () => [
      { x: bx, y: by },
      { x: snap(width * 0.3), y: snap(height * 0.68) },
      { x: snap(width * 0.4), y: snap(height * 0.58) },
      { x: snap(width * 0.5), y: snap(height * 0.48) },
      { x: snap(width * 0.65), y: snap(height * 0.3) },
    ],
    [bx, by, width, height],
  );

  const drawTrail = useCallback(
    (g: GraphicsContext) => {
      g.clear();
      if (!showTrail) return;
      g.moveTo(trailPoints[0].x, trailPoints[0].y);
      for (let i = 1; i < trailPoints.length; i++) g.lineTo(trailPoints[i].x, trailPoints[i].y);
      g.stroke({ color: TEAL, alpha: 0.15, width: 8 });
      const DASH = 6;
      const GAP = 6;
      for (let seg = 0; seg < trailPoints.length - 1; seg++) {
        const start = trailPoints[seg];
        const end = trailPoints[seg + 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;
        let d = 0;
        let drawing = true;
        while (d < len) {
          const sl = Math.min(drawing ? DASH : GAP, len - d);
          if (drawing)
            g.moveTo(start.x + ux * d, start.y + uy * d).lineTo(
              start.x + ux * (d + sl),
              start.y + uy * (d + sl),
            );
          d += sl;
          drawing = !drawing;
        }
      }
      g.stroke({ color: TEAL, alpha: 0.4 + pulse * 0.25, width: 1.5 });
      for (let i = 1; i < trailPoints.length - 1; i++) {
        g.circle(trailPoints[i].x, trailPoints[i].y, 2 + pulse).fill({
          color: TEAL,
          alpha: 0.3 + pulse * 0.4,
        });
      }
    },
    [showTrail, pulse, trailPoints],
  );

  // Drones — glyphs only, sense rings drawn separately below
  const drawDrones = useCallback(
    (g: GraphicsContext) => {
      g.clear();
      for (const d of dronePositions) {
        const { x, y } = d;
        g.circle(x, y, 14).fill({ color: d.color, alpha: 0.06 + pulse * 0.04 });
        const noseY = y - 13;
        const baseY = y + 7;
        const baseHalf = 6;
        g.moveTo(x, noseY)
          .lineTo(x + baseHalf, baseY)
          .lineTo(x, baseY - 3)
          .lineTo(x - baseHalf, baseY)
          .closePath()
          .fill({ color: d.color, alpha: 0.85 })
          .stroke({ color: d.color, alpha: 1, width: 1 });
        g.moveTo(x, noseY).lineTo(x, noseY - 6);
        g.stroke({ color: d.color, alpha: 0.5, width: 1 });
      }
    },
    [dronePositions, pulse],
  );

  // Sense rings — static polygon boundary + animated sweep arc + radio rings
  const drawSenseRings = useCallback(
    (g: GraphicsContext) => {
      g.clear();
      if (!showSense) return;

      const t = timeRef.current / 1000;

      dronePositions.forEach((d, _idx) => {
        const { x, y } = d;

        // Boundary edge — crisp circle
        g.circle(x, y, d.senseR).stroke({ color: d.color, alpha: 0.28, width: 1 });

        // Sweep arc — rotates around the boundary ring (same speed for all drones)
        const rotSpeed = 0.5;
        const sweepAngle = (t * rotSpeed * Math.PI * 2) % (Math.PI * 2);
        const arcSpan = Math.PI * 0.35; // ~63° trailing tail
        const arcSteps = 20;
        for (let s = 0; s < arcSteps; s++) {
          const frac = s / (arcSteps - 1);
          const a = sweepAngle - arcSpan * frac;
          const sweepR = d.senseR * 1.02;
          const alpha = (1 - frac) * 0.6;
          if (s === 0) g.moveTo(x + Math.cos(a) * sweepR, y + Math.sin(a) * sweepR);
          else g.lineTo(x + Math.cos(a) * sweepR, y + Math.sin(a) * sweepR);
          if (s > 0) {
            g.stroke({ color: d.color, alpha, width: 1.5 });
            g.moveTo(x + Math.cos(a) * sweepR, y + Math.sin(a) * sweepR);
          }
        }

        // Radio wave — locked to sweep rotation: fires once per full rotation.
        // wavePhase is the fractional position within the current rotation (0 = just fired, 1 = done).
        // The wave expands outward from center and fades before it hits the boundary,
        // so it reads as a pulse emitted by the sweep as it passes.
        const wavePhase = (t * rotSpeed) % 1; // 0..1, resets each rotation
        const waveR = wavePhase * d.senseR;
        const fadeIn = Math.min(waveR / 12, 1);
        const fadeOut = 1 - wavePhase * wavePhase; // eases out toward boundary
        const waveAlpha = fadeIn * fadeOut * 0.55;
        if (waveAlpha > 0.01) {
          g.circle(x, y, waveR).stroke({ color: d.color, alpha: waveAlpha, width: 1.5 });
          g.circle(x, y, waveR).stroke({ color: d.color, alpha: waveAlpha * 0.25, width: 6 });
        }
      });
    },
    [dronePositions, showSense, pulse],
  );

  const labelStyle = new TextStyle({
    fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
    fontSize: 10,
    fill: 0x94a3b8,
    fontWeight: "500",
  });
  const droneTagStyle = new TextStyle({
    fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
    fontSize: 9,
    fill: 0x94a3b8,
    fontWeight: "600",
    align: "center",
  });

  const anySensed = orePositions.some((_, i) => nodeVisMap[i] === "sense");

  return (
    <pixiContainer>
      <pixiGraphics draw={drawGrid} />
      <pixiGraphics draw={drawTrail} />
      <pixiGraphics draw={drawBase} />
      <pixiText
        text="BASE_AURORA"
        style={labelStyle}
        x={bx - BASE_SIZE / 2}
        y={by + BASE_SIZE / 2 + 6}
      />

      {/* Boundary always visible — hints at the deposit zone */}
      <pixiGraphics draw={drawDepositBoundary} />

      {/* Terrain background (dust, cracks, rocks) — shown when any node is known */}
      {anyKnown && <pixiGraphics draw={drawDepositTerrain} />}

      {/* Per-node ore: sense=bright, memory=dim, fog=hidden */}
      <pixiGraphics draw={drawDepositNodes} />

      {/* Label once any node is in active sense range */}
      {anySensed && (
        <pixiText
          text="ORE_CLUSTER_A1"
          style={labelStyle}
          x={orePositions[0].x - 48}
          y={orePositions[0].y - 28}
        />
      )}

      <pixiGraphics draw={drawDrones} />
      <pixiGraphics draw={drawSenseRings} />
      {dronePositions.map((d) => (
        <pixiText key={d.label} text={d.label} style={droneTagStyle} x={d.x - 8} y={d.y + 12} />
      ))}
    </pixiContainer>
  );
}
