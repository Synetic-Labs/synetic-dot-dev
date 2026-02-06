import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Loads the B2 Spirit stealth bomber from GLB file
 */
export const createBomber = async () => {
  const loader = new GLTFLoader()

  // Load the model
  const gltf = await new Promise((resolve, reject) => {
    loader.load(
      './assets/models/b2_stealth_bomber.glb',
      (gltf) => resolve(gltf),
      undefined,
      (error) => reject(error)
    )
  })

  const bomberGroup = gltf.scene

  // Store meshes for material manipulation
  const meshes = []

  // Replace GLTF materials with simple MeshBasicMaterial for reliable color control
  bomberGroup.traverse((child) => {
    if (child.isMesh) {
      // Create new simple material
      const newMaterial = new THREE.MeshBasicMaterial({
        color: 0x121212  // Match background - invisible at idle
      })
      child.material = newMaterial
      meshes.push(child)
    }
  })

  // B2 has two exhaust vents near center (chevron shaped)
  // Convert original world positions to local space:
  // local = -world / scale (due to 180° Y rotation and 2x scale)
  // Original world: (0.1, 0.3, 3.5) and (1.6, 0.3, 3.5)
  const exhaustPositions = [
    { x: -0.05, y: 0.3, z: -2.00 },   // Left exhaust
    { x: -0.8, y: 0.3, z: -2.00 }     // Right exhaust
  ]

  const engines = []
  const jetStreams = new THREE.Group()

  exhaustPositions.forEach(pos => {
    // Simple glowing plane for exhaust (halved since parent scales 2x)
    const glowGeo = new THREE.PlaneGeometry(0.4, 0.2)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)

    glow.position.set(pos.x, pos.y, pos.z)
    glow.rotation.x = -Math.PI / 2.5  // Tilt to match exhaust angle

    jetStreams.add(glow)
    engines.push({ glow, material: glowMat })
  })

  // Add jet streams as child of bomber so they move together
  bomberGroup.add(jetStreams)

  // Scale and orient the bomber
  bomberGroup.scale.setScalar(2)
  bomberGroup.rotation.y = Math.PI // Face forward (base rotation)

  // Flight control limits
  const maxPitchAngle = Math.PI / 6   // 30 degrees
  const maxRollAngle = Math.PI / 4    // 45 degrees
  const maxLateralOffset = 8          // Max horizontal drift
  const maxVerticalOffset = 5         // Max vertical drift

  // Pre-allocated colors (avoid per-frame allocation)
  const idleColor = new THREE.Color(0x121212)
  const activeColor = new THREE.Color(0x080808)
  const scratchColor = new THREE.Color()

  // Store current visual state for smooth transitions
  let currentPitch = 0
  let currentRoll = 0
  let currentLateral = 0
  let currentVertical = 0

  return {
    group: bomberGroup,
    jetStreams,
    meshes,
    engines,

    /**
     * Update bomber visuals and position
     * @param {number} throttle - 0 to 1
     * @param {number} pitch - -1 to 1 (negative = nose up)
     * @param {number} roll - -1 to 1 (negative = bank left)
     */
    update: (throttle, pitch = 0, roll = 0) => {
      // Update exhaust glow based on throttle
      engines.forEach(({ glow, material }) => {
        material.opacity = throttle * 0.95
        // Subtle scale increase with throttle
        const scale = 1 + throttle * 0.5
        glow.scale.set(scale, scale, 1)
      })

      // Update bomber color based on throttle
      // Idle: #121212 (matches background, invisible)
      // Active: #080808 (darker, visible silhouette)
      scratchColor.copy(idleColor).lerp(activeColor, throttle)

      meshes.forEach((mesh) => {
        mesh.material.color.copy(scratchColor)
      })

      // Apply pitch and roll rotations (heavily damped)
      const dampingFactor = 0.08
      currentPitch += (pitch * maxPitchAngle - currentPitch) * dampingFactor
      currentRoll += (roll * maxRollAngle - currentRoll) * dampingFactor

      // Apply rotations (base Y rotation + pitch/roll)
      bomberGroup.rotation.x = currentPitch
      bomberGroup.rotation.z = currentRoll

      // Lateral movement based on roll (drift in direction of bank)
      const targetLateral = roll * maxLateralOffset
      currentLateral += (targetLateral - currentLateral) * dampingFactor
      bomberGroup.position.x = currentLateral

      // Vertical movement based on pitch (nose up = climb)
      const targetVertical = -pitch * maxVerticalOffset
      currentVertical += (targetVertical - currentVertical) * dampingFactor
      bomberGroup.position.y = currentVertical
    }
  }
}
