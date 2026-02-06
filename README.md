# Stealth Flight Interactive Background

An interactive website background featuring a controllable B2 Spirit stealth bomber navigating through approaching gates. Built with THREE.js WebGPU renderer.

## Current Status

🟡 **Planning Phase** - Vision refined, project structure being defined

## Project Vision

A dark, minimal, interactive website background that comes alive on interaction. Visitors encounter a dark silhouette of a B2 Spirit bomber against near-black space. Scrolling the mouse wheel ignites the thrusters—revealing its 3D form through glowing engines and beginning a meditative flight through red square gates that emerge from darkness.

The experience is subtle, atmospheric, and elegant—an easter egg background that happens to be controllable.

## Core Features

- **Throttle-to-Activate**: Mouse wheel/controller ignites thrusters, progressively reveals the form
- **Easter Egg Design**: No obvious interactivity—visitors discover it organically
- **B2 Spirit Bomber**: Iconic low-polygon stealth aircraft
- **Square Gates**: Red square frames emerge from darkness and approach
- **Dark Aesthetic**: Minimal lighting, subtle reveals, pure visual experience
- **WebGPU Renderer**: Modern THREE.js renderer for smooth performance
- **Multi-Platform**: Desktop (keyboard/mouse/gamepad) and mobile (gyroscope)

## Technical Stack

- **THREE.js** with WebGPU renderer
- Vanilla JavaScript (ES modules)
- HTML5 + CSS3
- No build tools initially (may add Vite if needed)

## Repository Layout

```
/
├── README.md           # This file - project overview and status
├── CLAUDE.md          # Development notes and context for Claude
├── index.html         # Main entry point (planned)
├── src/               # Source code (planned)
│   ├── main.js       # Game initialization
│   ├── airplane.js   # Airplane physics and controls
│   ├── gates.js      # Gate generation and collision
│   ├── camera.js     # FPV camera system
│   └── scene.js      # THREE.js scene setup
└── assets/           # 3D models, textures (planned)
```

## Development Plan

### Phase 1: Dark Foundation
- [x] Minimal HTML structure
- [x] THREE.js WebGPU renderer initialization
- [x] Dark scene with minimal lighting
- [x] WebGPU compatibility check

### Phase 2: Stealth Bomber
- [x] Low-poly B2 Spirit geometry
- [x] Inactive silhouette state
- [x] Thruster glow system
- [x] Throttle-to-activate mechanism
- [x] Progressive reveal animation
- [x] Camera positioning

### Phase 3: Flight Controls
- [x] Pitch and roll mechanics
- [x] Lateral movement
- [x] Throttle control
- [x] Smooth, damped control feel
- [x] Keyboard, mouse, gamepad support

### Phase 4: Approaching Gates
- [x] Square gate geometry
- [x] Red emissive material
- [x] Spawning and approach system
- [x] Collision detection
- [x] Randomized positioning

### Phase 5: Polish & Mobile
- [ ] Performance optimization
- [ ] WebGPU fallback (WebGL)
- [ ] Mobile gyroscope controls
- [ ] Website title element

## Design Philosophy

**Stealth Aesthetic**: Dark, minimal, atmospheric. Less is more.

**Background First**: This is a website background that happens to be interactive, not a game pretending to be a background.

**Declarative Style**: Code should read like a description of what it does, not how it does it.

**Elegant Solutions**: Prefer clean, understandable implementations over clever optimizations.

**Subtle Interaction**: Everything should feel meditative, not gamified. No scores, no timers, no UI, no audio—just flow.

**Pure Visual**: Focus entirely on the visual experience. Minimalism in design and interaction.

## Getting Started

_(Instructions will be added once implementation begins)_

---

**For implementation details, see [CLAUDE.md](CLAUDE.md)**

**Last Updated**: 2026-02-04
