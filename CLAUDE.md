# Claude Development Notes

**Purpose**: Technical implementation details, design specifications, and development context.

**Note**: See [README.md](README.md) for project overview and roadmap.

## Project Context

Interactive website background. B2 Spirit bomber silhouette that becomes controllable via throttle input. Easter egg design—no obvious UI.

**Philosophy**: Pure visual minimalism. No compromises on modern tech—use latest THREE.js, WebGPU, whatever works best.

## Key Design Decisions

### Why WebGPU?
- Modern renderer with better performance
- Future-proof technology
- Native support in THREE.js r152+
- Enables more complex scenes with minimal overhead

### Why No Build System Initially?
- Keep setup simple
- ES modules work natively in modern browsers
- Add complexity only when needed
- Easier debugging during development

### Control Philosophy

**Not FPV Racing**: We're not simulating drone physics. This is about elegant, meditative control.

Controls should feel:
- **Smooth**: Heavily damped, no snappy movements
- **Responsive**: Input is felt immediately but gracefully
- **Intuitive**: Left moves left, up tilts up
- **Throttle Control**: Adjusts speed of approaching gates
- **Minimal Physics**: Pitch, roll, lateral movement with smooth interpolation

Think less "racing game" and more "screensaver you can steer."

**Input Methods**:
- **Keyboard**: Arrow keys or WASD for pitch/roll, Space/Shift or W/S for throttle
- **Mouse**: Movement for pitch/roll, wheel for throttle
- **Controller**: Left stick for pitch/roll, triggers for throttle (natural for FPV pilots)

## Code Style Guidelines

### Declarative Over Imperative
```javascript
// Good - declarative
const airplane = createAirplane({ position: [0, 10, 0] })
scene.add(airplane)

// Avoid - imperative
const airplane = new THREE.Group()
airplane.position.x = 0
airplane.position.y = 10
airplane.position.z = 0
scene.add(airplane)
```

### Pure Functions Where Possible
```javascript
// Good - pure function
const updateVelocity = (velocity, acceleration, deltaTime) =>
  velocity.clone().add(acceleration.multiplyScalar(deltaTime))

// Avoid - mutation
const updateVelocity = (velocity, acceleration, deltaTime) => {
  velocity.add(acceleration.multiplyScalar(deltaTime))
  return velocity
}
```

### Clear Naming
Use descriptive names that reveal intent:
- `applyPhysics()` not `update()`
- `checkGateCollision()` not `check()`
- `resetToStartPosition()` not `reset()`

## THREE.js WebGPU Notes

### Renderer Setup
```javascript
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js'
const renderer = new WebGPURenderer({ antialias: true })
```

### Compatibility Check
Use latest THREE.js WebGPU renderer. No fallbacks, no compatibility layers.

## Visual & Interaction Approach

### Initial State (Inactive)
- B2 Spirit is a dark silhouette against #121212 background
- Barely visible, no indication it's interactive
- **No cursor change**: It's an easter egg, not obviously interactive
- Static, mysterious presence
- Very subtle edge definition, almost invisible

### Activation Sequence (Throttle-to-Activate)
- User scrolls mouse wheel up (or controller trigger)
- **Thrusters ignite**: Engine glow begins
- Silhouette **lights up progressively** as throttle increases
- 3D form **reveals itself** through edge lighting
- Gates begin spawning and approaching
- Full control becomes available

The throttle input IS the activation mechanism. Elegant and intuitive.

### Movement System
- **Bomber mostly stationary** in world space (slight positional adjustments)
- Camera attached behind bomber
- **Gates move toward the bomber** at speed controlled by throttle
- User controls rotate/translate the bomber to align with gates
- Creates illusion of flight without moving through space

This is more efficient and creates the "infinite flight" feeling.

## Gate System

Gates should be:
- **Square/rectangular frame geometry** (low-poly, hollow squares)
- **Pure red color** (#ff2222) with emissive glow
- **Spawn in distance** (z = -1000 or beyond)
- **Move toward bomber** at speed controlled by throttle
- **Despawn behind** bomber after passing
- **Emissive material**: Red edges stand out against dark background
- **Randomized positions**: Create varied flight paths
- **Forgiving collision**: Generous pass-through detection
- **Only appear after activation**: Gates don't exist until throttle engages (throttle = 0 initially)

Visual inspiration: Tron Legacy meets cyberpunk aesthetic, but minimal.

## Performance Considerations

Start simple, optimize only when needed:
- Use instancing for multiple gates
- LOD only if many distant objects
- Keep draw calls low
- Profile before optimizing

## Visual Design Details

### Color Palette
- **Background**: #121212 (near black)
- **Inactive B2**: #0f0f0f silhouette (barely visible)
- **Thruster Glow**: Warm orange/blue engine glow as throttle increases
- **Active B2**: #1f1f1f with #3a3a5a edge lighting (revealed by thrusters)
- **Gates**: #ff2222 (pure red) with emissive glow
- **Accents**: Dark blue/purple for B2, red for gates

### Lighting
- **Minimal**: One or two subtle lights maximum
- **Edge lighting**: Rim lighting effect on B2 (only when active)
- **Thruster glow**: Emissive engine ports that light up the form
- **Gate glow**: Red/orange emissive edges on square gates
- **No shadows**: Keep it simple and performant
- **Fog/atmosphere**: Very subtle depth fog

### Materials
- **Low reflectivity**: Matte surfaces
- **Edge emphasis**: Use rim lighting/fresnel effects
- **Emissive thrusters**: Glow reveals the form
- **Emissive gates**: Red/orange square frames
- **No textures**: Pure geometry and materials

## Finalized Decisions

### UI & Interaction
- **No UI text**: Pure visual experience. Website title will be added last as single HTML tag
- **Throttle starts at 0**: Inactive state until user scrolls wheel/pulls trigger
- **No particle effects**: Keep it minimal
- **No audio**: Focus purely on visual experience

### Controls Priority
1. **Desktop**: Keyboard, mouse wheel, gamepad (initial implementation)
2. **Mobile**: Gyroscope control (final feature to add)

### Visual Constants
- **Gate color**: #ff2222 (pure red, simple and bold)
- **Background**: #121212 (near black)
- **Inactive B2**: #0f0f0f (barely visible silhouette)

## Session History

### 2026-02-04: Initial Setup
- Created README.md with project vision and plan
- Created this file (CLAUDE.md) for development context
- Established code style guidelines and design philosophy
- Defined repository structure

### 2026-02-04: Vision Refinement
- Refined concept: B2 Spirit stealth bomber, not generic airplane
- Dark aesthetic: #121212 background, minimal lighting, low-poly
- **Throttle-to-activate**: Mouse wheel/controller trigger starts thrusters
- **Easter egg design**: No cursor change, silhouette reveals as thrusters ignite
- Gates approach the bomber (bomber stays relatively stationary)
- **Square gates** with **#ff2222 red** emissive glow
- Focus: Interactive website background, not a game
- Multi-input support: keyboard, mouse (with wheel throttle), and gamepad/controller
- Thruster glow reveals 3D form progressively
- Updated both README.md and CLAUDE.md to reflect stealth aesthetic

### 2026-02-04: Finalized Design Decisions
- No UI text, no particle effects, no audio (pure minimal visual)
- Throttle starts at 0 (inactive state)
- Gate color: #ff2222 (pure red)
- Mobile gyroscope control as final feature
- Website title to be added last as simple HTML tag
- No compatibility concerns—use latest THREE.js/WebGPU

### 2026-02-04: Documentation Refactor
- Separated README.md (user-facing, high-level) from CLAUDE.md (implementation)
- Removed duplication: specs live in CLAUDE.md, vision/roadmap in README.md
- Removed compatibility sections—just use latest tech

---

**Remember**:
- README.md = **what** we're building (vision, roadmap)
- CLAUDE.md = **how** we're building it (specs, colors, code style)
