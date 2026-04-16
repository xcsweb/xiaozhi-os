<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import { createAppStore } from '../../stores/appStore'
import { appStoreKey } from '../../stores/appStoreContext'
import AvatarStage from '../AvatarStage/AvatarStage.vue'
import ChatPanel from '../ChatPanel/ChatPanel.vue'
import DockBar from '../DockBar/DockBar.vue'
import SettingsModal from '../SettingsModal/SettingsModal.vue'
import ExperimentModal from '../ExperimentModal/ExperimentModal.vue'
import DesktopWindow from '../DesktopWindow/DesktopWindow.vue'
import QuickStartCard from '../QuickStartCard/QuickStartCard.vue'
import BgmControls from '../BgmControls/BgmControls.vue'
import type { AvatarDo } from '../../lib/types'

const rootRef = ref<HTMLElement | null>(null)
const store = createAppStore()
provide(appStoreKey, store)

const backgroundUrl =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cozy%20warm%20home%20room%20interior%2C%20soft%20lighting%2C%20wood%20floor%2C%20plants%2C%20comfortable%20sofa%2C%20desk%2C%20gentle%20evening%20ambience%2C%20high%20detail%2C%20photorealistic%2C%20wide%20angle&image_size=landscape_16_9'

const isMobile = ref(false)
function updateIsMobile() {
  isMobile.value = typeof window !== 'undefined' ? window.innerWidth < 860 : false
}

const showQuickStart = computed(() => !store.settings.value.hasSeenQuickStart && !store.settings.value.apiEndpoint)

function onRootPointerDown() {
  store.setAudioUnlocked(true)
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return
    const data = event.data as unknown
    if (!data || typeof data !== 'object') return
    const type = (data as { type?: unknown }).type
    const payload = (data as { payload?: unknown }).payload
    if (typeof type !== 'string') return

    if (type === 'openChatPrompt' && payload && typeof payload === 'object') {
      const text = (payload as { text?: unknown }).text
      if (typeof text === 'string') {
        store.setChatDraft(text)
        store.ui.isChatOpenOnMobile = true
      }
      return
    }

    if (type === 'setContext' && payload && typeof payload === 'object') {
      const mode = (payload as { mode?: unknown }).mode
      if (typeof mode === 'string') store.setScenarioMode(mode)
      return
    }

    if (type === 'assistantSay' && payload && typeof payload === 'object') {
      const text = (payload as { text?: unknown }).text
      const mood = (payload as { mood?: unknown }).mood
      const action = (payload as { action?: unknown }).action
      if (typeof text !== 'string') return

      store.addMessage({ role: 'assistant', content: text, status: 'final', ttsReplayable: true })
      const dos: AvatarDo[] = []
      if (typeof mood === 'string') {
        const m = mood === 'happy' ? 'happy' : mood === 'sad' ? 'sad' : mood === 'angry' ? 'angry' : mood === 'surprised' ? 'surprised' : 'neutral'
        dos.push({ kind: 'expression', expression: m, intensity: 0.85, durationMs: 1200 })
      }
      if (typeof action === 'string') {
        const a =
          action === 'wave'
            ? 'wave'
            : action === 'nod'
              ? 'nod'
              : action === 'shakeHead'
                ? 'shakeHead'
                : action === 'think'
                  ? 'think'
                  : action === 'cheer'
                    ? 'cheer'
                    : 'idle'
        if (a !== 'idle') dos.push({ kind: 'action', action: a, durationMs: 1400 })
      }
      dos.push({ kind: 'speech', text, tts: true })
      void store.runPerform(
        dos.map((d, idx) => ({
          atMs: idx * 120,
          do: d,
        })),
      )
    }
  })
})

const desktopBounds = computed(() => {
  const el = rootRef.value
  if (!el) return { width: 1280, height: 720 }
  const rect = el.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
})
</script>

<template>
  <div ref="rootRef" class="root" :class="{ mobile: isMobile }" @pointerdown="onRootPointerDown">
    <div class="bg" :style="{ backgroundImage: `url(${backgroundUrl})` }" />
    <div class="topBar">
      <div class="brand">
        <div class="brandName">小智OS</div>
        <div class="clock">{{ store.clockText.value }}</div>
      </div>
      <div class="topActions">
        <BgmControls />
        <button class="iconBtn" type="button" @click="store.openExperiment">实验</button>
        <button class="iconBtn" type="button" @click="store.openSettings">设置</button>
      </div>
    </div>

    <div class="main">
      <div class="stageWrap">
        <AvatarStage />
        <div v-if="showQuickStart" class="quickStartWrap">
          <QuickStartCard @close="store.setQuickStartSeen" />
        </div>
      </div>

      <div class="chatWrap" :class="{ closed: isMobile && !store.ui.isChatOpenOnMobile }">
        <ChatPanel />
      </div>
    </div>

    <div class="dockWrap">
      <DockBar />
    </div>

    <div class="windowsLayer">
      <DesktopWindow
        v-for="w in store.windows.value"
        :key="w.id"
        :win="w"
        :bounds="desktopBounds"
        @focus="store.focusWindow(w.id)"
        @close="store.closeWindow(w.id)"
        @move="(pos) => store.moveWindow(w.id, pos.x, pos.y, desktopBounds)"
      />
    </div>

    <div v-if="isMobile" class="mobileBottomBar">
      <button class="tabBtn" type="button" @click="store.ui.isChatOpenOnMobile = !store.ui.isChatOpenOnMobile">
        {{ store.ui.isChatOpenOnMobile ? '收起聊天' : '打开聊天' }}
      </button>
      <button class="tabBtn" type="button" @click="store.openExperiment">实验</button>
      <button class="tabBtn" type="button" @click="store.openSettings">设置</button>
    </div>

    <SettingsModal v-if="store.ui.isSettingsOpen" @close="store.closeSettings" />
    <ExperimentModal v-if="store.ui.isExperimentOpen" @close="store.closeExperiment" />
  </div>
</template>

<style scoped>
.root {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.92);
}

.bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.1) contrast(1.05);
  transform: scale(1.04);
}

.topBar {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  z-index: 5;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.brandName {
  font-weight: 700;
  letter-spacing: 0.4px;
}

.clock {
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}

.topActions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.iconBtn {
  appearance: none;
  border: 0;
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.main {
  position: absolute;
  inset: 68px 16px 84px 16px;
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 14px;
  z-index: 3;
}

.root.mobile .main {
  inset: 60px 10px 110px 10px;
  grid-template-columns: 1fr;
}

.stageWrap {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(10px);
}

.chatWrap {
  border-radius: 22px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(10px);
}

.root.mobile .chatWrap.closed {
  display: none;
}

.dockWrap {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 6;
}

.windowsLayer {
  position: absolute;
  inset: 0;
  z-index: 7;
  pointer-events: none;
}

.quickStartWrap {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 2;
}

.mobileBottomBar {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 72px;
  display: flex;
  gap: 10px;
  z-index: 6;
}

.tabBtn {
  flex: 1;
  border: 0;
  border-radius: 14px;
  padding: 12px 12px;
  background: rgba(0, 0, 0, 0.42);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  backdrop-filter: blur(10px);
}
</style>
