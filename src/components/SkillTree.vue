<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[92] flex items-center justify-center bg-black/70 backdrop-blur-md px-4" @click.self="$emit('close')">
      <div class="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/[0.08] shadow-2xl"
        style="background: linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(10,15,26,0.99) 100%);">

        <button @click="$emit('close')" class="absolute top-4 right-4 z-10 btn-ghost p-2 text-gray-500 hover:text-white">✕</button>

        <!-- Header -->
        <div class="px-6 pt-6 pb-4">
          <h2 class="text-lg font-bold text-gray-200 flex items-center gap-2">{{ t('skills.title') }}</h2>
          <p class="text-[11px] text-gray-500 mt-1">{{ t('skills.desc') }}</p>
        </div>

        <div class="px-6 pb-8 space-y-6">
          <!-- Skills -->
          <section>
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('skills.levelTitle') }}
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="sk in store.skillList" :key="sk.key"
                class="glass-card p-4 relative overflow-hidden group hover:border-white/[0.12] transition-all">
                <!-- Level fill background -->
                <div class="absolute bottom-0 left-0 right-0 transition-all duration-700 opacity-[0.06]"
                  :style="{ height: (sk.level * 10) + '%', backgroundColor: sk.color }"></div>
                <div class="relative flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border"
                    :style="{ borderColor: sk.color + '40', backgroundColor: sk.color + '10' }">
                    {{ sk.icon }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-300">{{ sk.label }}</span>
                      <span class="text-xs font-bold font-mono" :style="{ color: sk.color }">
                        Lv.{{ sk.level }}
                      </span>
                    </div>
                    <!-- EXP bar -->
                    <div class="mt-1.5 h-2 bg-dark-800 rounded-full overflow-hidden border border-white/[0.04]">
                      <div class="h-full rounded-full transition-all duration-500 relative"
                        :style="{ width: (sk.level >= 10 ? 100 : (sk.exp / sk.maxExp) * 100) + '%', backgroundColor: sk.color }">
                        <div class="absolute inset-0 shimmer-bg"></div>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <span class="text-[9px] text-gray-600">{{ sk.level >= 10 ? 'MAX' : `${sk.exp}/${sk.maxExp} EXP` }}</span>
                      <div class="flex gap-0.5">
                        <div v-for="i in 10" :key="i" class="w-1 h-1.5 rounded-sm transition-all"
                          :class="i <= sk.level ? '' : 'bg-dark-800'"
                          :style="i <= sk.level ? { backgroundColor: sk.color } : {}"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Career Paths -->
          <section>
            <h3 class="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('skills.careerTitle') }}
            </h3>
            <div class="space-y-2">
              <div v-for="cp in careerPaths" :key="cp.id"
                class="glass-card p-3 flex items-center gap-3 transition-all"
                :class="cp.unlocked ? 'border-emerald-500/20 hover:border-emerald-500/30' : cp.current ? 'border-amber-500/20' : 'opacity-50'">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
                  :class="cp.unlocked ? 'bg-emerald-500/10 border-emerald-500/20' : cp.current ? 'bg-amber-500/10 border-amber-500/20' : 'bg-dark-800 border-white/[0.04]'">
                  {{ cp.icon }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-[13px] font-medium" :class="cp.unlocked ? 'text-emerald-300' : cp.current ? 'text-amber-300' : 'text-gray-600'">{{ cp.title }}</span>
                    <span v-if="cp.current" class="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20">{{ t('skills.current') }}</span>
                    <span v-else-if="cp.unlocked" class="text-[8px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{{ t('skills.unlocked') }}</span>
                    <span v-else class="text-[8px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-gray-600 border border-white/[0.04]">{{ t('skills.locked') }}</span>
                  </div>
                  <!-- Requirements -->
                  <div class="flex gap-1.5 mt-1 flex-wrap">
                    <span v-for="(lv, sk) in cp.req" :key="sk" class="text-[9px] px-1.5 py-0.5 rounded"
                      :class="store.skills[sk]?.level >= lv ? 'bg-emerald-500/10 text-emerald-400/80' : 'bg-rose-500/10 text-rose-400/80'">
                      {{ skillLabel(sk) }} ≥ Lv.{{ lv }}
                    </span>
                  </div>
                  <!-- Next path -->
                  <div v-if="cp.nextTitle" class="text-[9px] text-gray-600 mt-1">
                    {{ t('skills.nextStage') }} {{ cp.nextTitle }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Tips -->
          <div class="glass-card p-4 text-center">
            <p class="text-[11px] text-gray-500">{{ t('skills.tip') }}</p>
            <p class="text-[10px] text-gray-600 mt-1">{{ t('skills.tipDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { t } from '../i18n'

defineProps({ show: Boolean })
defineEmits(['close'])

const store = useGameStore()

function skillLabel(key) { return t('skills.' + key) || key }

const CAREER_ICONS = {
  programmer: '💻', senior_dev: '🖥️', tech_lead: '🏗️', cto: '👑',
  teacher: '🧑‍🏫', professor: '🎓', artist: '🎨', famous_artist: '🌟',
  entrepreneur: '🚀', ceo: '🏢', athlete: '⚽', champion: '🏆',
  doctor: '🩺', chief_doctor: '🏥', writer: '✍️', bestseller: '📖',
}
const CAREER_REQS = {
  programmer: { req: { technology: 3, academic: 2 }, next: 'senior_dev' },
  senior_dev: { req: { technology: 5, communication: 2 }, next: 'tech_lead' },
  tech_lead: { req: { technology: 7, business: 3, communication: 4 }, next: 'cto' },
  cto: { req: { technology: 9, business: 5, communication: 5 } },
  teacher: { req: { academic: 3, communication: 3 }, next: 'professor' },
  professor: { req: { academic: 7, communication: 4 } },
  artist: { req: { creativity: 4 }, next: 'famous_artist' },
  famous_artist: { req: { creativity: 7, communication: 3 } },
  entrepreneur: { req: { business: 4, communication: 3 }, next: 'ceo' },
  ceo: { req: { business: 7, communication: 5, technology: 3 } },
  athlete: { req: { fitness: 5 }, next: 'champion' },
  champion: { req: { fitness: 8, communication: 3 } },
  doctor: { req: { academic: 5, communication: 2 }, next: 'chief_doctor' },
  chief_doctor: { req: { academic: 8, communication: 4 } },
  writer: { req: { creativity: 4, academic: 3 }, next: 'bestseller' },
  bestseller: { req: { creativity: 7, communication: 5 } },
}
function careerTitle(id) { return t('skills.careers.' + id) || id }

const careerPaths = computed(() => {
  return Object.entries(CAREER_REQS).map(([id, cp]) => {
    const title = careerTitle(id)
    const icon = CAREER_ICONS[id]
    const unlocked = Object.entries(cp.req).every(([sk, lv]) => store.skills[sk]?.level >= lv)
    const current = store.career && store.career.includes(title)
    const nextTitle = cp.next ? careerTitle(cp.next) : null
    return { id, title, icon, req: cp.req, unlocked, current, nextTitle }
  })
})
</script>
