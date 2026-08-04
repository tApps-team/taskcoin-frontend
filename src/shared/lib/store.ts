import type { Platform } from '@/shared/api/types'

// Generic store home per OS. The user searches by the keyword they copied — we
// don't deep-link to a specific app. Opened in a new tab so the SPA (and the
// in-memory step progress) survives the round-trip to the store app.
export function storeHomeUrl(platform: Platform): string {
  return platform === 'ios' ? 'https://apps.apple.com/' : 'https://play.google.com/store/apps'
}
