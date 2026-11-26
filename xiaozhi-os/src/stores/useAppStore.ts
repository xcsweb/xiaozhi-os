import { inject } from 'vue'
import { appStoreKey } from './appStoreContext'

export function useAppStore() {
  const store = inject(appStoreKey)
  if (!store) {
    throw new Error('AppStore not provided')
  }
  return store
}

