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

  // Debug: Find model bounds
  const box = new THREE.Box3().setFromObject(bomberGroup)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  console.log('Model center:', center)
  console.log('Model size:', size)
  console.log('Model bounds min:', box.min)
  console.log('Model bounds max:', box.max)

  // Store original materials for manipulation
  const materials = []

  // Apply dark material for inactive state
  bomberGroup.traverse((child) => {
    if (child.isMesh) {
      // Store reference to material
      materials.push(child.material)

      // Set initial dark appearance
      child.material.color = new THREE.Color(0x0f0f0f)
      child.material.metalness = 0.3
      child.material.roughness = 0.7
      child.material.emissive = new THREE.Color(0x000000)
      child.material.emissiveIntensity = 0
    }
  })

  // B2 has two exhaust vents near center (chevron shaped)
  // Model center is offset ~0.8 to the right in world space
  const exhaustPositions = [
    { x: 0.1, y: 0.3, z: 3.5 },   // Left exhaust
    { x: 1.5, y: 0.3, z: 3.5 }    // Right exhaust
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
  bomberGroup.rotation.y = Math.PI // Face forward

  return {
    group: bomberGroup,
    jetStreams,
    materials,
    engines,

    // Update function to control throttle effects
    update: (throttle) => {
      // throttle is 0-1

      // Update exhaust glow based on throttle
      engines.forEach(({ glow, material }) => {
        material.opacity = throttle * 0.95
        // Subtle scale increase with throttle
        const scale = 1 + throttle * 0.5
        glow.scale.set(scale, scale, 1)
      })

      // Update bomber materials as throttle increases
      materials.forEach((material) => {
        if (throttle > 0) {
          // Reveal the bomber form
          material.color.setHex(0x1f1f1f)
          material.emissive = new THREE.Color(0x3a3a5a)
          material.emissiveIntensity = throttle * 0.15
        } else {
          // Inactive state
          material.color.setHex(0x0f0f0f)
          material.emissive = new THREE.Color(0x000000)
          material.emissiveIntensity = 0
        }
      })
    }
  }
}
