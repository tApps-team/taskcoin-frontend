// Web haptics that also works in iOS Safari (which has NO Vibration API).
//
// Strategy:
//  - Android / Chrome: navigator.vibrate() — real vibration.
//  - iOS Safari 17.4–26.4: the "<input type=checkbox switch>" trick — clicking a
//    hidden switch's <label> fires the Taptic Engine (Apple never shipped the
//    Vibration API). Must be called inside a user gesture.
//  - iOS 26.5+ / desktop / unsupported: silently no-op (real haptics there need
//    a native wrapper like Median/Capacitor).
//
// Ref: tijnjh/ios-haptics, WebKit switch-input haptic behaviour.

let switchLabel: HTMLLabelElement | null = null

function getSwitch(): HTMLLabelElement | null {
  if (typeof document === 'undefined') return null
  if (switchLabel && switchLabel.isConnected) return switchLabel

  const label = document.createElement('label')
  label.setAttribute('aria-hidden', 'true')
  label.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:0;height:0;opacity:0;pointer-events:none;'

  const input = document.createElement('input')
  input.type = 'checkbox'
  // The magic attribute recognised by Safari 17.4+ that binds a switch to the
  // Taptic Engine. Harmless on every other browser.
  input.setAttribute('switch', '')
  label.appendChild(input)

  document.body.appendChild(label)
  switchLabel = label
  return label
}

export function haptic(ms = 10): void {
  try {
    // Android and other browsers that expose the Vibration API.
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(ms)
    }
    // iOS Safari: toggling the switch via its label triggers native haptics.
    getSwitch()?.click()
  } catch {
    /* unsupported — ignore */
  }
}
