/**
 * Minimal OSD - artificial horizon dots
 * Behaves like FPV drone OSD: horizon stays world-relative
 * (rotates opposite to roll, shifts opposite to pitch)
 */

const DOT_COUNT = 9
const DOT_SPACING = 18    // px between dots
const DOT_SIZE = 3         // px diameter
const DOT_COLOR = 'rgb(125, 125, 125)'
const CENTER_DOT_SIZE = 4
const PITCH_SCALE = 60     // px shift per unit of pitch (-1 to 1)

export const createHUD = () => {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5'

  // Horizon group - centered on screen, transforms as a unit
  const horizon = document.createElement('div')
  horizon.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)'

  const dots = []
  const totalWidth = (DOT_COUNT - 1) * DOT_SPACING

  for (let i = 0; i < DOT_COUNT; i++) {
    const dot = document.createElement('div')
    const isCenter = i === Math.floor(DOT_COUNT / 2)
    const size = isCenter ? CENTER_DOT_SIZE : DOT_SIZE

    dot.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:${DOT_COLOR};top:${-size / 2}px;left:${i * DOT_SPACING - totalWidth / 2 - size / 2}px;transition:opacity 0.3s`

    horizon.appendChild(dot)
    dots.push(dot)
  }

  container.appendChild(horizon)
  document.body.appendChild(container)

  const update = (pitch, roll) => {
    // Horizon rotates opposite to aircraft roll
    const rollDeg = -roll * (180 / Math.PI)
    // Horizon shifts opposite to aircraft pitch
    const pitchOffset = pitch * PITCH_SCALE

    horizon.style.transform = `translate(-50%, calc(-50% + ${pitchOffset}px)) rotate(${rollDeg}deg)`
  }

  // Track which dots are visible (outside-in removal)
  const center = Math.floor(DOT_COUNT / 2)
  let removedPairs = 0

  const onMiss = () => {
    if (removedPairs >= center) {
      // Final miss - remove center dot
      dots[center].style.opacity = '0'
      return true
    }

    dots[removedPairs].style.opacity = '0'
    dots[DOT_COUNT - 1 - removedPairs].style.opacity = '0'
    removedPairs++
    return false
  }

  const showScore = (score) => {
    horizon.style.transform = 'translate(-50%, -50%)'
    dots.forEach(d => d.remove())
    const el = document.createElement('div')
    el.textContent = score
    el.style.cssText = `color:${DOT_COLOR};font-family:monospace;font-size:1.2rem;white-space:nowrap`
    horizon.appendChild(el)
  }

  return { update, onMiss, showScore }
}
