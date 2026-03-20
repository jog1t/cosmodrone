# Milestone 01 - Core Solo Loop

## Goal

Deliver the smallest playable vertical slice of Cosmodrone.

Milestone 01 is complete when a player can open the game in a browser, edit a single drone script, run Level 01, watch the drone move/mine/store autonomously, fail safely, reset the run, and try again without losing code.

This milestone is not about content breadth. It is about proving the core loop is real, legible, and satisfying.

Implementation should follow the smaller shippable slices in `docs/milestones/milestone-01-task-breakdown.md`.

## Player Promise

By the end of this milestone, the game should already answer this question with a believable "yes":

> Can a tiny programmable drone be fun to write, watch, and debug?

## Scope

### Included

- one playable puzzle: `Level 01 - First Loop`
- one drone
- one template
- one script editor
- one simulation loop
- one map renderer
- one reset flow
- battery, cargo, and ore rules
- coordinate movement and directional mining
- starter memory support for early non-sensor levels

### Explicitly Excluded

- sensors
- `baseMemory`
- multiple drones
- template switching
- loadout selection
- sandbox mode
- scoring or stars beyond a simple optional tick bonus display
- advanced tracing, replay scrubber, or op heatmaps

## Milestone Deliverables

### 1. Playable Level

Ship `docs/levels/level-01-first-loop.md` as a working in-game puzzle.

Required behavior:

- load the level successfully
- spawn the base, ore deposit, and one drone in correct positions
- preload starter memory with ore coordinates
- allow the player to run the starter code and see the drone complete the loop

### 2. Runtime Slice

Implement the minimal runtime contract needed for Level 01.

Required API:

- `api.self()`
- `api.base()`
- `api.tick()`
- `api.log()`
- `api.memory`
- `api.moveTo({ x, y })`
- `api.mine(direction)`
- `api.store(api.base())`

Required runtime rules:

- imperative `run(api)` execution
- one accepted actuator intent per tick
- coordinate-based movement
- directional mining
- same-tick actuator resolution
- battery depletion ends the run
- reset restores the world and memory, but not player code

### 3. World Simulation Slice

Implement only the world state needed for Level 01.

Required entities:

- base
- ore deposit
- drone

Required state:

- drone position
- drone battery
- drone cargo
- base ore total
- ore remaining in deposit
- per-drone `memory`

### 4. UI Slice

Implement the smallest usable UI.

Required layout:

- top bar with level title, objective, play/pause, step, reset, tick
- center canvas map
- right-side code editor
- simple inspector or status panel
- bottom console optional, but recommended

Required visible information:

- current tick
- drone battery
- drone cargo
- base ore total
- current script
- selected entity details or equivalent status readout
- clear success/failure messaging

### 5. Failure and Reset Flow

Required behavior:

- battery depletion pauses the run automatically
- success pauses or marks completion clearly
- `Reset Run` restores:
  - drone position
  - drone battery
  - drone cargo
  - ore amount
  - base ore total
  - per-drone `memory`
  - shared `baseMemory` if present in the engine
- code in the editor remains unchanged after reset

## Acceptance Criteria

Milestone 01 is done when all of the following are true:

- Level 01 can be completed from a fresh page load
- the fully working starter code solves the level without manual intervention
- editing the code changes drone behavior on the next run
- reset is reliable and never loses code
- the player can understand why the drone is moving, mining, or storing
- the player can see enough state to debug a mistake
- a broken script fails safely without crashing the app

## Required Systems Breakdown

### Simulation

- level loader for a single JSON level definition
- tick loop
- entity update rules
- ore extraction
- cargo deposit
- battery drain
- hard fail on battery depletion

### Runtime

- `run(api)` function execution
- minimal sandbox integration
- API-call op accounting can be stubbed or omitted if needed for the first playable
- runtime error capture and display
- per-drone mutable `memory`

### Rendering

- canvas grid
- base marker
- ore marker
- drone marker
- simple movement animation or per-tick redraw

### Editor

- editable JS source
- one template only
- run/reset loop integrated with the sim

### UI

- objective display
- controls
- status panel
- failure/success banner

## Recommended Implementation Order

1. hardcode Level 01 world state in memory
2. implement tick loop without player scripting
3. implement `moveTo`, `mine`, `store`
4. attach a hardcoded script and verify the drone completes the level
5. replace hardcoded script with editable `run(api)` source
6. add reset behavior
7. add UI polish and failure messaging
8. switch level definition to loaded config data

## Risks

### Risk 1 - Directional Mining Feels Confusing

Mitigation:

- show the ore target in starter memory
- show the helper function in starter code
- make the map tiny and legible

### Risk 2 - Reset Is Buggy

Mitigation:

- treat reset as full world reinitialization from level config
- never reuse mutated runtime objects after reset

### Risk 3 - Editor/Runtime Integration Slows Progress

Mitigation:

- ship Milestone 01 with a minimal editor integration first
- defer Monaco-specific polish if a simpler code textarea helps reach first playable faster

### Risk 4 - Battery Adds Friction Too Early

Mitigation:

- keep battery generous in Level 01
- use it as a fail-safe, not the main challenge

## Non-Goals for This Milestone

Do not expand scope to include:

- sensor logic
- scout/miner cooperation
- shared memory UI
- loadout economics
- pathfinding
- multiple templates
- advanced debug playback

If any of those appear necessary, the milestone is too large.

## Exit Demo

The milestone demo should be showable in under 2 minutes:

1. open the game
2. show Level 01 objective
3. hit play and watch the drone harvest ore
4. edit one line of code and show behavior change
5. break the script on purpose
6. reset the run and show code persistence

If this demo feels good, the project has a real core.

## Definition of Done Checklist

- [ ] Level 01 loads from data, not hardcoded UI state
- [ ] One drone can move to ore, mine, return, and store
- [ ] Starter memory is injected correctly
- [ ] Battery drains and can fail the run
- [ ] Success condition triggers at 10 delivered ore
- [ ] Reset restores level state and memory exactly
- [ ] Code survives reset
- [ ] Runtime errors are surfaced without crashing the game
- [ ] The UI shows enough state to understand what is happening
- [ ] The loop is satisfying enough to show to another person without explanation
