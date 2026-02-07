<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-dark-950">
    <!-- Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[160px] animate-breathe"
        style="background: radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%); animation-duration: 10s;" />
      <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] animate-breathe"
        style="background: radial-gradient(circle, rgba(6,182,212,0.05), transparent 70%); animation-delay: 3s; animation-duration: 12s;" />
    </div>

    <!-- Two-column layout on lg -->
    <div class="relative z-10 flex gap-6 w-full max-w-4xl">

      <!-- Left: Form -->
      <div class="glass-card p-6 sm:p-8 flex-1 min-w-0">
        <!-- Header -->
        <div class="mb-8">
          <button @click="$router.push('/')" class="btn-ghost text-gray-600 text-xs mb-4 -ml-2">← 返回首页</button>
          <h2 class="text-2xl font-bold">
            <span class="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">创建你的角色</span>
          </h2>
          <p class="text-xs text-dark-500 mt-1">塑造一个独一无二的灵魂</p>
        </div>

        <!-- Step bar -->
        <div class="flex items-center gap-1 mb-8">
          <div v-for="(s, i) in steps" :key="i" class="flex items-center gap-1 flex-1">
            <div class="flex-1 h-1 rounded-full transition-all duration-500"
              :class="step >= i ? 'bg-emerald-500' : 'bg-dark-800'">
            </div>
          </div>
        </div>
        <p class="text-[10px] text-dark-500 uppercase tracking-[0.2em] mb-5">
          {{ steps[step] }} <span class="text-dark-700">· {{ step + 1 }}/{{ steps.length }}</span>
        </p>

        <!-- Steps -->
        <transition name="slide-up" mode="out-in">
          <!-- Step 1 -->
          <div v-if="step === 0" key="s0" class="space-y-5">
            <div>
              <label class="text-xs text-gray-500 mb-2 block">角色姓名</label>
              <input v-model="form.name" class="input-field text-lg" placeholder="起个名字..." maxlength="20" @keyup.enter="nextStep" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-3 block">性别</label>
              <div class="grid grid-cols-3 gap-3">
                <button v-for="g in genders" :key="g.value" @click="form.gender = g.value"
                  :class="['relative p-4 rounded-xl text-center transition-all duration-300 border group',
                    form.gender === g.value
                      ? 'border-emerald-500/40 bg-emerald-500/[0.08] shadow-lg shadow-emerald-500/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]']">
                  <span class="text-3xl block mb-1.5 transition-transform duration-300 group-hover:scale-110">{{ g.icon }}</span>
                  <p class="text-xs" :class="form.gender === g.value ? 'text-emerald-400' : 'text-gray-500'">{{ g.label }}</p>
                  <div v-if="form.gender === g.value" class="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">✓</div>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-else-if="step === 1" key="s1">
            <label class="text-xs text-gray-500 mb-1.5 block">性格特征</label>
            <p class="text-[10px] text-dark-600 mb-4">选择 3 个最能代表角色的特质</p>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="trait in traits" :key="trait" @click="toggleTrait(trait)"
                :disabled="form.personality.length >= 3 && !form.personality.includes(trait)"
                :class="['relative py-2.5 px-2 rounded-xl text-sm transition-all duration-200 border',
                  form.personality.includes(trait)
                    ? 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400'
                    : 'border-white/[0.05] bg-white/[0.02] text-gray-500 hover:bg-white/[0.04] hover:text-gray-300',
                  form.personality.length >= 3 && !form.personality.includes(trait) ? 'opacity-20 !cursor-not-allowed' : '']">
                {{ trait }}
                <span v-if="form.personality.includes(trait)"
                  class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold">
                  {{ form.personality.indexOf(trait) + 1 }}
                </span>
              </button>
            </div>
            <div class="flex items-center gap-2 mt-5 min-h-[32px]">
              <TransitionGroup name="fade" tag="div" class="flex gap-1.5">
                <span v-for="p in form.personality" :key="p"
                  class="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">{{ p }}</span>
              </TransitionGroup>
              <span v-if="form.personality.length < 3" class="text-[10px] text-dark-600">还差 {{ 3 - form.personality.length }} 个</span>
            </div>
          </div>

          <!-- Step 3 -->
          <div v-else-if="step === 2" key="s2">
            <label class="text-xs text-gray-500 mb-2 block">背景故事</label>
            <textarea v-model="form.backstory" class="input-field h-48 resize-none leading-relaxed"
              placeholder="写一段角色的背景故事...&#10;&#10;例如：出生在一个普通家庭，从小对世界充满好奇，梦想有一天能看到更大的天空……" maxlength="500" />
            <div class="flex justify-between items-center mt-2.5">
              <span class="text-[10px] text-dark-600">
                <span :class="form.backstory.length >= 10 ? 'text-emerald-500/70' : ''">{{ form.backstory.length }}</span> / 500
              </span>
              <button @click="generateBackstory" :disabled="isGenerating"
                class="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg transition-all
                  bg-emerald-500/[0.06] text-emerald-400/80 border border-emerald-500/15 hover:bg-emerald-500/[0.12]
                  disabled:opacity-40">
                <span v-if="isGenerating" class="w-3 h-3 border-[1.5px] border-emerald-400/60 border-t-transparent rounded-full animate-spin"></span>
                <span v-else>✨</span>
                {{ isGenerating ? '生成中...' : 'AI 生成' }}
              </button>
            </div>
          </div>

          <!-- Step 4: Confirm -->
          <div v-else key="s3">
            <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/15 flex items-center justify-center text-2xl">
                  {{ form.gender === '男' ? '👨' : form.gender === '女' ? '👩' : '🧑' }}
                </div>
                <div>
                  <h3 class="font-bold text-lg">{{ form.name }}</h3>
                  <p class="text-[11px] text-gray-500">{{ form.gender }} · 18岁</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span v-for="p in form.personality" :key="p"
                  class="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15">{{ p }}</span>
              </div>
              <div class="h-px bg-white/[0.05] mb-3"></div>
              <p class="text-gray-400 text-sm leading-relaxed">{{ form.backstory }}</p>
            </div>
            <div class="mt-4 text-center">
              <p class="text-[11px] text-emerald-500/50">确认后将选择世界，开始你的人生旅程</p>
            </div>
          </div>
        </transition>

        <!-- Nav -->
        <div class="flex justify-between mt-8">
          <button v-if="step > 0" @click="step--" class="btn-secondary text-sm py-2.5">← 上一步</button>
          <div v-else></div>
          <button v-if="step < 3" @click="nextStep" class="btn-primary text-sm py-2.5" :disabled="!canNext">下一步 →</button>
          <button v-else @click="confirmCreate" class="btn-primary text-sm py-2.5 animate-glow">选择世界 →</button>
        </div>
      </div>

      <!-- Right: Live Preview (desktop only) -->
      <div class="hidden lg:flex w-72 flex-col gap-4">
        <div class="glass-card p-5 flex-1 flex flex-col border-gradient">
          <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-4">实时预览</p>

          <!-- Avatar -->
          <div class="text-center mb-5">
            <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/[0.06] flex items-center justify-center text-4xl mb-3 transition-all duration-300"
              :class="form.name ? 'opacity-100' : 'opacity-30'">
              {{ form.gender === '男' ? '👨' : form.gender === '女' ? '👩' : form.name ? '🧑' : '❓' }}
            </div>
            <h3 class="font-bold text-base transition-all" :class="form.name ? 'text-gray-200' : 'text-dark-600'">
              {{ form.name || '未命名' }}
            </h3>
            <p class="text-[11px] text-gray-600 mt-0.5">{{ form.gender || '?' }} · 18岁</p>
          </div>

          <!-- Traits -->
          <div class="mb-4">
            <p class="text-[9px] text-dark-500 uppercase tracking-wider mb-2">性格</p>
            <div class="flex flex-wrap gap-1">
              <span v-for="p in form.personality" :key="p"
                class="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15">{{ p }}</span>
              <span v-for="i in (3 - form.personality.length)" :key="'e'+i"
                class="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.02] text-dark-600 border border-white/[0.04]">?</span>
            </div>
          </div>

          <!-- Story preview -->
          <div class="flex-1">
            <p class="text-[9px] text-dark-500 uppercase tracking-wider mb-2">背景故事</p>
            <p class="text-[11px] text-gray-500 leading-relaxed line-clamp-6" :class="form.backstory ? '' : 'italic text-dark-600'">
              {{ form.backstory || '等待书写……' }}
            </p>
          </div>

          <!-- Completeness -->
          <div class="mt-4 pt-3 border-t border-white/[0.04]">
            <div class="flex items-center justify-between text-[10px] text-dark-500 mb-1.5">
              <span>完成度</span>
              <span class="font-mono" :class="completeness === 100 ? 'text-emerald-400' : ''">{{ completeness }}%</span>
            </div>
            <div class="h-1 bg-dark-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-500" :style="{ width: completeness + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import aiService from '../services/ai'

const router = useRouter()
const store = useGameStore()
const step = ref(0)
const steps = ['基本信息', '性格特征', '背景故事', '确认创建']
const isGenerating = ref(false)

const genders = [
  { value: '男', label: '男性', icon: '👨' },
  { value: '女', label: '女性', icon: '👩' },
  { value: '其他', label: '自定义', icon: '🧑' },
]
const traits = [
  '勇敢', '谨慎', '善良', '冷酷', '聪明', '天真',
  '幽默', '严肃', '浪漫', '务实', '叛逆', '温顺',
  '野心勃勃', '淡泊名利', '外向开朗', '内向沉静',
  '正义感强', '随波逐流',
]

const form = ref({ name: '', gender: '', personality: [], backstory: '' })

const canNext = computed(() => {
  if (step.value === 0) return form.value.name.trim() && form.value.gender
  if (step.value === 1) return form.value.personality.length === 3
  if (step.value === 2) return form.value.backstory.trim().length >= 10
  return true
})

const completeness = computed(() => {
  let c = 0
  if (form.value.name.trim()) c += 25
  if (form.value.gender) c += 25
  if (form.value.personality.length === 3) c += 25
  if (form.value.backstory.trim().length >= 10) c += 25
  return c
})

function toggleTrait(t) {
  const i = form.value.personality.indexOf(t)
  if (i >= 0) form.value.personality.splice(i, 1)
  else if (form.value.personality.length < 3) form.value.personality.push(t)
}
function nextStep() { if (canNext.value) step.value++ }

async function generateBackstory() {
  if (!form.value.name || !form.value.personality.length) {
    form.value.backstory = '请先填写姓名和性格特征。'
    return
  }
  isGenerating.value = true
  try {
    const r = await aiService.chat([
      { role: 'system', content: '你是创意写作助手，为游戏角色生成背景故事。100-200字，有趣、有戏剧性。直接输出故事，不加标题或引号。' },
      { role: 'user', content: `角色：${form.value.name}，${form.value.gender}，性格：${form.value.personality.join('、')}` }
    ], { max_tokens: 512, temperature: 0.9 })
    form.value.backstory = r.trim().replace(/^["']|["']$/g, '')
  } catch {
    form.value.backstory = `${form.value.name}出生在一个普通家庭，从小对世界充满好奇。`
  } finally { isGenerating.value = false }
}

function confirmCreate() {
  store.character = { ...form.value }
  router.push('/world')
}
</script>
