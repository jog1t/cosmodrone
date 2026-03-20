# Cosmodrone Concept Doc

## Overview

Cosmodrone is a programming-driven strategy and factory game about building autonomous drone systems under real hardware constraints.

The core fantasy is simple:

> Build the machine. Write the mind. Watch it live.

Players do not directly micromanage units. Instead, they design drone loadouts, write small programs for them, build supply and communication networks, and watch their systems adapt to a living world.

Cosmodrone takes the core magic of Screeps - writing real code that controls autonomous agents - and reimagines it with stronger onboarding, deeper world simulation, better strategic texture, richer observability, and more meaningful social and economic play.

## Design Goals

- Preserve the core magic of coding autonomous agents.
- Replace giant central control scripts with small, constrained, hardware-shaped programs.
- Make strategy, logistics, and distributed systems design the real depth layer.
- Build a world where incomplete information, geography, trade, and infrastructure matter.
- Make debugging, replay, and watching systems run feel as satisfying as building them.
- Create a game that can start as a puzzle/sandbox experience and later grow into a deeper multiplayer ecosystem.

## Core Pillars

### 1. Hardware Defines Possibility

Every drone is a blank chassis with module slots. Modules do not just improve stats - they define the API surface available to that drone.

- No sensor module: no sensing API.
- No radio module: no wireless communication.
- No drill: no extraction action.
- Bigger CPU: more ops, more memory, more sophisticated behavior.

The player is not only writing code. They are designing the hardware the code is allowed to run on.

### 2. Small Code Is the Fantasy

The game should encourage compact, specialized programs rather than one giant god-AI.

- Miners run mining logic.
- Scouts run scouting logic.
- Couriers run transport logic.
- Structures run broader coordination logic.

Complexity should emerge from many small programs interacting through infrastructure, shared state, and communication networks.

### 3. Code Is a Resource

Computation is a first-class economic and strategic constraint.

- CPU defines ops budget per tick.
- Memory defines persistent state capacity.
- Active modules drain power.
- Communication has range, latency, and cost.

Players are not just solving problems with code. They are allocating intelligence across a physical network.

### 4. Information Is Incomplete

The player should not have omniscient control over the world.

- Vision comes from drones, sensors, structures, and relay infrastructure.
- Intel gets stale.
- Exploration is a real investment.
- Attacking communication infrastructure can blind an opponent.

Fog of war is not just a feature. It is the foundation that makes sensing, scouting, memory, and networks matter.

### 5. The World Pushes Back

Cosmodrone should feel like a real strategy/factory world, not a static coding sandbox.

- Biomes have different resources and constraints.
- Environmental hazards require different programming approaches.
- Resources shift, deplete, and create strategic migration.
- PvE ecology competes for the same space and materials.
- Accidents, cascading failures, and infrastructure fragility create stories.

### 6. Watching Systems Work Is Gameplay

One of the most important emotional payoffs is stepping back and watching the whole system run.

- Drones move like a living logistics network.
- Power flows through visible infrastructure.
- Signals pulse across relay chains.
- Replays and debug views expose decision-making.

The game should feel beautiful through information density and system clarity, not through expensive graphics.

## Core Gameplay Loop

At a high level, the game loop is:

1. Explore and gather information.
2. Mine and transport resources.
3. Manufacture modules, drones, and infrastructure.
4. Write or improve behavior code for specialized templates.
5. Deploy drones and firmware updates.
6. Observe performance, failures, and bottlenecks.
7. Refine hardware, software, and network topology.
8. Expand, trade, defend, discover, or specialize.

The moment-to-moment loop is write -> deploy -> watch -> inspect -> improve.

## Core Systems

## 1. Programming Model

The player's code is the interface to the game.

Preferred long-term direction:

- Event-driven or reactive programming at the player-facing layer.
- Small engine primitive events.
- Player-defined higher-level signals and abstractions.

The engine should expose only a compact set of primitive hooks, while advanced players compose richer event systems themselves. This avoids replacing one giant `main()` function with a giant engine hook surface.

In practice, the game teaches architecture:

- reactive systems
- pub/sub patterns
- state machines
- distributed coordination
- graceful degradation

## 2. Drone and Building Model

Everything in the game follows the same mental model:

- chassis or platform
- module slots
- hardware-defined capabilities
- code running within compute and power constraints

Drones are mobile chassis.
Buildings are larger stationary chassis.

This keeps the whole game learnable through one unified system.

## 3. Module System

Modules are the main axis of progression, specialization, and experimentation.

Example module categories:

- CPU modules
- memory modules
- sensor modules
- movement modules
- extraction tools
- cargo modules
- battery modules
- wireless communication modules
- wired communication or docking modules
- specialized experimental or anomaly-derived modules

Modules create meaningful tradeoffs:

- better sensors cost more power
- bigger CPUs occupy more slots and need more resources
- larger batteries extend range but reduce room for other tools
- faster movement can come with efficiency penalties

The build space should support scouts, miners, haulers, relays, defenders, salvagers, and stranger hybrid roles discovered by players.

## 4. Compute, Ops, and Ticks

Cosmodrone separates thought from action.

- Ticks are world time steps.
- Ops are the amount of thinking a unit can do inside a tick.

This lets the game model intelligence as a budget.

- Cheap units can make simple decisions frequently.
- Expensive units can spend ops on richer logic.
- Physical actions can still take multiple ticks even when the decision itself was cheap.

The goal is not to ban language features. The goal is to make computation economically meaningful.

## 5. Power and Range

Power is the second major constraint after compute.

- Active modules drain battery or infrastructure power.
- Long-range operations require recharging or power support.
- Better code can translate into better endurance by avoiding wasteful behavior.
- Large empires require real energy infrastructure.

This makes intelligence, logistics, and territory shape tightly connected.

## 6. Communication and Networks

There should be no magical global command bus.

Communication options can include:

- wired ports
- short-range radio
- long-range radio
- relay towers
- data docks and update stations

This turns empire coordination into a real engineering problem.

- Frontier units may operate with stale instructions.
- Communication topology affects response speed and control quality.
- Raiding a relay chain can cut off a region.

The network is the empire's nervous system.

## 7. Fog of War and Knowledge

Players should only know what their systems know.

- Vision comes from sensors and infrastructure.
- Map knowledge lives in in-game memory and reporting systems.
- Stale information should remain useful but unreliable.
- Ambient hints can suggest activity beyond direct sight.

This makes scouting, reporting, memory, and adaptation core strategy problems instead of optional niceties.

## 8. Economy and Supply Chains

The economy should eventually become deep enough that specialization and trade are natural, not optional.

Long-term direction:

- multiple biomes
- distinct resource types
- manufacturing chains
- intermediate goods
- module production infrastructure
- geography-driven scarcity

The ideal outcome is an economy where:

- no one player efficiently produces everything
- trade routes matter
- player specialization is rewarded
- logistics networks are as important as combat power

The inspiration is distributed Factorio: many factories, many owners, one interdependent world.

## 9. Programmable Diplomacy

One of the most promising long-term ideas is a programmable protocol layer between players.

Players should be able to build code around:

- structured messages
- trade offers
- alliance rules
- defense pacts
- contracts and escrow-like systems
- automated marketplaces
- governance logic for shared infrastructure

The social layer becomes another engineering problem, not just a chat channel.

## 10. Discovery and Exploration

The world should reward curiosity.

Discovery vectors can include:

- anomalies that bend normal rules
- NPC stations with strange behaviors or recipes
- unique or weird modules that are not simply stronger
- hidden environmental interactions
- region-specific mechanics

These discoveries should create community conversation, experimentation, and asymmetrical knowledge.

Unique modules should be interesting rather than flat upgrades.

Good examples:

- pass through walls briefly at extreme power cost
- replay recent state from another drone
- paired mining modules that only work in coordinated sets
- modules that interact with anomalies or NPC systems

## 11. Salvage and Archaeology

Ruins and defeated systems should remain part of the world's history.

Salvage should focus on hardware, not stealing players' actual code.

Possible salvage outcomes:

- scrap modules into materials
- study damaged modules to unlock or reveal recipes
- reuse degraded modules with unreliable behavior

This supports:

- underdog recovery loops
- scavenger playstyles
- valuable ruins
- a world that remembers previous players and conflicts

## 12. Environmental Hazards and World Texture

Hazards should introduce programming problems, not just stat penalties.

Examples:

- radio disruption from solar storms
- terrain changes from seismic activity
- corrosive zones that accelerate module degradation
- noisy sensor environments requiring filtering
- seasonal shifts in power and resource availability

The point is to force adaptation in code and infrastructure design.

## 13. PvE Ecosystem

The world should feel alive even without human conflict.

PvE entities can:

- compete for the same resources
- create pressure in poorly defended areas
- alter regional conditions
- become targets for study, salvage, or capture

The strongest version of this idea is that wild entities use similar systemic rules to the player, making them part of the same mechanical universe rather than scripted enemies.

## 14. Deployment as Gameplay

Software deployment should be part of the simulation.

Instead of instant, global code updates:

- firmware is compiled at key structures
- updates travel through communication infrastructure
- remote drones may update more slowly
- different regions can run different versions intentionally

This naturally creates gameplay around:

- staged rollouts
- rollback strategies
- frontline stability vs experimental builds
- network dependency for maintenance

It also makes software operations feel tangible, which is a powerful thematic fit.

## 15. Observability, Debugging, and Replay

The debugging experience should be one of the game's signature strengths.

Players should be able to:

- inspect a drone's code and current state
- see ops usage and module status
- replay recent execution
- step through behavior traces
- visualize message traffic, power usage, and bottlenecks

The game should feel like a beautiful observability platform for a living machine empire.

## 16. Spectator and Content Layer

Cosmodrone has strong potential as a spectator and storytelling game if replay and explanation tools are first-class.

Useful content features:

- replay timelines
- annotated battle or logistics reports
- shared decision traces
- metrics beyond territorial control
- exportable stories from interesting system failures or recoveries

The game should support watching both what happened and why it happened.

## 17. Guilds and Shared Infrastructure

Groups should eventually be able to share more than a chat room.

Possible guild systems:

- communal relay networks
- pooled factories
- shared power grids
- contribution tracking
- programmable governance rules

This creates organizational gameplay around fairness, allocation, trust, and institutional design.

## 18. Seasonal and Meta Refresh Systems

Long-term persistent worlds risk stagnation. Seasonal or rule-mutating environments can keep the game fresh.

Examples:

- scarce energy, abundant minerals
- heavy PvE pressure requiring cooperation
- strict compute budgets favoring elegant code
- biome reshuffles or resource shifts

Permanent worlds can still exist, but seasonal contexts help new players enter on fairer footing.

## New Player vs Veteran Balance Philosophy

The game should not rely primarily on artificial protection.

Instead, its systems should naturally create limits on runaway empire dominance:

- maintenance burden grows with scale
- power and communication fragility increase with sprawl
- distance weakens coordination
- frontier forces become less responsive
- defending at home is cheaper than projecting force far away
- smaller operations can be more efficient and resilient

The ideal result is that new players are often more valuable alive as trade partners, buffers, or regional specialists than as territory to crush.

## Aesthetic Direction

Cosmodrone does not need expensive visuals to be compelling.

The strongest visual direction is information-dense, schematic, and readable.

Potential qualities:

- circuit-board or terminal-inspired map presentation
- clear glyphs for drones and structures
- visible network flows and power pulses
- strong profiler and overlay design
- low-fidelity assets with high systemic clarity

The beauty should come from seeing a complex distributed system functioning correctly.

## Why This Is Different

Cosmodrone is not just a coding sandbox.

It aims to combine:

- the autonomous programming fantasy of Screeps
- the production and throughput pleasure of factory games
- the incomplete-information pressure of strategy games
- the systems storytelling of simulation games
- the observability joy of engineering tools

The code matters, but it matters because the world is rich enough to challenge it.

## MVP Validation Direction

The right first question is not whether the full MMO is viable.

The right first question is:

> Is writing small, constrained programs for modular drones fun enough on its own?

That suggests a smaller first step:

- browser-based
- puzzle-first
- single-player or local sandbox
- minimal module set
- strong editor and playback tools
- very low operational complexity

If that core loop works, the larger world systems can be layered on later.

## Non-MVP Long-Term Feature Set

The full concept space includes:

- guilds
- sound as an information channel
- spectator tooling
- PvE ecosystems
- environmental hazards
- deep per-drone debug tools
- salvage and archaeology
- deployment as gameplay
- hidden modules and NPC stations
- programmable diplomacy
- seasonal servers or seasonal world systems
- discoverable world mechanics and anomalies

These should be treated as expansion layers on top of a strong core, not prerequisites for proving the idea.

## Closing Statement

Cosmodrone should make players feel like they are designing a living distributed machine civilization.

They should feel the tension between intelligence and efficiency, between local autonomy and central planning, between exploration and stability, between elegant code and hostile reality.

If it works, the player's best moments are not just solving a puzzle or winning a fight. They are stepping back, looking at the map, and realizing:

- the drones are moving
- the relays are humming
- the supply lines are flowing
- the defenses are reacting
- the code is holding

The machine is alive because they built both its body and its mind.
