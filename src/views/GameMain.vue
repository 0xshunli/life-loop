<template>
  <div class="h-screen flex flex-col overflow-hidden relative" :class="sceneClass">
    <!-- Ambient -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] animate-breathe" :style="{ background: ambientColor, animationDuration: '10s' }" />
      <div class="absolute -bottom-32 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] animate-breathe" :style="{ background: ambientColor2, animationDelay: '4s', animationDuration: '14s' }" />
    </div>

    <!-- Notifications -->
    <TransitionGroup name="fade" tag="div" class="fixed top-16 right-4 z-[70] space-y-2 pointer-events-none">
      <div v-for="n in notifications" :key="n.id" class="animate-float-up px-3.5 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-sm border"
        :class="n.type === 'milestone' ? 'bg-amber-500/15 border-amber-500/20 text-amber-400' : n.value > 0 ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/15 border-rose-500/20 text-rose-400'">
        {{ n.icon }} {{ n.label }} {{ n.value !== undefined ? ((n.value > 0 ? '+' : '') + n.value) : '' }}
      </div>
    </TransitionGroup>

    <!-- Menu -->
    <transition name="fade">
      <div v-if="showMenu" class="fixed inset-0 z-[80]" @click="showMenu = false">
        <div class="absolute right-4 top-12 w-52 glass-card p-1.5 shadow-2xl border border-white/[0.08]" @click.stop>
          <button @click="restartLife" class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2.5">🔄 重启人生</button>
          <button @click="openSettings" class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2.5">⚙️ 设置</button>
          <button @click="goHome" class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2.5">🏠 回到首页</button>
          <div class="h-px bg-white/[0.04] my-1"></div>
          <button @click="showMenu = false" class="w-full text-left px-3.5 py-2 rounded-xl text-[12px] text-dark-500 hover:bg-white/[0.03] transition-all">关闭</button>
        </div>
      </div>
    </transition>

    <!-- Restart dialog -->
    <transition name="fade">
      <div v-if="showRestartDialog" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" @click.self="showRestartDialog = false">
        <div class="glass-card p-8 max-w-sm w-full text-center shadow-2xl border border-white/[0.08]">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/20 flex items-center justify-center text-3xl mb-4">🔄</div>
          <h3 class="text-lg font-bold mb-2 text-gray-200">重启人生</h3>
          <p class="text-sm text-gray-500 mb-6">当前进度自动保存。重新创建角色，开启全新旅程。</p>
          <div class="flex gap-3 justify-center">
            <button @click="showRestartDialog = false" class="btn-secondary text-sm px-6 py-2.5">取消</button>
            <button @click="confirmRestart" class="btn-primary text-sm px-6 py-2.5">确认重启</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Settings -->
    <SettingsPanel :show="showSettings" @close="showSettings = false" />

    <!-- Top Bar -->
    <header class="relative z-10 bg-dark-950/60 backdrop-blur-2xl border-b border-white/[0.04] px-4 sm:px-5 py-2 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <button @click="showSidebar = true" class="lg:hidden btn-ghost p-2 -ml-2">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="relative">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all duration-500" :class="moodRingClass" :style="{ boxShadow: moodGlow }">
            {{ moodEmoji }}
          </div>
          <div class="absolute -bottom-0.5 -right-0.5 text-[7px] w-3.5 h-3.5 rounded-full border-2 border-dark-950 flex items-center justify-center font-bold" :class="lifeStageColor">{{ store.lifeStage.label[0] }}</div>
        </div>
        <div>
          <h1 class="font-bold text-sm leading-tight">{{ store.character.name }}</h1>
          <p class="text-[10px] text-gray-600 flex items-center gap-1">
            {{ store.yearMonth }}
            <span class="text-dark-600">·</span>
            <span>{{ store.seasonLabel.icon }}</span>
            <span :class="'text-'+store.lifeStage.color+'-500/70'">{{ store.lifeStage.label }}</span>
            <template v-if="store.career">
              <span class="text-dark-600">·</span>
              <span class="text-dark-400">{{ store.career }}</span>
            </template>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] px-2 py-1 rounded-lg font-medium" :class="moodBadgeClass">{{ store.currentMood }}</span>
        <span class="hidden sm:flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-500">{{ worldEmoji }} {{ store.world.settingLabel }}</span>
        <span class="hidden md:flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-500 font-mono">Lv.{{ store.lifeScore }}</span>
        <button @click="showMenu = !showMenu" class="btn-ghost p-2 text-gray-500 hover:text-gray-300">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
        </button>
      </div>
    </header>

    <!-- Body -->
    <div class="relative z-[5] flex flex-1 overflow-hidden">
      <transition name="drawer-overlay"><div v-if="showSidebar" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" @click="showSidebar = false" /></transition>

      <!-- Sidebar -->
      <transition name="drawer">
        <aside v-show="showSidebar || !isMobile" :class="['w-72 bg-dark-950/80 backdrop-blur-2xl border-r border-white/[0.04] overflow-y-auto flex flex-col shrink-0', showSidebar ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex']">
          <div v-if="showSidebar" class="flex items-center justify-between p-4 border-b border-white/[0.04] lg:hidden">
            <span class="text-xs font-bold text-gray-400">角色面板</span>
            <button @click="showSidebar = false" class="btn-ghost p-1 text-xs text-gray-500">✕</button>
          </div>
          <div class="p-4 flex-1 overflow-y-auto space-y-5">
            <!-- Portrait -->
            <section class="rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent p-4 text-center relative overflow-hidden">
              <div class="absolute top-2 right-2 text-sm opacity-60">{{ store.seasonLabel.icon }}</div>
              <div class="relative inline-block mb-3">
                <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2 transition-all duration-500 shadow-lg" :class="moodRingClass" :style="{ boxShadow: moodGlow }">{{ store.ageAvatar }}</div>
                <div v-if="moodParticle" class="absolute -top-1 -right-1 text-sm animate-bounce" style="animation-duration:2s;">{{ moodParticle }}</div>
              </div>
              <h3 class="font-bold text-base text-gray-200">{{ store.character.name }}</h3>
              <p class="text-[10px] text-gray-500 mt-0.5">{{ store.character.gender }} · {{ store.age }}岁 · {{ store.lifeStage.label }}</p>
              <p v-if="store.career" class="text-[10px] text-emerald-400/60 mt-0.5">💼 {{ store.career }}</p>
              <p v-if="store.location" class="text-[10px] text-dark-400 mt-0.5">📍 {{ store.location }}</p>
              <div class="flex justify-center gap-1.5 mt-2 flex-wrap">
                <span v-for="p in store.character.personality" :key="p" class="px-2 py-0.5 rounded-md text-[9px] bg-white/[0.04] text-gray-500 border border-white/[0.04]">{{ p }}</span>
              </div>
              <div class="grid grid-cols-6 gap-1 mt-3">
                <div v-for="a in store.attributeList" :key="a.key" class="text-center" :title="a.label+': '+a.value">
                  <div class="text-[10px] mb-0.5">{{ a.icon }}</div>
                  <div class="h-1 rounded-full bg-dark-800 overflow-hidden"><div class="h-full rounded-full transition-all duration-700" :style="{width:a.value+'%',backgroundColor:a.color}"></div></div>
                </div>
              </div>
            </section>

            <!-- Milestones -->
            <section v-if="store.milestones.length">
              <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">🏆 人生里程碑</p>
              <div class="space-y-1.5">
                <div v-for="(m, i) in store.milestones" :key="i" class="flex items-center gap-2 p-2 rounded-xl bg-amber-500/[0.03] border border-amber-500/10">
                  <span class="text-lg shrink-0">{{ m.icon }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-medium text-amber-300/80 truncate">{{ m.title }}</p>
                    <p class="text-[9px] text-dark-500">{{ m.age }}岁 · {{ m.description }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Attributes -->
            <section>
              <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">📊 属性</p>
              <div class="space-y-2">
                <div v-for="attr in store.attributeList" :key="attr.key" class="group">
                  <div class="flex justify-between items-baseline mb-0.5">
                    <span class="text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors">{{ attr.icon }} {{ attr.label }}</span>
                    <span class="text-[10px] font-mono font-bold tabular-nums" :style="{color:attr.color}">{{ attr.value }}</span>
                  </div>
                  <div class="h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.03]">
                    <div class="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden" :style="{width:attr.value+'%',backgroundColor:attr.color}"><div class="absolute inset-0 shimmer-bg"></div></div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Relationships -->
            <section>
              <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">👥 关系 <span class="text-dark-600">({{ store.relationships.length }})</span></p>
              <div v-if="!store.relationships.length" class="rounded-xl border border-dashed border-white/[0.06] p-4 text-center">
                <div class="text-2xl mb-1 opacity-30">👤</div>
                <p class="text-[11px] text-dark-600">等待缘分到来</p>
              </div>
              <div v-else class="space-y-1">
                <div v-for="rel in store.relationships" :key="rel.name" class="flex items-center gap-2 p-2 rounded-xl hover:bg-white/[0.02] transition-all group">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center text-base border" :class="relStyle(rel)">{{ npcEmoji(rel) }}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-medium truncate text-gray-400 group-hover:text-gray-200 transition-colors">{{ rel.name }}</p>
                    <p class="text-[9px] text-dark-600">{{ rel.relation }}</p>
                  </div>
                  <div class="flex gap-px">
                    <div v-for="i in 5" :key="i" class="w-1 h-3 rounded-sm transition-all" :class="i <= Math.round((rel.affection??50)/20) ? relBarColorClass(rel) : 'bg-dark-800'"></div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Timeline -->
            <section>
              <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">📅 时间线</p>
              <div class="relative pl-3 border-l border-white/[0.04] space-y-1 max-h-40 overflow-y-auto">
                <div v-for="(e, i) in recentTimeline" :key="i" class="relative text-[10px] group">
                  <div class="absolute -left-[calc(0.75rem+2px)] top-[4px] w-[4px] h-[4px] rounded-full bg-dark-700 border border-dark-600 group-hover:border-emerald-500/50 transition-colors"></div>
                  <span class="text-lg mr-1">{{ sceneIcon(e.sceneType) }}</span>
                  <span class="text-dark-600 font-mono mr-1">{{ e.age }}岁</span>
                  <span class="text-gray-500 group-hover:text-gray-300 transition-colors">{{ e.title }}</span>
                </div>
                <div v-if="!store.timeline.length" class="text-[10px] text-dark-600 italic">等待开始</div>
              </div>
            </section>
          </div>
        </aside>
      </transition>

      <!-- Main -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto" ref="narrativeContainer">
          <div class="max-w-2xl mx-auto px-5 lg:px-10">

            <!-- Game Over -->
            <div v-if="store.isGameOver" class="text-center py-16">
              <div class="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/[0.06] flex items-center justify-center text-5xl mb-6 shadow-2xl">🕊️</div>
              <h2 class="text-2xl font-bold mb-3 text-gray-200">人生落幕</h2>
              <p class="text-gray-500 mb-2">{{ store.gameOverReason }}</p>
              <p class="text-dark-500 text-sm mb-4">{{ store.character.name }} · {{ store.age }}岁 · {{ store.world.settingLabel }}</p>
              <!-- Milestones recap -->
              <div v-if="store.milestones.length" class="glass-card p-4 mb-4 max-w-sm mx-auto text-left">
                <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-2">🏆 人生里程碑</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(m,i) in store.milestones" :key="i" class="px-2 py-1 rounded-lg text-[10px] bg-amber-500/[0.06] border border-amber-500/10 text-amber-400/70">{{ m.icon }} {{ m.title }}</span>
                </div>
              </div>
              <div class="glass-card p-5 mb-6 max-w-sm mx-auto">
                <div class="grid grid-cols-3 gap-4">
                  <div v-for="a in store.attributeList" :key="a.key" class="text-center">
                    <div class="text-xl mb-1">{{ a.icon }}</div>
                    <div class="text-[10px] text-dark-500">{{ a.label }}</div>
                    <div class="text-base font-bold font-mono" :style="{color:a.color}">{{ a.value }}</div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-center gap-3">
                <button @click="restartLife" class="btn-primary px-6">🔄 重启人生</button>
                <button @click="goHome" class="btn-secondary px-6">🏠 首页</button>
              </div>
            </div>

            <!-- Welcome -->
            <div v-else-if="!store.currentNarrative && store.totalMonths === 0 && !store.isLoading" class="text-center py-14">
              <div class="glass-card p-8 max-w-md mx-auto mb-8 border-gradient">
                <div class="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/[0.08] flex items-center justify-center text-5xl mb-4 animate-breathe shadow-lg" style="animation-duration:4s;">{{ store.ageAvatar }}</div>
                <h2 class="text-xl font-bold mb-1">{{ store.character.name }}</h2>
                <p class="text-gray-500 text-sm mb-2">{{ store.character.personality.join(' · ') }}</p>
                <p class="text-dark-500 text-xs mb-4 leading-relaxed max-w-xs mx-auto">{{ store.character.backstory?.slice(0, 120) }}{{ store.character.backstory?.length > 120 ? '…' : '' }}</p>
                <div class="h-px bg-white/[0.04] mb-4"></div>
                <div class="flex items-center justify-center gap-2 mb-4">
                  <span class="text-lg">{{ worldEmoji }}</span>
                  <span class="text-sm text-gray-400">{{ store.world.settingLabel }}</span>
                  <span class="text-dark-600">·</span>
                  <span class="text-sm">{{ store.seasonLabel.icon }}</span>
                  <span class="text-xs text-dark-400">{{ store.seasonLabel.name }}天</span>
                </div>
                <div class="grid grid-cols-6 gap-2">
                  <div v-for="a in store.attributeList" :key="a.key" class="text-center">
                    <div class="text-base mb-0.5">{{ a.icon }}</div>
                    <div class="text-[10px] text-dark-500">{{ a.label }}</div>
                    <div class="text-sm font-bold font-mono" :style="{color:a.color}">{{ a.value }}</div>
                  </div>
                </div>
              </div>
              <button @click="startFirstTurn" class="btn-primary text-base px-10 py-4 animate-glow">开始第一个月 →</button>
            </div>

            <!-- Story flow -->
            <div v-else class="py-6 space-y-4">
              <!-- Past turns -->
              <div v-for="(entry, idx) in pastEntries" :key="idx">
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.04]"></div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-sm">{{ sceneIcon(entry.sceneType) }}</span>
                    <span class="text-[10px] text-dark-600 font-mono">{{ entry.age }}岁</span>
                    <span class="text-[11px] text-gray-500">{{ entry.title }}</span>
                  </div>
                  <div class="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.04]"></div>
                </div>
                <div class="rounded-xl px-4 py-3 border transition-all cursor-pointer" :class="expandedEntries.has(idx) ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02]'" @click="toggleExpand(idx)">
                  <template v-if="expandedEntries.has(idx)">
                    <p class="text-[13px] text-gray-400 leading-relaxed whitespace-pre-wrap">{{ entry.narrative }}</p>
                    <p v-if="entry.choice" class="mt-2 text-[11px] text-emerald-500/50 italic">↳ {{ entry.choice }}</p>
                    <p class="text-[10px] text-dark-600 mt-2">收起 ↑</p>
                  </template>
                  <template v-else>
                    <p class="text-[13px] text-gray-500 line-clamp-2">{{ entry.narrative }}</p>
                    <p class="text-[10px] text-dark-600 mt-1">展开 ↓</p>
                  </template>
                </div>
              </div>

              <!-- Current turn -->
              <div v-if="displayedNarrative || store.isLoading">
                <div class="flex items-center gap-3 mb-3">
                  <div class="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-white/[0.04]"></div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] text-emerald-400/70 font-mono">{{ store.timeline.length }}</span>
                    <span class="text-sm">{{ store.seasonLabel.icon }}</span>
                    <span class="text-[10px] text-dark-500 font-mono">{{ store.age }}岁 {{ store.month }}月</span>
                    <span v-if="currentTitle" class="text-[11px] text-emerald-400/60 font-medium">{{ currentTitle }}</span>
                  </div>
                  <div class="flex-1 h-px bg-gradient-to-l from-transparent via-emerald-500/15 to-white/[0.04]"></div>
                </div>

                <!-- Narrative bubble -->
                <div v-if="displayedNarrative" class="flex items-start gap-3 mb-3">
                  <div class="shrink-0 mt-1">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl border" :class="moodRingClass" :style="{boxShadow:moodGlow}">{{ moodEmoji }}</div>
                  </div>
                  <div class="flex-1 min-w-0 rounded-2xl bg-white/[0.02] border border-white/[0.05] px-5 py-4">
                    <div class="narrative-text whitespace-pre-wrap">{{ displayedNarrative }}<span v-if="isTyping" class="inline-block w-0.5 h-5 bg-emerald-400/60 animate-pulse ml-0.5 align-text-bottom"></span></div>
                  </div>
                </div>

                <!-- Loading (inline) -->
                <div v-if="store.isLoading" class="flex items-center gap-3 py-4 pl-[52px]">
                  <div class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse">
                    <div class="relative w-7 h-7 shrink-0">
                      <div class="absolute inset-0 rounded-full border border-white/[0.06]"></div>
                      <div class="absolute inset-0 rounded-full border border-transparent border-t-emerald-500/50 animate-spin"></div>
                      <div class="absolute inset-0 flex items-center justify-center text-xs">{{ worldEmoji }}</div>
                    </div>
                    <div>
                      <p class="text-gray-500 text-[12px]">{{ loadingTip }}</p>
                      <p class="text-dark-600 text-[10px]">AI 正在构思...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Options -->
        <transition name="slide-up">
          <div v-if="showOptions" class="relative z-10 border-t border-white/[0.04] bg-dark-950/70 backdrop-blur-2xl p-4 lg:p-5 shrink-0">
            <div class="max-w-2xl mx-auto">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <button v-for="(opt, i) in store.currentOptions" :key="i" @click="makeChoice(opt)" class="glass-card-hover p-3.5 text-[13px] text-left group relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" :style="{background:`linear-gradient(90deg,${themeColor},transparent)`}"></div>
                  <span class="text-gray-400 group-hover:text-emerald-300 transition-colors block pr-6">
                    <span class="inline-flex w-5 h-5 rounded bg-white/[0.04] border border-white/[0.06] items-center justify-center text-[10px] text-dark-400 mr-1.5 font-mono group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all">{{ i + 1 }}</span>
                    {{ opt }}
                  </span>
                </button>
              </div>
              <div class="flex gap-2">
                <input v-model="freeInput" class="input-field text-[13px] flex-1" placeholder="或输入你想做的任何事..." @keyup.enter="submitFreeInput" />
                <button @click="submitFreeInput" class="btn-primary px-5 py-2 text-[13px]" :disabled="!freeInput.trim()">行动</button>
              </div>
            </div>
          </div>
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import wallet from '../services/wallet'
import SettingsPanel from '../components/SettingsPanel.vue'

const router = useRouter()
const store = useGameStore()
const walletState = wallet.state
const walletShort = computed(() => wallet.shortAddress())

const narrativeContainer = ref(null)
const freeInput = ref('')
const displayedNarrative = ref('')
const isTyping = ref(false)
const showSidebar = ref(false)
const showMenu = ref(false)
const showRestartDialog = ref(false)
const showSettings = ref(false)
const isMobile = ref(false)
const notifications = ref([])
const currentTitle = ref('')
const expandedEntries = reactive(new Set())
let typewriterTimer = null
let nc = 0

const loadingTips = [
  '命运的齿轮正在转动……', '人生如戏，好戏将至……', '笔墨未干，故事已起……',
  '星辰排列，命运即将揭晓……', '下一个月会发生什么呢……', '时光流转中……',
  '故事正在编织……', '生活总有意想不到的惊喜……',
]
const loadingTip = ref(loadingTips[0])

// Scene icons
function sceneIcon(type) {
  const map = { work:'💼', love:'💕', study:'📚', adventure:'⚔️', family:'🏠', health:'🏥', social:'🎉', crisis:'⚡', leisure:'☕', milestone:'🏆' }
  return map[type] || '📖'
}

// Computed
const worldEmoji = computed(() => ({modern:'🏙️',ancient:'🏯',fantasy:'🐉',scifi:'🚀'})[store.world.setting] || '🌍')
const sceneClass = computed(() => 'scene-' + (store.world.setting || 'modern'))
const themeColor = computed(() => ({modern:'#3b82f6',ancient:'#d97706',fantasy:'#8b5cf6',scifi:'#06b6d4'})[store.world.setting] || '#10b981')
const ambientColor = computed(() => ({modern:'radial-gradient(circle,rgba(59,130,246,0.05),transparent 70%)',ancient:'radial-gradient(circle,rgba(217,119,6,0.05),transparent 70%)',fantasy:'radial-gradient(circle,rgba(139,92,246,0.05),transparent 70%)',scifi:'radial-gradient(circle,rgba(6,182,212,0.05),transparent 70%)'})[store.world.setting] || 'transparent')
const ambientColor2 = computed(() => ({modern:'radial-gradient(circle,rgba(16,185,129,0.03),transparent 70%)',ancient:'radial-gradient(circle,rgba(239,68,68,0.03),transparent 70%)',fantasy:'radial-gradient(circle,rgba(236,72,153,0.03),transparent 70%)',scifi:'radial-gradient(circle,rgba(16,185,129,0.03),transparent 70%)'})[store.world.setting] || 'transparent')

const moodEmoji = computed(() => {
  const m = store.currentMood
  const map = [[['开心','喜悦','愉悦','快乐'],'😄'],[['幸福','满足','感动','温暖'],'🥰'],[['兴奋','激动'],'🤩'],[['期待','好奇','憧憬'],'😊'],[['平静','安宁','淡然'],'😌'],[['疲惫','劳累'],'😩'],[['悲伤','难过','失落','沮丧'],'😢'],[['愤怒','生气'],'😠'],[['焦虑','不安','紧张'],'😰'],[['恐惧','害怕'],'😨'],[['迷茫','困惑'],'🤔'],[['孤独','寂寞'],'😔'],[['自信','骄傲'],'😎'],[['绝望','崩溃'],'😭']]
  for (const [kw,e] of map) if (kw.some(k => m.includes(k))) return e
  return store.ageAvatar
})
const moodParticle = computed(() => {
  const m = store.currentMood
  const map = [[['开心','喜悦','快乐'],'✨'],[['幸福','满足','温暖','感动'],'💕'],[['兴奋','激动'],'🔥'],[['悲伤','难过','失落'],'💧'],[['愤怒','生气'],'💢'],[['焦虑','紧张'],'💦'],[['期待','好奇'],'💫'],[['自信'],'⭐']]
  for (const [kw,e] of map) if (kw.some(k => m.includes(k))) return e
  return ''
})
const moodGlow = computed(() => {
  const m = store.currentMood
  const pos = ['开心','幸福','兴奋','满足','期待','喜悦','愉悦','自信','感动','温暖']
  const neg = ['悲伤','沮丧','愤怒','焦虑','恐惧','绝望','孤独','疲惫','迷茫','不安']
  if (pos.some(k => m.includes(k))) return '0 4px 20px rgba(16,185,129,0.15)'
  if (neg.some(k => m.includes(k))) return '0 4px 20px rgba(239,68,68,0.15)'
  return '0 4px 16px rgba(0,0,0,0.2)'
})
const moodRingClass = computed(() => {
  const m = store.currentMood
  const pos = ['开心','幸福','兴奋','满足','期待','喜悦','愉悦','自信','感动','温暖']
  const neg = ['悲伤','沮丧','愤怒','焦虑','恐惧','绝望','孤独','疲惫','迷茫','不安']
  if (pos.some(k => m.includes(k))) return 'bg-emerald-500/[0.08] border-emerald-500/30'
  if (neg.some(k => m.includes(k))) return 'bg-rose-500/[0.08] border-rose-500/30'
  return 'bg-white/[0.03] border-white/[0.06]'
})
const moodBadgeClass = computed(() => {
  const m = store.currentMood
  const pos = ['开心','幸福','兴奋','满足','期待','喜悦','愉悦','自信','感动','温暖']
  const neg = ['悲伤','沮丧','愤怒','焦虑','恐惧','绝望','孤独','疲惫','迷茫','不安']
  if (pos.some(k => m.includes(k))) return 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15'
  if (neg.some(k => m.includes(k))) return 'bg-rose-500/10 text-rose-400/80 border border-rose-500/15'
  return 'bg-white/[0.04] text-gray-500 border border-white/[0.05]'
})
const lifeStageColor = computed(() => ({baby:'bg-pink-500',child:'bg-blue-500',youth:'bg-emerald-500',middle:'bg-amber-500',elder:'bg-purple-500'})[store.lifeStage.key]+' text-white')
const recentTimeline = computed(() => [...store.timeline].reverse().slice(0, 30))
const pastEntries = computed(() => store.timeline.length <= 1 ? [] : store.timeline.slice(0, -1))
const showOptions = computed(() => store.currentOptions.length > 0 && !store.isLoading && !store.isGameOver && !isTyping.value && store.currentNarrative)

function npcEmoji(rel) {
  const r = (rel.relation||'').toLowerCase()
  if (r.includes('恋')||r.includes('爱')||r.includes('伴侣')||r.includes('妻')||r.includes('夫')) return '💑'
  if (r.includes('父')||r.includes('爸')) return '👨‍🦳'
  if (r.includes('母')||r.includes('妈')) return '👩‍🦳'
  if (r.includes('兄')||r.includes('弟')||r.includes('姐')||r.includes('妹')) return '👫'
  if (r.includes('老师')||r.includes('师')) return '🧑‍🏫'
  if (r.includes('老板')||r.includes('上司')||r.includes('领导')) return '🧑‍💼'
  if (r.includes('同事')||r.includes('同学')) return '🤝'
  if (r.includes('朋友')||r.includes('好友')) return '😊'
  if (r.includes('敌')||r.includes('对手')) return '😤'
  return '👤'
}
function relStyle(r) { const a=r.affection??50; if(a>=70) return 'bg-emerald-500/[0.08] border-emerald-500/20'; if(a>=40) return 'bg-white/[0.03] border-white/[0.06]'; return 'bg-rose-500/[0.08] border-rose-500/20' }
function relBarColorClass(r) { const a=r.affection??50; return a>=70?'bg-emerald-500':a>=40?'bg-gray-500':'bg-rose-500' }
function toggleExpand(i) { expandedEntries.has(i) ? expandedEntries.delete(i) : expandedEntries.add(i) }

function restartLife() { showMenu.value=false; showRestartDialog.value=true }
function confirmRestart() { showRestartDialog.value=false; store.saveGame(); router.push('/create') }
function goHome() { showMenu.value=false; store.saveGame(); router.push('/') }
function openSettings() { showMenu.value=false; showSettings.value=true }

// Notifications
const prevAttrs = ref({...store.attributes})
watch(() => ({...store.attributes}), nv => {
  const meta = {health:['健康','❤️'],intelligence:['智力','🧠'],charisma:['魅力','✨'],wealth:['财富','💰'],happiness:['幸福','😊'],social:['社交','👥']}
  for (const k of Object.keys(nv)) {
    const d = nv[k]-(prevAttrs.value[k]??nv[k])
    if (d!==0 && meta[k]) { const id=++nc; notifications.value.push({id,label:meta[k][0],icon:meta[k][1],value:d}); setTimeout(()=>{notifications.value=notifications.value.filter(n=>n.id!==id)},1800) }
  }
  prevAttrs.value={...nv}
},{deep:true})

// Milestone notifications
watch(() => store.milestones.length, (nv, ov) => {
  if (nv > (ov||0)) {
    const m = store.milestones[store.milestones.length-1]
    const id = ++nc
    notifications.value.push({ id, label: m.title, icon: m.icon, type: 'milestone' })
    setTimeout(() => { notifications.value = notifications.value.filter(n => n.id !== id) }, 3000)
  }
})

// Typewriter
watch(() => store.currentNarrative, v => {
  if (!v) return
  if (typewriterTimer) clearInterval(typewriterTimer)
  const latest = store.timeline[store.timeline.length-1]
  currentTitle.value = latest?.title || ''
  displayedNarrative.value = ''
  isTyping.value = true
  let i = 0
  const speed = store.settings.textSpeed || 30
  typewriterTimer = setInterval(() => {
    if (i < v.length) { displayedNarrative.value += v[i]; i++; if (i%12===0) scrollBottom() }
    else { clearInterval(typewriterTimer); typewriterTimer=null; isTyping.value=false; scrollBottom() }
  }, speed)
})

// Loading tip rotation
watch(() => store.isLoading, v => { if (v) loadingTip.value = loadingTips[Math.floor(Math.random()*loadingTips.length)] })

onUnmounted(() => { if (typewriterTimer) clearInterval(typewriterTimer) })
onMounted(() => {
  checkMobile(); window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleKey)
})
onUnmounted(() => { window.removeEventListener('resize', checkMobile); window.removeEventListener('keydown', handleKey) })

function checkMobile() { isMobile.value = window.innerWidth < 1024 }

// Keyboard shortcuts
function handleKey(e) {
  if (showSettings.value || showRestartDialog.value || showMenu.value) return
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  if (e.key === 'Escape') { showSettings.value = true; return }
  if (!showOptions.value) return
  const num = parseInt(e.key)
  if (num >= 1 && num <= 3 && store.currentOptions[num-1]) {
    makeChoice(store.currentOptions[num-1])
  }
}

function scrollBottom() { nextTick(() => { if (narrativeContainer.value) narrativeContainer.value.scrollTop = narrativeContainer.value.scrollHeight }) }
async function startFirstTurn() { await store.playTurn() }
async function makeChoice(o) { await store.playTurn(o) }
async function submitFreeInput() { if (!freeInput.value.trim()) return; const v=freeInput.value.trim(); freeInput.value=''; await store.playTurn(v) }
</script>
