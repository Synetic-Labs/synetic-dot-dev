import { createScene } from './scene.js'
import { InputManager } from './input.js'

const init = async () => {
  try {
    // Initialize scene
    const { scene, camera, renderer, bomber } = await createScene()

    // Initialize input
    const input = new InputManager()

    // Append canvas to body
    document.body.appendChild(renderer.domElement)

    // Animation loop with delta time
    let lastTime = performance.now()

    const animate = () => {
      requestAnimationFrame(animate)

      const now = performance.now()
      const deltaTime = (now - lastTime) / 1000
      lastTime = now

      // Update input and bomber
      input.update(deltaTime)
      const throttle = input.getThrottle()
      const pitch = input.getPitch()
      const roll = input.getRoll()
      bomber.update(throttle, pitch, roll)

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
