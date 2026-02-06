import { createScene } from './scene.js'
import { InputManager } from './input.js'
import { createHUD } from './hud.js'

const init = async () => {
  try {
    // Initialize scene
    const { scene, camera, renderer, bomber, gates } = await createScene()

    // Initialize input
    const input = new InputManager()

    // Append canvas to body
    document.body.appendChild(renderer.domElement)

    // Artificial horizon OSD
    const hud = createHUD()

    // Red flash overlay for missed gates
    const flashOverlay = document.createElement('div')
    flashOverlay.style.cssText = 'position:fixed;inset:0;background:#ff2222;pointer-events:none;opacity:0;z-index:10'
    document.body.appendChild(flashOverlay)

    // Animation loop with delta time
    let lastTime = performance.now()
    let wasFlashing = false
    let dead = false
    let fallVelocity = 0
    let lastThrottle = 0
    const GRAVITY = 15
    const NOSE_DIVE_SPEED = 0.8

    const animate = () => {
      requestAnimationFrame(animate)

      const now = performance.now()
      const deltaTime = (now - lastTime) / 1000
      lastTime = now

      if (dead) {
        // Kill engines
        bomber.engines.forEach(({ material }) => {
          material.opacity = Math.max(0, material.opacity - deltaTime * 3)
        })

        // Nose dive and fall
        fallVelocity += GRAVITY * deltaTime
        bomber.group.position.y -= fallVelocity * deltaTime
        bomber.group.rotation.x += NOSE_DIVE_SPEED * deltaTime

        // Keep remaining gates moving at last speed
        gates.update(deltaTime, lastThrottle, bomber.group.position.x, bomber.group.position.y)

        const flash = gates.getFlashIntensity()
        flashOverlay.style.opacity = flash > 0 ? flash * 0.4 : 0

        renderer.render(scene, camera)
        return
      }

      // Update input and bomber
      input.update(deltaTime)
      const throttle = input.getThrottle()
      const pitch = input.getPitch()
      const roll = input.getRoll()
      bomber.update(throttle, pitch, roll)
      gates.update(deltaTime, throttle, bomber.group.position.x, bomber.group.position.y)

      // Update artificial horizon (uses bomber's visual rotation)
      hud.update(bomber.group.rotation.x, bomber.group.rotation.z)

      // Screen flash on miss + remove HUD dots
      const flash = gates.getFlashIntensity()
      const isFlashing = flash > 0
      if (isFlashing && !wasFlashing) {
        const gameOver = hud.onMiss()
        if (gameOver) {
          dead = true
          lastThrottle = throttle
          gates.stop()
        }
      }
      wasFlashing = isFlashing
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
