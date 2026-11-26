<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppWindowState } from '../../lib/types'

const props = defineProps<{
  win: AppWindowState
  bounds: { width: number; height: number }
}>()

const emit = defineEmits<{
  (e: 'focus'): void
  (e: 'close'): void
  (e: 'move', pos: { x: number; y: number }): void
}>()

const dragging = ref(false)
const start = ref({ x: 0, y: 0 })
const origin = ref({ x: 0, y: 0 })

const style = computed(() => ({
  left: `${props.win.x}px`,
  top: `${props.win.y}px`,
  width: `${props.win.w}px`,
  height: `${props.win.h}px`,
  zIndex: props.win.z,
}))

function onHeaderPointerDown(e: PointerEvent) {
  dragging.value = true
  start.value = { x: e.clientX, y: e.clientY }
  origin.value = { x: props.win.x, y: props.win.y }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  emit('focus')
}

function onHeaderPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - start.value.x
  const dy = e.clientY - start.value.y
  emit('move', { x: origin.value.x + dx, y: origin.value.y + dy })
}

function onHeaderPointerUp() {
  dragging.value = false
}
</script>

<template>
  <div class="win" :style="style" @pointerdown="emit('focus')">
    <div
      class="header"
      @pointerdown.stop.prevent="onHeaderPointerDown"
      @pointermove.stop.prevent="onHeaderPointerMove"
      @pointerup.stop="onHeaderPointerUp"
      @pointercancel.stop="onHeaderPointerUp"
    >
      <div class="title">{{ win.title }}</div>
      <div class="ops">
        <button class="opBtn" type="button" @click.stop="emit('close')">关闭</button>
      </div>
    </div>
    <iframe class="frame" :src="win.url" :title="win.title" />
  </div>
</template>

<style scoped>
.win {
  position: absolute;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
  pointer-events: auto;
}

.header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.38);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  touch-action: none;
  cursor: grab;
}

.title {
  font-weight: 700;
  font-size: 13px;
  opacity: 0.95;
}

.ops {
  display: flex;
  gap: 8px;
}

.opBtn {
  border: 0;
  border-radius: 12px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
}

.frame {
  width: 100%;
  height: calc(100% - 44px);
  border: 0;
  background: rgba(255, 255, 255, 0.92);
}

@media (max-width: 860px) {
  .win {
    left: 10px !important;
    right: 10px !important;
    top: 88px !important;
    bottom: 140px !important;
    width: auto !important;
    height: auto !important;
  }
}
</style>

