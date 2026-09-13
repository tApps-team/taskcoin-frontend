import type { Platform, Store } from '@/shared/api/types'

// Generic store home per store. The user searches by the keyword they copied —
// we don't deep-link to a specific app. Opened in a new tab so the SPA (and the
// in-memory step progress) survives the round-trip to the store app.
export function storeHomeUrl(store: Store): string {
  switch (store) {
    case 'appstore':
      return 'https://apps.apple.com/'
    case 'rustore':
      return 'https://www.rustore.ru/'
    default:
      return 'https://play.google.com/store/apps'
  }
}

export function storeName(store: Store): string {
  switch (store) {
    case 'appstore':
      return 'App Store'
    case 'rustore':
      return 'RuStore'
    default:
      return 'Play Market'
  }
}

// The OS a store implies (RuStore and Play Market are both Android).
export function storePlatform(store: Store): Platform {
  return store === 'appstore' ? 'ios' : 'android'
}

// Options for the admin app form.
export const STORE_OPTIONS: { value: Store; label: string }[] = [
  { value: 'appstore', label: 'iOS · App Store' },
  { value: 'playmarket', label: 'Android · Play Market' },
  { value: 'rustore', label: 'Android · RuStore' },
]
