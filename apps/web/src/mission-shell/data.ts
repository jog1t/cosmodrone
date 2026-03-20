export const missionCode = `export function tick() {
  const drone = self();
  const home = base();

  if (drone.battery < 24) {
    moveTo(home.position);
    store("ore");
    return;
  }

  if (drone.cargo.ore < drone.cargo.capacity) {
    moveTo({ x: 18, y: 12 });
    mine();
    return;
  }

  moveTo(home.position);
  store("ore");
}`;

export const templates = [
  { name: "Miner Alpha", chassis: "Miner frame", state: "selected" },
  { name: "Scout Relay", chassis: "Scout frame", state: "queued" },
  { name: "Hauler Queue", chassis: "Cargo frame", state: "locked" },
];

export const apiSections = [
  { title: "Core", entries: ["self()", "base()", "tick()", "log()", "memory"] },
  { title: "Actions", entries: ["moveTo()", "mine()", "store()", "pickup()"] },
  { title: "Future", entries: ["scan()", "broadcast()", "routePower()"] },
];
