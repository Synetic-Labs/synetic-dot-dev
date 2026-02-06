/**
 * Input handling for flight controls
 * Supports keyboard, mouse, gamepad, gyroscope, and touch
 */

export class InputManager {
  constructor() {
    // Throttle state
    this.throttle = 0
    this.targetThrottle = 0
    this.throttleSmoothing = 0.08

    // Pitch/roll state (-1 to 1)
    this.pitch = 0
    this.roll = 0
    this.targetPitch = 0
    this.targetRoll = 0
    this.controlSmoothing = 0.06  // Heavily damped for meditative feel

    // Mouse tracking
    this.mouseX = 0
    this.mouseY = 0
    this.mouseActive = false

    // Gyroscope state (activates on first deviceorientation event)
    this.gyroActive = false
    this.gyroPitch = 0
    this.gyroRoll = 0
    this.gyroBaselineBeta = null
    this.gyroBaselineGamma = null

    // Touch state
    this.touchStartY = null
    this.touchCurrentY = null

    this.keys = {
      pitchUp: false,
      pitchDown: false,
      rollLeft: false,
      rollRight: false
    }

    this.setupKeyboard()
    this.setupMouseWheel()
    this.setupMouseMovement()
    this.setupGyroscope()
    this.setupTouch()
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        // Pitch (W/S, arrow up/down)
        case 'KeyW':
        case 'ArrowUp':
          this.keys.pitchUp = true
          e.preventDefault()
          break
        case 'KeyS':
        case 'ArrowDown':
          this.keys.pitchDown = true
          e.preventDefault()
          break
        // Roll (A/D, arrow left/right)
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.rollLeft = true
          e.preventDefault()
          break
        case 'KeyD':
        case 'ArrowRight':
          this.keys.rollRight = true
          e.preventDefault()
          break
      }
    })

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        // Pitch
        case 'KeyW':
        case 'ArrowUp':
          this.keys.pitchUp = false
          break
        case 'KeyS':
        case 'ArrowDown':
          this.keys.pitchDown = false
          break
        // Roll
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.rollLeft = false
          break
        case 'KeyD':
        case 'ArrowRight':
          this.keys.rollRight = false
          break
      }
    })
  }

  setupMouseWheel() {
    window.addEventListener('wheel', (e) => {
      const delta = Math.sign(e.deltaY) * 0.08  // Scroll down = increase throttle
      this.targetThrottle = Math.max(0, Math.min(1, this.targetThrottle + delta))
      e.preventDefault()
    }, { passive: false })
  }

  setupMouseMovement() {
    // Track mouse position relative to screen center
    window.addEventListener('mousemove', (e) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      // Normalize to -1 to 1 range, with deadzone in center
      const rawX = (e.clientX - centerX) / centerX
      const rawY = (e.clientY - centerY) / centerY

      // Apply deadzone (inner 10% of screen)
      const deadzone = 0.1
      this.mouseX = Math.abs(rawX) < deadzone ? 0 : rawX
      this.mouseY = Math.abs(rawY) < deadzone ? 0 : rawY

      this.mouseActive = true
    })

    // Reset mouse control when mouse leaves
    window.addEventListener('mouseleave', () => {
      this.mouseActive = false
      this.mouseX = 0
      this.mouseY = 0
    })
  }

  setupGyroscope() {
    // Request permission on iOS (requires user gesture)
    const requestPermission = () => {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(state => {
            if (state === 'granted') this.bindGyroscope()
          })
          .catch(() => {})
      }
    }

    // On iOS, permission must be requested from a user gesture
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      window.addEventListener('touchstart', requestPermission, { once: true })
    } else {
      // Android/desktop: bind directly (on desktop, event simply never fires)
      this.bindGyroscope()
    }
  }

  bindGyroscope() {
    window.addEventListener('deviceorientation', (e) => {
      if (e.beta === null || e.gamma === null) return

      // Set baseline on first reading (calibration)
      if (this.gyroBaselineBeta === null) {
        this.gyroBaselineBeta = e.beta
        this.gyroBaselineGamma = e.gamma
      }

      this.gyroActive = true

      // Offset from baseline, normalized to -1…1 (±30° = full deflection)
      const maxAngle = 30
      const pitchDeg = e.beta - this.gyroBaselineBeta
      const rollDeg = e.gamma - this.gyroBaselineGamma

      this.gyroPitch = Math.max(-1, Math.min(1, pitchDeg / maxAngle))
      this.gyroRoll = Math.max(-1, Math.min(1, rollDeg / maxAngle))
    })
  }

  setupTouch() {
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return
      this.touchStartY = e.touches[0].clientY
      this.touchCurrentY = e.touches[0].clientY
      e.preventDefault()
    }, { passive: false })

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return
      this.touchCurrentY = e.touches[0].clientY
      e.preventDefault()
    }, { passive: false })

    window.addEventListener('touchend', () => {
      this.touchStartY = null
      this.touchCurrentY = null
    })
  }

  update(deltaTime) {
    // --- Touch throttle (swipe up = increase, swipe down = decrease) ---
    if (this.touchStartY !== null && this.touchCurrentY !== null) {
      const deltaY = this.touchStartY - this.touchCurrentY  // Positive = swiped up
      const sensitivity = 0.003
      this.targetThrottle = Math.max(0, Math.min(1, this.targetThrottle + deltaY * sensitivity))
      this.touchStartY = this.touchCurrentY  // Reset for incremental deltas
    }

    // --- Pitch/Roll from keyboard ---
    // Keyboard sets target directly (binary input)
    let keyboardPitch = 0
    let keyboardRoll = 0

    if (this.keys.pitchUp) keyboardPitch = -1    // Nose up
    if (this.keys.pitchDown) keyboardPitch = 1   // Nose down
    if (this.keys.rollLeft) keyboardRoll = -1    // Bank left
    if (this.keys.rollRight) keyboardRoll = 1    // Bank right

    // --- Gamepad input ---
    let gamepadPitch = 0
    let gamepadRoll = 0

    const gamepads = navigator.getGamepads()
    for (const gamepad of gamepads) {
      if (gamepad) {
        // Triggers for throttle
        const rightTrigger = gamepad.buttons[7]?.value || 0
        const leftTrigger = gamepad.buttons[6]?.value || 0

        if (rightTrigger > 0.1) {
          this.targetThrottle = Math.min(1, this.targetThrottle + rightTrigger * deltaTime * 0.5)
        }
        if (leftTrigger > 0.1) {
          this.targetThrottle = Math.max(0, this.targetThrottle - leftTrigger * deltaTime * 0.5)
        }

        // Left stick for pitch/roll (with deadzone)
        const stickX = gamepad.axes[0] || 0
        const stickY = gamepad.axes[1] || 0
        const stickDeadzone = 0.15

        if (Math.abs(stickX) > stickDeadzone) gamepadRoll = stickX
        if (Math.abs(stickY) > stickDeadzone) gamepadPitch = stickY

        break
      }
    }

    // --- Combine inputs (priority: gamepad > keyboard > gyroscope > mouse) ---
    if (Math.abs(gamepadPitch) > 0.1 || Math.abs(gamepadRoll) > 0.1) {
      this.targetPitch = gamepadPitch
      this.targetRoll = gamepadRoll
    } else if (keyboardPitch !== 0 || keyboardRoll !== 0) {
      this.targetPitch = keyboardPitch
      this.targetRoll = keyboardRoll
    } else if (this.gyroActive) {
      this.targetPitch = this.gyroPitch * 0.7
      this.targetRoll = this.gyroRoll * 0.7
    } else if (this.mouseActive) {
      // Mouse: Y controls pitch, X controls roll
      this.targetPitch = this.mouseY * 0.7  // Reduced sensitivity
      this.targetRoll = this.mouseX * 0.7
    } else {
      // No input - return to neutral
      this.targetPitch = 0
      this.targetRoll = 0
    }

    // --- Smooth interpolation ---
    this.throttle += (this.targetThrottle - this.throttle) * this.throttleSmoothing
    this.pitch += (this.targetPitch - this.pitch) * this.controlSmoothing
    this.roll += (this.targetRoll - this.roll) * this.controlSmoothing
  }

  getThrottle() {
    return this.throttle
  }

  getPitch() {
    return this.pitch
  }

  getRoll() {
    return this.roll
  }
}
