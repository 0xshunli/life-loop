<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" @click.self="$emit('close')">
      <div class="glass-card p-6 max-w-lg w-full shadow-2xl border border-white/[0.08] max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-200 flex items-center gap-2">📊 人生总览</h3>
          <button @click="$emit('close')" class="btn-ghost p-1 text-gray-500 text-sm">✕</button>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div class="text-2xl font-bold font-mono text-emerald-400">{{ store.age }}</div>
            <div class="text-[9px] text-dark-500 uppercase tracking-wider mt-0.5">年龄</div>
          </div>
          <div class="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div class="text-2xl font-bold font-mono text-blue-400">{{ store.totalMonths }}</div>
            <div class="text-[9px] text-dark-500 uppercase tracking-wider mt-0.5">经历月份</div>
          </div>
          <div class="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div class="text-2xl font-bold font-mono text-amber-400">{{ store.lifeScore }}</div>
            <div class="text-[9px] text-dark-500 uppercase tracking-wider mt-0.5">综合评分</div>
          </div>
          <div class="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div class="text-2xl font-bold font-mono text-purple-400">{{ store.milestones.length }}</div>
            <div class="text-[9px] text-dark-500 uppercase tracking-wider mt-0.5">里程碑</div>
          </div>
          <div class="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div class="text-2xl font-bold font-mono text-rose-400">{{ store.relationships.length }}</div>
            <div class="text-[9px] text-dark-500 uppercase tracking-wider mt-0.5">人际关系</div>
          </div>
          <div class="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div class="text-2xl font-bold font-mono text-cyan-400">{{ store.lifeStats.totalChoices }}</div>
            <div class="text-[9px] text-dark-500 uppercase tracking-wider mt-0.5">抉择次数</div>
          </div>
        </div>

        <!-- Attribute Trend Charts -->
        <section class="mb-6">
          <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">📈 属性趋势</p>
          <div class="space-y-3">
            <div v-for="attr in store.attributeList" :key="attr.key" class="group">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[11px] text-gray-500">{{ attr.icon }} {{ attr.label }}</span>
                <span class="text-[10px] font-mono font-bold" :style="{ color: attr.color }">{{ attr.value }}</span>
              </div>
              <!-- Sparkline -->
              <div class="h-8 bg-white/[0.02] rounded-lg border border-white/[0.03] overflow-hidden relative">
                <svg class="w-full h-full" preserveAspectRatio="none">
                  <polyline
                    :points="sparklinePoints(attr.key)"
                    fill="none"
                    :stroke="attr.color"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    vector-effect="non-scaling-stroke"
                  />
                  <polyline
                    :points="sparklineAreaPoints(attr.key)"
                    :fill="`${attr.color}10`"
                    stroke="none"
                  />
                </svg>
                <!-- Min/Max labels -->
                <div class="absolute top-0.5 left-1 text-[7px] text-dark-600 font-mono">{{ sparklineMax(attr.key) }}</div>
                <div class="absolute bottom-0.5 left-1 text-[7px] text-dark-600 font-mono">{{ sparklineMin(attr.key) }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Life Events Distribution -->
        <section class="mb-6">
          <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">⚖️ 事件分布</p>
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <div class="h-3 bg-dark-800 rounded-full overflow-hidden flex">
                <div class="h-full bg-emerald-500 transition-all duration-500" :style="{ width: positiveRatio + '%' }"></div>
                <div class="h-full bg-rose-500 transition-all duration-500" :style="{ width: negativeRatio + '%' }"></div>
              </div>
            </div>
            <div class="text-[10px] text-gray-500 shrink-0 w-20 text-right">
              <span class="text-emerald-400">{{ store.lifeStats.positiveEvents }}</span>
              <span class="text-dark-600 mx-1">/</span>
              <span class="text-rose-400">{{ store.lifeStats.negativeEvents }}</span>
            </div>
          </div>
          <div class="flex justify-between text-[9px] text-dark-600 mt-1">
            <span>😊 积极事件</span>
            <span>😢 消极事件</span>
          </div>
        </section>

        <!-- Mood History -->
        <section class="mb-6">
          <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">🎭 情绪轨迹</p>
          <div class="flex flex-wrap gap-1">
            <span v-for="(m, i) in recentMoods" :key="i"
              class="px-1.5 py-0.5 rounded text-[9px] border"
              :class="moodClass(m.mood)">
              {{ m.mood }}
            </span>
          </div>
          <p class="text-[10px] text-dark-500 mt-2">主导情绪：<span class="text-gray-400">{{ store.dominantMood }}</span></p>
        </section>

        <!-- Key Milestones -->
        <section v-if="store.milestones.length" class="mb-4">
          <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">🏆 成就</p>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="(m, i) in store.milestones" :key="i"
              class="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/[0.03] border border-amber-500/10">
              <span class="text-xl shrink-0">{{ m.icon }}</span>
              <div class="min-w-0">
                <p class="text-[11px] font-medium text-amber-300/80 truncate">{{ m.title }}</p>
                <p class="text-[9px] text-dark-500">{{ m.age }}岁</p>
              </div>
            </div>
          </div>
        </section>

        <button @click="$emit('close')" class="btn-secondary w-full text-sm py-2.5 mt-2">关闭</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

defineProps({ show: Boolean })
defineEmits(['close'])

const store = useGameStore()

const positiveRatio = computed(() => {
  const t = store.lifeStats.positiveEvents + store.lifeStats.negativeEvents
  return t > 0 ? Math.round((store.lifeStats.positiveEvents / t) * 100) : 50
})
const negativeRatio = computed(() => 100 - positiveRatio.value)

const recentMoods = computed(() => store.moodHistory.slice(-30))

function moodClass(mood) {
  const pos = ['开心','幸福','兴奋','满足','期待','喜悦','愉悦','自信','感动','温暖']
  const neg = ['悲伤','沮丧','愤怒','焦虑','恐惧','绝望','孤独','疲惫','迷茫','不安']
  if (pos.some(k => mood.includes(k))) return 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400/70'
  if (neg.some(k => mood.includes(k))) return 'bg-rose-500/10 border-rose-500/15 text-rose-400/70'
  return 'bg-white/[0.03] border-white/[0.05] text-gray-500'
}

function sparklinePoints(key) {
  const data = store.sparklineData(key, 30)
  if (data.length < 2) return '0,16 100,16'
  const maxV = Math.max(...data, 1)
  const minV = Math.min(...data, 0)
  const range = maxV - minV || 1
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((v - minV) / range) * 100
    return `${x}%,${y}%`
  }).join(' ')
}

function sparklineAreaPoints(key) {
  const data = store.sparklineData(key, 30)
  if (data.length < 2) return ''
  const maxV = Math.max(...data, 1)
  const minV = Math.min(...data, 0)
  const range = maxV - minV || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((v - minV) / range) * 100
    return `${x}%,${y}%`
  })
  return `0%,100% ${points.join(' ')} 100%,100%`
}

function sparklineMax(key) {
  const data = store.sparklineData(key, 30)
  return data.length ? Math.max(...data) : 0
}
function sparklineMin(key) {
  const data = store.sparklineData(key, 30)
  return data.length ? Math.min(...data) : 0
}
</script>
