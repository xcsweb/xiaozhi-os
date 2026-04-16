<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import type { AppId } from '../../lib/types'

const store = useAppStore()

const apps: Array<{ id: AppId; label: string }> = [
  { id: 'english-music-game', label: 'Music' },
  { id: 'twoeyes-vue', label: 'TwoEyes' },
  { id: 'anti-pua-puax', label: 'AntiPUA' },
]

const opened = computed(() => new Set(store.windows.value.map((w) => w.appId)))

const showHint = ref(false)
onMounted(() => {
  if (!store.settings.value.hasSeenDockHint) {
    showHint.value = true
    window.setTimeout(() => {
      showHint.value = false
    }, 4200)
  }
})

function open(appId: AppId) {
  store.openApp(appId)
  if (!store.settings.value.hasSeenDockHint) {
    store.setDockHintSeen()
    showHint.value = false
  }
}
</script>

<template>
  <div class="dock">
    <div v-if="showHint" class="hint">
      <div class="hintText">点 Dock 打开子应用，窗口可拖拽</div>
      <button class="hintClose" type="button" @click="store.setDockHintSeen(), (showHint = false)">知道了</button>
    </div>

    <button
      v-for="a in apps"
      :key="a.id"
      class="item"
      type="button"
      :class="{ active: opened.has(a.id) }"
      @click="open(a.id)"
    >
      <div class="icon">{{ a.label.slice(0, 1) }}</div>
      <div class="label">{{ a.label }}</div>
    </button>
  </div>
</template>

<style scoped>
.dock {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 22px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  justify-content: center;
}

.item {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  border-radius: 16px;
  padding: 10px 12px;
  display: grid;
  gap: 6px;
  justify-items: center;
  min-width: 92px;
}

.item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.item.active {
  background: rgba(90, 80, 140, 0.38);
}

.icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 800;
}

.label {
  font-size: 12px;
  opacity: 0.9;
}

.hint {
  position: absolute;
  left: 12px;
  bottom: calc(100% + 10px);
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
}

.hintText {
  font-size: 13px;
  opacity: 0.92;
}

.hintClose {
  border: 0;
  border-radius: 12px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
}
</style>

