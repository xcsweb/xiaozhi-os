<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import { uid } from '../../lib/id'
import { mockAiRespond } from '../../lib/ai/mockAi'
import { xiaozhiApiRespond } from '../../lib/ai/xiaozhiApi'
import type { ChatMessage } from '../../lib/types'

const store = useAppStore()

const input = store.chatDraft
const isSending = ref(false)
const listRef = ref<HTMLDivElement | null>(null)
const autoScroll = ref(true)

const showJumpToBottom = ref(false)

function isNearBottom(el: HTMLElement) {
  const threshold = 24
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

function onScroll() {
  const el = listRef.value
  if (!el) return
  autoScroll.value = isNearBottom(el)
  showJumpToBottom.value = !autoScroll.value
}

async function scrollToBottom() {
  await nextTick()
  const el = listRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
  autoScroll.value = true
  showJumpToBottom.value = false
}

watch(
  () => store.messages.value.length,
  async () => {
    if (autoScroll.value) await scrollToBottom()
  },
)

onMounted(() => {
  void scrollToBottom()
})

const canSend = computed(() => input.value.trim().length > 0 && !isSending.value)

async function send(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return
  if (isSending.value) return
  isSending.value = true

  store.addMessage({ role: 'user', content: trimmed, status: 'final' })

  const thinkingId = uid('m')
  const thinking: ChatMessage = {
    id: thinkingId,
    role: 'assistant',
    content: '思考中…',
    status: 'thinking',
    createdAt: Date.now(),
  }
  store.messages.value = [...store.messages.value, thinking]

  input.value = ''
  store.setThinkingMode(true)

  try {
    const ctx = {
      activeApp: store.activeAppContext.value,
      carryContext: store.settings.value.carryContext,
      scenarioMode: store.scenarioContext.value.mode,
      controlMode: store.settings.value.avatarControlMode,
    } as const

    const res = store.settings.value.apiEndpoint
      ? await xiaozhiApiRespond({
          endpoint: store.settings.value.apiEndpoint,
          apiKey: store.settings.value.apiKey,
          userText: trimmed,
          ctx,
        })
      : await mockAiRespond(trimmed, {
          activeApp: ctx.activeApp,
          carryContext: ctx.carryContext,
          controlMode: ctx.controlMode,
        })
    store.replaceMessage(thinkingId, {
      ...thinking,
      content: res.text,
      status: 'final',
      ttsReplayable: true,
    })
    if (res.perform) {
      void store.runPerform(res.perform.timeline)
    } else {
      void store.speak(res.text, true)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '未知错误'
    store.replaceMessage(thinkingId, {
      ...thinking,
      content: `请求失败：${msg}`,
      status: 'error',
      ttsReplayable: false,
    })
  } finally {
    isSending.value = false
    store.setThinkingMode(false)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  if (e.shiftKey) return
  e.preventDefault()
  void send(input.value)
}

async function retryFrom(message: ChatMessage) {
  if (message.role !== 'assistant' || message.status !== 'error') return
  const lastUser = [...store.messages.value].reverse().find((m) => m.role === 'user')
  if (!lastUser) return
  void send(lastUser.content)
}

async function replay(message: ChatMessage) {
  if (!message.ttsReplayable) return
  await store.speak(message.content, true)
}

async function copy(message: ChatMessage) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  await navigator.clipboard.writeText(message.content)
}
</script>

<template>
  <div class="panel">
    <div class="header">
      <div class="title">对话</div>
      <div class="right">
        <button v-if="store.tts.isSpeaking" class="ghostBtn" type="button" @click="store.stopSpeak">停止播报</button>
      </div>
    </div>

    <div ref="listRef" class="list" @scroll="onScroll">
      <div v-for="m in store.messages.value" :key="m.id" class="msg" :class="`role-${m.role}`">
        <div class="bubble" :class="`status-${m.status}`">
          <div class="content">{{ m.content }}</div>
          <div v-if="m.role === 'assistant' && m.status !== 'thinking'" class="ops">
            <button class="miniBtn" type="button" @click="copy(m)">复制</button>
            <button class="miniBtn" type="button" :disabled="!m.ttsReplayable" @click="replay(m)">重播</button>
            <button v-if="m.status === 'error'" class="miniBtn" type="button" @click="retryFrom(m)">重试</button>
          </div>
        </div>
      </div>

      <button v-if="showJumpToBottom" class="jump" type="button" @click="scrollToBottom">回到底部</button>
    </div>

    <div class="composer">
      <textarea
        v-model="input"
        class="input"
        placeholder="输入消息…（Enter 发送，Shift+Enter 换行）"
        :disabled="isSending"
        rows="2"
        @keydown="onKeydown"
      />
      <div class="actions">
        <button class="ghostBtn" type="button" :disabled="isSending" @click="send('（模拟语音）你好')">语音</button>
        <button class="sendBtn" type="button" :disabled="!canSend" @click="send(input)">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.title {
  font-weight: 700;
  letter-spacing: 0.2px;
}

.list {
  position: relative;
  overflow: auto;
  padding: 12px;
}

.msg {
  display: flex;
  margin-bottom: 10px;
}

.role-user {
  justify-content: flex-end;
}

.role-assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: min(520px, 100%);
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.role-user .bubble {
  background: rgba(90, 80, 140, 0.38);
  border-color: rgba(90, 80, 140, 0.55);
}

.status-thinking {
  opacity: 0.75;
}

.status-error {
  background: rgba(210, 60, 60, 0.18);
  border-color: rgba(210, 60, 60, 0.38);
}

.content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.35;
  font-size: 13px;
}

.ops {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.miniBtn {
  border: 0;
  border-radius: 10px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 12px;
}

.miniBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.jump {
  position: sticky;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  border: 0;
  border-radius: 999px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.45);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.composer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 10px;
}

.input {
  width: 100%;
  resize: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.26);
  color: rgba(255, 255, 255, 0.92);
  outline: none;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.ghostBtn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
}

.sendBtn {
  flex: 1;
  border: 0;
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 700;
}

.sendBtn:disabled,
.ghostBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
