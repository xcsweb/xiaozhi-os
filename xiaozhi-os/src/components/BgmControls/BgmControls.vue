<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { getBgmController } from '../../lib/audio/bgm'
import { useAppStore } from '../../stores/useAppStore'

const store = useAppStore()

const bgm = getBgmController({ volume: store.settings.value.bgmVolume, muted: store.settings.value.bgmMuted })

watchEffect(() => {
  bgm.setVolume(store.settings.value.bgmVolume)
  bgm.setMuted(store.settings.value.bgmMuted)
})

watchEffect(() => {
  bgm.duck(store.tts.isSpeaking)
})

const label = computed(() => (bgm.playing ? 'BGM 暂停' : 'BGM 播放'))

async function toggle() {
  if (!bgm.unlocked) await bgm.unlock()
  store.setAudioUnlocked(bgm.unlocked)
  if (bgm.playing) bgm.pause()
  else bgm.play()
}

function onVolumeInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  store.patchSettings({ bgmVolume: v })
}

function toggleMute() {
  store.patchSettings({ bgmMuted: !store.settings.value.bgmMuted })
}
</script>

<template>
  <div class="wrap">
    <button class="btn" type="button" @click="toggle">{{ label }}</button>
    <button class="btn" type="button" @click="toggleMute">{{ store.settings.value.bgmMuted ? '静音' : '有声' }}</button>
    <input class="vol" type="range" min="0" max="1" step="0.01" :value="store.settings.value.bgmVolume" @input="onVolumeInput" />
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.btn {
  border: 0;
  border-radius: 12px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.vol {
  width: 110px;
}
</style>

