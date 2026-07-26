import type { Platform } from '@/shared/api/types'

// Best-effort device OS detection from the user agent (used to filter offers).
export function detectPlatform(): Platform | undefined {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  return undefined
}
