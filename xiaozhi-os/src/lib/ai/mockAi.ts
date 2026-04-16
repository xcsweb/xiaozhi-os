import type { AppId, AvatarControlMode, AvatarDo, AvatarPerformCommand } from '../types'
import { uid } from '../id'

export interface MockAiContext {
  activeApp: { appId: AppId | null; title: string | null }
  carryContext: boolean
  controlMode: AvatarControlMode
}

export interface MockAiResult {
  text: string
  perform?: AvatarPerformCommand
}

function inferDo(text: string, ctx: MockAiContext): AvatarDo[] {
  const t = text.toLowerCase()
  const dos: AvatarDo[] = []

  if (t.includes('开心') || t.includes('太好了') || t.includes('nice') || t.includes('good')) {
    dos.push({ kind: 'expression', expression: 'happy', intensity: 0.85, durationMs: 1400 })
  } else if (t.includes('难过') || t.includes('sad')) {
    dos.push({ kind: 'expression', expression: 'sad', intensity: 0.8, durationMs: 1400 })
  } else if (t.includes('生气') || t.includes('angry')) {
    dos.push({ kind: 'expression', expression: 'angry', intensity: 0.85, durationMs: 1400 })
  } else if (t.includes('惊') || t.includes('surprise')) {
    dos.push({ kind: 'expression', expression: 'surprised', intensity: 0.9, durationMs: 1200 })
  }

  if (t.includes('挥手') || t.includes('wave')) dos.push({ kind: 'action', action: 'wave', durationMs: 1600 })
  else if (t.includes('点头') || t.includes('nod')) dos.push({ kind: 'action', action: 'nod', durationMs: 900 })
  else if (t.includes('摇头') || t.includes('no')) dos.push({ kind: 'action', action: 'shakeHead', durationMs: 900 })
  else if (t.includes('加油') || t.includes('cheer')) dos.push({ kind: 'action', action: 'cheer', durationMs: 1400 })

  if (ctx.controlMode === 'scene') {
    if (t.includes('过来') || t.includes('靠近') || t.includes('来这里') || t.includes('come')) {
      dos.push({ kind: 'move', x: 0.42, y: 0.62, durationMs: 900 })
    }
    if (t.includes('去左边') || t.includes('left')) {
      dos.push({ kind: 'move', x: 0.26, y: 0.62, durationMs: 900 })
    }
    if (t.includes('去右边') || t.includes('right')) {
      dos.push({ kind: 'move', x: 0.6, y: 0.62, durationMs: 900 })
    }
  }

  return dos
}

function buildReply(text: string, ctx: MockAiContext): string {
  const prefix = ctx.carryContext && ctx.activeApp.title ? `（我看到你正在使用「${ctx.activeApp.title}」）` : ''
  if (text.includes('英语') || text.toLowerCase().includes('english')) {
    return `${prefix}好呀，我们来做一个简短的英语对话练习。你可以先用英文介绍一下今天的心情。`
  }
  if (text.includes('反PUA') || text.includes('PUA')) {
    return `${prefix}可以，我们来做一次反PUA演练。你可以把对方的话发给我，我会给出拆解与应对话术。`
  }
  if (text.includes('你好') || text.toLowerCase().includes('hello')) {
    return `${prefix}你好～我在呢。想聊什么？`
  }
  if (text.includes('打开') && text.includes('游戏')) {
    return `${prefix}已经帮你打开应用啦。需要我陪你一起玩吗？`
  }
  return `${prefix}我听到了：${text}\n\n如果你想让我做动作，可以试试说“挥手”“点头”“摇头”“加油”，或者在场景交互模式下说“过来/去左边/去右边”。`
}

export async function mockAiRespond(userText: string, ctx: MockAiContext): Promise<MockAiResult> {
  const shouldFail = userText.toLowerCase().includes('fail') || userText.includes('失败')
  await new Promise((r) => window.setTimeout(r, 650 + Math.random() * 450))
  if (shouldFail) {
    throw new Error('Mock 失败：你触发了模拟错误（输入包含 “fail/失败”）')
  }

  const dos = inferDo(userText, ctx)
  const reply = buildReply(userText, ctx)

  const timeline: Array<{ atMs: number; do: AvatarDo }> = []
  let at = 0
  for (const d of dos) {
    timeline.push({ atMs: at, do: d })
    at += d.kind === 'action' ? d.durationMs * 0.4 : 120
  }
  timeline.push({ atMs: Math.max(180, at), do: { kind: 'speech', text: reply, tts: true } })

  return {
    text: reply,
    perform: {
      type: 'character.perform',
      id: uid('perf'),
      timeline,
    },
  }
}

