import { createScene } from './scene.js'
import { InputManager } from './input.js'

const init = async () => {
  try {
    // Initialize scene
    const { scene, camera, renderer, bomber, gates } = await createScene()

    // Initialize input
    const input = new InputManager()

    // Append canvas to body
    document.body.appendChild(renderer.domElement)

    // Red flash overlay for missed gates
    const flashOverlay = document.createElement('div')
    flashOverlay.style.cssText = 'position:fixed;inset:0;background:#ff2222;pointer-events:none;opacity:0;z-index:10'
    document.body.appendChild(flashOverlay)

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
      gates.update(deltaTime, throttle, bomber.group.position.x, bomber.group.position.y)

      // Screen flash on miss
      const flash = gates.getFlashIntensity()
      flashOverlay.style.opacity = flash * 0.4

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
