// Lightweight haptic feedback. Uses the Web Vibration API (Android/Chrome and
// most Android WebViews). iOS Safari has no vibration API — this is a no-op
// there; native haptics will come via the mobile wrapper (Median) later.
export function haptic(ms = 8): void {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* not supported — ignore */
  }
}
