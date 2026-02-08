<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" @click.self="$emit('close')">
      <div class="glass-card p-6 max-w-md w-full shadow-2xl border border-white/[0.08] max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-200 flex items-center gap-2">{{ t('settings.title') }}</h3>
          <button @click="$emit('close')" class="btn-ghost p-1 text-gray-500 text-sm">✕</button>
        </div>

        <!-- Game Settings -->
        <section class="mb-6">
          <p class="text-[10px] text-dark-500 uppercase tracking-[0.2em] mb-3">{{ t('settings.gameTitle') }}</p>
          <div class="space-y-4">
            <div>
              <label class="text-[11px] text-gray-500 mb-1.5 block">{{ t('settings.textSpeed') }}</label>
              <div class="flex items-center gap-3">
                <input type="range" v-model.number="textSpeed" min="10" max="80" step="5" class="flex-1 accent-emerald-500" />
                <span class="text-[11px] text-gray-400 font-mono w-14 text-right">{{ textSpeed }}ms</span>
              </div>
              <div class="flex justify-between text-[9px] text-dark-600 mt-1">
                <span>{{ t('settings.fast') }}</span><span>{{ t('settings.slow') }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-[11px] text-gray-500 block">{{ t('settings.typewriter') }}</label>
                <p class="text-[9px] text-dark-600">{{ t('settings.typewriterDesc') }}</p>
              </div>
              <button @click="enableTypewriter = !enableTypewriter"
                class="w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0"
                :class="enableTypewriter ? 'bg-emerald-500' : 'bg-dark-700'">
                <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                  :class="enableTypewriter ? 'left-[22px]' : 'left-0.5'"></div>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-[11px] text-gray-500 block">{{ t('settings.particles') }}</label>
                <p class="text-[9px] text-dark-600">{{ t('settings.particlesDesc') }}</p>
              </div>
              <button @click="enableParticles = !enableParticles"
                class="w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0"
                :class="enableParticles ? 'bg-emerald-500' : 'bg-dark-700'">
                <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                  :class="enableParticles ? 'left-[22px]' : 'left-0.5'"></div>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-[11px] text-gray-500 block">{{ t('settings.autoSave') }}</label>
                <p class="text-[9px] text-dark-600">{{ t('settings.autoSaveDesc') }}</p>
              </div>
              <button @click="autoSave = !autoSave"
                class="w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0"
                :class="autoSave ? 'bg-emerald-500' : 'bg-dark-700'">
                <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                  :class="autoSave ? 'left-[22px]' : 'left-0.5'"></div>
              </button>
            </div>
          </div>
        </section>

        <!-- Audio Settings -->
        <section class="mb-6">
          <p class="text-[10px] text-dark-500 uppercase tracking-[0.2em] mb-3">{{ t('settings.audioTitle') }}</p>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-[11px] text-gray-500 block">{{ t('settings.audioEnabled') }}</label>
                <p class="text-[9px] text-dark-600">{{ t('settings.audioDesc') }}</p>
              </div>
              <button @click="audioEnabled = !audioEnabled"
                class="w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0"
                :class="audioEnabled ? 'bg-emerald-500' : 'bg-dark-700'">
                <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                  :class="audioEnabled ? 'left-[22px]' : 'left-0.5'"></div>
              </button>
            </div>
            <div v-if="audioEnabled">
              <label class="text-[11px] text-gray-500 mb-1.5 block">{{ t('settings.bgm') }}</label>
              <div class="flex items-center gap-3">
                <input type="range" v-model.number="bgmVolume" min="0" max="100" step="5" class="flex-1 accent-emerald-500" />
                <span class="text-[11px] text-gray-400 font-mono w-10 text-right">{{ bgmVolume }}%</span>
              </div>
            </div>
            <div v-if="audioEnabled">
              <label class="text-[11px] text-gray-500 mb-1.5 block">{{ t('settings.sfx') }}</label>
              <div class="flex items-center gap-3">
                <input type="range" v-model.number="sfxVolume" min="0" max="100" step="5" class="flex-1 accent-emerald-500" />
                <span class="text-[11px] text-gray-400 font-mono w-10 text-right">{{ sfxVolume }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Language -->
        <section class="mb-6">
          <p class="text-[10px] text-dark-500 uppercase tracking-[0.2em] mb-3">{{ t('settings.langTitle') }}</p>
          <div class="flex gap-2">
            <button v-for="opt in localeOptions" :key="opt.value"
              class="flex-1 px-3 py-2 rounded-xl text-[12px] border transition-all text-center"
              :class="selectedLocale === opt.value ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:bg-white/[0.04]'"
              @click="selectedLocale = opt.value">
              {{ opt.label }}
            </button>
          </div>
        </section>

        <!-- Shortcuts -->
        <section class="mb-6">
          <p class="text-[10px] text-dark-500 uppercase tracking-[0.2em] mb-3">{{ t('settings.shortcuts') }}</p>
          <div class="space-y-1.5 text-[11px] text-gray-500">
            <div class="flex justify-between"><span>{{ t('settings.shortcutChoose') }}</span><span class="font-mono text-dark-400">1 2 3</span></div>
            <div class="flex justify-between"><span>{{ t('settings.shortcutSettings') }}</span><span class="font-mono text-dark-400">Esc</span></div>
            <div class="flex justify-between"><span>{{ t('settings.shortcutDashboard') }}</span><span class="font-mono text-dark-400">Tab</span></div>
          </div>
        </section>

        <!-- Actions -->
        <div class="flex gap-2">
          <button @click="save" class="btn-primary flex-1 text-sm py-2.5">{{ t('nav.save') }}</button>
          <button @click="$emit('close')" class="btn-secondary flex-1 text-sm py-2.5">{{ t('nav.cancel') }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import aiService from '../services/ai'
import audioService from '../services/audio'
import { useI18n, setLocale, t } from '../i18n'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const store = useGameStore()
const { localeOptions, locale } = useI18n()

const apiUrl = ref('')
const apiKey = ref('')
const model = ref('')
const textSpeed = ref(25)
const autoSave = ref(true)
const enableTypewriter = ref(true)
const enableParticles = ref(true)
const showKey = ref(false)
const audioEnabled = ref(true)
const bgmVolume = ref(25)
const sfxVolume = ref(50)
const selectedLocale = ref('zh')

// Sync on open
watch(() => props.show, (v) => {
  if (v) {
    apiUrl.value = aiService.apiUrl
    apiKey.value = aiService.apiKey
    model.value = aiService.model
    textSpeed.value = store.settings.textSpeed || 25
    autoSave.value = store.settings.autoSave !== false
    enableTypewriter.value = store.settings.enableTypewriter !== false
    enableParticles.value = store.settings.enableParticles !== false
    audioEnabled.value = audioService.enabled
    bgmVolume.value = Math.round(audioService.bgmVolume * 100)
    sfxVolume.value = Math.round(audioService.sfxVolume * 100)
    selectedLocale.value = locale.value
  }
})

function save() {
  aiService.updateConfig({ apiUrl: apiUrl.value, apiKey: apiKey.value, model: model.value })
  store.settings.textSpeed = textSpeed.value
  store.settings.autoSave = autoSave.value
  store.settings.enableTypewriter = enableTypewriter.value
  store.settings.enableParticles = enableParticles.value
  audioService.setEnabled(audioEnabled.value)
  audioService.setBGMVolume(bgmVolume.value / 100)
  audioService.setSFXVolume(sfxVolume.value / 100)
  setLocale(selectedLocale.value)
  emit('close')
}
</script>
