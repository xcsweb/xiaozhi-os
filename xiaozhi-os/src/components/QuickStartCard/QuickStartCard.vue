<script setup lang="ts">
import { useAppStore } from '../../stores/useAppStore'

defineEmits<{ (e: 'close'): void }>()
const store = useAppStore()

function sample(text: string) {
  store.addMessage({ role: 'user', content: text, status: 'final' })
  store.addMessage({ role: 'assistant', content: '已帮你把示例问题填进对话里。你也可以直接输入自己的问题。', status: 'final' })
}
</script>

<template>
  <div class="card">
    <div class="titleRow">
      <div class="title">快速开始</div>
      <button class="closeBtn" type="button" @click="$emit('close')">关闭</button>
    </div>
    <div class="desc">当前处于 Mock 模式（未配置 API）。你可以先体验对话、播报、动作与浮窗。</div>

    <div class="samples">
      <button class="sampleBtn" type="button" @click="sample('你好，挥手')">“你好，挥手”</button>
      <button class="sampleBtn" type="button" @click="sample('我们来练英语')">“我们来练英语”</button>
      <button class="sampleBtn" type="button" @click="sample('反PUA演练')">“反PUA演练”</button>
    </div>

    <div class="footer">
      <button class="primaryBtn" type="button" @click="store.openSettings">去设置</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: min(420px, 74vw);
  padding: 14px 14px 12px 14px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.titleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.title {
  font-weight: 800;
  letter-spacing: 0.2px;
}

.closeBtn {
  border: 0;
  border-radius: 12px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.9);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
}

.desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.35;
  opacity: 0.92;
}

.samples {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sampleBtn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
}

.footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.primaryBtn {
  border: 0;
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(20, 20, 22, 0.92);
  cursor: pointer;
  font-weight: 800;
}
</style>

