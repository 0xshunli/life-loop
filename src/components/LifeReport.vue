<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-lg px-4" @click.self="$emit('close')">
      <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.08] shadow-2xl"
        style="background: linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(10,15,26,0.99) 100%);">

        <!-- Close -->
        <button @click="$emit('close')" class="absolute top-4 right-4 z-10 btn-ghost p-2 text-gray-500 hover:text-white">✕</button>

        <!-- Header -->
        <div class="relative overflow-hidden rounded-t-3xl">
          <div class="h-48 flex flex-col items-center justify-center text-center relative"
            :style="{ background: headerBg }">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(15,23,42,0.95)]"></div>
            <div class="relative z-10">
              <div class="text-6xl mb-3 drop-shadow-lg">{{ store.ageAvatar }}</div>
              <h2 class="text-2xl font-bold text-white/90">{{ store.character.name }}{{ t('report.life') }}</h2>
              <p class="text-sm text-white/50 mt-1">{{ store.world.settingLabel }} · {{ store.age }}岁 · {{ store.totalMonths }}个月</p>
            </div>
          </div>
        </div>

        <div class="px-6 pb-8 space-y-6 -mt-4 relative">
          <!-- Score ring -->
          <div class="flex justify-center -mt-2">
            <div class="relative w-28 h-28">
              <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8" />
                <circle cx="60" cy="60" r="52" fill="none" :stroke="scoreColor" stroke-width="8"
                  stroke-linecap="round" :stroke-dasharray="`${store.lifeScore * 3.27} 327`"
                  class="transition-all duration-1000" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black font-mono" :style="{ color: scoreColor }">{{ store.lifeScore }}</span>
                <span class="text-[9px] text-gray-500 uppercase tracking-wider">{{ t('report.lifeScore') }}</span>
              </div>
            </div>
          </div>

          <!-- Quick stats -->
          <div class="grid grid-cols-4 gap-2">
            <div v-for="s in quickStats" :key="s.label" class="glass-card p-3 text-center">
              <div class="text-lg mb-0.5">{{ s.icon }}</div>
              <div class="text-lg font-bold font-mono" :style="{ color: s.color }">{{ s.value }}</div>
              <div class="text-[8px] text-gray-600 uppercase tracking-wider">{{ s.label }}</div>
            </div>
          </div>

          <!-- Attribute final -->
          <section>
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.finalAttrs') }}
            </h3>
            <div class="grid grid-cols-3 gap-3">
              <div v-for="a in store.attributeList" :key="a.key"
                class="glass-card p-3 text-center relative overflow-hidden">
                <div class="absolute bottom-0 left-0 right-0 transition-all duration-700"
                  :style="{ height: a.value + '%', background: `linear-gradient(to top, ${a.color}15, transparent)` }"></div>
                <div class="relative">
                  <div class="text-xl mb-1">{{ a.icon }}</div>
                  <div class="text-xs text-gray-500 mb-0.5">{{ a.label }}</div>
                  <div class="text-xl font-bold font-mono" :style="{ color: a.color }">{{ a.value }}</div>
                </div>
                <!-- Mini trend -->
                <svg class="w-full h-6 mt-1 opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polyline :points="trendLine(a.key)" fill="none" :stroke="a.color" stroke-width="3" stroke-linecap="round" />
                </svg>
              </div>
            </div>
          </section>

          <!-- Life journey -->
          <section v-if="keyMoments.length">
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.lifeJourney') }}
            </h3>
            <div class="relative pl-6 border-l border-white/[0.06] space-y-3">
              <div v-for="(m, i) in keyMoments" :key="i" class="relative">
                <div class="absolute -left-[calc(1.5rem+4px)] top-1 w-2.5 h-2.5 rounded-full border-2"
                  :style="{ borderColor: m.color, backgroundColor: i === 0 ? m.color : 'transparent' }"></div>
                <div class="glass-card p-3">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm">{{ m.icon }}</span>
                    <span class="text-[11px] font-medium text-gray-300">{{ m.title }}</span>
                    <span class="text-[9px] text-gray-600 ml-auto font-mono">{{ m.age }}岁</span>
                  </div>
                  <p class="text-[10px] text-gray-500 line-clamp-2">{{ m.text }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Milestones -->
          <section v-if="store.milestones.length">
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.milestonesLabel') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <div v-for="(m, i) in store.milestones" :key="i"
                class="px-3 py-2 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 flex items-center gap-2">
                <span class="text-lg">{{ m.icon }}</span>
                <div>
                  <p class="text-[11px] font-medium text-amber-300/80">{{ m.title }}</p>
                  <p class="text-[8px] text-gray-600">{{ m.age }}岁 · {{ m.description }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Relationships -->
          <section v-if="store.relationships.length">
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.peopleMet') }}
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="r in store.relationships.slice(0, 8)" :key="r.name" class="glass-card p-2.5 flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base border"
                  :class="r.affection >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' : r.affection >= 40 ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-rose-500/10 border-rose-500/20'">
                  {{ relEmoji(r) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-medium text-gray-300 truncate">{{ r.name }}</p>
                  <p class="text-[9px] text-gray-600">{{ r.relation }}
                    <span v-if="r.affection" class="ml-1" :class="r.affection >= 70 ? 'text-emerald-500/60' : r.affection < 40 ? 'text-rose-500/60' : 'text-gray-600'">♥{{ r.affection }}</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Family -->
          <section v-if="store.family.spouse || store.family.children.length">
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.familyLabel') }}
            </h3>
            <div class="glass-card p-4 space-y-2">
              <div v-if="store.family.spouse" class="flex items-center gap-2">
                <span class="text-xl">💑</span>
                <span class="text-sm text-rose-300/70">{{ store.family.spouse }}</span>
                <span class="text-[9px] text-gray-600">{{ t('game.spouse') }}</span>
              </div>
              <div v-for="c in store.family.children" :key="c.name" class="flex items-center gap-2">
                <span class="text-xl">{{ c.gender === '女' ? '👧' : '👦' }}</span>
                <span class="text-sm text-amber-300/70">{{ c.name }}</span>
                <span class="text-[9px] text-gray-600">{{ c.age }}岁 · {{ c.gender }}</span>
                <div v-if="c.inheritedTraits" class="flex gap-1 ml-auto">
                  <span v-for="t in c.inheritedTraits.slice(0,2)" :key="t"
                    class="text-[8px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400/50">{{ t }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- AI Life Review -->
          <section>
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.aiReview') }}
            </h3>
            <div class="glass-card p-5 relative overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-purple-500/30"></div>
              <div v-if="isLoadingReview" class="flex items-center gap-3 py-4">
                <div class="w-5 h-5 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
                <span class="text-sm text-gray-500 animate-pulse">{{ t('report.aiLoading') }}</span>
              </div>
              <p v-else-if="aiReview" class="text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap">{{ aiReview }}</p>
              <p v-else class="text-[12px] text-gray-600 italic">{{ t('report.aiFail') }}</p>
            </div>
          </section>

          <!-- Skills Final -->
          <section v-if="store.skillList.some(s => s.level > 0)">
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.finalSkills') }}
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="sk in store.skillList" :key="sk.key" class="glass-card p-3 text-center">
                <div class="text-xl mb-1">{{ sk.icon }}</div>
                <div class="text-[10px] text-gray-500">{{ sk.label }}</div>
                <div class="text-lg font-bold font-mono" :style="{ color: sk.color }">Lv.{{ sk.level }}</div>
              </div>
            </div>
          </section>

          <!-- Assets -->
          <section v-if="store.assets.length">
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.finalAssets') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <div v-for="a in store.assets" :key="a.id" class="px-3 py-2 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 flex items-center gap-2">
                <span class="text-lg">{{ a.icon }}</span>
                <div>
                  <p class="text-[11px] font-medium text-amber-300/80">{{ a.name }}</p>
                  <p class="text-[8px] text-gray-600">价值 {{ a.value }} · {{ a.acquiredAge }}岁获得</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Relationship Network Graph -->
          <section v-if="store.relationships.length > 1">
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.relGraph') }}
            </h3>
            <div class="glass-card p-4 overflow-hidden">
              <svg viewBox="0 0 400 300" class="w-full h-48">
                <!-- Links -->
                <line v-for="(link, li) in networkLinks" :key="'l'+li"
                  :x1="link.x1" :y1="link.y1" :x2="link.x2" :y2="link.y2"
                  :stroke="link.color" stroke-width="1" stroke-opacity="0.3" />
                <!-- Player node -->
                <circle cx="200" cy="150" r="20" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" stroke-width="2" />
                <text x="200" y="155" text-anchor="middle" fill="rgba(16,185,129,0.8)" font-size="10" font-weight="bold">{{ store.character.name?.slice(0, 2) || '我' }}</text>
                <!-- NPC nodes -->
                <g v-for="(node, ni) in networkNodes" :key="'n'+ni">
                  <circle :cx="node.x" :cy="node.y" r="14" :fill="node.fill" :stroke="node.stroke" stroke-width="1.5" />
                  <text :x="node.x" :y="node.y + 3" text-anchor="middle" :fill="node.textColor" font-size="7">{{ node.label }}</text>
                </g>
              </svg>
              <p class="text-[9px] text-gray-600 text-center mt-1">{{ t('report.relGraphDesc') }}</p>
            </div>
          </section>

          <!-- Mood journey -->
          <section v-if="moodSummary.length">
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('report.moodPortrait') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <div v-for="m in moodSummary" :key="m.mood"
                class="px-3 py-1.5 rounded-xl border text-[11px]"
                :class="m.positive ? 'bg-emerald-500/[0.06] border-emerald-500/10 text-emerald-400/70' : m.negative ? 'bg-rose-500/[0.06] border-rose-500/10 text-rose-400/70' : 'bg-white/[0.03] border-white/[0.06] text-gray-500'">
                {{ m.mood }} × {{ m.count }}
              </div>
            </div>
          </section>

          <!-- Actions -->
          <div class="flex items-center justify-center gap-3 pt-4 flex-wrap">
            <button @click="exportText" class="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2">{{ t('report.exportText') }}</button>
            <button @click="$emit('share')" class="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 text-[#1d9bf0] hover:bg-[#1d9bf0]/20 transition-all flex items-center gap-2">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              {{ t('nav.share') }}
            </button>
            <button @click="$emit('close')" class="btn-ghost px-5 py-2.5 text-sm text-gray-500">{{ t('nav.close') }}</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { t } from '../i18n'

const props = defineProps({ show: Boolean })
defineEmits(['close', 'share'])

const store = useGameStore()
const aiReview = ref('')
const isLoadingReview = ref(false)

// Generate AI review when report opens
watch(() => props.show, async (v) => {
  if (v && !aiReview.value && store.isGameOver) {
    isLoadingReview.value = true
    try {
      aiReview.value = await store.generateLifeReview()
    } catch { aiReview.value = '' }
    isLoadingReview.value = false
  }
})

const scoreColor = computed(() => {
  const s = store.lifeScore
  if (s >= 75) return '#10b981'
  if (s >= 50) return '#f59e0b'
  if (s >= 25) return '#f97316'
  return '#ef4444'
})

const headerBg = computed(() => {
  const worldGradients = {
    modern:  'linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 50%, #1e40af 100%)',
    ancient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #92400e 100%)',
    fantasy: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 50%, #6d28d9 100%)',
    scifi:   'linear-gradient(135deg, #064e3b 0%, #06b6d4 50%, #0e7490 100%)',
  }
  return worldGradients[store.world.setting] || worldGradients.modern
})

const quickStats = computed(() => [
  { icon: '📅', label: t('report.quickStats.months'), value: store.totalMonths, color: '#60a5fa' },
  { icon: '🏆', label: t('report.quickStats.milestones'), value: store.milestones.length, color: '#fbbf24' },
  { icon: '👥', label: t('report.quickStats.people'), value: store.relationships.length, color: '#f472b6' },
  { icon: '✋', label: t('report.quickStats.choices'), value: store.lifeStats.totalChoices, color: '#34d399' },
])

const keyMoments = computed(() => {
  const sceneColors = { work: '#3b82f6', love: '#f43f5e', study: '#818cf8', adventure: '#f59e0b', family: '#10b981', health: '#ef4444', social: '#f97316', crisis: '#dc2626', leisure: '#a78bfa', milestone: '#eab308' }
  const sceneIcons = { work: '💼', love: '💕', study: '📚', adventure: '⚔️', family: '🏠', health: '🏥', social: '🎉', crisis: '⚡', leisure: '☕', milestone: '🏆' }
  // Pick important timeline entries
  const important = store.timeline
    .filter((e, i) => i === 0 || i === store.timeline.length - 1 || store.milestones.some(m => m.age === e.age) || (e.choice && e.choice.length > 5))
    .slice(0, 12)
  return important.map(e => ({
    title: e.title, age: e.age,
    text: e.narrative?.substring(0, 120) || '',
    icon: sceneIcons[e.sceneType] || '📖',
    color: sceneColors[e.sceneType] || '#6b7280',
  }))
})

const moodSummary = computed(() => {
  const freq = {}
  const posKeys = ['开心', '幸福', '兴奋', '满足', '期待', '喜悦', '愉悦', '自信', '感动', '温暖']
  const negKeys = ['悲伤', '沮丧', '愤怒', '焦虑', '恐惧', '绝望', '孤独', '疲惫', '迷茫']
  store.moodHistory.forEach(m => { freq[m.mood] = (freq[m.mood] || 0) + 1 })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([mood, count]) => ({
      mood, count,
      positive: posKeys.some(k => mood.includes(k)),
      negative: negKeys.some(k => mood.includes(k)),
    }))
})

// Relationship network graph
const networkNodes = computed(() => {
  const rels = store.relationships.slice(0, 12)
  const count = rels.length
  return rels.map((r, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    const radius = 90 + (i % 2) * 20
    const x = 200 + Math.cos(angle) * radius
    const y = 150 + Math.sin(angle) * radius
    const aff = r.affection ?? 50
    const fill = aff >= 70 ? 'rgba(16,185,129,0.12)' : aff < 40 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)'
    const stroke = aff >= 70 ? 'rgba(16,185,129,0.4)' : aff < 40 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.15)'
    const textColor = aff >= 70 ? 'rgba(16,185,129,0.8)' : aff < 40 ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.5)'
    return { x, y, fill, stroke, textColor, label: r.name?.slice(0, 2) || '?' }
  })
})

const networkLinks = computed(() => {
  return networkNodes.value.map(node => ({
    x1: 200, y1: 150, x2: node.x, y2: node.y,
    color: node.stroke,
  }))
})

function trendLine(key) {
  const data = store.sparklineData(key, 20)
  if (data.length < 2) return '0,50 100,50'
  const max = Math.max(...data, 1), min = Math.min(...data, 0), range = max - min || 1
  return data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ')
}

function relEmoji(rel) {
  const r = (rel.relation || '').toLowerCase()
  if (r.includes('恋') || r.includes('爱') || r.includes('妻') || r.includes('夫')) return '💑'
  if (r.includes('父') || r.includes('爸')) return '👨‍🦳'
  if (r.includes('母') || r.includes('妈')) return '👩‍🦳'
  if (r.includes('朋友') || r.includes('好友')) return '😊'
  if (r.includes('同事') || r.includes('同学')) return '🤝'
  return '👤'
}

function exportText() {
  let text = `═══ ${store.character.name} 的人生报告 ═══\n\n`
  text += `世界: ${store.world.settingLabel}\n`
  text += `年龄: ${store.age}岁 (${store.totalMonths}个月)\n`
  text += `人生评分: ${store.lifeScore}/100\n\n`
  text += `── 属性 ──\n`
  store.attributeList.forEach(a => { text += `${a.icon} ${a.label}: ${a.value}\n` })
  if (store.milestones.length) {
    text += `\n── 里程碑 ──\n`
    store.milestones.forEach(m => { text += `${m.icon} ${m.title} (${m.age}岁) - ${m.description}\n` })
  }
  if (store.relationships.length) {
    text += `\n── 人物关系 ──\n`
    store.relationships.forEach(r => { text += `${r.name} - ${r.relation} (好感度:${r.affection})\n` })
  }
  if (store.family.spouse) text += `\n配偶: ${store.family.spouse}\n`
  if (store.family.children.length) {
    text += `子女: ${store.family.children.map(c => `${c.name}(${c.age}岁)`).join(', ')}\n`
  }
  text += `\n── 故事节选 ──\n`
  store.timeline.filter((_, i) => i === 0 || i === store.timeline.length - 1).forEach(e => {
    text += `\n[${e.age}岁] ${e.title}\n${e.narrative}\n`
  })
  text += `\n═══ 人生进程 · AI 驱动的模拟人生 ═══`

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${store.character.name}的人生报告.txt`
  a.click(); URL.revokeObjectURL(url)
}
</script>
