import { useEffect } from "react";
import { type WorldState } from "./simulation";

export function useMissionMapCanvas(
  canvasRef: { current: HTMLCanvasElement | null },
  world: WorldState,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(400, Math.floor(rect.width || 400));
      const height = Math.max(320, Math.floor(rect.height || 320));
      const ratio = window.devicePixelRatio || 1;
      const tickPhase = ((world.tick % 8) + 1) / 8;
      const tileSize = Math.floor(
        Math.min((width - 96) / world.map.width, (height - 96) / world.map.height),
      );
      const boardWidth = tileSize * world.map.width;
      const boardHeight = tileSize * world.map.height;
      const originX = Math.floor((width - boardWidth) / 2);
      const originY = Math.floor((height - boardHeight) / 2);

      const toCanvasPoint = (x: number, y: number) => ({
        x: originX + x * tileSize + tileSize / 2,
        y: originY + y * tileSize + tileSize / 2,
      });

      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      context.fillStyle = "#02070d";
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(88, 166, 255, 0.12)";
      context.lineWidth = 1;
      for (let x = originX; x <= originX + boardWidth; x += tileSize) {
        context.beginPath();
        context.moveTo(x, originY);
        context.lineTo(x, originY + boardHeight);
        context.stroke();
      }
      for (let y = originY; y <= originY + boardHeight; y += tileSize) {
        context.beginPath();
        context.moveTo(originX, y);
        context.lineTo(originX + boardWidth, y);
        context.stroke();
      }

      context.strokeStyle = "rgba(34, 211, 238, 0.08)";
      context.lineWidth = 2;
      for (let x = originX; x <= originX + boardWidth; x += tileSize * 2) {
        context.beginPath();
        context.moveTo(x, originY);
        context.lineTo(x, originY + boardHeight);
        context.stroke();
      }

      context.strokeStyle = "rgba(16, 185, 129, 0.32)";
      context.strokeRect(originX, originY, boardWidth, boardHeight);

      const sweepX = originX + ((world.tick % world.map.width) + 0.5) * tileSize;
      context.fillStyle = `rgba(34, 211, 238, ${0.05 + tickPhase * 0.08})`;
      context.fillRect(sweepX - tileSize / 2, originY, tileSize, boardHeight);

      const base = toCanvasPoint(world.base.position.x, world.base.position.y);
      context.fillStyle = `rgba(34, 197, 94, ${0.08 + tickPhase * 0.12})`;
      context.fillRect(
        base.x - tileSize * 0.38,
        base.y - tileSize * 0.38,
        tileSize * 0.76,
        tileSize * 0.76,
      );
      context.strokeStyle = `rgba(74, 222, 128, ${0.35 + tickPhase * 0.35})`;
      context.lineWidth = 1.5;
      context.strokeRect(
        base.x - tileSize * 0.38,
        base.y - tileSize * 0.38,
        tileSize * 0.76,
        tileSize * 0.76,
      );

      context.strokeStyle = `rgba(34, 211, 238, ${0.2 + tickPhase * 0.35})`;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(base.x, base.y, tileSize * (0.28 + tickPhase * 0.12), 0, Math.PI * 2);
      context.stroke();

      const oreNodes = world.oreDeposits.map((deposit) =>
        toCanvasPoint(deposit.position.x, deposit.position.y),
      );

      context.fillStyle = "#f59e0b";
      oreNodes.forEach(({ x, y }) => {
        context.beginPath();
        context.arc(x, y, tileSize * 0.16, 0, Math.PI * 2);
        context.fill();
      });

      context.strokeStyle = `rgba(251, 191, 36, ${0.18 + tickPhase * 0.25})`;
      context.lineWidth = 1;
      oreNodes.forEach(({ x, y }) => {
        context.beginPath();
        context.arc(x, y, tileSize * (0.26 + tickPhase * 0.08), 0, Math.PI * 2);
        context.stroke();
      });

      const pathPoints = [
        toCanvasPoint(world.drones[0].position.x, world.drones[0].position.y),
        toCanvasPoint(world.drones[0].position.x + 1, world.drones[0].position.y),
        toCanvasPoint(world.drones[0].position.x + 2, world.drones[0].position.y),
        toCanvasPoint(world.oreDeposits[0].position.x, world.oreDeposits[0].position.y),
      ];

      context.strokeStyle = "rgba(34, 211, 238, 0.2)";
      context.lineWidth = 8;
      context.beginPath();
      pathPoints.forEach(({ x, y }, index) => {
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();

      context.strokeStyle = `rgba(34, 211, 238, ${0.45 + tickPhase * 0.3})`;
      context.lineWidth = 2;
      context.setLineDash([6, 6]);
      context.beginPath();
      pathPoints.forEach(({ x, y }, index) => {
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
      context.setLineDash([]);

      context.fillStyle = `rgba(34, 211, 238, ${0.35 + tickPhase * 0.45})`;
      pathPoints.slice(1, -1).forEach(({ x, y }) => {
        context.beginPath();
        context.arc(x, y, tileSize * (0.06 + tickPhase * 0.02), 0, Math.PI * 2);
        context.fill();
      });

      world.drones.forEach((drone) => {
        const dronePoint = toCanvasPoint(drone.position.x, drone.position.y);
        context.fillStyle = "#38bdf8";
        context.beginPath();
        context.arc(dronePoint.x, dronePoint.y, tileSize * 0.24, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = "rgba(56, 189, 248, 0.4)";
        context.lineWidth = 1;
        context.beginPath();
        context.arc(
          dronePoint.x,
          dronePoint.y,
          tileSize * (0.34 + tickPhase * 0.05),
          0,
          Math.PI * 2,
        );
        context.stroke();

        context.fillStyle = "#02070d";
        context.font = '600 9px "IBM Plex Mono", monospace';
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("D1", dronePoint.x, dronePoint.y + 1);
      });

      context.strokeStyle = "rgba(16, 185, 129, 0.2)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(base.x, base.y);
      context.lineTo(base.x, base.y + tileSize * 0.8);
      context.lineTo(base.x + tileSize * 0.8, base.y + tileSize * 0.8);
      context.stroke();

      context.fillStyle = "rgba(148, 163, 184, 0.6)";
      context.font = '500 10px "IBM Plex Mono", monospace';
      context.textAlign = "left";
      context.fillText("BASE_AURORA", originX, originY + boardHeight + 28);
      context.fillText("ORE_01", originX + boardWidth - tileSize * 1.3, originY - 18);
      context.fillText(`TICK :: ${world.tick.toString().padStart(3, "0")}`, originX, originY - 18);
    };

    draw();

    const handleResize = () => {
      draw();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef, world]);
}
