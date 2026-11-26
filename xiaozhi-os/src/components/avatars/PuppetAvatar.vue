<script setup lang="ts">
import { computed } from 'vue'
import type { AvatarAction, AvatarExpression } from '../../lib/types'

const props = defineProps<{
  action: AvatarAction
  expression: AvatarExpression
  mouthOpen: number
}>()

function tint(e: AvatarExpression) {
  if (e === 'happy') return 'rgba(255, 195, 230, 0.48)'
  if (e === 'sad') return 'rgba(170, 215, 255, 0.48)'
  if (e === 'angry') return 'rgba(255, 170, 170, 0.48)'
  if (e === 'surprised') return 'rgba(255, 230, 170, 0.48)'
  if (e === 'shy') return 'rgba(255, 185, 195, 0.5)'
  return 'rgba(255, 255, 255, 0.32)'
}

const faceTint = computed(() => tint(props.expression))
const mouthH = computed(() => 6 + Math.max(0, Math.min(1, props.mouthOpen)) * 12)

const wave = computed(() => (props.action === 'wave' ? 'wave' : ''))
const nod = computed(() => (props.action === 'nod' ? 'nod' : props.action === 'shakeHead' ? 'shake' : ''))
const cheer = computed(() => (props.action === 'cheer' ? 'cheer' : ''))
const think = computed(() => (props.action === 'think' ? 'think' : ''))
const idle = computed(() => (props.action === 'idle' ? 'idle' : 'idle'))
</script>

<template>
  <div class="wrap">
    <div class="puppet" :class="[idle, wave, nod, cheer, think]" :style="{ '--faceTint': faceTint }">
      <svg class="svg" viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="hairG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#6d59a8" />
            <stop offset="1" stop-color="#2e2247" />
          </linearGradient>
          <linearGradient id="cloakG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#5c4a88" />
            <stop offset="1" stop-color="#2a203e" />
          </linearGradient>
          <radialGradient id="shine" cx="35%" cy="30%" r="70%">
            <stop offset="0" stop-color="rgba(255,255,255,0.25)" />
            <stop offset="1" stop-color="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g class="shadow">
          <ellipse cx="170" cy="392" rx="94" ry="20" fill="rgba(0,0,0,0.18)" />
        </g>

        <g class="body">
          <path
            d="M108 220c18-26 42-38 68-38s50 12 68 38c20 30 32 78 32 130H76c0-52 12-100 32-130z"
            fill="url(#cloakG)"
            stroke="rgba(255,255,255,0.12)"
            stroke-width="2"
          />
          <path
            d="M114 242c18-18 38-26 62-26s44 8 62 26c-6 12-14 22-24 30-12 9-26 14-38 14s-26-5-38-14c-10-8-18-18-24-30z"
            fill="rgba(255,255,255,0.06)"
          />
        </g>

        <g class="arm left">
          <path
            d="M118 264c-22 4-40 14-54 30-10 12-14 22-12 30 2 8 10 12 24 12 20 0 40-12 58-34l-16-38z"
            fill="#372a53"
            opacity="0.9"
          />
        </g>
        <g class="arm right">
          <path
            d="M222 264c22 4 40 14 54 30 10 12 14 22 12 30-2 8-10 12-24 12-20 0-40-12-58-34l16-38z"
            fill="#372a53"
            opacity="0.9"
          />
        </g>

        <g class="headGroup">
          <path
            d="M72 154c0-60 44-104 98-104s98 44 98 104c0 48-28 86-68 100-10 3-20 5-30 5s-20-2-30-5c-40-14-68-52-68-100z"
            fill="url(#hairG)"
            stroke="rgba(0,0,0,0.12)"
            stroke-width="2"
          />
          <path
            d="M92 170c0-44 34-78 78-78s78 34 78 78c0 52-34 86-78 86s-78-34-78-86z"
            fill="rgba(248,248,252,0.92)"
            stroke="rgba(0,0,0,0.08)"
            stroke-width="2"
          />
          <path d="M104 166c10-36 38-60 66-60s56 24 66 60c-16-10-38-16-66-16s-50 6-66 16z" fill="url(#shine)" />
          <path
            d="M116 190c12-10 30-16 54-16s42 6 54 16c-6 28-26 46-54 46s-48-18-54-46z"
            fill="var(--faceTint)"
            opacity="0.9"
            style="mix-blend-mode: overlay"
          />

          <g class="eyes">
            <g class="eye left">
              <ellipse cx="142" cy="188" rx="16" ry="14" fill="rgba(255,255,255,0.92)" />
              <circle cx="146" cy="190" r="8" fill="rgba(0,0,0,0.82)" />
              <circle cx="149" cy="186" r="3" fill="rgba(255,255,255,0.78)" />
            </g>
            <g class="eye right">
              <ellipse cx="198" cy="188" rx="16" ry="14" fill="rgba(255,255,255,0.92)" />
              <circle cx="202" cy="190" r="8" fill="rgba(0,0,0,0.82)" />
              <circle cx="205" cy="186" r="3" fill="rgba(255,255,255,0.78)" />
            </g>
          </g>

          <g class="mouth">
            <rect x="156" y="214" width="28" :height="mouthH" rx="12" fill="rgba(120,40,70,0.85)" />
          </g>

          <g class="blush">
            <ellipse cx="126" cy="214" rx="18" ry="10" fill="rgba(255,130,170,0.22)" />
            <ellipse cx="214" cy="214" rx="18" ry="10" fill="rgba(255,130,170,0.22)" />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
  pointer-events: none;
}

.puppet {
  width: 320px;
  height: 420px;
  transform-origin: 50% 90%;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.35));
  animation: breathe 3600ms ease-in-out infinite;
}

.svg {
  width: 100%;
  height: 100%;
}

.eyes {
  transform-origin: 170px 190px;
  animation: blink 5600ms ease-in-out infinite;
}

.arm.right {
  transform-origin: 240px 270px;
}

.puppet.wave .arm.right {
  animation: wave 850ms ease-in-out infinite;
}

.puppet.nod .headGroup {
  transform-origin: 170px 170px;
  animation: nod 640ms ease-in-out infinite;
}

.puppet.shake .headGroup {
  transform-origin: 170px 170px;
  animation: shake 560ms ease-in-out infinite;
}

.puppet.cheer {
  animation: cheer 720ms ease-in-out infinite;
}

.puppet.think {
  animation-duration: 2400ms;
}

@keyframes breathe {
  0% {
    transform: translateY(0) scale(0.66);
  }
  50% {
    transform: translateY(-6px) scale(0.67);
  }
  100% {
    transform: translateY(0) scale(0.66);
  }
}

@keyframes wave {
  0% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(-54deg);
  }
  100% {
    transform: rotate(-10deg);
  }
}

@keyframes nod {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
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
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes cheer {
  0% {
    transform: translateY(0) scale(0.66);
  }
  50% {
    transform: translateY(-12px) scale(0.67);
  }
  100% {
    transform: translateY(0) scale(0.66);
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
  .puppet {
    animation-name: breatheMobile;
  }
  @keyframes breatheMobile {
    0% {
      transform: translateY(0) scale(0.52);
    }
    50% {
      transform: translateY(-6px) scale(0.53);
    }
    100% {
      transform: translateY(0) scale(0.52);
    }
  }
}
</style>
