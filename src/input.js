/**
 * Input handling for throttle control
 * Supports keyboard, mouse wheel, and gamepad
 */

export class InputManager {
  constructor() {
    this.throttle = 0
    this.targetThrottle = 0
    this.throttleSmoothing = 0.08

    this.keys = {
      throttleUp: false,
      throttleDown: false
    }

    this.setupKeyboard()
    this.setupMouseWheel()
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'Space':
          this.keys.throttleUp = true
          e.preventDefault()
          break
        case 'KeyS':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.throttleDown = true
          e.preventDefault()
          break
      }
    })

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'Space':
          this.keys.throttleUp = false
          break
        case 'KeyS':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.throttleDown = false
          break
      }
    })
  }

  setupMouseWheel() {
    window.addEventListener('wheel', (e) => {
      const delta = -Math.sign(e.deltaY) * 0.08
      this.targetThrottle = Math.max(0, Math.min(1, this.targetThrottle + delta))
      e.preventDefault()
    }, { passive: false })
  }

  update(deltaTime) {
    // Keyboard input
    if (this.keys.throttleUp) {
      this.targetThrottle = Math.min(1, this.targetThrottle + deltaTime * 0.5)
    }
    if (this.keys.throttleDown) {
      this.targetThrottle = Math.max(0, this.targetThrottle - deltaTime * 0.5)
    }

    // Gamepad input
    const gamepads = navigator.getGamepads()
    for (const gamepad of gamepads) {
      if (gamepad) {
        const rightTrigger = gamepad.buttons[7]?.value || 0
        const leftTrigger = gamepad.buttons[6]?.value || 0

        if (rightTrigger > 0.1) {
          this.targetThrottle = Math.min(1, this.targetThrottle + rightTrigger * deltaTime * 0.5)
        }
        if (leftTrigger > 0.1) {
          this.targetThrottle = Math.max(0, this.targetThrottle - leftTrigger * deltaTime * 0.5)
        }
        break
      }
    }

    // Smooth interpolation
    this.throttle += (this.targetThrottle - this.throttle) * this.throttleSmoothing
  }

  getThrottle() {
    return this.throttle
  }
}
