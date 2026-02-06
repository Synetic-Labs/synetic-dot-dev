import * as THREE from 'three'

const GATE_COLOR = 0xff2222
const GATE_OUTER = 8
const GATE_INNER = 7.2
const GATE_DEPTH = 0.15
const SPAWN_Z = -250
const DESPAWN_Z = 30
const POOL_SIZE = 12
const BASE_INTERVAL = 1      // Seconds between spawns at full throttle
const BASE_SPEED = 500          // Units/second at full throttle
const RANGE_X = 8               // Random horizontal spread
const RANGE_Y = 4               // Random vertical spread

/**
 * Creates the shared gate frame geometry (square with hole)
 */
const createFrameGeometry = () => {
  const outer = GATE_OUTER / 2
  const inner = GATE_INNER / 2

  const shape = new THREE.Shape()
  shape.moveTo(-outer, -outer)
  shape.lineTo(outer, -outer)
  shape.lineTo(outer, outer)
  shape.lineTo(-outer, outer)
  shape.lineTo(-outer, -outer)

  const hole = new THREE.Path()
  hole.moveTo(-inner, -inner)
  hole.lineTo(-inner, inner)
  hole.lineTo(inner, inner)
  hole.lineTo(inner, -inner)
  hole.lineTo(-inner, -inner)
  shape.holes.push(hole)

  return new THREE.ExtrudeGeometry(shape, {
    depth: GATE_DEPTH,
    bevelEnabled: false
  })
}

/**
 * Creates the approaching gate system
 * Gates spawn in the distance and move toward the bomber
 */
export const createGateSystem = () => {
  const geometry = createFrameGeometry()
  const group = new THREE.Group()

  // Gate pool - pre-allocate all meshes
  const pool = Array.from({ length: POOL_SIZE }, () => {
    const material = new THREE.MeshBasicMaterial({
      color: GATE_COLOR,
      transparent: true,
      opacity: 0.85
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.visible = false
    group.add(mesh)
    return { mesh, material, active: false, passed: false, dissolving: false, dissolveTimer: 0 }
  })

  let spawnTimer = 0
  let active = false

  const spawnGate = () => {
    const gate = pool.find(g => !g.active)
    if (!gate) return

    gate.active = true
    gate.passed = false
    gate.dissolving = false
    gate.dissolveTimer = 0
    gate.mesh.visible = true
    gate.mesh.scale.set(1, 1, 1)
    gate.material.opacity = 0.85
    gate.material.color.setHex(GATE_COLOR)

    gate.mesh.position.set(
      (Math.random() - 0.5) * RANGE_X * 2,
      (Math.random() - 0.5) * RANGE_Y * 2,
      SPAWN_Z
    )
  }

  const DISSOLVE_DURATION = 0.4 // Seconds for dissolve animation
  const FLASH_DURATION = 0.3    // Seconds for red screen flash
  let flashTimer = 0

  /**
   * Update gate positions and spawning
   * @param {number} deltaTime - Frame delta in seconds
   * @param {number} throttle - 0 to 1
   * @param {number} bomberX - Bomber lateral position
   * @param {number} bomberY - Bomber vertical position
   */
  const update = (deltaTime, throttle, bomberX = 0, bomberY = 0) => {
    // Tick down screen flash
    if (flashTimer > 0) flashTimer = Math.max(0, flashTimer - deltaTime)

    if (throttle < 0.05) {
      active = false
      return
    }

    // First activation - spawn a gate soon
    if (!active) {
      active = true
      spawnTimer = BASE_INTERVAL * 0.6
    }

    // Spawn timer (faster at higher throttle)
    spawnTimer += deltaTime
    if (spawnTimer >= BASE_INTERVAL / Math.max(throttle, 0.1)) {
      spawnGate()
      spawnTimer = 0
    }

    // Move and check all active gates
    const speed = BASE_SPEED * throttle * deltaTime

    pool.forEach(gate => {
      if (!gate.active) return

      // Dissolve animation (clean pass success)
      if (gate.dissolving) {
        gate.dissolveTimer += deltaTime
        const t = Math.min(gate.dissolveTimer / DISSOLVE_DURATION, 1)

        const scale = 1 + t * 0.3
        gate.mesh.scale.set(scale, scale, 1)
        gate.material.opacity = 0.85 * (1 - t * t)

        const r = 1
        const g = 0.6 + t * 0.4
        const b = 0.3 + t * 0.7
        gate.material.color.setRGB(r, g, b)

        if (t >= 1) {
          gate.active = false
          gate.mesh.visible = false
        }
        return
      }

      gate.mesh.position.z += speed

      // Collision detection (check both X and Y)
      if (!gate.passed && gate.mesh.position.z > -1 && gate.mesh.position.z < 3) {
        gate.passed = true
        const dx = Math.abs(gate.mesh.position.x - bomberX)
        const dy = Math.abs(gate.mesh.position.y - bomberY)
        const innerHalf = GATE_INNER / 2

        const cleanPass = dx < innerHalf && dy < innerHalf

        if (cleanPass) {
          // Success - dissolve effect
          gate.dissolving = true
          gate.dissolveTimer = 0
        } else {
          // Miss - red screen flash
          flashTimer = FLASH_DURATION
        }
      }

      // Fade out as gate passes camera
      if (gate.mesh.position.z > 10) {
        gate.material.opacity = Math.max(0, 0.85 - (gate.mesh.position.z - 10) / 20)
      }

      // Recycle
      if (gate.mesh.position.z > DESPAWN_Z) {
        gate.active = false
        gate.mesh.visible = false
      }
    })
  }

  const getFlashIntensity = () => flashTimer / FLASH_DURATION

  return { group, update, getFlashIntensity }
}
