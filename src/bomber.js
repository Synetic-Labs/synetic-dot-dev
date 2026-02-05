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

  // Add engine glow points (approximate positions for B2)
  const enginePositions = [
    { x: -2, y: 0, z: -2 },
    { x: -0.7, y: 0, z: -2 },
    { x: 0.7, y: 0, z: -2 },
    { x: 2, y: 0, z: -2 }
  ]

  const engines = []

  enginePositions.forEach(pos => {
    // Create point light for engine glow
    const engineLight = new THREE.PointLight(0xff6600, 0, 5)
    engineLight.position.set(pos.x, pos.y, pos.z)
    bomberGroup.add(engineLight)

    engines.push({ light: engineLight })
  })

  // Scale and orient the bomber
  bomberGroup.scale.setScalar(2)
  bomberGroup.rotation.y = Math.PI // Face forward

  return {
    group: bomberGroup,
    materials,
    engines,

    // Update function to control throttle effects
    update: (throttle) => {
      // throttle is 0-1

      // Update engine glow based on throttle
      engines.forEach(({ light }) => {
        // Orange thruster glow
        light.intensity = throttle * 2.0
        light.distance = 5 + throttle * 5
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
