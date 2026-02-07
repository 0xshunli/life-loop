<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
    style="background: radial-gradient(ellipse at 70% 80%, hsla(155, 50%, 18%, 0.10) 0%, transparent 50%), linear-gradient(160deg, hsl(210, 50%, 12%) 0%, hsl(195, 40%, 10%) 35%, hsl(230, 45%, 13%) 65%, hsl(215, 50%, 9%) 100%);">
    <!-- Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 -left-10 w-[600px] h-[600px] rounded-full blur-[120px] animate-breathe"
        style="background: radial-gradient(circle, rgba(16,185,129,0.16), rgba(52,211,153,0.04) 50%, transparent 65%); animation-duration: 8s;" />
      <div class="absolute -bottom-10 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-breathe"
        style="background: radial-gradient(circle, rgba(6,182,212,0.12), rgba(99,102,241,0.04) 50%, transparent 65%); animation-delay: 3s; animation-duration: 12s;" />
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
            <div>
              <label class="text-xs text-gray-500 mb-2 block">起始年龄</label>
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <input type="range" v-model.number="form.startAge" min="0" max="60" step="1" class="w-full accent-emerald-500" />
                  <div class="flex justify-between text-[9px] text-dark-600 mt-1">
                    <span>出生</span><span>少年</span><span>青年</span><span>中年</span>
                  </div>
                </div>
                <div class="w-16 shrink-0 text-center">
                  <input v-model.number="form.startAge" type="number" min="0" max="80" class="input-field text-center text-lg font-bold !px-2 !py-1.5" />
                  <p class="text-[9px] text-dark-600 mt-0.5">岁</p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <button v-for="preset in agePresets" :key="preset.age" @click="form.startAge = preset.age"
                  :class="['px-2.5 py-1 rounded-lg text-[11px] border transition-all duration-200',
                    form.startAge === preset.age
                      ? 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400'
                      : 'border-white/[0.05] bg-white/[0.02] text-gray-500 hover:bg-white/[0.04]']">
                  {{ preset.icon }} {{ preset.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Avatar -->
          <div v-else-if="step === 1" key="s1">
            <label class="text-xs text-gray-500 mb-1.5 block">选择一个代表你的头像</label>
            <p class="text-[10px] text-dark-600 mb-4">这将成为你在人生旅程中的形象标识</p>

            <!-- Category tabs -->
            <div class="flex gap-1 mb-4 overflow-x-auto pb-1 scrollbar-none">
              <button v-for="(cat, ci) in avatarCategories" :key="ci" @click="selectedCategory = ci"
                :class="['flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] border whitespace-nowrap transition-all duration-200 shrink-0',
                  selectedCategory === ci
                    ? 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400'
                    : 'border-white/[0.05] bg-white/[0.02] text-gray-500 hover:bg-white/[0.04]']">
                <span>{{ cat.icon }}</span> {{ cat.label }}
              </button>
            </div>

            <!-- Avatar grid -->
            <div class="grid grid-cols-5 sm:grid-cols-7 gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              <button v-for="a in avatarCategories[selectedCategory].avatars" :key="a + selectedCategory" @click="form.avatar = a"
                :class="['relative w-full aspect-square rounded-xl flex items-center justify-center text-2xl sm:text-3xl border transition-all duration-200 group',
                  form.avatar === a
                    ? 'border-emerald-500/50 bg-emerald-500/[0.12] shadow-lg shadow-emerald-500/15 scale-105 ring-2 ring-emerald-500/30'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] hover:scale-105']">
                <span class="transition-transform duration-200 group-hover:scale-110">{{ a }}</span>
                <div v-if="form.avatar === a" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold shadow-md">✓</div>
              </button>
            </div>

            <!-- Selected preview -->
            <div class="mt-4 flex items-center gap-3 min-h-[40px]">
              <template v-if="form.avatar">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center text-2xl">{{ form.avatar }}</div>
                <div>
                  <p class="text-xs text-emerald-400">已选择头像</p>
                  <p class="text-[10px] text-dark-600">你可以随时回到这一步更换</p>
                </div>
              </template>
              <p v-else class="text-[10px] text-dark-600 italic">请从上方选择一个头像</p>
            </div>
          </div>

          <!-- Step 3: Personality -->
          <div v-else-if="step === 2" key="s2">
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

          <!-- Step 4: Backstory -->
          <div v-else-if="step === 3" key="s4">
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

          <!-- Step 5: Confirm -->
          <div v-else key="s5">
            <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/15 flex items-center justify-center text-2xl">
                  {{ previewAvatar }}
                </div>
                <div>
                  <h3 class="font-bold text-lg">{{ form.name }}</h3>
                  <p class="text-[11px] text-gray-500">{{ form.gender }} · {{ form.startAge }}岁起步 · {{ ageStageName(form.startAge) }}</p>
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
          <button v-if="step < 4" @click="nextStep" class="btn-primary text-sm py-2.5" :disabled="!canNext">下一步 →</button>
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
              {{ previewAvatar }}
            </div>
            <h3 class="font-bold text-base transition-all" :class="form.name ? 'text-gray-200' : 'text-dark-600'">
              {{ form.name || '未命名' }}
            </h3>
            <p class="text-[11px] text-gray-600 mt-0.5">{{ form.gender || '?' }} · {{ form.startAge }}岁 · {{ ageStageName(form.startAge) }}</p>
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
const steps = ['基本信息', '选择头像', '性格特征', '背景故事', '确认创建']
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

const avatarCategories = [
  {
    label: '经典人物', icon: '👤',
    avatars: ['👶', '👦', '👧', '👨', '👩', '🧑', '👴', '👵', '🧒', '👱', '👱‍♀️', '🧔', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳', '🧑‍🦱', '🧑‍🦰']
  },
  {
    label: '职业身份', icon: '💼',
    avatars: ['👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀', '👨‍🍳', '👩‍🍳', '👨‍✈️', '👩‍✈️', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍🌾', '👩‍🌾', '🕵️', '🕵️‍♀️']
  },
  {
    label: '奇幻角色', icon: '🧙',
    avatars: ['🧙', '🧙‍♀️', '🧝', '🧝‍♀️', '🧛', '🧛‍♀️', '🧜', '🧜‍♀️', '🧚', '🧚‍♀️', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🥷', '👸', '🤴', '🤖', '👻', '👽']
  },
  {
    label: '动物精灵', icon: '🐾',
    avatars: ['🐱', '🐶', '🦊', '🐺', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐉', '🦅', '🦋', '🐧', '🐬', '🦄', '🐙', '🦎', '🐝', '🦉']
  },
  {
    label: '符号标志', icon: '🎭',
    avatars: ['🎭', '👑', '⭐', '🌙', '🔥', '💎', '🌸', '🍀', '🌊', '⚡', '🎪', '🎯', '🏆', '💫', '🌈', '🎵', '🗡️', '🛡️', '🔮', '💀']
  },
]
const selectedCategory = ref(0)

const agePresets = [
  { age: 0, label: '出生', icon: '👶' },
  { age: 6, label: '童年', icon: '💒' },
  { age: 18, label: '成年', icon: '🎓' },
  { age: 30, label: '而立', icon: '💼' },
]
const form = ref({ name: '', gender: '', personality: [], backstory: '', startAge: 0, avatar: '' })

const canNext = computed(() => {
  if (step.value === 0) return form.value.name.trim() && form.value.gender
  if (step.value === 1) return !!form.value.avatar
  if (step.value === 2) return form.value.personality.length === 3
  if (step.value === 3) return form.value.backstory.trim().length >= 10
  return true
})

const completeness = computed(() => {
  let c = 0
  if (form.value.name.trim()) c += 20
  if (form.value.gender) c += 20
  if (form.value.avatar) c += 20
  if (form.value.personality.length === 3) c += 20
  if (form.value.backstory.trim().length >= 10) c += 20
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

function ageStageName(age) {
  if (age < 3) return '婴儿期'
  if (age < 6) return '幼儿期'
  if (age < 12) return '童年'
  if (age < 18) return '少年期'
  if (age < 30) return '青年期'
  if (age < 50) return '壮年期'
  if (age < 65) return '中年期'
  return '老年期'
}

const previewAvatar = computed(() => {
  // 优先使用玩家选择的自定义头像
  if (form.value.avatar) return form.value.avatar
  // 否则根据性别和年龄自动推断
  const g = form.value.gender, a = form.value.startAge
  if (!g && !form.value.name) return '❓'
  if (g === '女') {
    if (a < 3) return '👶'; if (a < 10) return '👧'; if (a < 20) return '👩'
    if (a < 35) return '💁‍♀️'; if (a < 50) return '👩‍💼'; if (a < 65) return '👩‍🦰'; return '👵'
  }
  if (a < 3) return '👶'; if (a < 10) return '👦'; if (a < 20) return '👨'
  if (a < 35) return '🙋‍♂️'; if (a < 50) return '👨‍💼'; if (a < 65) return '🧔'; return '👴'
})

function confirmCreate() {
  store.character = { ...form.value }
  router.push('/world')
}
</script>
