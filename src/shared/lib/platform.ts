import type { Platform } from '@/shared/api/types'

// Best-effort device OS detection from the user agent (used to filter offers).
export function detectPlatform(): Platform | undefined {
  if (typeof navigator === 'undefined') return undefined
  const ua = navigator.userAgent || ''
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  // iPadOS 13+ masquerades as "Macintosh" but is a multi-touch device.
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return 'ios'
  return undefined
}
