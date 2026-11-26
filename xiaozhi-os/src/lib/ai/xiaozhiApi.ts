import type { AppId, AvatarControlMode, AvatarPerformCommand } from '../types'
import { uid } from '../id'

export interface XiaozhiApiContext {
  activeApp: { appId: AppId | null; title: string | null }
  carryContext: boolean
  scenarioMode: string | null
  controlMode: AvatarControlMode
}

export interface XiaozhiApiResult {
  text: string
  perform?: AvatarPerformCommand
}

export async function xiaozhiApiRespond(args: {
  endpoint: string
  apiKey?: string
  userText: string
  ctx: XiaozhiApiContext
}): Promise<XiaozhiApiResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const key = args.apiKey?.trim()
  if (key) {
    headers.Authorization = `Bearer ${key}`
    headers['X-Api-Key'] = key
  }

  const body = {
    id: uid('req'),
    text: args.userText,
    context: args.ctx.carryContext
      ? {
          activeApp: args.ctx.activeApp,
          scenarioMode: args.ctx.scenarioMode,
          controlMode: args.ctx.controlMode,
        }
      : { controlMode: args.ctx.controlMode },
  }

  const res = await fetch(args.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const json = (await res.json()) as any
  const text =
    (typeof json?.text === 'string' && json.text) ||
    (typeof json?.reply === 'string' && json.reply) ||
    (typeof json?.message === 'string' && json.message) ||
    (typeof json?.data?.text === 'string' && json.data.text) ||
    ''

  if (!text) {
    throw new Error('响应缺少文本字段（text/reply/message）')
  }

  const perform = json?.perform && typeof json.perform === 'object' ? (json.perform as AvatarPerformCommand) : undefined

  return { text, perform }
}

