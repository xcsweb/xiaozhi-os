<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import SpeechBubble from '../SpeechBubble/SpeechBubble.vue'
import PixelAvatar from '../avatars/PixelAvatar.vue'
import PuppetAvatar from '../avatars/PuppetAvatar.vue'
import ThreeAvatar from '../avatars/ThreeAvatar.vue'

const store = useAppStore()
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
  if (store.settings.value.avatarSkin === 'three' && !webglAvailable.value) {
    store.patchSettings({ avatarSkin: 'pixel', avatarEngine: 'static' })
  }
})

const engineLabel = computed(() => {
  const s = store.settings.value.avatarSkin
  if (s === 'puppet') return '2D'
  if (s === 'three') return '3D'
  return 'Static'
})

const isSceneMode = computed(() => store.settings.value.avatarControlMode === 'scene')

const avatarStyle = computed(() => {
  const pos = store.avatar.position
  const x = `${pos.x * 100}%`
  const y = `${pos.y * 100}%`
  return {
    left: x,
    top: y,
  }
})

const actionClass = computed(() => `act-${store.avatar.action}`)

const mouthScale = computed(() => {
  const open = store.avatar.mouthOpen
  const base = 0.12
  return base + open * 0.9
})

const faceTint = computed(() => {
  const e = store.avatar.expression
  if (e === 'happy') return 'rgba(255, 210, 240, 0.55)'
  if (e === 'sad') return 'rgba(190, 220, 255, 0.55)'
  if (e === 'angry') return 'rgba(255, 180, 180, 0.55)'
  if (e === 'surprised') return 'rgba(255, 240, 190, 0.55)'
  if (e === 'shy') return 'rgba(255, 200, 210, 0.55)'
  return 'rgba(255, 255, 255, 0.35)'
})

const showEngineWarning = computed(() => store.settings.value.avatarSkin === 'three' && !webglAvailable.value)
</script>

<template>
  <div class="stage">
    <div class="stageHeader">
      <div class="tag">{{ engineLabel }} · {{ isSceneMode ? '场景交互' : '动作库' }}</div>
      <div v-if="showEngineWarning" class="warn">WebGL 不可用，已降级</div>
    </div>

    <div class="room" />

    <div class="avatarAnchor" :class="{ scene: isSceneMode }" :style="avatarStyle">
      <div class="slot">
        <div v-if="store.settings.value.avatarSkin === 'classic'" class="avatarScale">
          <div class="avatar" :class="actionClass" :style="{ '--faceTint': faceTint }">
            <div class="hair" />
            <div class="head">
              <div class="eye left" />
              <div class="eye right" />
              <div class="mouth" :style="{ transform: `scaleY(${mouthScale})` }" />
              <div class="blush" />
            </div>
            <div class="body" />
            <div class="arm left" />
            <div class="arm right" />
          </div>
        </div>

        <PixelAvatar
          v-else-if="store.settings.value.avatarSkin === 'pixel'"
          :action="store.avatar.action"
          :expression="store.avatar.expression"
          :mouthOpen="store.avatar.mouthOpen"
        />

        <PuppetAvatar
          v-else-if="store.settings.value.avatarSkin === 'puppet'"
          :action="store.avatar.action"
          :expression="store.avatar.expression"
          :mouthOpen="store.avatar.mouthOpen"
        />

        <ThreeAvatar
          v-else-if="store.settings.value.avatarSkin === 'three'"
          :action="store.avatar.action"
          :expression="store.avatar.expression"
          :mouthOpen="store.avatar.mouthOpen"
        />

        <SpeechBubble />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: absolute;
  inset: 0;
}

.room {
  position: absolute;
  inset: 0;
  background: radial-gradient(1200px 600px at 30% 70%, rgba(255, 255, 255, 0.18), rgba(0, 0, 0, 0) 60%),
    radial-gradient(900px 500px at 70% 35%, rgba(255, 255, 255, 0.12), rgba(0, 0, 0, 0) 55%);
}

.stageHeader {
  position: absolute;
  left: 14px;
  top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
}

.tag {
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  font-size: 12px;
  letter-spacing: 0.2px;
}

.warn {
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(210, 60, 60, 0.35);
  backdrop-filter: blur(10px);
  font-size: 12px;
}

.avatarAnchor {
  position: absolute;
  z-index: 1;
  transition: left 700ms cubic-bezier(0.2, 0.9, 0.2, 1), top 700ms cubic-bezier(0.2, 0.9, 0.2, 1);
  --avatarScale: 0.68;
}

.avatarAnchor.scene {
  transition-duration: 900ms;
}

.slot {
  position: relative;
  transform: translate(-50%, -100%);
}

.avatarScale {
  width: 260px;
  height: 420px;
  transform: scale(var(--avatarScale));
  transform-origin: 50% 90%;
}

.avatar {
  position: relative;
  width: 260px;
  height: 420px;
  transform-origin: 50% 90%;
  filter: drop-shadow(0 16px 26px rgba(0, 0, 0, 0.38));
}

.hair {
  position: absolute;
  left: 50%;
  top: 22px;
  width: 210px;
  height: 210px;
  transform: translateX(-50%);
  border-radius: 44% 44% 46% 46%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0) 52%),
    linear-gradient(140deg, rgba(90, 70, 120, 0.95), rgba(50, 35, 70, 0.95));
}

.head {
  position: absolute;
  left: 50%;
  top: 70px;
  width: 176px;
  height: 176px;
  transform: translateX(-50%);
  border-radius: 46% 46% 52% 52%;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(170deg, rgba(255, 255, 255, 0.86), rgba(245, 245, 255, 0.7));
  box-shadow: inset 0 -12px 22px rgba(0, 0, 0, 0.08);
}

.head::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 44% 44% 52% 52%;
  background: var(--faceTint);
  opacity: 0.9;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.eye {
  position: absolute;
  top: 70px;
  width: 28px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.08);
  animation: blink 5200ms ease-in-out infinite;
}

.eye::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 52%;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.92) 0 18%, rgba(0, 0, 0, 0.86) 18% 100%);
}

.eye::after {
  content: '';
  position: absolute;
  left: 9px;
  top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
}

.eye.left {
  left: 52px;
}

.eye.right {
  right: 52px;
}

.mouth {
  position: absolute;
  left: 50%;
  top: 118px;
  width: 34px;
  height: 14px;
  transform: translateX(-50%);
  transform-origin: 50% 50%;
  border-radius: 0 0 999px 999px;
  background: rgba(120, 40, 70, 0.85);
  box-shadow: inset 0 -4px 6px rgba(0, 0, 0, 0.25);
}

.blush {
  position: absolute;
  left: 50%;
  top: 98px;
  width: 160px;
  height: 50px;
  transform: translateX(-50%);
  background: radial-gradient(circle at 26% 65%, rgba(255, 120, 160, 0.24), rgba(0, 0, 0, 0) 46%),
    radial-gradient(circle at 74% 65%, rgba(255, 120, 160, 0.24), rgba(0, 0, 0, 0) 46%);
  pointer-events: none;
}

.body {
  position: absolute;
  left: 50%;
  top: 210px;
  width: 160px;
  height: 200px;
  transform: translateX(-50%);
  border-radius: 56% 56% 26% 26%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(90, 80, 140, 0.92), rgba(50, 35, 70, 0.92));
}

.arm {
  position: absolute;
  top: 240px;
  width: 90px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(90, 80, 140, 0.9), rgba(50, 35, 70, 0.9));
  transform-origin: 12px 50%;
}

.arm.left {
  left: 34px;
  transform: rotate(14deg);
}

.arm.right {
  right: 34px;
  transform: rotate(-14deg);
}

.act-idle {
  animation: breathe 3600ms ease-in-out infinite;
}

.act-think {
  animation: breathe 2400ms ease-in-out infinite;
}

.act-wave .arm.right {
  animation: wave 880ms ease-in-out infinite;
}

.act-nod {
  animation: nod 650ms ease-in-out infinite;
}

.act-shakeHead {
  animation: shake 520ms ease-in-out infinite;
}

.act-cheer {
  animation: cheer 760ms ease-in-out infinite;
}

@keyframes breathe {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.01);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes wave {
  0% {
    transform: rotate(-18deg) translateY(0);
  }
  50% {
    transform: rotate(-68deg) translateY(-6px);
  }
  100% {
    transform: rotate(-18deg) translateY(0);
  }
}

@keyframes nod {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes cheer {
  0% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-10px) rotate(-2deg);
  }
  100% {
    transform: translateY(0) rotate(0);
  }
}

@keyframes blink {
  0% {
    transform: scaleY(1);
  }
  92% {
    transform: scaleY(1);
  }
  94% {
    transform: scaleY(0.08);
  }
  96% {
    transform: scaleY(1);
  }
  100% {
    transform: scaleY(1);
  }
}

@media (max-width: 860px) {
  .avatarAnchor {
    --avatarScale: 0.5;
  }
}

@media (min-width: 1200px) {
  .avatarAnchor {
    --avatarScale: 0.72;
  }
}
</style>
