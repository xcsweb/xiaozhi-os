<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { AvatarAction, AvatarExpression } from '../../lib/types'

const props = defineProps<{
  action: AvatarAction
  expression: AvatarExpression
  mouthOpen: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1

const size = { w: 96, h: 112 }
const scale = computed(() => 3.6)

let raf = 0
let t0 = 0

function colorForExpression(e: AvatarExpression) {
  if (e === 'happy') return '#ffb3d9'
  if (e === 'sad') return '#9fd0ff'
  if (e === 'angry') return '#ff9d9d'
  if (e === 'surprised') return '#ffd39b'
  if (e === 'shy') return '#ffb0b0'
  return '#e9e9f1'
}

function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, c: string) {
  ctx.fillStyle = c
  ctx.fillRect(x, y, 1, 1)
}

function draw(ctx: CanvasRenderingContext2D, now: number) {
  const tt = (now - t0) / 1000
  ctx.clearRect(0, 0, size.w, size.h)

  const breathe = Math.sin(tt * 2.2) * 1.2
  const baseY = 14 + breathe
  const wave = props.action === 'wave' ? Math.sin(tt * 10) * 10 : 0
  const nod = props.action === 'nod' ? Math.sin(tt * 12) * 2.5 : 0
  const shake = props.action === 'shakeHead' ? Math.sin(tt * 12) * 2.8 : 0
  const cheer = props.action === 'cheer' ? Math.max(0, Math.sin(tt * 8)) * 2 : 0
  const think = props.action === 'think' ? Math.sin(tt * 6) * 1.2 : 0

  const ox = 18 + shake
  const oy = baseY + nod - cheer - think

  const cloak = '#4b3a6d'
  const cloak2 = '#2f2347'
  const skin = '#f7f7fb'
  const outline = '#1b1626'
  const faceTint = colorForExpression(props.expression)
  const blush = props.expression === 'shy' ? '#ff7c9a' : '#ff9cb6'

  const blink = Math.sin(tt * 0.9) > 0.98 ? 1 : 0

  const bodyTop = Math.floor(oy + 46)
  for (let y = 0; y < 52; y++) {
    for (let x = 0; x < 60; x++) {
      const xx = Math.floor(ox + x)
      const yy = Math.floor(bodyTop + y)
      const dx = x - 30
      const dy = y - 24
      const r = Math.sqrt(dx * dx + dy * dy)
      const edge = r > 27 ? 0 : 1
      if (!edge) continue
      const shade = dy > 8 ? cloak2 : cloak
      drawPixel(ctx, xx, yy, shade)
    }
  }

  const armY = Math.floor(bodyTop + 18)
  const leftArmX = Math.floor(ox + 8)
  const rightArmX = Math.floor(ox + 44)
  const armLift = props.action === 'wave' ? -10 : props.action === 'cheer' ? -6 : 0

  for (let i = 0; i < 26; i++) {
    drawPixel(ctx, leftArmX + i, armY + 12, cloak2)
    drawPixel(ctx, rightArmX + i, armY + 12 + armLift, cloak2)
  }

  const headX = Math.floor(ox + 10)
  const headY = Math.floor(oy + 12)
  for (let y = 0; y < 44; y++) {
    for (let x = 0; x < 44; x++) {
      const dx = x - 22
      const dy = y - 22
      const r = Math.sqrt(dx * dx + dy * dy)
      if (r > 21) continue
      const isEdge = r > 20.2
      drawPixel(ctx, headX + x, headY + y, isEdge ? outline : skin)
    }
  }

  for (let y = 2; y < 42; y++) {
    for (let x = 2; x < 42; x++) {
      const dx = x - 22
      const dy = y - 22
      const r = Math.sqrt(dx * dx + dy * dy)
      if (r > 18) continue
      if (Math.abs(dx) < 10 && dy < 6) continue
      drawPixel(ctx, headX + x, headY + y, faceTint)
    }
  }

  const hair = '#3c2d5c'
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      const dx = x - 24
      const dy = y - 18
      const r = Math.sqrt(dx * dx + dy * dy)
      if (r > 25) continue
      if (dy > 18 && Math.abs(dx) < 16) continue
      const edge = r > 24.2
      drawPixel(ctx, headX - 2 + x, headY - 6 + y, edge ? outline : hair)
    }
  }

  const eyeY = headY + 20
  const leftEyeX = headX + 12
  const rightEyeX = headX + 28
  for (let i = 0; i < 8; i++) {
    drawPixel(ctx, leftEyeX + i, eyeY, outline)
    drawPixel(ctx, rightEyeX + i, eyeY, outline)
    if (!blink) {
      drawPixel(ctx, leftEyeX + i, eyeY + 1, '#ffffff')
      drawPixel(ctx, rightEyeX + i, eyeY + 1, '#ffffff')
    }
  }
  if (!blink) {
    drawPixel(ctx, leftEyeX + 3, eyeY + 2, '#111118')
    drawPixel(ctx, rightEyeX + 3, eyeY + 2, '#111118')
    drawPixel(ctx, leftEyeX + 4, eyeY + 2, '#ffffff')
    drawPixel(ctx, rightEyeX + 4, eyeY + 2, '#ffffff')
  }

  const mouthY = headY + 32
  const mouthX = headX + 18
  const open = props.mouthOpen > 0.25 ? 1 : 0
  for (let i = 0; i < 8; i++) {
    drawPixel(ctx, mouthX + i, mouthY, '#7a274b')
    if (open) drawPixel(ctx, mouthX + i, mouthY + 1, '#7a274b')
  }

  const blushY = headY + 28
  drawPixel(ctx, headX + 10, blushY, blush)
  drawPixel(ctx, headX + 34, blushY, blush)

  if (props.action === 'wave') {
    const handX = Math.floor(rightArmX + 16 + wave)
    const handY = Math.floor(armY + 10 + armLift)
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        drawPixel(ctx, handX + x, handY + y, outline)
      }
    }
    for (let y = 1; y < 5; y++) {
      for (let x = 1; x < 5; x++) {
        drawPixel(ctx, handX + x, handY + y, skin)
      }
    }
  }
}

function loop(now: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  draw(ctx, now)
  raf = requestAnimationFrame(loop)
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = Math.floor(size.w * dpr)
  canvas.height = Math.floor(size.h * dpr)
  canvas.style.width = `${Math.floor(size.w * scale.value)}px`
  canvas.style.height = `${Math.floor(size.h * scale.value)}px`
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
}

onMounted(() => {
  t0 = performance.now()
  resize()
  raf = requestAnimationFrame(loop)
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})

watch(scale, () => resize())
</script>

<template>
  <div class="wrap">
    <canvas ref="canvasRef" class="canvas" />
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
  pointer-events: none;
}

.canvas {
  image-rendering: pixelated;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.35));
}
</style>
