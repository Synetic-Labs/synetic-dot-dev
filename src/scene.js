import * as THREE from 'three'
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js'
import { createBomber } from './bomber.js'
import { createGateSystem } from './gates.js'

export const createScene = async () => {
  // Scene setup
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x121212) // Near black background
  scene.fog = new THREE.Fog(0x121212, 50, 500) // Subtle depth fog

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  )
  camera.position.set(0, 5, 20) // Behind and slightly above the bomber

  // WebGPU Renderer
  const renderer = new WebGPURenderer({
    antialias: true,
    alpha: false
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Initialize WebGPU
  await renderer.init()

  // Create and add B2 Spirit bomber
  const bomber = await createBomber()
  bomber.group.position.set(0, 0, 0)
  scene.add(bomber.group)

  // Create gate system
  const gates = createGateSystem()
  scene.add(gates.group)

  // Handle window resize
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', handleResize)

  return {
    scene,
    camera,
    renderer,
    bomber,
    gates,
    cleanup: () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }
}
