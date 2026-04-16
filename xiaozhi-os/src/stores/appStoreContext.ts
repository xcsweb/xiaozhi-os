import type { InjectionKey } from 'vue'
import type { AppStore } from './appStore'

export const appStoreKey: InjectionKey<AppStore> = Symbol('appStore')

