export type AvatarEngine = 'static' | '2d' | '3d'

export type AvatarControlMode = 'library' | 'scene'

export type AvatarSkin = 'classic' | 'pixel' | 'puppet' | 'three'

export type SpeechBubbleMode = 'summary' | 'full' | 'off'

export type SpeechBubblePlacement = 'avatar' | 'chat'

export type ChatMessageRole = 'user' | 'assistant' | 'system'

export type ChatMessageStatus = 'final' | 'thinking' | 'error'

export type AppId = 'english-music-game' | 'twoeyes-vue' | 'anti-pua-puax'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  status: ChatMessageStatus
  createdAt: number
  ttsReplayable?: boolean
}

export interface AppWindowState {
  id: string
  appId: AppId
  title: string
  url: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
}

export interface SettingsState {
  apiEndpoint: string
  apiKey: string
  avatarEngine: AvatarEngine
  avatarControlMode: AvatarControlMode
  avatarSkin: AvatarSkin
  carryContext: boolean
  speechBubbleMode: SpeechBubbleMode
  speechBubblePlacement: SpeechBubblePlacement
  bgmVolume: number
  bgmMuted: boolean
  hasSeenQuickStart: boolean
  hasSeenDockHint: boolean
  debug: boolean
}

export type AvatarExpression =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'shy'

export type AvatarAction =
  | 'idle'
  | 'wave'
  | 'nod'
  | 'shakeHead'
  | 'think'
  | 'cheer'

export interface AvatarPerformCommand {
  type: 'character.perform'
  id: string
  timeline: Array<{
    atMs: number
    do: AvatarDo
  }>
}

export type AvatarDo =
  | {
      kind: 'expression'
      expression: AvatarExpression
      intensity: number
      durationMs: number
    }
  | {
      kind: 'action'
      action: AvatarAction
      durationMs: number
    }
  | {
      kind: 'move'
      x: number
      y: number
      durationMs: number
    }
  | {
      kind: 'speech'
      text: string
      tts: boolean
    }
  | {
      kind: 'stop'
    }
