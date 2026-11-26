import { readLocalStorage, writeLocalStorage } from './storage'
import type { SettingsState } from './types'

const STORAGE_KEY = 'xiaozhi.settings.v1'

export const defaultSettings: SettingsState = {
  apiEndpoint: '',
  apiKey: '',
  avatarEngine: 'static',
  avatarControlMode: 'library',
  avatarSkin: 'classic',
  carryContext: true,
  speechBubbleMode: 'summary',
  speechBubblePlacement: 'avatar',
  bgmVolume: 0.35,
  bgmMuted: false,
  hasSeenQuickStart: false,
  hasSeenDockHint: false,
  debug: false,
}

export function loadSettings(): SettingsState {
  const saved = readLocalStorage<Partial<SettingsState>>(STORAGE_KEY) ?? {}
  return {
    ...defaultSettings,
    ...saved,
  }
}

export function saveSettings(next: SettingsState): void {
  const toSave: SettingsState = {
    ...next,
    apiKey: next.apiKey ?? '',
  }
  writeLocalStorage(STORAGE_KEY, toSave)
}
