# Cosmodrone - Game Design + Todo

## 1. Vision

**One-line pitch:** Program tiny drones with limited hardware, then watch them solve resource and coordination problems autonomously.

Cosmodrone is a browser-based programming puzzle game where the player writes small JavaScript functions for modular drones. Each drone has a strict hardware loadout, a tiny compute budget, and a limited operational range. The game is about making good decisions under constraints: what hardware to install, what information to gather, what code to run, and how to coordinate multiple drones without a centralized god-AI.

The MVP is a puzzle-first game. It does not try to prove multiplayer, persistence, diplomacy, or large-scale economy. It tries to prove one thing:

> Is it fun to program small, constrained autonomous machines and watch them work?

## 2. Core Pillars

- **Hardware shapes behavior.** A drone can only do what its installed modules physically allow.
- **Small code is the fantasy.** The player writes compact, purposeful functions rather than one giant codebase.
- **Computation is limited.** API calls consume ops, so efficient logic matters.
- **Coordination is distributed.** Drones cooperate through simple shared state, not centralized omniscience.
- **Observation is part of play.** The game should feel good to watch, inspect, debug, and improve.

## 3. Terminology

- **Drone**: the player-controlled autonomous unit
- **Template**: a named module loadout paired with one script
- **Memory**: persistent per-drone JSON object
- **Base Memory**: persistent shared JSON object available to all friendly drones in a level
- **Run**: one attempt at a level from tick 0 until success or failure
- **Reset Run**: restore the level state to its initial setup while keeping the player's code edits

## 4. MVP Ruleset

### 4.1 Programming Model

- Drones run JavaScript.
- Each template exports a single `run(api)` function.
- The API is imperative.
- `api.memory` is the drone's persistent mutable state object.
- `api.baseMemory` is the shared persistent mutable state object for the level.
- Query methods may be called multiple times per tick, limited by ops.
- Only one actuator action may be accepted per drone per tick.
- The first accepted actuator intent wins; later actuator calls in the same tick are ignored.

Example for an early non-sensor level where the ore target is preloaded into `api.memory` by the level:

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
    const adjacentToBase =
      Math.abs(self.x - base.x) + Math.abs(self.y - base.y) === 1;

    if (adjacentToBase) {
      api.store(base);
    } else {
      api.moveTo(base);
    }

    return;
  }

  if (ore) {
    const dir = directionToAdjacent(self, ore);

    if (dir) {
      api.mine(dir);
    } else {
      api.moveTo(ore);
    }
  }
}
```

### 4.2 Tick Rules

Each tick:

1. Reset each active drone's op budget from its CPU module.
2. Drain battery power from active modules.
3. If any drone reaches zero battery, the run fails immediately.
4. For each drone with a CPU, in stable drone-id order:
   - create an API view from the current committed world state
   - execute `run(api)`
   - commit that drone's `memory` if it fits within its cap
   - commit `baseMemory` if it fits within its cap
   - record the first accepted actuator intent issued during execution
5. Resolve all recorded actuator actions simultaneously.
6. Update world state.
7. Advance tick count.

Target resolution rule:

- `moveTo()` resolves immediately to a concrete coordinate target when called.
- Directional actuator calls such as `mine(direction)` resolve against the drone's facing-relative neighboring tile during same-tick resolution.
- Because movement is coordinate-based in v1, the game does not provide magical id-tracking for moving targets.

### 4.3 Simultaneous Resolution Rules

- Actuator intents are collected during execution, then resolved together after all drones finish their tick.
- Multiple drones may occupy the same tile in v1.
- If multiple drones move into the same tile, all successful moves are allowed.
- If multiple drones move out of the same tile, all successful moves are allowed.
- If multiple drones mine the same ore deposit on the same tick, each successful `mine()` extracts its normal amount, applied in stable drone-id order, until the deposit is empty.
- A later miner in the same tick fails if earlier successful mining depleted the deposit first.
- If multiple drones attempt to `store()` at the base on the same tick, all valid stores succeed.
- Because v1 allows stacking and has no combat, there are no blocking collisions to resolve.

### 4.4 Hard Failure

- Battery depletion is a hard fail condition for the run.
- On failure, the simulation pauses automatically.
- The player can inspect the failure state, then press `Reset Run`.
- `Reset Run` restores the world to the level's initial state.
- `Reset Run` also restores each drone's `memory` and the shared `baseMemory` to their initial level-defined values, including any starter memory preloaded for early levels.
- Player code edits remain intact across resets.
- Level tuning should use battery as a planning constraint, not a razor-thin execution trap, especially once multiple drones are involved.

### 4.5 No Busy System in v1

- Drones are not locked into multi-tick actions in the MVP.
- `moveTo()`, `mine()`, and `store()` are all single-tick actuator actions.
- This keeps the mental model simple and the simulation highly readable.

### 4.6 Actuator Rules

- Actuator methods are `moveTo()`, `mine()`, and `store()`.
- A drone may successfully queue at most one actuator action per tick.
- The first accepted actuator intent wins.
- Invalid actuator calls still cost ops, but do not consume the actuator slot.
- If a drone exhausts its remaining ops during an API call, execution stops immediately for that drone for the rest of the tick.
- On ops exhaustion, the drone stops running further code, then proceeds to the normal end-of-execution `memory` and `baseMemory` commit checks using whatever in-memory mutations were made before execution halted.
- An accepted actuator intent may still fail during same-tick resolution if world conditions no longer allow it.
- The API call that exceeds the op budget fails and produces no result.
- In debug output, invalid actuator calls may emit warnings to help explain failed logic.

Per-action validity:

- `moveTo(target)` is valid if the drone has `LEGS`, the target is a known coordinate, and at least one legal one-step move exists.
- `mine(direction)` is valid if the drone has `DRILL`, the direction is one of the legal cardinal directions, the tile in that direction contains an ore deposit when resolution occurs, and the drone has remaining cargo capacity.
- `store(target)` is valid if the drone has `CARGO`, the target is the base, the drone is adjacent to it, and the drone is carrying ore.

Target forms:

- `moveTo()` accepts coordinates.
- `mine()` accepts a direction: `"up"`, `"right"`, `"down"`, or `"left"`.
- In early non-sensor levels, the level may preload known ore coordinates into `api.memory`.
- `store()` targets the base object returned by `api.base()`.

### 4.7 Movement

- `moveTo(target)` attempts one step per tick.
- There is no pathfinding in v1.
- Movement is deterministic.
- Orthogonal movement only.
- Adjacency uses Manhattan distance 1.
- If multiple steps are equally good, the engine uses a fixed tie-break order: right, left, down, up.
- If a future level adds blocked terrain, movement rules must remain simple and predictable.

### 4.8 Information Model

- Drones only perceive the world through installed sensors.
- `sense()` returns exact local facts, but only shallow entity data.
- `SENSOR_BASIC` senses entities within Manhattan distance 3.
- `sense()` returns a snapshot of the physical world as it exists during that tick before actuator resolution.
- `sense()` includes all in-range ore deposits, friendly drones, and the base using the same radius rule.
- Sensors ignore occlusion in v1.
- Terrain does not block sensing in v1.
- The API does not expose engine internals, hidden world state, or deep object graphs.
- Early non-sensor levels may preload known ore target data into `api.memory`, including coordinates.
- This allows introductory harvesting levels to work without `sense()` while still teaching adjacency logic and directional actions.

### 4.9 Memory Model

- `memory` is per-drone persistent memory.
- `baseMemory` is shared persistent memory for all player drones in the level.
- Both are plain mutable JSON-like objects.
- Both have byte caps.
- At the start of a drone's execution, the runtime gives that drone mutable clones of its current `memory` and the current committed `baseMemory`.
- At the end of that drone's execution, the runtime serializes the entire `memory` object. If it exceeds the cap, the whole object is rejected and the prior committed version is preserved.
- At the end of that drone's execution, the runtime serializes the entire `baseMemory` object. If it exceeds the cap, the whole object is rejected and the prior committed version is preserved.
- Nested mutations are not tracked individually; commit or rejection always applies to the whole object.
- Because drones execute in stable drone-id order, later drones see committed `baseMemory` writes from earlier drones in the same tick.
- If multiple drones write the same key in one tick, the later drone in execution order wins because its committed object is newer.

### 4.10 Ops Model

- In v1, ops are charged only for API calls.
- Loops and generic JavaScript execution are not individually metered in the design rules.
- Runtime execution is still sandboxed and time-limited separately.
- Heavy pure-JS computation is intentionally not part of the puzzle space in v1.
- Level design should reward information gathering, coordination, and action selection rather than raw algorithmic CPU work.
- The purpose of ops in v1 is to pressure API usage and encourage efficient logic.
- If an API call would exceed the remaining op budget, that call fails immediately and the drone stops executing for the rest of the tick.
- Ops exhaustion does not roll back in-memory mutations made before execution halted; those mutations still go through the normal end-of-execution commit checks.

## 5. Modules and Constraints

### 5.1 Chassis Rule

- Every drone has 4 module slots.
- Modules take either 1 or 2 slots.
- No chassis classes in MVP.
- Battery is intrinsic to the chassis in MVP and does not consume a module slot.
- Build variety comes from module choice, not frame type.

### 5.2 Starter Module Set

| Module | Size | What It Provides |
|---|---:|---|
| `CPU_MICRO` | 1 | low ops budget, small memory |
| `CPU_BASIC` | 2 | medium ops budget, medium memory |
| `CPU_ADVANCED` | 2 | high ops budget, larger memory |
| `SENSOR_BASIC` | 1 | `sense()` |
| `LEGS` | 1 | `moveTo()` |
| `DRILL` | 1 | `mine()` |
| `CARGO` | 1 | cargo capacity, `store()` |

### 5.3 Intrinsic Chassis Battery

- Every drone chassis has a baseline battery capacity in MVP.
- Battery remains a core gameplay constraint, but it is not purchased through a slotted module in v1.
- This preserves the 4-slot specialization game while still allowing early self-sufficient mining drones.
- Post-MVP can reintroduce battery modules or larger power components if deeper hardware tradeoffs are needed.

### 5.4 Constraint Summary

- **Slots** limit hardware breadth.
- **Ops** limit decision complexity.
- **Battery** limits operational range.
- **Cargo** limits delivery cadence.
- **Memory** limits how much state can be retained.

These constraints should combine to create interesting choices without obscuring the core loop.

## 6. API Model

### 6.1 Core API

Available to all drones:

```ts
type DroneMemory = Record<string, any>;
type BaseMemory = Record<string, any>;

interface CoreAPI {
  self(): {
    id: string;
    x: number;
    y: number;
    battery: number;
    batteryMax: number;
    cargo: number;
    cargoMax: number;
  };

  base(): {
    id: string;
    x: number;
    y: number;
    ore: number;
  };

  tick(): number;
  log(message: string): void;
  memory: DroneMemory;
  baseMemory: BaseMemory;
}
```

### 6.2 Module APIs

```ts
interface SensorAPI {
  sense(): Array<{
    id: string;
    type: "ore" | "base" | "drone";
    x: number;
    y: number;
    amount?: number;
    cargo?: number;
    battery?: number;
    template?: string;
  }>;
}

interface LegsAPI {
  moveTo(target: { x: number; y: number }): void;
}

interface DrillAPI {
  mine(direction: "up" | "right" | "down" | "left"): void;
}

interface CargoAPI {
  store(target: { id: string; x: number; y: number }): void;
}
```

### 6.3 API Design Rules

- `sense()` is exact but shallow.
- `sense()` uses the installed sensor's fixed radius and returns a pre-resolution snapshot for the current tick.
- `moveTo()` takes one step per tick.
- `moveTo()` is coordinate-based in v1.
- `mine()` is a single-tick actuator intent that, if successful, extracts ore during same-tick resolution.
- `mine()` is directional in v1, not entity-targeted.
- `store()` deposits cargo at the base.
- `memory` and `baseMemory` are the only persistent writable state surfaces available to player code.
- If multiple actuator calls are attempted in one tick, only the first accepted actuator intent is recorded.
- Action validation happens at runtime.
- Editor typings only expose methods provided by installed modules plus the core API.

## 7. Puzzle Mechanic Taxonomy

### 7.1 Navigation

The player reasons about where drones should go and how efficiently they travel.

Subtypes:

- direct travel
- target choice
- route efficiency
- positional logic

### 7.2 Resource Handling

The player reasons about when to mine, when to return, and how cargo shapes throughput.

Subtypes:

- mine-return loop
- cargo thresholding
- deposit timing
- throughput improvement

### 7.3 Operational Constraints

The player reasons about limited resources that shape behavior.

Subtypes:

- battery as range
- ops as simplicity pressure
- local memory discipline
- shared memory discipline

### 7.4 Information

The player reasons about what is visible locally, what must be remembered, and what must be shared.

Subtypes:

- local perception
- partial knowledge
- memory as world model
- stale information

### 7.5 Coordination

The player reasons about making multiple drones cooperate rather than duplicate work.

Subtypes:

- identity-based differentiation
- reservation of work
- role assignment
- work distribution
- shared priorities

### 7.6 Hardware Identity

The player reasons about what a drone can physically do based on installed modules.

Subtypes:

- missing capability
- forced role
- slot tradeoff
- template thinking

### 7.7 Optimization

The player reasons about solving well, not merely eventually.

Subtypes:

- tick efficiency
- op efficiency
- ore efficiency
- behavioral efficiency

### 7.8 Failure Analysis

The player reasons about why a run failed and how to improve it.

Subtypes:

- battery failure
- op waste
- memory overflow
- coordination failure

## 8. Mechanic Matrix

| Mechanic | Required Systems | Required API | Required UI |
|---|---|---|---|
| Navigation | grid movement, deterministic stepping, target resolution | `moveTo()`, `self()`, `base()` | map, selected target or position, last action |
| Resource Handling | ore deposits, cargo, delivery to base | `mine()`, `store()`, `self()`, `base()` | cargo bar, ore counters, deposit inspector |
| Battery Constraint | per-tick drain, hard fail, reset flow | `self()`, `base()` | battery bar, failure banner, tick counter |
| Ops Constraint | op budgets, API-call accounting | all API calls, `tick()` | op meter, trace output, console warnings |
| Local State | per-drone persistent state, byte cap | `memory` | memory viewer, overflow warning |
| Shared Coordination | shared state, byte cap, deterministic writes | `baseMemory`, `self()` | baseMemory viewer, assignment visibility |
| Information Asymmetry | sensor-gated world knowledge | `sense()` | sensed entity list, selected entity details |
| Hardware Identity | module loadouts, module-gated API | module APIs, core API | loadout display, template docs |
| Identity / Role Split | stable drone ids, same-template execution | `self().id`, `memory`, `baseMemory` | drone list, per-drone inspector |
| Optimization | scoring and result tracking | all relevant APIs | post-run stats, optional bonuses |
| Failure Analysis | pause on fail, replay visibility, reset | all indirect | failure banner, console, timeline, inspector |

## 9. Starter Level Roster

### Level 1 - First Loop

- **Primary mechanic:** Resource Handling
- **Secondary mechanic:** Navigation
- **Validates:** the basic automation loop is understandable and satisfying without requiring sensors

### Level 2 - Return In Time

- **Primary mechanic:** Battery as Range
- **Secondary mechanic:** Resource Handling
- **Validates:** battery creates meaningful route planning

### Level 3 - Think Less

- **Primary mechanic:** Ops Constraint
- **Secondary mechanic:** Local State
- **Validates:** players can optimize code, not just behavior

### Level 4 - Same Code, Two Drones

- **Primary mechanic:** Coordination by Identity
- **Secondary mechanic:** Resource Handling
- **Validates:** multiple drones running one template can still behave differently

### Level 5 - Blind and Sighted

- **Primary mechanic:** Information Asymmetry
- **Secondary mechanic:** Hardware Identity
- **Validates:** hardware-defined APIs create meaningful specialization

### Level 6 - Claim the Work

- **Primary mechanic:** Shared Reservation
- **Secondary mechanic:** Coordination
- **Validates:** `baseMemory` enables useful team planning

### Level 7 - Build Matters

- **Primary mechanic:** Hardware Identity
- **Secondary mechanic:** Optimization
- **Validates:** loadout choices meaningfully shape solutions

### Level 8 - Full System Check

- **Primary mechanic:** Combined Coordination
- **Secondary mechanic:** Optimization
- **Validates:** the full drone programming loop remains compelling with a small fleet

## 10. Level Goals / Quests

### Level 1 - First Loop

- **Objective:** Collect 10 ore and deliver it to base.
- **Player task:** Write a script that uses preloaded ore target data, moves to the ore, mines it, and returns cargo home.
- **Optional bonus:** Finish within 80 ticks.

### Level 2 - Return In Time

- **Objective:** Collect 12 ore without depleting your drone's battery.
- **Player task:** Add battery-aware return logic.
- **Optional bonus:** Never drop below 20% battery.

### Level 3 - Think Less

- **Objective:** Collect 12 ore using a `CPU_MICRO` drone.
- **Player task:** Reduce wasted API calls and simplify decision logic.
- **Optional bonus:** Keep average ops per tick under 10.

### Level 4 - Same Code, Two Drones

- **Objective:** Collect 20 ore using two drones running the same template.
- **Player task:** Differentiate behavior using drone identity and state.
- **Optional bonus:** Ensure both drones contribute ore.

### Level 5 - Blind and Sighted

- **Objective:** Use the scout drone to locate ore and guide the miner drone to collect 15 ore.
- **Player task:** Write scout logic that shares findings through `baseMemory`, then use them from the miner.
- **Optional bonus:** Finish without any idle scout ticks after first contact.

### Level 6 - Claim the Work

- **Objective:** Collect 30 ore with three drones without sending two drones to the same deposit.
- **Player task:** Reserve or assign deposits in `baseMemory`.
- **Optional bonus:** No drone stays idle for more than 5 consecutive ticks.

### Level 7 - Build Matters

- **Objective:** Choose a drone template and collect 20 ore within the ore budget.
- **Player task:** Pick an efficient loadout and write logic that makes the most of it.
- **Optional bonus:** Complete the level using the cheapest successful template.

### Level 8 - Full System Check

- **Objective:** Coordinate your drone fleet to collect 40 ore before tick 200.
- **Player task:** Combine specialization, battery logic, shared memory, and efficient action loops.
- **Optional bonuses:** Complete with no battery failures; use less than a target total ops value.

## 11. Puzzle Mode Player Loop

### 11.1 Core Loop

1. Enter a level in paused state.
2. Inspect the map, templates, modules, and objective.
3. Edit template code.
4. Press `Play`.
5. Observe drone behavior, logs, and resource flow.
6. On success, review score and move on.
7. On failure, inspect what happened, then reset and iterate.

### 11.2 Failure UX Rules

- Failure pauses the simulation automatically.
- The game clearly states which drone failed, on which tick, and why.
- The player can inspect the current state before resetting.
- Reset keeps code edits intact.

## 12. UI Structure

### 12.1 Main Screen

- top bar with objective, controls, tick, and reset
- center map view for drones, ore, and base
- right panel for template selector, code editor, and API docs
- inspector panel for selected drone, ore, or base
- bottom console and timeline for runtime feedback

### 12.2 Required Readability Features

- visible battery and cargo for selected drones
- visible current template and loadout
- visible `memory` and `baseMemory`
- clear failure and warning messages
- easy reset after failed runs

## 13. System Implementation Roadmap

### Phase 1 - Core Solo Loop

Supports Levels 1-2.

Build:

- level loader
- tile map and renderer
- base entity
- ore deposit entity
- drone entity
- template binding
- imperative runtime execution
- `moveTo()`, `mine()`, `store()`
- `self()`, `base()`, `tick()`, `log()`, `memory`
- cargo system
- intrinsic chassis battery system
- level-provided starter memory for non-sensor levels
- hard fail + reset flow

Exit criteria:

- one drone can mine and return ore successfully
- battery depletion fails the run
- reset restores state but keeps code
- early solo levels work without requiring sensor support

### Phase 2 - Constraint Readability

Supports Level 3.

Build:

- API-call op accounting
- CPU-derived op budgets
- op exhaustion behavior that halts execution for the rest of the tick
- per-drone op display
- simple trace output

Exit criteria:

- players can understand why code exceeded budget
- simpler code performs better in practice

### Phase 3 - Multi-Drone Identity

Supports Level 4.

Build:

- multi-drone execution from one template
- stable ids
- deterministic tick ordering
- deterministic action resolution

Exit criteria:

- two drones can run one template and split work via identity/state

### Phase 4 - Information and Specialization

Supports Level 5.

Build:

- sensor module support
- `sense()` with fixed radius and pre-resolution snapshot semantics
- `baseMemory`
- shared-memory serialization and byte cap
- deterministic last-writer-wins semantics in stable drone-id order
- module-gated API typings in the editor
- runtime invalid-call safeguards
- loadout display

Exit criteria:

- a scout can discover local ore data
- a miner without sensors cannot directly perceive the same information
- scout-to-miner coordination through `baseMemory` works for Level 5-style puzzles
- sensing is introduced only once the player already understands non-sensor harvesting loops

### Phase 5 - Shared Coordination

Supports Level 6.

Build:

- simultaneous resolution rules for shared-resource contention
- memory inspection UI

Exit criteria:

- drones can reserve work and coordinate through shared state

### Phase 6 - Loadout Strategy

Supports Level 7.

Build:

- template and loadout selection in level config
- stat summaries derived from modules
- capability summaries in UI

Exit criteria:

- build choice materially affects viable solutions

### Phase 7 - Capstone and Scoring

Supports Level 8.

Build:

- post-run results summary
- score metrics such as ticks, ops, and ore spent
- replay or scrubber support for debugging
- polish pass on failure and success UX

Exit criteria:

- multi-drone levels are understandable, debuggable, and rewarding to optimize

## 14. Open Questions

- exact byte caps for `memory` and `baseMemory`
- exact op budgets and module balance values
- how much terrain complexity belongs in the MVP
- whether level 7 should use prebuilt choices or limited freeform assembly

## 15. Todo List

## Design

- [ ] Finalize v1 module stats: ops, battery, cargo, memory, ore costs
- [ ] Define exact sensed entity schema
- [ ] Define intrinsic chassis battery values and drain rules
- [ ] Validate fixed movement tie-break order through playtesting
- [ ] Define actuator validation rules and failure messaging
- [ ] Finalize byte caps for `memory` and `baseMemory`
- [ ] Finalize objective and bonus scoring rules

## Simulation

- [ ] Define world state TypeScript interfaces
- [ ] Implement tick loop order of operations
- [ ] Implement drone action resolution
- [ ] Implement ore extraction and deposit delivery
- [ ] Implement battery drain and hard-fail handling
- [ ] Implement deterministic multi-drone execution order
- [ ] Implement simultaneous resolution rules for movement, mining, and storing

## Runtime

- [ ] Integrate code execution sandbox strategy
- [ ] Implement template `run(api)` execution model
- [ ] Implement core API and module APIs
- [ ] Implement op accounting for API calls
- [ ] Implement ops exhaustion halt semantics
- [ ] Implement whole-object `memory` serialization and memory-cap rejection
- [ ] Implement `baseMemory` shared persistence, cap handling, and stable-order commit semantics

## Editor

- [ ] Add Monaco editor
- [ ] Generate per-template TypeScript API definitions
- [ ] Surface runtime errors and warnings clearly
- [ ] Show available API methods for selected template
- [ ] Add op-usage visibility and trace hooks

## UI

- [ ] Build puzzle mode layout
- [ ] Build canvas map renderer
- [ ] Build selected drone/base/ore inspector
- [ ] Build console and timeline panel
- [ ] Build failure banner and reset flow
- [ ] Build objective and bonus display

## Levels

- [ ] Spec Level 1 in detail
- [ ] Spec Level 2 in detail
- [ ] Spec Level 3 in detail
- [ ] Spec Level 4 in detail
- [ ] Spec Level 5 in detail
- [ ] Spec Level 6 in detail
- [ ] Spec Level 7 in detail
- [ ] Spec Level 8 in detail

## Polish

- [ ] Add post-run scoring summary
- [ ] Add replay or scrubber support
- [ ] Improve readability of `memory` and `baseMemory`
- [ ] Tune module values through playtesting
- [ ] Refine onboarding text and level intros

## 16. Post-MVP Ideas

- software deployment packets and delayed code updates
- field recharging, towing, and recovery mechanics
- larger chassis and additional physical module tiers
- communication modules and signal infrastructure
- fog of war and remote sensing chains
- persistent world and multiplayer expansion
