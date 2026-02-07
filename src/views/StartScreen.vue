<template>
  <div class="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    style="background: radial-gradient(ellipse at 30% 20%, hsla(168, 60%, 18%, 0.12) 0%, transparent 50%), linear-gradient(160deg, hsl(220, 50%, 12%) 0%, hsl(200, 45%, 10%) 35%, hsl(250, 40%, 12%) 65%, hsl(210, 50%, 8%) 100%);">
    <!-- Starfield -->
    <div class="starfield">
      <div
        v-for="s in stars"
        :key="s.id"
        class="star"
        :style="{
          width: s.size + 'px', height: s.size + 'px',
          left: s.x + '%', top: s.y + '%',
          '--duration': s.dur + 's', '--delay': s.delay + 's',
        }"
      />
    </div>

    <!-- Large ambient orbs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -left-10 w-[700px] h-[700px] rounded-full blur-[120px] animate-breathe"
        style="background: radial-gradient(circle, rgba(16,185,129,0.18), rgba(6,182,212,0.06) 50%, transparent 70%); animation-duration: 8s;" />
      <div class="absolute -bottom-32 -right-10 w-[600px] h-[600px] rounded-full blur-[100px] animate-breathe"
        style="background: radial-gradient(circle, rgba(99,102,241,0.14), rgba(139,92,246,0.06) 50%, transparent 70%); animation-delay: 3s; animation-duration: 12s;" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] animate-breathe"
        style="background: radial-gradient(circle, rgba(6,182,212,0.10), transparent 65%); animation-delay: 5s; animation-duration: 14s;" />
    </div>

    <!-- Subtle grid -->
    <div class="absolute inset-0 opacity-[0.03]"
      style="background-image: linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 60px 60px;" />

    <!-- Wallet Connection (top-right) -->
    <div class="absolute top-5 right-5 z-20">
      <div v-if="walletState.connected" class="glass-card px-4 py-2.5 flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
        <div>
          <p class="text-[9px] text-gray-500 uppercase tracking-wider leading-none mb-0.5">Wallet</p>
          <p class="text-xs font-mono text-emerald-400/90">{{ shortAddr }}</p>
        </div>
        <button @click="disconnectWallet" class="text-dark-500 hover:text-rose-400 transition-colors ml-1 p-0.5" title="断开">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <button v-else @click="connectWallet"
        class="glass-card-hover px-4 py-2.5 flex items-center gap-2.5 text-xs text-gray-500 hover:text-emerald-400 group"
        :disabled="isConnecting">
        <span v-if="isConnecting" class="w-3.5 h-3.5 border-2 border-emerald-400/60 border-t-transparent rounded-full animate-spin"></span>
        <svg v-else class="w-4 h-4 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ isConnecting ? '连接中...' : '连接钱包' }}
      </button>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 text-center px-6 max-w-lg">
      <!-- Logo -->
      <div class="mb-10">
        <div class="relative w-24 h-24 mx-auto mb-8">
          <!-- Outer glow ring -->
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 animate-breathe" style="animation-duration: 4s;" />
          <div class="absolute -inset-2 rounded-3xl border border-emerald-500/10 animate-breathe" style="animation-duration: 6s; animation-delay: 1s;" />
          <div class="relative w-full h-full rounded-2xl bg-dark-900/60 backdrop-blur border border-white/[0.08] flex items-center justify-center">
            <span class="text-5xl select-none">🌟</span>
          </div>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-6xl sm:text-7xl font-black tracking-[0.08em] mb-4 select-none leading-none">
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent animate-gradient" style="background-size: 200% 200%;">
          人生进程
        </span>
      </h1>
      <div class="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mb-5"></div>
      <p class="text-gray-500 text-sm sm:text-base tracking-[0.3em] font-light mb-5">每一次人生都是独一无二的</p>

      <!-- Feature pills -->
      <div class="flex items-center justify-center gap-2 mb-10 flex-wrap">
        <span v-for="f in features" :key="f" class="px-3 py-1 rounded-full text-[11px] bg-white/[0.03] border border-white/[0.06] text-gray-500">
          {{ f }}
        </span>
      </div>

      <!-- Save preview -->
      <transition name="slide-up">
        <div v-if="walletState.connected && saveInfo" class="glass-card p-4 mb-6 text-left border-gradient">
          <div class="flex items-center gap-2 mb-2.5">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <span class="text-[9px] text-gray-500 uppercase tracking-[0.15em]">已有存档</span>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-bold text-gray-200">{{ saveInfo.characterName }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ saveInfo.world }} · {{ saveInfo.age }}岁</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-mono text-dark-400">{{ shortAddr }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Error -->
      <div v-if="walletError" class="mb-4">
        <p class="text-xs text-rose-400/80 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 inline-block">
          {{ walletError }}
        </p>
      </div>

      <!-- Buttons -->
      <div class="space-y-3">
        <button @click="$router.push('/create')" class="btn-primary text-lg px-10 py-4 w-full max-w-[280px] mx-auto block animate-glow group">
          <span class="flex items-center justify-center gap-2">
            开始新人生
            <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </span>
        </button>
        <button v-if="hasSave" @click="continueGame" class="btn-secondary text-base px-10 py-3.5 w-full max-w-[280px] mx-auto block group">
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            继续上次的故事
          </span>
        </button>
      </div>

      <!-- Footer hint -->
      <p v-if="!walletState.connected && walletAvailable" class="text-[11px] text-dark-600 mt-10">
        连接钱包后，存档将绑定你的链上身份
      </p>

      <p class="text-dark-700 text-[10px] mt-12 tracking-wider font-mono">v0.1.0 · 人生进程 · DeepSeek AI</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import wallet from '../services/wallet'

const router = useRouter()
const store = useGameStore()
const walletState = wallet.state
const isConnecting = ref(false)
const walletError = ref('')

const walletAvailable = computed(() => wallet.hasProvider())
const shortAddr = computed(() => wallet.shortAddress())
const hasSave = computed(() => store.hasSaveData())
const saveInfo = computed(() => store.getSaveInfo())

const features = ['🤖 AI 驱动叙事', '🎭 自由选择', '🌍 多元世界', '🔗 钱包存档']

// Generate stars
const stars = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  dur: 2 + Math.random() * 4,
  delay: Math.random() * 5,
}))

onMounted(() => { wallet.tryReconnect() })

async function connectWallet() {
  isConnecting.value = true
  walletError.value = ''
  try { await wallet.connect() }
  catch { walletError.value = wallet.state.error }
  finally { isConnecting.value = false }
}
function disconnectWallet() { wallet.disconnect(); walletError.value = '' }
function continueGame() { store.loadGame(); router.push('/game') }
</script>
