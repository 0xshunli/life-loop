<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[92] flex items-center justify-center bg-black/70 backdrop-blur-md px-4" @click.self="$emit('close')">
      <div class="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/[0.08] shadow-2xl"
        style="background: linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(10,15,26,0.99) 100%);">

        <button @click="$emit('close')" class="absolute top-4 right-4 z-10 btn-ghost p-2 text-gray-500 hover:text-white">✕</button>

        <!-- Header -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-gray-200 flex items-center gap-2">{{ t('achievements.title') }}</h2>
            <span class="text-xs px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
              {{ store.achievementProgress.unlocked }}/{{ store.achievementProgress.total }}
            </span>
          </div>
          <p class="text-[11px] text-gray-500 mt-1">{{ t('achievements.desc') }}</p>

          <!-- Progress bar -->
          <div class="mt-3 h-2 bg-dark-800 rounded-full overflow-hidden border border-white/[0.04]">
            <div class="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-500 to-yellow-400"
              :style="{ width: (store.achievementProgress.unlocked / store.achievementProgress.total * 100) + '%' }"></div>
          </div>
        </div>

        <div class="px-6 pb-8 space-y-5">
          <!-- Categories -->
          <div class="flex gap-2 flex-wrap">
            <button v-for="cat in categories" :key="cat.id"
              class="px-3 py-1.5 rounded-lg text-[11px] border transition-all"
              :class="selectedCat === cat.id ? 'bg-white/[0.08] border-white/[0.15] text-gray-200' : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:bg-white/[0.04]'"
              @click="selectedCat = cat.id">
              {{ cat.icon }} {{ cat.label }}
            </button>
          </div>

          <!-- Achievements Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="a in filteredAchievements" :key="a.id"
              class="glass-card p-4 flex items-center gap-3 transition-all"
              :class="a.unlocked ? 'border-amber-500/15 hover:border-amber-500/25' : 'opacity-40 hover:opacity-60'">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0"
                :class="a.unlocked ? 'bg-amber-500/10 border-amber-500/20' : 'bg-dark-800 border-white/[0.04]'">
                <span :class="a.unlocked ? '' : 'grayscale'">{{ a.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[13px] font-medium truncate" :class="a.unlocked ? 'text-amber-300' : 'text-gray-600'">{{ a.title }}</span>
                  <span v-if="a.unlocked" class="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">✓</span>
                </div>
                <p class="text-[10px] mt-0.5" :class="a.unlocked ? 'text-gray-500' : 'text-gray-700'">{{ a.desc }}</p>
                <p v-if="a.unlocked && a.unlockedAt" class="text-[8px] text-gray-700 mt-0.5">
                  🕐 {{ new Date(a.unlockedAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredAchievements.length === 0" class="text-center py-8">
            <div class="text-3xl mb-2 opacity-30">🏅</div>
            <p class="text-sm text-gray-600">{{ t('achievements.noCat') }}</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { t } from '../i18n'

defineProps({ show: Boolean })
defineEmits(['close'])

const store = useGameStore()
const selectedCat = ref('all')

const catKeys = ['all', 'explore', 'life', 'relation', 'attr', 'career', 'skill', 'asset']
const categories = computed(() => catKeys.map(id => {
  const raw = t('achievements.cats.' + id)
  return { id, label: raw.replace(/^[^\s]+\s/, ''), icon: raw.split(' ')[0] }
}))

const filteredAchievements = computed(() => {
  const list = store.achievementList
  if (selectedCat.value === 'all') return list
  return list.filter(a => a.cat === selectedCat.value)
})
</script>
