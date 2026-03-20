import { useEffect } from "react";

export function useMissionMapCanvas(canvasRef: { current: HTMLCanvasElement | null }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frameId = 0;

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(400, Math.floor(rect.width || 400));
      const height = Math.max(320, Math.floor(rect.height || 320));
      const ratio = window.devicePixelRatio || 1;

      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      const pulse = (Math.sin(time / 700) + 1) / 2;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      context.fillStyle = "#02070d";
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(88, 166, 255, 0.12)";
      context.lineWidth = 1;
      for (let x = 0; x <= width; x += 32) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y <= height; y += 32) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      context.strokeStyle = "rgba(34, 211, 238, 0.08)";
      context.lineWidth = 2;
      for (let x = 16; x <= width; x += 128) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      context.strokeStyle = "rgba(16, 185, 129, 0.32)";
      context.strokeRect(48, 48, width - 96, height - 96);

      context.fillStyle = `rgba(34, 197, 94, ${0.08 + pulse * 0.08})`;
      context.fillRect(56, height - 122, 78, 78);
      context.strokeStyle = `rgba(74, 222, 128, ${0.35 + pulse * 0.45})`;
      context.lineWidth = 1.5;
      context.strokeRect(56, height - 122, 78, 78);

      context.strokeStyle = `rgba(34, 211, 238, ${0.2 + pulse * 0.35})`;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(95, height - 83, 22 + pulse * 10, 0, Math.PI * 2);
      context.stroke();

      const oreNodes = [
        [width - 148, 78],
        [width - 182, 110],
        [width - 126, 138],
        [width - 214, 154],
      ] as const;

      context.fillStyle = "#f59e0b";
      oreNodes.forEach(([x, y]) => {
        context.beginPath();
        context.arc(x, y, 7, 0, Math.PI * 2);
        context.fill();
      });

      context.strokeStyle = `rgba(251, 191, 36, ${0.18 + pulse * 0.25})`;
      context.lineWidth = 1;
      oreNodes.forEach(([x, y]) => {
        context.beginPath();
        context.arc(x, y, 12 + pulse * 4, 0, Math.PI * 2);
        context.stroke();
      });

      const pathPoints = [
        [95, height - 83],
        [148, height - 112],
        [194, height - 142],
        [236, height - 166],
        [width - 164, 120],
      ] as const;

      context.strokeStyle = "rgba(34, 211, 238, 0.2)";
      context.lineWidth = 8;
      context.beginPath();
      pathPoints.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();

      context.strokeStyle = `rgba(34, 211, 238, ${0.45 + pulse * 0.3})`;
      context.lineWidth = 2;
      context.setLineDash([6, 6]);
      context.beginPath();
      pathPoints.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
      context.setLineDash([]);

      context.fillStyle = `rgba(34, 211, 238, ${0.35 + pulse * 0.45})`;
      pathPoints.slice(1, -1).forEach(([x, y]) => {
        context.beginPath();
        context.arc(x, y, 2.4 + pulse * 1.2, 0, Math.PI * 2);
        context.fill();
      });

      [
        { x: 164, y: height - 134, color: "#38bdf8", label: "M1" },
        { x: 230, y: height - 174, color: "#22c55e", label: "H1" },
        { x: 278, y: height - 214, color: "#f97316", label: "S1" },
      ].forEach(({ x, y, color, label }) => {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, 11, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = `${color}66`;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(x, y, 18 + pulse * 4, 0, Math.PI * 2);
        context.stroke();

        context.fillStyle = "#02070d";
        context.font = '600 9px "IBM Plex Mono", monospace';
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(label, x, y + 1);
      });

      context.strokeStyle = "rgba(16, 185, 129, 0.2)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(95, height - 83);
      context.lineTo(95, height - 142);
      context.lineTo(164, height - 142);
      context.stroke();

      context.fillStyle = "rgba(148, 163, 184, 0.6)";
      context.font = '500 10px "IBM Plex Mono", monospace';
      context.textAlign = "left";
      context.fillText("BASE_AURORA", 58, height - 24);
      context.fillText("ORE_CLUSTER_A1", width - 238, 54);
      context.fillText("ROUTE :: ACTIVE", 146, height - 154);

      frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [canvasRef]);
}
