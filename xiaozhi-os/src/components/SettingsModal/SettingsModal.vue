<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import type { AvatarEngine, AvatarControlMode, AvatarSkin, SpeechBubbleMode, SpeechBubblePlacement } from '../../lib/types'

defineEmits<{ (e: 'close'): void }>()
const store = useAppStore()

const apiEndpoint = ref(store.settings.value.apiEndpoint)
const apiKey = ref(store.settings.value.apiKey)
const showKey = ref(false)
const carryContext = ref(store.settings.value.carryContext)
const engine = ref<AvatarEngine>(store.settings.value.avatarEngine)
const controlMode = ref<AvatarControlMode>(store.settings.value.avatarControlMode)
const skin = ref<AvatarSkin>(store.settings.value.avatarSkin)
const bubbleMode = ref<SpeechBubbleMode>(store.settings.value.speechBubbleMode)
const bubblePlacement = ref<SpeechBubblePlacement>(store.settings.value.speechBubblePlacement)
const debug = ref(store.settings.value.debug)

const webglAvailable = ref(true)
function detectWebgl() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    webglAvailable.value = Boolean(gl)
  } catch {
    webglAvailable.value = false
  }
}

onMounted(() => {
  detectWebgl()
})

const canUse3d = computed(() => webglAvailable.value)

const saveStatus = ref<'idle' | 'saved'>('idle')
function save() {
  if (engine.value === '3d' && !canUse3d.value) {
    engine.value = 'static'
  }
  store.patchSettings({
    apiEndpoint: apiEndpoint.value.trim(),
    apiKey: apiKey.value,
    carryContext: carryContext.value,
    avatarEngine: engine.value,
    avatarControlMode: controlMode.value,
    avatarSkin: skin.value,
    speechBubbleMode: bubbleMode.value,
    speechBubblePlacement: bubblePlacement.value,
    debug: debug.value,
  })
  saveStatus.value = 'saved'
  window.setTimeout(() => (saveStatus.value = 'idle'), 1600)
}

const pingStatus = ref<'idle' | 'checking' | 'ok' | 'fail'>('idle')
const pingMessage = ref('')

async function ping() {
  const endpoint = apiEndpoint.value.trim()
  if (!endpoint) return
  pingStatus.value = 'checking'
  pingMessage.value = ''
  try {
    const ctrl = new AbortController()
    const t = window.setTimeout(() => ctrl.abort(), 2000)
    const res = await fetch(endpoint, {
      method: 'GET',
      mode: 'cors',
      signal: ctrl.signal,
    })
    window.clearTimeout(t)
    pingStatus.value = res.ok ? 'ok' : 'fail'
    pingMessage.value = res.ok ? '连通性正常' : `连通性异常（HTTP ${res.status}）`
  } catch (e) {
    pingStatus.value = 'fail'
    pingMessage.value = e instanceof Error ? e.message : '请求失败'
  }
}
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="header">
        <div class="title">设置</div>
        <button class="closeBtn" type="button" @click="$emit('close')">关闭</button>
      </div>

      <div class="body">
        <div class="section">
          <div class="sectionTitle">API</div>
          <label class="field">
            <div class="label">Endpoint</div>
            <input v-model="apiEndpoint" class="input" placeholder="https://example.com/worker/..." />
          </label>
          <label class="field">
            <div class="label">API Key</div>
            <div class="row">
              <input v-model="apiKey" class="input" :type="showKey ? 'text' : 'password'" placeholder="可选" />
              <button class="miniBtn" type="button" @click="showKey = !showKey">{{ showKey ? '隐藏' : '显示' }}</button>
            </div>
          </label>
          <div class="row">
            <button class="miniBtn" type="button" :disabled="pingStatus === 'checking'" @click="ping">
              {{ pingStatus === 'checking' ? '检查中…' : '连通性检查' }}
            </button>
            <div v-if="pingStatus !== 'idle'" class="hint" :class="`hint-${pingStatus}`">{{ pingMessage }}</div>
          </div>
        </div>

        <div class="section">
          <div class="sectionTitle">数字人</div>
          <label class="field">
            <div class="label">风格</div>
            <select v-model="skin" class="input">
              <option value="classic">经典（CSS）</option>
              <option value="pixel">像素精灵</option>
              <option value="puppet">2D Puppet</option>
              <option value="three" :disabled="!canUse3d">3D Three</option>
            </select>
          </label>
          <div class="row">
            <button class="miniBtn" type="button" @click="store.openExperiment">打开实验室</button>
          </div>

          <label class="field">
            <div class="label">引擎</div>
            <select v-model="engine" class="input">
              <option value="static">静态</option>
              <option value="2d">2D</option>
              <option :value="'3d'" :disabled="!canUse3d">3D</option>
            </select>
          </label>
          <div v-if="!canUse3d" class="note">检测到 WebGL 不可用，3D 选项已禁用</div>

          <label class="field">
            <div class="label">动作模式</div>
            <select v-model="controlMode" class="input">
              <option value="library">动作库（推荐）</option>
              <option value="scene">场景交互（实验）</option>
            </select>
          </label>
        </div>

        <div class="section">
          <div class="sectionTitle">对话</div>
          <label class="check">
            <input v-model="carryContext" type="checkbox" />
            <span>携带当前应用上下文</span>
          </label>
        </div>

        <div class="section">
          <div class="sectionTitle">气泡</div>
          <label class="field">
            <div class="label">内容</div>
            <select v-model="bubbleMode" class="input">
              <option value="summary">摘要</option>
              <option value="full">全文</option>
              <option value="off">关闭</option>
            </select>
          </label>
          <label class="field">
            <div class="label">位置</div>
            <select v-model="bubblePlacement" class="input">
              <option value="avatar">跟随角色</option>
              <option value="chat">固定在对话区</option>
            </select>
          </label>
        </div>

        <div class="section">
          <div class="sectionTitle">隐私</div>
          <label class="check">
            <input v-model="debug" type="checkbox" />
            <span>调试模式</span>
          </label>
          <div class="note">默认不在页面或控制台输出 API Key 等敏感信息</div>
        </div>
      </div>

      <div class="footer">
        <div class="saved" v-if="saveStatus === 'saved'">已保存</div>
        <button class="saveBtn" type="button" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 20;
  padding: 16px;
}

.modal {
  width: min(760px, 100%);
  max-height: min(84vh, 820px);
  overflow: hidden;
  border-radius: 22px;
  background: rgba(20, 20, 26, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.4);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 14px 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.title {
  font-weight: 800;
  letter-spacing: 0.2px;
}

.closeBtn {
  border: 0;
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 800;
}

.body {
  overflow: auto;
  padding: 14px;
  display: grid;
  gap: 14px;
}

.section {
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.sectionTitle {
  font-weight: 800;
  margin-bottom: 10px;
}

.field {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.label {
  font-size: 12px;
  opacity: 0.85;
}

.input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.24);
  color: rgba(255, 255, 255, 0.92);
  outline: none;
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.miniBtn {
  border: 0;
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
  white-space: nowrap;
}

.miniBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hint {
  font-size: 12px;
  opacity: 0.9;
}

.hint-ok {
  color: rgba(130, 255, 190, 0.9);
}

.hint-fail {
  color: rgba(255, 160, 160, 0.9);
}

.note {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.check {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 6px;
  font-size: 13px;
}

.footer {
  padding: 12px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
}

.saveBtn {
  border: 0;
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 900;
}

.saved {
  font-size: 12px;
  opacity: 0.85;
}
</style>
