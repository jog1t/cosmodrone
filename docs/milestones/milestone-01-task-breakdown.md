# Milestone 01 - Task Breakdown

## Purpose

This document splits Milestone 01 into small shippable tasks.

Each task should end in a state that still runs, still boots, and still demonstrates progress clearly. The goal is to avoid a long period where many systems are half-built but nothing is playable.

## Shipping Rule

Every task should satisfy all of these:

- the app still starts
- the current feature can be shown in under 30 seconds
- no unfinished work leaves the main loop in a broken state
- if a task adds data or UI, it should be visible and testable immediately

## Task 01 - App Shell Boots

### Goal

Get a minimal frontend booting with a visible Cosmodrone frame.

### Deliverable

- app starts in browser
- page has placeholder layout for top bar, map, editor, and status panel
- no simulation yet

### Done When

- opening the app shows a stable shell instead of a blank page
- there is a visible placeholder for Level 01 objective and controls

### Why It Ships

It gives a visible starting point and a stable place to plug the rest of the game into.

## Task 02 - Static Level 01 World

### Goal

Render the Level 01 map and entities from static data.

### Deliverable

- base, ore, and drone appear in the right positions
- Level 01 data is loaded from a config object or file
- map is drawn on canvas or equivalent renderer

### Done When

- the player can open the app and visually identify the level layout
- the positions match `docs/levels/level-01-first-loop.md`

### Why It Ships

It proves the data model and visual language before simulation complexity enters.

## Task 03 - Tick Loop Without Scripting

### Goal

Create a simulation clock and world state updates without player code yet.

### Deliverable

- play, pause, and step controls work
- tick counter advances
- world state is stored centrally
- no drone actions yet

### Done When

- the app can step the world deterministically
- the map redraws correctly per tick

### Why It Ships

It creates the backbone needed for every later task.

## Task 04 - Hardcoded Drone Script

### Goal

Prove the solo harvesting loop works end-to-end before introducing the editor.

### Deliverable

- a hardcoded Level 01 drone behavior runs in the tick loop
- drone moves to ore, mines, returns, and stores
- base ore total increases

### Done When

- the drone can complete Level 01 automatically using hardcoded logic

### Why It Ships

It validates the simulation rules independently from runtime/editor integration.

## Task 05 - Core Actuators

### Goal

Formalize the world actions behind that hardcoded behavior.

### Deliverable

- `moveTo({ x, y })`
- `mine(direction)`
- `store(api.base())`
- cargo and ore updates work correctly

### Done When

- the hardcoded script uses the same actuator path the player script will use later
- movement, mining, and storing follow the Level 01 rules exactly

### Why It Ships

It turns prototype behavior into reusable game rules.

## Task 06 - Runtime Execution

### Goal

Replace hardcoded behavior with real `run(api)` execution.

### Deliverable

- template code string can be executed safely
- `api.self()`, `api.base()`, `api.tick()`, `api.log()`, and `api.memory` are exposed
- one accepted actuator intent per tick is enforced
- runtime errors are caught and surfaced

### Done When

- the working starter script from Level 01 can drive the drone successfully
- a broken script does not crash the app

### Why It Ships

This is the first true "program the machine" version of the game.

## Task 07 - Editable Script Panel

### Goal

Let the player change code directly in the UI.

### Deliverable

- editable code panel
- current template source is visible and changeable
- rerunning the level uses the edited code

### Done When

- changing one line of code changes drone behavior on the next run

### Why It Ships

This is the moment the project becomes a game instead of a scripted demo.

## Task 08 - Reset and Failure Flow

### Goal

Make iteration safe.

### Deliverable

- battery depletion ends the run
- success is clearly shown
- reset restores world state and starter memory
- code remains intact after reset

### Done When

- the player can intentionally fail, hit reset, and try again without losing work

### Why It Ships

The write-run-reset loop is the core product experience.

## Task 09 - Essential Status UI

### Goal

Expose enough state for the player to understand what is happening.

### Deliverable

- objective text
- tick display
- battery display
- cargo display
- base ore display
- selected entity or simple drone status panel
- starter memory visibility

### Done When

- a new player can see why the drone is moving, mining, or returning

### Why It Ships

Without readability, the loop is harder to learn and judge.

## Task 10 - Milestone 01 Polish Pass

### Goal

Make the first slice demoable.

### Deliverable

- clear failure banner
- clear success message
- stable Level 01 starter code
- small onboarding hints for directional mining and starter memory

### Done When

- the 2-minute milestone demo can be shown smoothly
- another person can try Level 01 without verbal explanation from the developer

### Why It Ships

This task turns a functioning prototype into a credible first milestone.

## Recommended Order

1. Task 01 - App Shell Boots
2. Task 02 - Static Level 01 World
3. Task 03 - Tick Loop Without Scripting
4. Task 04 - Hardcoded Drone Script
5. Task 05 - Core Actuators
6. Task 06 - Runtime Execution
7. Task 07 - Editable Script Panel
8. Task 08 - Reset and Failure Flow
9. Task 09 - Essential Status UI
10. Task 10 - Milestone 01 Polish Pass

## Parallelizable Work

Some tasks can overlap lightly, but the safest sequencing is still mostly linear.

- Task 01 and initial visual styling can overlap
- Task 02 and Level 01 data shaping can overlap
- Task 09 can begin once Task 03 exposes world state
- Task 10 can begin only after Task 08 is stable

## Hard Gates

Do not start these until the earlier gate is real:

- do not build editable scripting before a hardcoded drone can already finish the level
- do not build reset flow before world state can be re-created from source data
- do not polish UX before the runtime loop is actually stable

## Definition of Success

Milestone 01 is healthy if each completed task leaves the project in a state where you could:

- run the app
- show the new behavior quickly
- explain the progress in one sentence

If a task cannot be demonstrated easily, it is probably still too large.
