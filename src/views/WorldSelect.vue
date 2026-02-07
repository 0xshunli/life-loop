<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-all duration-[1500ms]" :style="bgStyle">
    <!-- Ambient -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-20 -left-10 w-[650px] h-[650px] rounded-full blur-[120px] transition-all duration-[1500ms] animate-breathe"
        :style="{ background: glowColor, animationDuration: '9s' }" />
      <div class="absolute -bottom-20 -right-10 w-[550px] h-[550px] rounded-full blur-[100px] transition-all duration-[1500ms] animate-breathe"
        :style="{ background: glowColor2, animationDelay: '4s', animationDuration: '13s' }" />
    </div>

    <!-- Stars for scifi/fantasy -->
    <div v-if="selectedWorld === 'scifi' || selectedWorld === 'fantasy'" class="starfield">
      <div v-for="s in miniStars" :key="s.id" class="star"
        :style="{ width: s.size+'px', height: s.size+'px', left: s.x+'%', top: s.y+'%', '--duration': s.dur+'s', '--delay': s.delay+'s' }" />
    </div>

    <div class="relative z-10 w-full max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-10">
        <button @click="$router.push('/create')" class="btn-ghost text-gray-600 text-xs mb-6">← 返回修改角色</button>
        <h2 class="text-3xl font-bold mb-2">
          <span class="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">选择你的世界</span>
        </h2>
        <p class="text-gray-600 text-sm">每个世界都有独特的命运等待书写</p>
      </div>

      <!-- Character reminder -->
      <div v-if="store.character.name" class="flex justify-center mb-8">
        <div class="glass-card px-4 py-2 flex items-center gap-3 text-xs">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center text-sm">
            {{ store.character.gender === '男' ? '👨' : store.character.gender === '女' ? '👩' : '🧑' }}
          </div>
          <span class="font-medium text-gray-300">{{ store.character.name }}</span>
          <span class="text-dark-600">·</span>
          <span class="text-gray-500">{{ store.character.personality.join(' / ') }}</span>
        </div>
      </div>

      <!-- World Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button v-for="w in worlds" :key="w.key" @click="selectedWorld = w.key"
          :class="['group relative text-left overflow-hidden rounded-2xl border transition-all duration-500',
            selectedWorld === w.key
              ? 'border-white/[0.12] shadow-2xl scale-[1.01]'
              : 'border-white/[0.05] hover:border-white/[0.08]']">

          <!-- Scene illustration area -->
          <div class="h-28 relative overflow-hidden" :style="{ background: w.sceneBg }">
            <!-- Scene decorations -->
            <div class="absolute inset-0" v-html="w.sceneDecor"></div>
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-950/95"></div>
            <!-- Icon -->
            <div class="absolute top-4 left-5 text-3xl transition-transform duration-500 group-hover:scale-110">{{ w.icon }}</div>
            <!-- Selected badge -->
            <transition name="fade">
              <div v-if="selectedWorld === w.key" class="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </div>
            </transition>
          </div>

          <!-- Content -->
          <div class="p-5 bg-dark-900/60 backdrop-blur-sm">
            <h3 class="font-bold text-base mb-1.5 transition-colors duration-300"
              :class="selectedWorld === w.key ? 'text-white' : 'text-gray-300 group-hover:text-white'">
              {{ w.label }}
            </h3>
            <p class="text-gray-500 text-[13px] leading-relaxed mb-3">{{ w.description }}</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="tag in w.tags" :key="tag"
                class="text-[10px] px-2 py-0.5 rounded-md transition-colors duration-300"
                :class="selectedWorld === w.key
                  ? 'bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15'
                  : 'bg-white/[0.03] text-dark-400 border border-white/[0.04]'">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Accent line -->
          <div class="h-0.5 transition-all duration-500"
            :style="{ background: selectedWorld === w.key ? w.accentGradient : 'transparent' }"></div>
        </button>
      </div>

      <!-- Start button -->
      <div class="text-center mt-10">
        <button @click="startGame" :disabled="!selectedWorld"
          class="btn-primary text-base px-12 py-4"
          :class="selectedWorld ? 'animate-glow' : ''">
          开始人生旅程 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const store = useGameStore()
const selectedWorld = ref('')

const miniStars = Array.from({ length: 40 }, (_, i) => ({
  id: i, x: Math.random()*100, y: Math.random()*100, size: Math.random()*1.5+0.5, dur: 2+Math.random()*4, delay: Math.random()*5,
}))

const worlds = [
  {
    key: 'modern', label: '现代都市', icon: '🏙️',
    description: '繁华的现代城市，机遇与挑战并存。在职场、爱情、生活中找到属于你的位置。',
    tags: ['职场', '爱情', '社交', '科技'],
    sceneBg: 'linear-gradient(135deg, #0a1628 0%, #0f2440 50%, #162d50 100%)',
    sceneDecor: `<div style="position:absolute;bottom:0;left:10%;width:8px;height:60%;background:linear-gradient(to top,#1a365d,#2563eb33);border-radius:2px 2px 0 0;"></div>
      <div style="position:absolute;bottom:0;left:20%;width:12px;height:75%;background:linear-gradient(to top,#1e3a5f,#3b82f633);border-radius:2px 2px 0 0;"></div>
      <div style="position:absolute;bottom:0;left:35%;width:6px;height:50%;background:linear-gradient(to top,#1a365d,#60a5fa22);border-radius:2px 2px 0 0;"></div>
      <div style="position:absolute;bottom:0;left:55%;width:10px;height:65%;background:linear-gradient(to top,#1e3a5f,#3b82f633);border-radius:2px 2px 0 0;"></div>
      <div style="position:absolute;bottom:0;left:70%;width:14px;height:80%;background:linear-gradient(to top,#1a365d,#2563eb44);border-radius:2px 2px 0 0;"></div>
      <div style="position:absolute;bottom:0;left:85%;width:7px;height:45%;background:linear-gradient(to top,#1e3a5f,#60a5fa22);border-radius:2px 2px 0 0;"></div>`,
    accentGradient: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
  },
  {
    key: 'ancient', label: '古代王朝', icon: '🏯',
    description: '风云变幻的古代，朝堂争斗、江湖恩怨。入朝为官或行走江湖，命运由你书写。',
    tags: ['权谋', '武侠', '诗词', '历史'],
    sceneBg: 'linear-gradient(135deg, #1a0f00 0%, #2d1b08 50%, #3d2a12 100%)',
    sceneDecor: `<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:30px solid transparent;border-right:30px solid transparent;border-bottom:50px solid #4a2c0a;"></div>
      <div style="position:absolute;bottom:50px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:22px solid transparent;border-right:22px solid transparent;border-bottom:35px solid #5c3a12;"></div>
      <div style="position:absolute;bottom:20%;right:15%;width:60px;height:1px;background:#d97706;opacity:0.15;border-radius:50%;"></div>
      <div style="position:absolute;top:20%;right:20%;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle,#fbbf2420,transparent);"></div>`,
    accentGradient: 'linear-gradient(90deg, #d97706, #ef4444)',
  },
  {
    key: 'fantasy', label: '奇幻大陆', icon: '🐉',
    description: '魔法与神秘生物的世界。冒险、修炼、结交伙伴，书写属于你的史诗传奇。',
    tags: ['魔法', '冒险', '修炼', '神兽'],
    sceneBg: 'linear-gradient(135deg, #0d0628 0%, #1a0b3a 50%, #2d1557 100%)',
    sceneDecor: `<div style="position:absolute;top:15%;left:20%;width:4px;height:4px;background:#c084fc;border-radius:50%;box-shadow:0 0 8px #c084fc;"></div>
      <div style="position:absolute;top:35%;right:25%;width:3px;height:3px;background:#a78bfa;border-radius:50%;box-shadow:0 0 6px #a78bfa;"></div>
      <div style="position:absolute;bottom:30%;left:40%;width:5px;height:5px;background:#e879f9;border-radius:50%;box-shadow:0 0 10px #e879f9;"></div>
      <div style="position:absolute;top:25%;left:60%;width:2px;height:2px;background:#c084fc;border-radius:50%;box-shadow:0 0 5px #c084fc;"></div>
      <div style="position:absolute;bottom:40%;right:35%;width:3px;height:3px;background:#f0abfc;border-radius:50%;box-shadow:0 0 8px #f0abfc;"></div>`,
    accentGradient: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
  },
  {
    key: 'scifi', label: '星际时代', icon: '🚀',
    description: '人类走向星际的未来。太空探索、AI 共存、星际贸易，无限可能在宇宙展开。',
    tags: ['太空', 'AI', '探索', '未来'],
    sceneBg: 'linear-gradient(135deg, #021a1a 0%, #042d2d 50%, #063f3f 100%)',
    sceneDecor: `<div style="position:absolute;top:20%;left:25%;width:40px;height:1px;background:linear-gradient(90deg,transparent,#06b6d4,transparent);opacity:0.3;"></div>
      <div style="position:absolute;top:50%;right:20%;width:30px;height:1px;background:linear-gradient(90deg,transparent,#10b981,transparent);opacity:0.25;"></div>
      <div style="position:absolute;top:30%;left:60%;width:6px;height:6px;border:1px solid #06b6d440;border-radius:50%;"></div>
      <div style="position:absolute;bottom:35%;left:30%;width:4px;height:4px;border:1px solid #10b98140;border-radius:50%;"></div>`,
    accentGradient: 'linear-gradient(90deg, #06b6d4, #10b981)',
  },
]

const bgStyle = computed(() => {
  const map = {
    modern:  'radial-gradient(ellipse at 25% 15%, hsla(215,60%,22%,0.12) 0%, transparent 50%), linear-gradient(160deg, hsl(215,55%,13%) 0%, hsl(205,50%,10%) 35%, hsl(225,45%,12%) 65%, hsl(220,50%,8%) 100%)',
    ancient: 'radial-gradient(ellipse at 70% 20%, hsla(35,55%,22%,0.10) 0%, transparent 50%), linear-gradient(160deg, hsl(28,45%,12%) 0%, hsl(20,40%,10%) 35%, hsl(35,35%,11%) 65%, hsl(25,40%,7%) 100%)',
    fantasy: 'radial-gradient(ellipse at 40% 30%, hsla(270,55%,25%,0.12) 0%, transparent 50%), linear-gradient(160deg, hsl(268,50%,13%) 0%, hsl(280,45%,11%) 35%, hsl(300,40%,12%) 65%, hsl(265,45%,8%) 100%)',
    scifi:   'radial-gradient(ellipse at 60% 25%, hsla(185,55%,20%,0.10) 0%, transparent 50%), linear-gradient(160deg, hsl(185,55%,12%) 0%, hsl(175,50%,10%) 35%, hsl(195,45%,11%) 65%, hsl(180,50%,7%) 100%)',
  }
  return { background: map[selectedWorld.value] || 'linear-gradient(160deg, hsl(220,45%,12%) 0%, hsl(230,40%,9%) 100%)' }
})
const glowColor = computed(() => {
  const map = {
    modern:  'radial-gradient(circle, rgba(59,130,246,0.18), rgba(99,102,241,0.05) 50%, transparent 65%)',
    ancient: 'radial-gradient(circle, rgba(217,119,6,0.18), rgba(245,158,11,0.05) 50%, transparent 65%)',
    fantasy: 'radial-gradient(circle, rgba(139,92,246,0.18), rgba(236,72,153,0.05) 50%, transparent 65%)',
    scifi:   'radial-gradient(circle, rgba(6,182,212,0.18), rgba(16,185,129,0.05) 50%, transparent 65%)',
  }
  return map[selectedWorld.value] || 'transparent'
})
const glowColor2 = computed(() => {
  const map = {
    modern:  'radial-gradient(circle, rgba(99,102,241,0.12), transparent 65%)',
    ancient: 'radial-gradient(circle, rgba(239,68,68,0.10), transparent 65%)',
    fantasy: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 65%)',
    scifi:   'radial-gradient(circle, rgba(16,185,129,0.10), transparent 65%)',
  }
  return map[selectedWorld.value] || 'transparent'
})

function startGame() {
  const w = worlds.find(x => x.key === selectedWorld.value)
  if (!w) return
  store.initGame(store.character, { setting: w.key, settingLabel: w.label, description: w.description })
  router.push('/game')
}
</script>
