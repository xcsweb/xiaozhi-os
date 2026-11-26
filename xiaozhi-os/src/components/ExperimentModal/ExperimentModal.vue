<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import AvatarPreview from './components/AvatarPreview.vue'
import type { AvatarSkin, SettingsState } from '../../lib/types'

defineEmits<{ (e: 'close'): void }>()
const store = useAppStore()

const active = ref<AvatarSkin>('pixel')

const skins: Array<{ id: AvatarSkin; title: string; desc: string; badge: string }> = [
  { id: 'pixel', title: '像素精灵', desc: '轻量、移动端稳定、动作可做得很丰富', badge: '推荐' },
  { id: 'puppet', title: '2D Puppet', desc: '类 Live2D 的参数驱动，精致且可控', badge: '实验' },
  { id: 'three', title: '3D Three', desc: '3D 风格预览，后续可接 VRM', badge: '实验' },
]

const current = computed(() => skins.find((s) => s.id === active.value) ?? skins[0])

function applySkin(skin: AvatarSkin) {
  const patch: Partial<SettingsState> = { avatarSkin: skin }
  if (skin === 'three') patch.avatarEngine = '3d'
  if (skin === 'puppet') patch.avatarEngine = '2d'
  if (skin === 'pixel' || skin === 'classic') patch.avatarEngine = 'static'
  store.patchSettings(patch)
}
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="header">
        <div class="title">实验室：数字人风格</div>
        <button class="closeBtn" type="button" @click="$emit('close')">关闭</button>
      </div>

      <div class="body">
        <div class="tabs">
          <button
            v-for="s in skins"
            :key="s.id"
            class="tab"
            type="button"
            :class="{ active: active === s.id }"
            @click="active = s.id"
          >
            <span class="tabTitle">{{ s.title }}</span>
            <span class="tabBadge">{{ s.badge }}</span>
          </button>
        </div>

        <div class="panel">
          <div class="panelLeft">
            <AvatarPreview :skin="active" />
          </div>
          <div class="panelRight">
            <div class="h1">{{ current.title }}</div>
            <div class="p">{{ current.desc }}</div>
            <div class="note">
              说明：这里展示的是“风格原型”，用于你快速选型。后续要接入真实 Live2D 模型或 VRM 模型时，会保持同一套动作/表情接口与 AI 控制协议。
            </div>
            <div class="actions">
              <button class="primaryBtn" type="button" @click="applySkin(active)">应用到主页</button>
              <button class="ghostBtn" type="button" @click="applySkin('classic')">恢复当前</button>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="footerText">
          当前选择：{{ store.settings.value.avatarSkin }}（主页） · 动作模式：{{
            store.settings.value.avatarControlMode === 'scene' ? '场景交互' : '动作库'
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  z-index: 30;
  padding: 14px;
}

.modal {
  width: min(980px, 100%);
  max-height: min(86vh, 920px);
  overflow: hidden;
  border-radius: 22px;
  background: rgba(20, 20, 26, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.title {
  font-weight: 900;
  letter-spacing: 0.2px;
}

.closeBtn {
  border: 0;
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 900;
}

.body {
  overflow: auto;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  align-items: center;
}

.tab.active {
  background: rgba(90, 80, 140, 0.42);
  border-color: rgba(90, 80, 140, 0.55);
}

.tabTitle {
  font-weight: 900;
}

.tabBadge {
  font-size: 12px;
  opacity: 0.9;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.panel {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 12px;
}

.panelLeft {
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.panelRight {
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 14px;
  display: grid;
  gap: 10px;
  align-content: start;
}

.h1 {
  font-weight: 900;
  font-size: 18px;
}

.p {
  font-size: 13px;
  line-height: 1.4;
  opacity: 0.92;
}

.note {
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.78;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.primaryBtn {
  border: 0;
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 900;
}

.ghostBtn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-weight: 900;
}

.footer {
  padding: 12px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footerText {
  font-size: 12px;
  opacity: 0.8;
}

@media (max-width: 860px) {
  .panel {
    grid-template-columns: 1fr;
  }
}
</style>
