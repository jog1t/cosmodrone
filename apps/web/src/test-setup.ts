import "@testing-library/jest-dom/vitest";

const canvasContext = {
  beginPath: () => {},
  clearRect: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  fill: () => {},
  fillRect: () => {},
  fillText: () => {},
  lineTo: () => {},
  moveTo: () => {},
  setLineDash: () => {},
  setTransform: () => {},
  stroke: () => {},
  strokeRect: () => {},
  arc: () => {},
  fillStyle: "",
  font: "",
  lineWidth: 1,
  strokeStyle: "",
  textAlign: "left",
  textBaseline: "alphabetic",
};

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () => canvasContext as unknown as CanvasRenderingContext2D,
});
