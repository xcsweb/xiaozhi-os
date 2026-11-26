<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/useAppStore'

const store = useAppStore()

const text = computed(() => store.avatar.speechText)
const visible = computed(() => Boolean(text.value) && store.speechBubbleMode.value !== 'off')

const bubbleText = computed(() => {
  if (store.speechBubbleMode.value === 'full') return text.value
  const max = 42
  if (text.value.length <= max) return text.value
  return `${text.value.slice(0, max)}…`
})

const placementClass = computed(() => `place-${store.speechBubblePlacement.value}`)
</script>

<template>
  <div v-if="visible" class="bubble" :class="placementClass">
    <div class="content">{{ bubbleText }}</div>
  </div>
</template>

<style scoped>
.bubble {
  position: absolute;
  left: 50%;
  bottom: 86%;
  transform: translateX(-50%);
  max-width: min(360px, 70vw);
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 16px;
  height: 16px;
  transform: translateX(-50%) rotate(45deg);
  background: rgba(0, 0, 0, 0.55);
}

.content {
  font-size: 13px;
  line-height: 1.35;
  white-space: pre-wrap;
  word-break: break-word;
}

.place-chat {
  left: 12px;
  bottom: auto;
  top: 12px;
  transform: none;
}

.place-chat::after {
  display: none;
}
</style>

