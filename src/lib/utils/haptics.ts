type HapticType = 'success' | 'error' | 'selection'

const HAPTIC_PATTERNS: Record<HapticType, number[]> = {
  success: [30, 50, 30],
  error: [50, 30, 50, 30, 50],
  selection: [5],
}

export function triggerHaptic(type: HapticType): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(HAPTIC_PATTERNS[type])
  }
}
