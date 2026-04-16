import { computed, reactive, readonly, ref } from 'vue'
import { formatClock } from '../lib/clock'
import { uid } from '../lib/id'
import { loadSettings, saveSettings } from '../lib/settings'
import type {
  AppId,
  AppWindowState,
  AvatarAction,
  AvatarDo,
  AvatarEngine,
  AvatarExpression,
  SettingsState,
  SpeechBubbleMode,
  SpeechBubblePlacement,
  ChatMessage,
  AvatarControlMode,
} from '../lib/types'
import { clamp } from '../lib/window'

export type AppStore = ReturnType<typeof createAppStore>

export function createAppStore() {
  const settings = ref<SettingsState>(loadSettings())

  function patchSettings(patch: Partial<SettingsState>) {
    settings.value = { ...settings.value, ...patch }
    saveSettings(settings.value)
  }

  const now = ref(new Date())
  setInterval(() => {
    now.value = new Date()
  }, 1000)
  const clockText = computed(() => formatClock(now.value))

  const ui = reactive({
    isSettingsOpen: false,
    isExperimentOpen: false,
    isChatOpenOnMobile: true,
    isAudioUnlocked: false,
    showAudioUnlockHint: false,
  })

  const messages = ref<ChatMessage[]>([
    {
      id: uid('m'),
      role: 'assistant',
      content: '欢迎回家。想聊点什么？',
      status: 'final',
      createdAt: Date.now(),
    },
  ])

  const activeAppContext = ref<{ appId: AppId | null; title: string | null }>({
    appId: null,
    title: null,
  })

  const scenarioContext = ref<{ mode: string | null }>({ mode: null })
  const chatDraft = ref('')

  const windows = ref<AppWindowState[]>([])
  const zTop = ref(10)

  function appUrl(appId: AppId) {
    if (appId === 'english-music-game') return './apps/english-music-game/index.html'
    if (appId === 'twoeyes-vue') return './apps/twoeyes-vue/index.html'
    return './apps/anti-pua-puax/index.html'
  }

  function appTitle(appId: AppId) {
    if (appId === 'english-music-game') return 'English Music Game'
    if (appId === 'twoeyes-vue') return 'Two Eyes'
    return 'Anti PUA'
  }

  function focusWindow(id: string) {
    const win = windows.value.find((w) => w.id === id)
    if (!win) return
    zTop.value += 1
    win.z = zTop.value
    activeAppContext.value = { appId: win.appId, title: win.title }
  }

  function closeWindow(id: string) {
    windows.value = windows.value.filter((w) => w.id !== id)
    if (activeAppContext.value.appId && !windows.value.some((w) => w.appId === activeAppContext.value.appId)) {
      activeAppContext.value = { appId: null, title: null }
    }
  }

  function openApp(appId: AppId) {
    const existing = windows.value.find((w) => w.appId === appId)
    if (existing) {
      focusWindow(existing.id)
      return
    }
    const offset = windows.value.length * 24
    const id = uid('win')
    zTop.value += 1
    const win: AppWindowState = {
      id,
      appId,
      title: appTitle(appId),
      url: appUrl(appId),
      x: 120 + offset,
      y: 120 + offset,
      w: 520,
      h: 380,
      z: zTop.value,
      minimized: false,
    }
    windows.value = [...windows.value, win]
    focusWindow(id)
  }

  function moveWindow(id: string, x: number, y: number, bounds: { width: number; height: number }) {
    const win = windows.value.find((w) => w.id === id)
    if (!win) return
    const margin = 16
    const maxX = Math.max(margin, bounds.width - win.w - margin)
    const maxY = Math.max(margin, bounds.height - 48 - margin)
    win.x = clamp(x, margin, maxX)
    win.y = clamp(y, margin, maxY)
  }

  const avatar = reactive({
    engine: computed<AvatarEngine>(() => settings.value.avatarEngine),
    controlMode: computed<AvatarControlMode>(() => settings.value.avatarControlMode),
    expression: 'neutral' as AvatarExpression,
    expressionIntensity: 0.7,
    action: 'idle' as AvatarAction,
    mouthOpen: 0,
    position: { x: 0.18, y: 0.62 },
    isSpeaking: false,
    speechText: '',
  })

  const speechBubbleMode = computed<SpeechBubbleMode>(() => settings.value.speechBubbleMode)
  const speechBubblePlacement = computed<SpeechBubblePlacement>(() => settings.value.speechBubblePlacement)

  const tts = reactive({
    isSpeaking: false,
    currentText: '',
    lastText: '',
    stopRequested: false,
  })

  function setQuickStartSeen() {
    patchSettings({ hasSeenQuickStart: true })
  }

  function setDockHintSeen() {
    patchSettings({ hasSeenDockHint: true })
  }

  function openSettings() {
    ui.isSettingsOpen = true
  }

  function closeSettings() {
    ui.isSettingsOpen = false
  }

  function openExperiment() {
    ui.isExperimentOpen = true
  }

  function closeExperiment() {
    ui.isExperimentOpen = false
  }

  function addMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>) {
    messages.value = [
      ...messages.value,
      {
        ...msg,
        id: uid('m'),
        createdAt: Date.now(),
      },
    ]
  }

  function setChatDraft(text: string) {
    chatDraft.value = text
  }

  function setScenarioMode(mode: string | null) {
    scenarioContext.value = { mode }
  }

  function updateMessage(id: string, patch: Partial<ChatMessage>) {
    messages.value = messages.value.map((m) => (m.id === id ? { ...m, ...patch } : m))
  }

  function replaceMessage(id: string, next: ChatMessage) {
    messages.value = messages.value.map((m) => (m.id === id ? next : m))
  }

  function setAvatarExpression(expression: AvatarExpression, intensity: number) {
    avatar.expression = expression
    avatar.expressionIntensity = clamp(intensity, 0, 1)
  }

  function setAvatarAction(action: AvatarAction) {
    avatar.action = action
  }

  let mouthTimer: number | null = null
  function startMouth() {
    stopMouth()
    mouthTimer = window.setInterval(() => {
      avatar.mouthOpen = avatar.mouthOpen > 0.1 ? 0 : 1
    }, 140)
  }
  function stopMouth() {
    if (mouthTimer) window.clearInterval(mouthTimer)
    mouthTimer = null
    avatar.mouthOpen = 0
  }

  async function speak(text: string, useTts: boolean) {
    tts.stopRequested = false
    tts.currentText = text
    tts.lastText = text
    avatar.speechText = text
    avatar.isSpeaking = useTts
    if (!useTts) return
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return

    tts.isSpeaking = true
    startMouth()
    await new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(text)
      u.onend = () => resolve()
      u.onerror = () => resolve()
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    })
    tts.isSpeaking = false
    avatar.isSpeaking = false
    avatar.speechText = ''
    stopMouth()
  }

  function stopSpeak() {
    tts.stopRequested = true
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    tts.isSpeaking = false
    avatar.isSpeaking = false
    avatar.speechText = ''
    stopMouth()
  }

  function applyDo(action: AvatarDo) {
    if (action.kind === 'expression') {
      setAvatarExpression(action.expression, action.intensity)
      window.setTimeout(() => {
        setAvatarExpression('neutral', 0.7)
      }, action.durationMs)
      return
    }
    if (action.kind === 'action') {
      setAvatarAction(action.action)
      window.setTimeout(() => {
        setAvatarAction('idle')
      }, action.durationMs)
      return
    }
    if (action.kind === 'move') {
      if (settings.value.avatarControlMode !== 'scene') return
      avatar.position = {
        x: clamp(action.x, 0, 1),
        y: clamp(action.y, 0, 1),
      }
      return
    }
    if (action.kind === 'speech') {
      void speak(action.text, action.tts)
      return
    }
    if (action.kind === 'stop') {
      stopSpeak()
    }
  }

  async function runPerform(timeline: Array<{ atMs: number; do: AvatarDo }>) {
    const sorted = [...timeline].sort((a, b) => a.atMs - b.atMs)
    const startedAt = Date.now()
    for (const item of sorted) {
      const delay = Math.max(0, startedAt + item.atMs - Date.now())
      if (delay) {
        await new Promise((r) => window.setTimeout(r, delay))
      }
      if (tts.stopRequested) break
      applyDo(item.do)
    }
  }

  function setThinkingMode(on: boolean) {
    if (on) setAvatarAction('think')
    else setAvatarAction('idle')
  }

  function setAudioUnlocked(unlocked: boolean) {
    ui.isAudioUnlocked = unlocked
    ui.showAudioUnlockHint = !unlocked
  }

  return {
    settings: readonly(settings),
    patchSettings,
    ui,
    clockText,
    messages,
    addMessage,
    updateMessage,
    replaceMessage,
    windows,
    openApp,
    focusWindow,
    closeWindow,
    moveWindow,
    activeAppContext,
    scenarioContext,
    chatDraft,
    setChatDraft,
    setScenarioMode,
    avatar,
    speechBubbleMode,
    speechBubblePlacement,
    tts,
    speak,
    stopSpeak,
    runPerform,
    setThinkingMode,
    openSettings,
    closeSettings,
    openExperiment,
    closeExperiment,
    setQuickStartSeen,
    setDockHintSeen,
    setAudioUnlocked,
  }
}
