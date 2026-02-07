<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" @click.self="$emit('close')">
      <div class="glass-card p-6 max-w-md w-full shadow-2xl border border-white/[0.08] max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-200 flex items-center gap-2">⚙️ 设置</h3>
          <button @click="$emit('close')" class="btn-ghost p-1 text-gray-500 text-sm">✕</button>
        </div>

        <!-- API Settings -->
        <section class="mb-6">
          <p class="text-[10px] text-dark-500 uppercase tracking-[0.2em] mb-3">🔑 AI 接口</p>
          <div class="space-y-3">
            <div>
              <label class="text-[11px] text-gray-500 mb-1 block">API 地址</label>
              <input v-model="apiUrl" class="input-field text-[12px]" placeholder="https://api.deepseek.com" />
            </div>
            <div>
              <label class="text-[11px] text-gray-500 mb-1 block">API Key</label>
              <div class="relative">
                <input :type="showKey ? 'text' : 'password'" v-model="apiKey" class="input-field text-[12px] pr-16" placeholder="sk-..." />
                <button @click="showKey = !showKey" class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-dark-500 hover:text-gray-400 px-2 py-1">
                  {{ showKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div>
              <label class="text-[11px] text-gray-500 mb-1 block">模型</label>
              <input v-model="model" class="input-field text-[12px]" placeholder="deepseek-chat" />
            </div>
          </div>
        </section>

        <!-- Game Settings -->
        <section class="mb-6">
          <p class="text-[10px] text-dark-500 uppercase tracking-[0.2em] mb-3">🎮 游戏设置</p>
          <div class="space-y-3">
            <div>
              <label class="text-[11px] text-gray-500 mb-1.5 block">文字速度</label>
              <div class="flex items-center gap-3">
                <input type="range" v-model.number="textSpeed" min="10" max="80" step="5" class="flex-1 accent-emerald-500" />
                <span class="text-[11px] text-gray-400 font-mono w-14 text-right">{{ textSpeed }}ms</span>
              </div>
              <div class="flex justify-between text-[9px] text-dark-600 mt-1">
                <span>快</span><span>慢</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-[11px] text-gray-500">自动保存</label>
              <button @click="autoSave = !autoSave"
                class="w-10 h-5 rounded-full transition-colors duration-200 relative"
                :class="autoSave ? 'bg-emerald-500' : 'bg-dark-700'">
                <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                  :class="autoSave ? 'left-[22px]' : 'left-0.5'"></div>
              </button>
            </div>
          </div>
        </section>

        <!-- Info -->
        <section class="mb-6">
          <p class="text-[10px] text-dark-500 uppercase tracking-[0.2em] mb-3">ℹ️ 快捷键</p>
          <div class="space-y-1.5 text-[11px] text-gray-500">
            <div class="flex justify-between"><span>选择选项 1/2/3</span><span class="font-mono text-dark-400">1 2 3</span></div>
            <div class="flex justify-between"><span>打开设置</span><span class="font-mono text-dark-400">Esc</span></div>
          </div>
        </section>

        <!-- Actions -->
        <div class="flex gap-2">
          <button @click="save" class="btn-primary flex-1 text-sm py-2.5">保存设置</button>
          <button @click="$emit('close')" class="btn-secondary flex-1 text-sm py-2.5">取消</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import aiService from '../services/ai'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const store = useGameStore()

const apiUrl = ref('')
const apiKey = ref('')
const model = ref('')
const textSpeed = ref(30)
const autoSave = ref(true)
const showKey = ref(false)

onMounted(() => {
  apiUrl.value = aiService.apiUrl
  apiKey.value = aiService.apiKey
  model.value = aiService.model
  textSpeed.value = store.settings.textSpeed || 30
  autoSave.value = store.settings.autoSave !== false
})

function save() {
  aiService.updateConfig({ apiUrl: apiUrl.value, apiKey: apiKey.value, model: model.value })
  store.settings.textSpeed = textSpeed.value
  store.settings.autoSave = autoSave.value
  emit('close')
}
</script>
