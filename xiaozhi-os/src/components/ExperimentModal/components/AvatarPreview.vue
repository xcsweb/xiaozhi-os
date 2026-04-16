<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AvatarAction, AvatarExpression, AvatarSkin } from '../../../lib/types'
import PixelAvatar from '../../avatars/PixelAvatar.vue'
import PuppetAvatar from '../../avatars/PuppetAvatar.vue'
import ThreeAvatar from '../../avatars/ThreeAvatar.vue'

const props = defineProps<{ skin: AvatarSkin }>()

const action = ref<AvatarAction>('idle')
const expression = ref<AvatarExpression>('neutral')
const mouthOpen = ref(0)

const actions: Array<{ id: AvatarAction; label: string }> = [
  { id: 'idle', label: '待机' },
  { id: 'wave', label: '挥手' },
  { id: 'nod', label: '点头' },
  { id: 'shakeHead', label: '摇头' },
  { id: 'think', label: '思考' },
  { id: 'cheer', label: '加油' },
]

const expressions: Array<{ id: AvatarExpression; label: string }> = [
  { id: 'neutral', label: '平静' },
  { id: 'happy', label: '开心' },
  { id: 'sad', label: '难过' },
  { id: 'angry', label: '生气' },
  { id: 'surprised', label: '惊讶' },
  { id: 'shy', label: '害羞' },
]

let mouthTimer: number | null = null
function toggleTalk() {
  if (mouthTimer) {
    window.clearInterval(mouthTimer)
    mouthTimer = null
    mouthOpen.value = 0
    return
  }
  mouthTimer = window.setInterval(() => {
    mouthOpen.value = mouthOpen.value > 0.2 ? 0 : 1
  }, 140)
}

const wrapperClass = computed(() => `skin-${props.skin}`)
</script>

<template>
  <div class="wrap" :class="wrapperClass">
    <div class="stage">
      <div class="bg" />
      <PixelAvatar v-if="skin === 'pixel'" :action="action" :expression="expression" :mouthOpen="mouthOpen" />
      <PuppetAvatar v-else-if="skin === 'puppet'" :action="action" :expression="expression" :mouthOpen="mouthOpen" />
      <ThreeAvatar v-else-if="skin === 'three'" :action="action" :expression="expression" :mouthOpen="mouthOpen" />
      <div v-else class="placeholder">请选择一个风格</div>
    </div>

    <div class="controls">
      <div class="row">
        <select v-model="action" class="sel">
          <option v-for="a in actions" :key="a.id" :value="a.id">{{ a.label }}</option>
        </select>
        <select v-model="expression" class="sel">
          <option v-for="e in expressions" :key="e.id" :value="e.id">{{ e.label }}</option>
        </select>
      </div>
      <div class="row">
        <button class="btn" type="button" @click="toggleTalk">口型</button>
      </div>
      <div class="hint">提示：像素/2D/3D 都走同一套动作与表情命名，方便以后用 AI Skill 控制</div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
}

.stage {
  position: relative;
  min-height: 320px;
}

.bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(900px 520px at 30% 70%, rgba(255, 255, 255, 0.12), rgba(0, 0, 0, 0) 60%),
    radial-gradient(640px 420px at 70% 32%, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0) 55%);
}

.controls {
  padding: 12px;
  display: grid;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.25);
}

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sel {
  flex: 1;
  min-width: 140px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.92);
}

.btn {
  border: 0;
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 900;
}

.hint {
  font-size: 12px;
  opacity: 0.78;
  line-height: 1.35;
}

.placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 0.6;
}
</style>

