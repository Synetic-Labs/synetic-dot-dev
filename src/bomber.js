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
  // Model center is offset ~0.8 to the right in world space
  // Exhausts centered around x=0.8, spaced ~0.7 apart each side
  const exhaustPositions = [
    { x: 0.1, y: 0.3, z: 3.5 },   // Left exhaust
    { x: 1.6, y: 0.3, z: 3.5 }    // Right exhaust
  ]

  const engines = []
  const jetStreams = new THREE.Group()

  exhaustPositions.forEach(pos => {
    // Simple glowing plane for exhaust
    const glowGeo = new THREE.PlaneGeometry(0.8, 0.4)
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

  // Scale and orient the bomber
  bomberGroup.scale.setScalar(2)
  bomberGroup.rotation.y = Math.PI // Face forward (base rotation)

  // Flight control limits
  const maxPitchAngle = Math.PI / 6   // 30 degrees
  const maxRollAngle = Math.PI / 4    // 45 degrees
  const maxLateralOffset = 8          // Max horizontal drift

  // Store current visual state for smooth transitions
  let currentPitch = 0
  let currentRoll = 0
  let currentLateral = 0

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
      const idleColor = new THREE.Color(0x121212)
      const activeColor = new THREE.Color(0x080808)
      const currentColor = idleColor.clone().lerp(activeColor, throttle)

      meshes.forEach((mesh) => {
        mesh.material.color.copy(currentColor)
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

      // Sync jet streams position with bomber
      jetStreams.position.x = currentLateral
      jetStreams.rotation.x = currentPitch
      jetStreams.rotation.z = currentRoll
    }
  }
}
