import { createScene } from './scene.js'

const init = async () => {
  try {
    // Initialize scene
    const { scene, camera, renderer } = await createScene()

    // Append canvas to body
    document.body.appendChild(renderer.domElement)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()

    console.log('Stealth Flight initialized with WebGPU')
  } catch (error) {
    console.error('Failed to initialize:', error)
    document.body.innerHTML = `
      <div style="color: #ff2222; padding: 20px; font-family: monospace;">
        WebGPU initialization failed. Please use a browser that supports WebGPU.
      </div>
    `
  }
}

init()
