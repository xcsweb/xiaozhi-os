<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AvatarAction, AvatarExpression } from '../../lib/types'

const props = defineProps<{
  action: AvatarAction
  expression: AvatarExpression
  mouthOpen: number
}>()

const wrapRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let disposeFns: Array<() => void> = []

function exprColor(e: AvatarExpression) {
  if (e === 'happy') return 0xffa9d6
  if (e === 'sad') return 0x93cfff
  if (e === 'angry') return 0xff8e8e
  if (e === 'surprised') return 0xffd39a
  if (e === 'shy') return 0xffa4b4
  return 0xe8e8f1
}

const tint = computed(() => exprColor(props.expression))

onMounted(async () => {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return
  const wrapEl = wrap

  let THREE: any
  try {
    THREE = await import('three')
  } catch {
    return
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20)
  camera.position.set(0, 1.18, 3.2)
  camera.lookAt(0, 1.1, 0)

  const key = new THREE.DirectionalLight(0xffffff, 1.05)
  key.position.set(2, 3, 2)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xb7b8ff, 0.55)
  fill.position.set(-2, 1, 1)
  scene.add(fill)
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))

  const group = new THREE.Group()
  scene.add(group)

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf2f2fa, roughness: 0.55, metalness: 0.05 })
  const faceMat = new THREE.MeshStandardMaterial({ color: tint.value, roughness: 0.6, metalness: 0.05 })
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x3b2b5e, roughness: 0.7, metalness: 0.05 })
  const cloakMat = new THREE.MeshStandardMaterial({ color: 0x4b3a6d, roughness: 0.75, metalness: 0.05 })
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.05 })
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.35, metalness: 0.1 })
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x7a274b, roughness: 0.35, metalness: 0.05 })

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.52, 0.76, 8, 16), cloakMat)
  body.position.set(0, 0.72, 0)
  group.add(body)

  const headGroup = new THREE.Group()
  headGroup.position.set(0, 1.62, 0)
  group.add(headGroup)

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), hairMat)
  hair.scale.set(1.08, 1.1, 1.05)
  hair.position.set(0, 0.06, -0.02)
  headGroup.add(hair)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 18), skinMat)
  head.position.set(0, 0.02, 0.1)
  headGroup.add(head)

  const face = new THREE.Mesh(new THREE.SphereGeometry(0.47, 24, 18), faceMat)
  face.position.set(0, 0.02, 0.16)
  headGroup.add(face)

  const eyeL = new THREE.Group()
  eyeL.position.set(-0.16, 0.08, 0.55)
  const eyeR = new THREE.Group()
  eyeR.position.set(0.16, 0.08, 0.55)
  headGroup.add(eyeL, eyeR)

  const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), eyeWhiteMat)
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), eyeMat)
  pupil.position.set(0.02, -0.01, 0.08)
  eyeL.add(eyeWhite.clone(), pupil.clone())
  eyeR.add(eyeWhite.clone(), pupil.clone())

  const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.05, 4, 10), mouthMat)
  mouth.position.set(0, -0.16, 0.56)
  mouth.rotation.x = Math.PI * 0.5
  headGroup.add(mouth)

  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.35, 6, 12), cloakMat)
  armL.position.set(-0.58, 0.94, 0.04)
  armL.rotation.z = Math.PI * 0.08
  group.add(armL)
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.35, 6, 12), cloakMat)
  armR.position.set(0.58, 0.94, 0.04)
  armR.rotation.z = -Math.PI * 0.08
  group.add(armR)

  const ground = new THREE.Mesh(new THREE.CircleGeometry(0.8, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }))
  ground.rotation.x = -Math.PI * 0.5
  ground.position.set(0, 0.06, 0)
  group.add(ground)

  let raf = 0
  const tStart = performance.now()

  function resize() {
    const rect = wrapEl.getBoundingClientRect()
    const w = Math.max(1, rect.width)
    const h = Math.max(1, rect.height)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  resize()
  window.addEventListener('resize', resize)
  disposeFns.push(() => window.removeEventListener('resize', resize))

  function tick(now: number) {
    const tt = (now - tStart) / 1000
    group.position.y = Math.sin(tt * 2.1) * 0.03
    group.rotation.y = Math.sin(tt * 0.45) * 0.12

    const a = props.action
    if (a === 'wave') {
      armR.rotation.x = Math.sin(tt * 8) * 0.7
      armR.rotation.z = -0.2 - Math.sin(tt * 8) * 0.25
    } else {
      armR.rotation.x = 0
      armR.rotation.z = -Math.PI * 0.08
    }

    if (a === 'cheer') {
      armL.rotation.z = Math.PI * 0.35 + Math.sin(tt * 10) * 0.08
      armR.rotation.z = -Math.PI * 0.35 - Math.sin(tt * 10) * 0.08
      group.position.y += Math.max(0, Math.sin(tt * 8)) * 0.08
    } else {
      armL.rotation.z = Math.PI * 0.08
    }

    if (a === 'nod') {
      headGroup.rotation.x = Math.max(-0.4, Math.min(0.4, Math.sin(tt * 10) * 0.25))
    } else if (a === 'shakeHead') {
      headGroup.rotation.y = Math.max(-0.4, Math.min(0.4, Math.sin(tt * 10) * 0.25))
      headGroup.rotation.x = 0
    } else if (a === 'think') {
      headGroup.rotation.z = Math.sin(tt * 4) * 0.08
      headGroup.rotation.x = 0
      headGroup.rotation.y = 0
    } else {
      headGroup.rotation.set(0, 0, 0)
    }

    mouth.scale.y = 1 + Math.max(0, Math.min(1, props.mouthOpen)) * 2.1
    face.material.color.setHex(tint.value)

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)
  disposeFns.push(() => cancelAnimationFrame(raf))

  disposeFns.push(() => {
    renderer.dispose()
    for (const obj of [skinMat, faceMat, hairMat, cloakMat, eyeWhiteMat, eyeMat, mouthMat]) obj.dispose()
    ;(body.geometry as any).dispose()
    ;(hair.geometry as any).dispose()
    ;(head.geometry as any).dispose()
    ;(face.geometry as any).dispose()
    ;(mouth.geometry as any).dispose()
    ;(armL.geometry as any).dispose()
    ;(armR.geometry as any).dispose()
    ;(ground.geometry as any).dispose()
    ;(ground.material as any).dispose()
  })
})

onUnmounted(() => {
  for (const fn of disposeFns) fn()
  disposeFns = []
})
</script>

<template>
  <div ref="wrapRef" class="wrap">
    <canvas ref="canvasRef" class="canvas" />
    <div class="label">3D 预览（VRM-ready）</div>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
  width: 420px;
  height: 420px;
  pointer-events: none;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.label {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  backdrop-filter: blur(10px);
}
</style>
