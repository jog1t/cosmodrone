# Level 01 - First Loop

## Purpose

This is the player's first real interaction with the Cosmodrone programming loop.

The level should prove four things immediately:

- the player can read a tiny script and understand what it is trying to do
- a drone can move, mine, and store ore with a short function
- the write-run-watch loop feels satisfying even before sensors or coordination exist
- directional actions make spatial reasoning feel concrete rather than abstract

This level should not test search, sensing, or shared coordination. It should teach the basic harvesting loop with known information.

## Player-Facing Goal

- **Objective:** Collect 10 ore and deliver it to base.
- **Bonus:** Finish within 80 ticks.
- **Failure:** Any drone battery depletion ends the run.

## Mechanics Introduced

- coordinate-based `moveTo()`
- directional `mine()`
- adjacency checks using Manhattan distance 1
- cargo return loop
- `memory` as level-provided starter data
- `store(api.base())`

## Level Summary

- One drone
- One template
- One visible ore deposit with known coordinates preloaded into memory
- No sensors required
- No shared memory required
- No terrain blockers
- No ambiguity about what to do first

## Intended Player Insight

The player should discover this structure:

1. move to the ore
2. when adjacent, mine toward it
3. when carrying ore, return to base
4. when adjacent to base, store cargo
5. repeat until the objective is met

## Exact Map Spec

### Grid

- width: `8`
- height: `8`
- terrain: all passable floor

### Coordinate System

- origin: top-left
- `x` increases to the right
- `y` increases downward
- all positions are tile coordinates

### Entities

#### Base

- id: `base_01`
- position: `{ x: 1, y: 1 }`

#### Ore Deposit

- id: `ore_01`
- position: `{ x: 4, y: 1 }`
- starting amount: `10`
- regen rate: `0`

#### Drone

- id: `drone_01`
- template: `Starter Miner`
- starting position: `{ x: 1, y: 2 }`

### Visual Layout

```text
y\x 0 1 2 3 4 5 6 7
 0  . . . . . . . .
 1  . B . . O . . .
 2  . D . . . . . .
 3  . . . . . . . .
 4  . . . . . . . .
 5  . . . . . . . .
 6  . . . . . . . .
 7  . . . . . . . .
```

Legend:

- `B` = base
- `O` = ore
- `D` = drone
- `.` = empty floor

## Template Spec

### Template Name

- `Starter Miner`

### Modules

- `CPU_MICRO`
- `LEGS`
- `DRILL`
- `CARGO`

### Expected Capability Surface

- has `moveTo()`
- has `mine()`
- has `store()`
- does not have `sense()`

## Initial Runtime Data

### Drone Memory

Initial `api.memory` for `drone_01`:

```json
{
  "ore": {
    "x": 4,
    "y": 1
  }
}
```

Notes:

- The level intentionally provides only ore coordinates.
- The player must derive the mining direction from position.
- This is the first tutorial use of persistent memory, but not yet a state-management challenge.

### Base Memory

Initial `api.baseMemory`:

```json
{}
```

This level does not require or teach `baseMemory`.

## Starter Code

The starter code should be partially complete, readable, and close to success. It should require the player to understand the loop rather than write everything from scratch.

```js
function run(api) {
  const self = api.self();
  const base = api.base();
  const ore = api.memory.ore;

  function directionToAdjacent(from, to) {
    if (to.x === from.x && to.y === from.y - 1) return "up";
    if (to.x === from.x + 1 && to.y === from.y) return "right";
    if (to.x === from.x && to.y === from.y + 1) return "down";
    if (to.x === from.x - 1 && to.y === from.y) return "left";
    return null;
  }

  if (self.cargo > 0) {
    const dirToBase = directionToAdjacent(self, base);

    if (dirToBase) {
      api.store(base);
    } else {
      api.moveTo(base);
    }

    return;
  }

  const dirToOre = directionToAdjacent(self, ore);

  if (dirToOre) {
    api.mine(dirToOre);
  } else {
    api.moveTo(ore);
  }
}
```

### Optional More Scaffolded Variant

If the default starter code still feels too complete, an onboarding variant can leave one key blank for the player to fill in:

```js
function run(api) {
  const self = api.self();
  const base = api.base();
  const ore = api.memory.ore;

  function directionToAdjacent(from, to) {
    if (to.x === from.x && to.y === from.y - 1) return "up";
    if (to.x === from.x + 1 && to.y === from.y) return "right";
    if (to.x === from.x && to.y === from.y + 1) return "down";
    if (to.x === from.x - 1 && to.y === from.y) return "left";
    return null;
  }

  if (self.cargo > 0) {
    const dirToBase = directionToAdjacent(self, base);

    if (dirToBase) {
      api.store(base);
    } else {
      api.moveTo(base);
    }

    return;
  }

  const dirToOre = directionToAdjacent(self, ore);

  if (dirToOre) {
    // TODO: mine toward the ore
  } else {
    api.moveTo(ore);
  }
}
```

Recommended default for MVP testing: use the fully working starter script first, then reduce scaffolding later if needed.

## Success Conditions

### Primary Success

- base ore delivered during this run reaches `10`

### Bonus Success

- primary success achieved on or before tick `80`

## Failure Conditions

- any drone battery depletion

There are no other fail states in this level.

## Expected Solution Behavior

The intended solution should produce a visible loop:

1. drone walks from `(1, 2)` toward `(4, 1)`
2. drone mines from an adjacent tile using a cardinal direction
3. drone walks back to the base
4. drone stores cargo
5. drone repeats until the ore deposit is empty and the base has 10 ore

This should look obviously autonomous and satisfying even at 1x speed.

## Expected Tick Shape

Assuming `mine()` yields `1` ore and cargo capacity is generous enough for the whole deposit, the drone may choose to mine several times before returning. For the first tutorial level, either of these is acceptable:

- **Simple loop:** mine once, return once, repeat
- **Better loop:** mine until full or until the deposit is empty, then return

For tutorial clarity, the level should accept either behavior as long as the player reaches 10 delivered ore.

## UI Notes

The UI should make the following immediately visible:

- the objective text
- the ore location on the map
- the drone's cargo bar
- the base ore total
- the current script for `Starter Miner`
- the initial `memory` object showing `ore: { x: 4, y: 1 }`

The inspector should clearly show that:

- the drone has no `sense()` ability
- the ore location comes from starter memory
- `mine()` takes a direction, not a target object

## Teaching Notes

This level should teach by doing, not by exposition.

What the player should learn naturally:

- coordinates can be stored in memory
- a helper function can turn position into direction
- actions happen one tick at a time
- the same small function can create a useful repeating machine

What this level should not teach yet:

- `sense()`
- `baseMemory`
- multiple drones
- loadout choice
- optimization under severe op pressure

## Implementation Notes

### Suggested JSON Shape

```json
{
  "id": "level_01_first_loop",
  "title": "First Loop",
  "objective": {
    "type": "collect_ore",
    "amount": 10
  },
  "bonus": {
    "type": "max_ticks",
    "value": 80
  },
  "map": {
    "width": 8,
    "height": 8,
    "terrain": []
  },
  "base": {
    "id": "base_01",
    "x": 1,
    "y": 1
  },
  "oreDeposits": [
    {
      "id": "ore_01",
      "x": 4,
      "y": 1,
      "amount": 10,
      "regenRate": 0
    }
  ],
  "templates": [
    {
      "name": "Starter Miner",
      "modules": ["CPU_MICRO", "LEGS", "DRILL", "CARGO"],
      "count": 1,
      "code": "function run(api) { /* starter code */ }"
    }
  ],
  "drones": [
    {
      "id": "drone_01",
      "template": "Starter Miner",
      "x": 1,
      "y": 2,
      "memory": {
        "ore": { "x": 4, "y": 1 }
      }
    }
  ],
  "baseMemory": {}
}
```

### Tuning Notes

- The base and ore are placed on the same row corridor to make movement legible.
- The drone starts adjacent to the base so the return loop is easy to understand.
- Ore amount matches the objective exactly to keep the win condition easy to read.
- Battery should be generous enough that a correct solution never fails unexpectedly.

## Validation Checklist

- [ ] The starter script solves the level without edits
- [ ] A player can understand why `mine()` needs a direction
- [ ] The map communicates the ore/base relationship clearly
- [ ] Reset restores starter memory exactly
- [ ] No sensor functionality is required
- [ ] The level remains readable at both step mode and normal play speed
