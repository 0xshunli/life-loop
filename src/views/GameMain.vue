<template>
  <div class="h-screen flex flex-col overflow-hidden relative transition-all duration-[2000ms]" :style="dynamicBgStyle">
    <!-- Ambient orbs (dynamic, large & vivid) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-20 -left-10 w-[700px] h-[700px] rounded-full blur-[120px] animate-breathe transition-all duration-[2500ms]" :style="{ background: dynamicOrb1, animationDuration: '8s' }" />
      <div class="absolute -bottom-20 -right-10 w-[600px] h-[600px] rounded-full blur-[100px] animate-breathe transition-all duration-[2500ms]" :style="{ background: dynamicOrb2, animationDelay: '3s', animationDuration: '12s' }" />
      <div class="absolute top-1/3 right-1/3 w-[500px] h-[500px] rounded-full blur-[140px] animate-breathe transition-all duration-[2500ms]" :style="{ background: dynamicOrb3, animationDelay: '6s', animationDuration: '15s' }" />
    </div>

    <!-- Vignette overlay -->
    <div class="scene-vignette"></div>

    <!-- World particles -->
    <div v-if="store.settings.enableParticles" class="world-particles" :class="'wp-' + (store.world.setting || 'modern')">
      <div v-for="p in worldParticles" :key="p.id" class="wp"
        :style="{ left: p.x + '%', '--dur': p.dur + 's', '--delay': p.delay + 's', '--drift': p.drift + 'px', '--rot': p.rot + 'deg', '--opacity': p.opacity, '--glow-color': p.glow, '--size': p.size + 'px', fontSize: p.size + 'px' }"
        v-text="p.content" />
    </div>

    <!-- Weather overlay -->
    <div v-if="currentWeather === '雨'" class="weather-rain">
      <div v-for="d in rainDrops" :key="d.id" class="drop" :style="{ left: d.x + '%', height: d.h + 'px', '--dur': d.dur + 's', '--delay': d.delay + 's' }" />
    </div>
    <div v-if="currentWeather === '雪'" class="weather-snow">
      <div v-for="f in snowFlakes" :key="f.id" class="flake" :style="{ left: f.x + '%', width: f.size + 'px', height: f.size + 'px', '--dur': f.dur + 's', '--delay': f.delay + 's', '--drift': f.drift + 'px' }" />
    </div>

    <!-- Scene decoration layer — floating themed elements -->
    <div v-if="store.settings.enableParticles && store.isPlaying" class="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      <div v-for="d in sceneDecorations" :key="d.id"
        class="absolute text-2xl sm:text-3xl select-none animate-scene-deco opacity-0"
        :style="{
          left: d.x + '%', top: d.y + '%',
          '--deco-dur': d.dur + 's', '--deco-delay': d.delay + 's',
          '--deco-drift-x': d.dx + 'px', '--deco-drift-y': d.dy + 'px',
          fontSize: d.size + 'px',
          filter: `blur(${d.blur}px)`,
        }">{{ d.emoji }}</div>
    </div>

    <!-- Notifications -->
    <TransitionGroup name="fade" tag="div" class="fixed top-16 right-4 z-[70] space-y-2 pointer-events-none">
      <div v-for="n in notifications" :key="n.id" class="animate-slide-in px-3.5 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md border"
        :class="n.type === 'milestone' ? 'bg-amber-500/15 border-amber-500/20 text-amber-400' : n.value > 0 ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/15 border-rose-500/20 text-rose-400'">
        {{ n.icon }} {{ n.label }} {{ n.value !== undefined ? ((n.value > 0 ? '+' : '') + n.value) : '' }}
      </div>
    </TransitionGroup>

    <!-- Menu overlay -->
    <transition name="fade">
      <div v-if="showMenu" class="fixed inset-0 z-[80]" @click="showMenu = false">
        <div class="absolute right-4 top-12 w-56 glass-card p-1.5 shadow-2xl border border-white/[0.08] animate-slide-in" @click.stop>
          <button @click="restartLife" class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2.5">🔄 重启人生</button>
          <button @click="openDashboard" class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2.5">📊 人生总览</button>
          <button @click="openSettings" class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2.5">⚙️ 设置</button>
          <button @click="goHome" class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2.5">🏠 回到首页</button>
          <button @click="shareToTwitter('progress')" class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] text-[#1d9bf0] hover:bg-[#1d9bf0]/[0.08] transition-all flex items-center gap-2.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            分享到 X
          </button>
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

    <!-- Panels -->
    <SettingsPanel :show="showSettings" @close="showSettings = false" />
    <LifeDashboard :show="showDashboard" @close="showDashboard = false" />

    <!-- ═══ Top Bar ═══ -->
    <header class="relative z-10 bg-dark-950/60 backdrop-blur-2xl border-b border-white/[0.04] px-4 sm:px-5 py-2 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <button @click="showSidebar = true" class="lg:hidden btn-ghost p-2 -ml-2">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="relative">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all duration-500" :class="moodRingClass" :style="{ boxShadow: moodGlow }">{{ moodEmoji }}</div>
          <div class="absolute -bottom-0.5 -right-0.5 text-[7px] w-3.5 h-3.5 rounded-full border-2 border-dark-950 flex items-center justify-center font-bold" :class="lifeStageColor">{{ store.lifeStage.label[0] }}</div>
        </div>
        <div>
          <h1 class="font-bold text-sm leading-tight">{{ store.character.name }}</h1>
          <p class="text-[10px] text-gray-600 flex items-center gap-1 flex-wrap">
            {{ store.yearMonth }}
            <span class="text-dark-600">·</span>
            <span>{{ store.seasonLabel.icon }}</span>
            <span :class="'text-'+store.lifeStage.color+'-500/70'">{{ store.lifeStage.label }}</span>
            <template v-if="store.career"><span class="text-dark-600">·</span><span class="text-dark-400">{{ store.career }}</span></template>
            <template v-if="currentWeather"><span class="text-dark-600">·</span><span>{{ weatherEmoji }}</span></template>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] px-2 py-1 rounded-lg font-medium" :class="moodBadgeClass">{{ store.currentMood }}</span>
        <button @click="showDashboard = true" class="hidden sm:flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300 transition-all font-mono cursor-pointer">Lv.{{ store.lifeScore }}</button>
        <button @click="showMenu = !showMenu" class="btn-ghost p-2 text-gray-500 hover:text-gray-300">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
        </button>
      </div>
    </header>

    <!-- ═══ Body ═══ -->
    <div class="relative z-[5] flex flex-1 overflow-hidden">
      <transition name="drawer-overlay"><div v-if="showSidebar" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" @click="showSidebar = false" /></transition>

      <!-- ═══ Sidebar ═══ -->
      <transition name="drawer">
        <aside v-show="showSidebar || !isMobile" :class="['w-72 bg-dark-950/80 backdrop-blur-2xl border-r border-white/[0.04] overflow-y-auto flex flex-col shrink-0', showSidebar ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex']">
          <div v-if="showSidebar" class="flex items-center justify-between p-4 border-b border-white/[0.04] lg:hidden">
            <span class="text-xs font-bold text-gray-400">角色面板</span>
            <button @click="showSidebar = false" class="btn-ghost p-1 text-xs text-gray-500">✕</button>
          </div>
          <div class="p-4 flex-1 overflow-y-auto space-y-5">
            <!-- Portrait card with age-themed visuals -->
            <section class="rounded-2xl border border-white/[0.05] overflow-hidden relative">
              <!-- Age-themed banner background -->
              <div class="relative h-24 overflow-hidden transition-all duration-1000" :style="{ background: portraitBannerBg }">
                <!-- Floating age-themed emojis in banner -->
                <div class="absolute inset-0 flex items-center justify-around opacity-20 text-2xl">
                  <span v-for="(e, i) in ageDecoEmojis.slice(0, 4)" :key="i" class="animate-float" :style="{ animationDelay: i * 0.8 + 's', animationDuration: (3 + i) + 's' }">{{ e }}</span>
                </div>
                <!-- Character avatar (large, centered) -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="relative">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border-2 transition-all duration-500 shadow-xl backdrop-blur-sm bg-black/20" :class="moodRingClass" :style="{ boxShadow: moodGlow }">{{ store.ageAvatar }}</div>
                    <div v-if="moodParticle" class="absolute -top-2 -right-2 text-base animate-bounce" style="animation-duration:2s;">{{ moodParticle }}</div>
                    <!-- Life stage badge -->
                    <div class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold border-2 border-dark-950" :class="lifeStageColor">
                      {{ store.lifeStage.label }}
                    </div>
                  </div>
                </div>
                <!-- Season + weather overlay -->
                <div class="absolute top-2 right-2 flex items-center gap-1 text-sm opacity-70">
                  <span>{{ store.seasonLabel.icon }}</span>
                  <span v-if="currentWeather">{{ weatherEmoji }}</span>
                </div>
                <!-- Bottom fade -->
                <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-dark-950/90 to-transparent"></div>
              </div>
              <!-- Info section -->
              <div class="p-4 -mt-2 relative bg-gradient-to-b from-white/[0.03] to-transparent text-center">
                <h3 class="font-bold text-base text-gray-200">{{ store.character.name }}</h3>
                <p class="text-[10px] text-gray-500 mt-0.5">{{ store.character.gender }} · {{ store.age }}岁</p>
                <p v-if="store.career" class="text-[10px] text-emerald-400/60 mt-0.5">💼 {{ store.career }}</p>
                <p v-if="store.location" class="text-[10px] text-dark-400 mt-0.5">📍 {{ store.location }}</p>
                <div class="flex justify-center gap-1.5 mt-2 flex-wrap">
                  <span v-for="p in store.character.personality" :key="p" class="px-2 py-0.5 rounded-md text-[9px] bg-white/[0.04] text-gray-500 border border-white/[0.04]">{{ p }}</span>
                </div>
                <!-- Mini attribute bars -->
                <div class="grid grid-cols-6 gap-1 mt-3">
                  <div v-for="a in store.attributeList" :key="a.key" class="text-center" :title="a.label+': '+a.value">
                    <div class="text-[10px] mb-0.5">{{ a.icon }}</div>
                    <div class="h-1 rounded-full bg-dark-800 overflow-hidden"><div class="h-full rounded-full transition-all duration-700" :style="{width:a.value+'%',backgroundColor:a.color}"></div></div>
                  </div>
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

            <!-- Attributes with sparklines -->
            <section>
              <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">📊 属性</p>
              <div class="space-y-2.5">
                <div v-for="attr in store.attributeList" :key="attr.key" class="group">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors">{{ attr.icon }} {{ attr.label }}</span>
                    <div class="flex items-center gap-2">
                      <!-- Mini sparkline -->
                      <svg class="w-12 h-3 opacity-40 group-hover:opacity-80 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <polyline :points="miniSparkline(attr.key)" fill="none" :stroke="attr.color" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
                      </svg>
                      <span class="text-[10px] font-mono font-bold tabular-nums w-6 text-right" :style="{color:attr.color}">{{ attr.value }}</span>
                    </div>
                  </div>
                  <div class="h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.03]">
                    <div class="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden" :style="{width:attr.value+'%',backgroundColor:attr.color}"><div class="absolute inset-0 shimmer-bg"></div></div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Family -->
            <section v-if="store.family.spouse || store.family.children.length">
              <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-3">👨‍👩‍👧‍👦 家庭</p>
              <div class="rounded-xl border border-white/[0.05] bg-gradient-to-b from-rose-500/[0.03] to-transparent p-3 space-y-2">
                <div v-if="store.family.spouse" class="flex items-center gap-2">
                  <span class="text-lg">💑</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-medium text-rose-300/80">{{ store.family.spouse }}</p>
                    <p class="text-[9px] text-dark-600">配偶</p>
                  </div>
                </div>
                <div v-for="child in store.family.children" :key="child.name" class="flex items-center gap-2">
                  <span class="text-lg">{{ child.age < 3 ? '👶' : child.gender === '女' ? '👧' : '👦' }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-medium text-amber-300/70">{{ child.name }}</p>
                    <p class="text-[9px] text-dark-600">{{ child.gender }} · {{ child.age }}岁</p>
                  </div>
                  <div v-if="child.inheritedTraits" class="flex gap-0.5">
                    <span v-for="t in child.inheritedTraits.slice(0,2)" :key="t" class="text-[8px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400/60 border border-amber-500/10">{{ t }}</span>
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
                    <p class="text-[9px] text-dark-600">
                      {{ rel.relation }}
                      <span v-if="rel.personality" class="text-dark-500"> · {{ rel.personality }}</span>
                      <span v-if="rel.age" class="text-dark-500"> · {{ rel.age }}岁</span>
                    </p>
                    <p v-if="rel.status" class="text-[8px] text-emerald-500/50 mt-0.5">{{ rel.status }}</p>
                  </div>
                  <div class="flex gap-px">
                    <div v-for="i in 5" :key="i" class="w-1 h-3 rounded-sm transition-all" :class="i <= Math.round((rel.affection??50)/20) ? relBarColorClass(rel) : 'bg-dark-800'"></div>
                  </div>
                </div>
              </div>
              <!-- NPC Bonds -->
              <div v-if="store.npcBonds.length" class="mt-3 space-y-1">
                <p class="text-[8px] text-dark-600 uppercase tracking-wider mb-1">NPC 关系网</p>
                <div v-for="(bond, bi) in store.npcBonds" :key="bi" class="flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-lg" :class="bond.tension > 0 ? 'bg-emerald-500/[0.04] text-emerald-400/50' : bond.tension < 0 ? 'bg-rose-500/[0.04] text-rose-400/50' : 'bg-white/[0.02] text-dark-500'">
                  <span class="font-medium text-gray-400">{{ bond.from }}</span>
                  <span>{{ bond.tension > 2 ? '💕' : bond.tension > 0 ? '🤝' : bond.tension < -2 ? '⚔️' : bond.tension < 0 ? '😤' : '↔' }}</span>
                  <span class="font-medium text-gray-400">{{ bond.to }}</span>
                  <span class="text-[8px] ml-auto">{{ bond.type }}</span>
                </div>
              </div>
            </section>

            <!-- Timeline -->
            <section>
              <div class="flex items-center justify-between mb-3">
                <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em]">📅 时间线</p>
                <span v-if="store.timeline.length" class="text-[9px] text-dark-600 font-mono">{{ store.timeline.length }} 回合</span>
              </div>
              <div v-if="!store.timeline.length" class="rounded-xl border border-dashed border-white/[0.06] p-4 text-center">
                <div class="text-2xl mb-1 opacity-30">⏳</div>
                <p class="text-[11px] text-dark-600">等待故事开始</p>
              </div>
              <div v-else class="relative max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                <!-- Age group headers + entries -->
                <template v-for="(group, gi) in timelineGroups" :key="gi">
                  <!-- Age divider -->
                  <div class="flex items-center gap-2 mb-1.5" :class="gi > 0 ? 'mt-3' : ''">
                    <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs border shrink-0"
                      :style="{ backgroundColor: timelineAgeColor(group.age) + '15', borderColor: timelineAgeColor(group.age) + '30', color: timelineAgeColor(group.age) }">
                      {{ group.age }}
                    </div>
                    <div class="flex-1 h-px" :style="{ background: `linear-gradient(90deg, ${timelineAgeColor(group.age)}30, transparent)` }"></div>
                    <span class="text-[8px] text-dark-600">{{ group.entries.length }} 事件</span>
                  </div>
                  <!-- Entries for this age -->
                  <div class="relative ml-3 pl-3 border-l border-white/[0.05] space-y-1 mb-1">
                    <div v-for="(e, ei) in group.entries" :key="ei"
                      class="relative py-1.5 px-2 rounded-lg text-[10px] group cursor-default transition-all hover:bg-white/[0.03]">
                      <!-- Timeline node -->
                      <div class="absolute -left-[calc(0.75rem+3px)] top-[10px] w-[7px] h-[7px] rounded-full border-2 transition-all"
                        :style="{ borderColor: sceneColor(e.sceneType), backgroundColor: ei === 0 && gi === 0 ? sceneColor(e.sceneType) : 'transparent' }"></div>
                      <!-- Content -->
                      <div class="flex items-start gap-1.5">
                        <span class="text-sm shrink-0 mt-px">{{ sceneIcon(e.sceneType) }}</span>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-1 flex-wrap">
                            <span class="font-medium text-gray-400 group-hover:text-gray-200 transition-colors">{{ e.title }}</span>
                            <span v-if="e.weather" class="text-xs opacity-40">{{ weatherMap[e.weather] || '' }}</span>
                            <span v-if="e.mood" class="text-[8px] px-1 py-0.5 rounded bg-white/[0.04] text-dark-500">{{ e.mood }}</span>
                          </div>
                          <p v-if="e.choice" class="text-[9px] text-emerald-500/40 mt-0.5 truncate">↳ {{ e.choice }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </section>

            <!-- Dashboard shortcut -->
            <button @click="showDashboard = true" class="w-full glass-card-hover p-3 text-center text-[11px] text-gray-500 flex items-center justify-center gap-2">
              📊 查看人生总览
            </button>
          </div>
        </aside>
      </transition>

      <!-- ═══ Main Content ═══ -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto" ref="narrativeContainer">
          <div class="max-w-2xl mx-auto px-5 lg:px-10">

            <!-- Game Over -->
            <div v-if="store.isGameOver" class="text-center py-16">
              <div class="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/[0.06] flex items-center justify-center text-5xl mb-6 shadow-2xl">🕊️</div>
              <h2 class="text-2xl font-bold mb-3 text-gray-200">人生落幕</h2>
              <p class="text-gray-500 mb-2">{{ store.gameOverReason }}</p>
              <p class="text-dark-500 text-sm mb-6">{{ store.character.name }} · {{ store.age }}岁 · {{ store.world.settingLabel }}</p>

              <!-- Final summary cards -->
              <div class="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
                <div class="glass-card p-3 text-center">
                  <p class="text-2xl font-bold font-mono text-emerald-400">{{ store.totalMonths }}</p>
                  <p class="text-[9px] text-dark-500 uppercase tracking-wider">经历月份</p>
                </div>
                <div class="glass-card p-3 text-center">
                  <p class="text-2xl font-bold font-mono text-amber-400">{{ store.milestones.length }}</p>
                  <p class="text-[9px] text-dark-500 uppercase tracking-wider">人生里程碑</p>
                </div>
                <div class="glass-card p-3 text-center">
                  <p class="text-2xl font-bold font-mono text-rose-400">{{ store.relationships.length }}</p>
                  <p class="text-[9px] text-dark-500 uppercase tracking-wider">结识之人</p>
                </div>
                <div class="glass-card p-3 text-center">
                  <p class="text-2xl font-bold font-mono text-blue-400">{{ store.lifeStats.totalChoices }}</p>
                  <p class="text-[9px] text-dark-500 uppercase tracking-wider">人生抉择</p>
                </div>
              </div>

              <div v-if="store.milestones.length" class="glass-card p-4 mb-6 max-w-md mx-auto text-left">
                <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-2">🏆 人生里程碑</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(m,i) in store.milestones" :key="i" class="px-2 py-1 rounded-lg text-[10px] bg-amber-500/[0.06] border border-amber-500/10 text-amber-400/70">{{ m.icon }} {{ m.title }}</span>
                </div>
              </div>

              <!-- Family summary -->
              <div v-if="store.family.spouse || store.family.children.length" class="glass-card p-4 mb-6 max-w-md mx-auto text-left">
                <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-2">👨‍👩‍👧‍👦 家庭</p>
                <div class="space-y-1.5">
                  <p v-if="store.family.spouse" class="text-[11px] text-rose-300/70">💑 配偶：{{ store.family.spouse }}</p>
                  <div v-for="child in store.family.children" :key="child.name" class="text-[11px] text-amber-300/70">
                    {{ child.gender === '女' ? '👧' : '👦' }} {{ child.name }}（{{ child.age }}岁）
                    <span v-if="child.inheritedTraits" class="text-dark-500 text-[9px]"> · 继承: {{ child.inheritedTraits.join('、') }}</span>
                  </div>
                </div>
              </div>

              <div class="glass-card p-5 mb-6 max-w-md mx-auto">
                <div class="grid grid-cols-3 gap-4">
                  <div v-for="a in store.attributeList" :key="a.key" class="text-center">
                    <div class="text-xl mb-1">{{ a.icon }}</div>
                    <div class="text-[10px] text-dark-500">{{ a.label }}</div>
                    <div class="text-base font-bold font-mono" :style="{color:a.color}">{{ a.value }}</div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-center gap-3 flex-wrap">
                <button @click="showDashboard = true" class="btn-secondary px-6">📊 详细总览</button>
                <button @click="shareToTwitter('gameover')" class="px-6 py-2.5 rounded-xl text-sm font-medium bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 text-[#1d9bf0] hover:bg-[#1d9bf0]/20 transition-all flex items-center gap-2">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  分享到 X
                </button>
                <button @click="restartLife" class="btn-primary px-6">🔄 重启人生</button>
                <button @click="goHome" class="btn-secondary px-6">🏠 首页</button>
              </div>
            </div>

            <!-- Welcome -->
            <div v-else-if="!store.currentNarrative && store.totalMonths === 0 && !store.isLoading" class="text-center py-14">
              <div class="glass-card max-w-md mx-auto mb-8 border-gradient overflow-hidden">
                <!-- Character card banner -->
                <div class="relative h-28 overflow-hidden" :style="{ background: sceneBannerGradients.family }">
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-6xl drop-shadow-lg animate-float">{{ store.ageAvatar }}</span>
                  </div>
                  <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[rgba(10,15,26,0.95)] to-transparent"></div>
                  <div class="absolute top-3 right-3 text-2xl opacity-60">{{ worldEmoji }}</div>
                </div>
                <div class="p-6 -mt-4 relative">
                  <h2 class="text-xl font-bold mb-1">{{ store.character.name }}</h2>
                  <p class="text-dark-400 text-xs mb-2">{{ store.age }}岁 · {{ store.lifeStage.label }} · {{ store.world.settingLabel }}</p>
                  <div class="flex justify-center gap-1.5 mb-3">
                    <span v-for="p in store.character.personality" :key="p" class="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15">{{ p }}</span>
                  </div>
                  <p class="text-dark-500 text-xs mb-4 leading-relaxed max-w-xs mx-auto">{{ store.character.backstory?.slice(0, 140) }}{{ store.character.backstory?.length > 140 ? '…' : '' }}</p>
                  <div class="h-px bg-white/[0.04] mb-4"></div>
                  <div class="flex items-center justify-center gap-2 mb-4">
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
              </div>
              <button @click="startFirstTurn" class="btn-primary text-base px-10 py-4 animate-glow">开始第一个月 →</button>
              <p class="text-[10px] text-dark-600 mt-4">提示：按 <span class="font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">1</span> <span class="font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">2</span> <span class="font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">3</span> 快速选择 · <span class="font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">Esc</span> 设置</p>
            </div>

            <!-- ═══ Story Flow ═══ -->
            <div v-else class="py-6 space-y-4">
              <!-- Past turns (collapsed) -->
              <div v-for="(entry, idx) in pastEntries" :key="idx">
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.04]"></div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-sm">{{ sceneIcon(entry.sceneType) }}</span>
                    <span class="text-[10px] text-dark-600 font-mono">{{ entry.age }}岁</span>
                    <span class="text-[11px] text-gray-500">{{ entry.title }}</span>
                    <span v-if="entry.weather" class="text-xs opacity-50">{{ weatherMap[entry.weather] || '' }}</span>
                  </div>
                  <div class="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.04]"></div>
                </div>
                <div class="rounded-xl px-4 py-3 border transition-all cursor-pointer" :class="[expandedEntries.has(idx) ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02]', 'scene-header-' + (entry.sceneType || 'leisure')]" @click="toggleExpand(idx)">
                  <template v-if="expandedEntries.has(idx)">
                    <NarrativeRenderer :text="entry.narrative" class="text-[13px] !leading-relaxed" style="--nr-size: 13px;" />
                    <p v-if="entry.choice" class="mt-2 text-[11px] text-emerald-500/50 italic">↳ {{ entry.choice }}</p>
                    <p class="text-[10px] text-dark-600 mt-2 select-none">收起 ↑</p>
                  </template>
                  <template v-else>
                    <p class="text-[13px] text-gray-500 line-clamp-2">{{ entry.narrative }}</p>
                    <p class="text-[10px] text-dark-600 mt-1 select-none">展开 ↓</p>
                  </template>
                </div>
              </div>

              <!-- Current turn -->
              <div v-if="displayedNarrative || store.isLoading">
                <!-- Turn header -->
                <div class="flex items-center gap-3 mb-3">
                  <div class="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-white/[0.04]"></div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] text-emerald-400/70 font-mono">{{ store.timeline.length }}</span>
                    <span class="text-sm">{{ store.seasonLabel.icon }}</span>
                    <span class="text-[10px] text-dark-500 font-mono">{{ store.age }}岁 {{ store.month }}月</span>
                    <span v-if="currentTitle" class="text-[11px] text-emerald-400/60 font-medium">{{ currentTitle }}</span>
                    <span v-if="currentWeather" class="text-sm opacity-50">{{ weatherEmoji }}</span>
                  </div>
                  <div class="flex-1 h-px bg-gradient-to-l from-transparent via-emerald-500/15 to-white/[0.04]"></div>
                </div>

                <!-- Scene illustration banner -->
                <div v-if="displayedNarrative" class="mb-3 rounded-2xl overflow-hidden border border-white/[0.05]">
                  <!-- Scene top banner with gradient illustration -->
                  <div class="relative h-16 overflow-hidden" :style="sceneBannerStyle">
                    <div class="absolute inset-0 flex items-center justify-between px-5">
                      <div class="flex items-center gap-2">
                        <span class="text-2xl drop-shadow-lg">{{ sceneIcon(currentSceneType) }}</span>
                        <div>
                          <p class="text-[11px] font-bold text-white/80 drop-shadow">{{ currentTitle }}</p>
                          <p class="text-[9px] text-white/50">{{ store.yearMonth }} · {{ store.seasonLabel.name }}天 {{ weatherEmoji }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-lg drop-shadow">{{ moodEmoji }}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white/70">{{ store.currentMood }}</span>
                      </div>
                    </div>
                    <!-- Decorative elements -->
                    <div class="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[rgba(10,15,26,0.95)] to-transparent"></div>
                  </div>
                  <!-- Narrative content -->
                  <div class="flex items-start gap-3 px-5 py-4 bg-white/[0.02]" :class="'scene-header-' + currentSceneType">
                    <div class="shrink-0 mt-0.5">
                      <div class="w-9 h-9 rounded-lg flex items-center justify-center text-lg border" :class="moodRingClass" :style="{boxShadow:moodGlow}">{{ store.ageAvatar }}</div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <NarrativeRenderer :text="displayedNarrative" :typing="isTyping" />
                    </div>
                  </div>
                </div>

                <!-- Loading indicator -->
                <div v-if="store.isLoading" class="flex items-center gap-3 py-4 pl-[52px]">
                  <div class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div class="relative w-7 h-7 shrink-0">
                      <div class="absolute inset-0 rounded-full border border-white/[0.06]"></div>
                      <div class="absolute inset-0 rounded-full border border-transparent border-t-emerald-500/50 animate-spin"></div>
                      <div class="absolute inset-0 flex items-center justify-center text-xs">{{ worldEmoji }}</div>
                    </div>
                    <div>
                      <p class="text-gray-500 text-[12px] animate-pulse-soft">{{ loadingTip }}</p>
                      <p class="text-dark-600 text-[10px]">AI 正在构思你的故事...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Options Bar ═══ -->
        <transition name="slide-up">
          <div v-if="showOptions" class="relative z-10 border-t border-white/[0.04] bg-dark-950/70 backdrop-blur-2xl p-4 lg:p-5 shrink-0">
            <div class="max-w-2xl mx-auto">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <button v-for="(opt, i) in store.currentOptions" :key="i" @click="makeChoice(opt)"
                  class="glass-card-hover p-3.5 text-[13px] text-left group relative overflow-hidden"
                  :class="hoveredOption === i ? 'border-white/[0.12]' : ''"
                  @mouseenter="hoveredOption = i" @mouseleave="hoveredOption = -1">
                  <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" :style="{background:`linear-gradient(90deg,${themeColor},transparent)`}"></div>
                  <span class="text-gray-400 group-hover:text-emerald-300 transition-colors block pr-6">
                    <span class="inline-flex w-5 h-5 rounded bg-white/[0.04] border border-white/[0.06] items-center justify-center text-[10px] text-dark-400 mr-1.5 font-mono group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all">{{ i + 1 }}</span>
                    {{ opt }}
                  </span>
                </button>
              </div>
              <div class="flex gap-2">
                <input v-model="freeInput" ref="freeInputEl" class="input-field text-[13px] flex-1" placeholder="或输入你想做的任何事..." @keyup.enter="submitFreeInput" />
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
import LifeDashboard from '../components/LifeDashboard.vue'
import NarrativeRenderer from '../components/NarrativeRenderer.vue'

const router = useRouter()
const store = useGameStore()

const narrativeContainer = ref(null)
const freeInputEl = ref(null)
const freeInput = ref('')
const displayedNarrative = ref('')
const isTyping = ref(false)
const showSidebar = ref(false)
const showMenu = ref(false)
const showRestartDialog = ref(false)
const showSettings = ref(false)
const showDashboard = ref(false)
const isMobile = ref(false)
const notifications = ref([])
const currentTitle = ref('')
const currentSceneType = ref('leisure')
const currentWeather = ref('')
const expandedEntries = reactive(new Set())
const hoveredOption = ref(-1)
let typewriterTimer = null
let nc = 0

// Weather map
const weatherMap = { '晴': '☀️', '阴': '☁️', '雨': '🌧️', '雪': '🌨️', '风': '🌬️', '雾': '🌫️', '雷': '⛈️' }
const weatherEmoji = computed(() => weatherMap[currentWeather.value] || '')

const loadingTips = [
  '命运的齿轮正在转动……', '人生如戏，好戏将至……', '笔墨未干，故事已起……',
  '星辰排列，命运即将揭晓……', '下一个月会发生什么呢……', '时光流转中……',
  '故事正在编织……', '生活总有意想不到的惊喜……', '每一个选择都在塑造你……',
]
const loadingTip = ref(loadingTips[0])

// --- World Particles ---
const worldParticles = computed(() => {
  const w = store.world.setting
  const count = 20
  if (w === 'modern') {
    return Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, dur: 8 + Math.random() * 12, delay: Math.random() * 15,
      drift: (Math.random() - 0.5) * 60, rot: Math.random() * 360, opacity: 0.2 + Math.random() * 0.2,
      glow: ['#3b82f6', '#06b6d4', '#8b5cf6'][i % 3], size: 2, content: ''
    }))
  }
  if (w === 'ancient') {
    const leaves = ['🍃', '🍂', '🌿', '🍁']
    return Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, dur: 10 + Math.random() * 15, delay: Math.random() * 20,
      drift: (Math.random() - 0.5) * 80, rot: Math.random() * 360, opacity: 0.25 + Math.random() * 0.2,
      glow: '', size: 10 + Math.random() * 8, content: leaves[i % leaves.length]
    }))
  }
  if (w === 'fantasy') {
    return Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, dur: 6 + Math.random() * 10, delay: Math.random() * 12,
      drift: (Math.random() - 0.5) * 50, rot: 0, opacity: 0.3 + Math.random() * 0.3,
      glow: ['#c084fc', '#a78bfa', '#e879f9', '#f0abfc'][i % 4], size: 2 + Math.random() * 3, content: ''
    }))
  }
  if (w === 'scifi') {
    return Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, dur: 3 + Math.random() * 5, delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 20, rot: 0, opacity: 0.15 + Math.random() * 0.2,
      glow: ['#06b6d4', '#10b981', '#22d3ee'][i % 3], size: 15 + Math.random() * 25, content: ''
    }))
  }
  return []
})

// --- Scene Decorations (themed floating emoji by scene + age) ---
const sceneDecoEmojis = {
  work:      ['💼', '📊', '💻', '☕', '📋', '🏢'],
  love:      ['💕', '🌹', '💌', '🥂', '✨', '💗'],
  study:     ['📚', '🎓', '✏️', '📖', '💡', '🔬'],
  adventure: ['⚔️', '🗺️', '🏔️', '🌄', '🧭', '🔥'],
  family:    ['🏠', '🍳', '🌻', '🎂', '🧸', '💛'],
  health:    ['🏥', '💊', '🩺', '🍎', '🧘', '❤️‍🩹'],
  social:    ['🎉', '🎊', '🍻', '🎵', '🤝', '🎭'],
  crisis:    ['⚡', '🌊', '😰', '💔', '🔥', '⏳'],
  leisure:   ['☕', '🌿', '📖', '🎵', '🌙', '🛋️'],
  milestone: ['🏆', '🎖️', '⭐', '🎊', '👑', '🌟'],
}
const ageDecoEmojis = computed(() => {
  const k = store.lifeStage.key
  if (k === 'infant' || k === 'toddler') return ['🍼', '🧸', '🌈', '⭐']
  if (k === 'child') return ['🎈', '🦋', '🌸', '🎨']
  if (k === 'teen') return ['🎸', '📱', '⚽', '🎧']
  if (k === 'youth') return ['🎓', '💪', '🌟', '🚀']
  if (k === 'prime') return ['💼', '🏡', '🚗', '💎']
  if (k === 'middle') return ['📚', '🍷', '🌳', '☕']
  if (k === 'elder') return ['🌅', '🎋', '📸', '🕊️']
  return ['✨']
})
const sceneDecorations = computed(() => {
  const sceneEmojis = sceneDecoEmojis[currentSceneType.value] || sceneDecoEmojis.leisure
  const ageEmojis = ageDecoEmojis.value
  const all = [...sceneEmojis, ...ageEmojis]
  return Array.from({ length: 8 }, (_, i) => ({
    id: `deco-${i}`,
    emoji: all[i % all.length],
    x: 5 + Math.random() * 90,
    y: 10 + Math.random() * 80,
    dx: (Math.random() - 0.5) * 80,
    dy: (Math.random() - 0.5) * 60,
    dur: 12 + Math.random() * 18,
    delay: Math.random() * 10,
    size: 16 + Math.random() * 20,
    blur: Math.random() > 0.5 ? 1 : 0,
  }))
})

// --- Rain / Snow ---
const rainDrops = computed(() => Array.from({ length: 60 }, (_, i) => ({
  id: i, x: Math.random() * 100, h: 10 + Math.random() * 20, dur: 0.4 + Math.random() * 0.6, delay: Math.random() * 2
})))
const snowFlakes = computed(() => Array.from({ length: 40 }, (_, i) => ({
  id: i, x: Math.random() * 100, size: 1.5 + Math.random() * 3, dur: 6 + Math.random() * 8, delay: Math.random() * 10, drift: (Math.random() - 0.5) * 60
})))

// --- Scene icons ---
function sceneIcon(type) {
  const map = { work: '💼', love: '💕', study: '📚', adventure: '⚔️', family: '🏠', health: '🏥', social: '🎉', crisis: '⚡', leisure: '☕', milestone: '🏆' }
  return map[type] || '📖'
}

// --- Sparkline helper ---
function miniSparkline(key) {
  const data = store.sparklineData(key, 12)
  if (data.length < 2) return '0,50 100,50'
  const max = Math.max(...data, 1), min = Math.min(...data, 0), range = max - min || 1
  return data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ')
}

// --- Computed ---
const worldEmoji = computed(() => ({ modern: '🏙️', ancient: '🏯', fantasy: '🐉', scifi: '🚀' })[store.world.setting] || '🌍')
const themeColor = computed(() => ({ modern: '#3b82f6', ancient: '#d97706', fantasy: '#8b5cf6', scifi: '#06b6d4' })[store.world.setting] || '#10b981')

// ═══ Dynamic Scene System ═══
// Blends: world base + scene type + weather + season + mood
// Each scene has distinct rich colors — no more monochrome
const sceneColorPalette = {
  work:      { h: 215, s: 65, l: 22, accent: 'rgba(59,130,246,0.18)',  accent2: 'rgba(99,102,241,0.10)' },
  love:      { h: 340, s: 60, l: 22, accent: 'rgba(244,114,182,0.20)', accent2: 'rgba(251,113,133,0.12)' },
  study:     { h: 245, s: 55, l: 20, accent: 'rgba(129,140,248,0.16)', accent2: 'rgba(99,102,241,0.10)' },
  adventure: { h: 35,  s: 70, l: 22, accent: 'rgba(251,191,36,0.18)',  accent2: 'rgba(245,158,11,0.12)' },
  family:    { h: 155, s: 50, l: 20, accent: 'rgba(52,211,153,0.16)',  accent2: 'rgba(16,185,129,0.10)' },
  health:    { h: 5,   s: 50, l: 18, accent: 'rgba(248,113,113,0.16)', accent2: 'rgba(239,68,68,0.10)' },
  social:    { h: 25,  s: 65, l: 22, accent: 'rgba(251,146,60,0.18)',  accent2: 'rgba(249,115,22,0.12)' },
  crisis:    { h: 0,   s: 70, l: 16, accent: 'rgba(239,68,68,0.22)',   accent2: 'rgba(185,28,28,0.14)' },
  leisure:   { h: 260, s: 35, l: 18, accent: 'rgba(167,139,250,0.12)', accent2: 'rgba(148,163,184,0.08)' },
  milestone: { h: 45,  s: 75, l: 24, accent: 'rgba(251,191,36,0.22)',  accent2: 'rgba(245,158,11,0.14)' },
}
const worldBaseHSL = {
  modern:  { h: 220, s: 60, l: 16 },
  ancient: { h: 28,  s: 55, l: 15 },
  fantasy: { h: 268, s: 60, l: 16 },
  scifi:   { h: 185, s: 65, l: 15 },
}
// 年龄段额外色彩偏移——让不同人生阶段有不同色温
const ageShift = computed(() => {
  const k = store.lifeStage.key
  if (k === 'infant' || k === 'toddler') return { h: -20, s: 10, l: 6 }   // 偏暖偏亮（温馨）
  if (k === 'child') return { h: -10, s: 15, l: 5 }                        // 明亮活泼
  if (k === 'teen') return { h: 10, s: 8, l: 3 }                            // 偏蓝（青春）
  if (k === 'youth') return { h: 0, s: 5, l: 2 }                            // 标准
  if (k === 'prime') return { h: 15, s: 0, l: 0 }                           // 偏暖（稳重）
  if (k === 'middle') return { h: 20, s: -5, l: -1 }                        // 偏褐（沉稳）
  if (k === 'elder') return { h: -30, s: -10, l: -2 }                       // 偏紫（回忆）
  return { h: 0, s: 0, l: 0 }
})
const seasonShift = computed(() => {
  const s = store.seasonLabel.name
  if (s === '春') return { h: -15, s: 10, l: 3 }
  if (s === '夏') return { h: -8,  s: 15, l: 4 }
  if (s === '秋') return { h: 20,  s: 8,  l: 1 }
  return { h: 8, s: -5, l: -2 }
})
const weatherShift = computed(() => {
  const w = currentWeather.value
  if (w === '晴') return { h: -5, s: 15, l: 5 }
  if (w === '阴') return { h: 0, s: -12, l: -3 }
  if (w === '雨') return { h: 12, s: -8, l: -4 }
  if (w === '雪') return { h: 25, s: -10, l: 4 }
  if (w === '风') return { h: 5, s: 8, l: 1 }
  if (w === '雾') return { h: 0, s: -18, l: 0 }
  return { h: 0, s: 0, l: 0 }
})
const moodShift = computed(() => {
  const m = store.currentMood
  if (isMoodPos(m)) return { h: -8, s: 12, l: 3 }
  if (isMoodNeg(m)) return { h: 8, s: -8, l: -3 }
  return { h: 0, s: 0, l: 0 }
})

const blendedHSL = computed(() => {
  const base = worldBaseHSL[store.world.setting] || { h: 220, s: 40, l: 14 }
  const scene = sceneColorPalette[currentSceneType.value] || sceneColorPalette.leisure
  const ss = seasonShift.value, ws = weatherShift.value, ms = moodShift.value, as = ageShift.value
  // 40% world + 60% scene — scene dominates for visual variety
  const h = Math.round(base.h * 0.4 + scene.h * 0.6 + ss.h + ws.h + ms.h + as.h) % 360
  const s = Math.max(20, Math.min(100, Math.round(base.s * 0.4 + scene.s * 0.6 + ss.s + ws.s + ms.s + as.s)))
  const l = Math.max(10, Math.min(35, Math.round(base.l * 0.4 + scene.l * 0.6 + ss.l + ws.l + ms.l + as.l)))
  return { h: h < 0 ? h + 360 : h, s, l }
})

// Multi-stop gradient with more color variation + radial accent overlay
const dynamicBgStyle = computed(() => {
  const { h, s, l } = blendedHSL.value
  const c1 = `hsl(${h}, ${s}%, ${l}%)`
  const c2 = `hsl(${(h + 20) % 360}, ${Math.max(s - 5, 15)}%, ${Math.max(l - 4, 6)}%)`
  const c3 = `hsl(${(h + 40) % 360}, ${Math.max(s + 5, 20)}%, ${Math.max(l + 2, 10)}%)`
  const c4 = `hsl(${(h - 10 + 360) % 360}, ${Math.max(s - 10, 10)}%, ${Math.max(l - 6, 5)}%)`
  const accentH = (h + 180) % 360
  const radial = `radial-gradient(ellipse at 30% 20%, hsla(${accentH}, ${Math.min(s + 20, 80)}%, ${l + 10}%, 0.08) 0%, transparent 60%)`
  const linear = `linear-gradient(160deg, ${c1} 0%, ${c2} 30%, ${c3} 60%, ${c4} 100%)`
  return { background: `${radial}, ${linear}` }
})

const dynamicOrb1 = computed(() => {
  const scene = sceneColorPalette[currentSceneType.value] || sceneColorPalette.leisure
  return `radial-gradient(circle, ${scene.accent}, transparent 65%)`
})
const dynamicOrb2 = computed(() => {
  const scene = sceneColorPalette[currentSceneType.value] || sceneColorPalette.leisure
  const { h, s } = blendedHSL.value
  return `radial-gradient(circle, ${scene.accent2}, hsla(${(h + 90) % 360}, ${s}%, 45%, 0.06) 40%, transparent 70%)`
})
const dynamicOrb3 = computed(() => {
  const { h, s, l } = blendedHSL.value
  return `radial-gradient(circle, hsla(${(h + 150) % 360}, ${Math.min(s + 15, 80)}%, ${l + 15}%, 0.07), transparent 65%)`
})

// Mood helpers
const moodPosKeys = ['开心', '幸福', '兴奋', '满足', '期待', '喜悦', '愉悦', '自信', '感动', '温暖']
const moodNegKeys = ['悲伤', '沮丧', '愤怒', '焦虑', '恐惧', '绝望', '孤独', '疲惫', '迷茫', '不安']
function isMoodPos(m) { return moodPosKeys.some(k => m.includes(k)) }
function isMoodNeg(m) { return moodNegKeys.some(k => m.includes(k)) }

const moodEmoji = computed(() => {
  const m = store.currentMood
  const map = [[['开心', '喜悦', '愉悦', '快乐'], '😄'], [['幸福', '满足', '感动', '温暖'], '🥰'], [['兴奋', '激动'], '🤩'], [['期待', '好奇', '憧憬'], '😊'], [['平静', '安宁', '淡然'], '😌'], [['疲惫', '劳累'], '😩'], [['悲伤', '难过', '失落', '沮丧'], '😢'], [['愤怒', '生气'], '😠'], [['焦虑', '不安', '紧张'], '😰'], [['恐惧', '害怕'], '😨'], [['迷茫', '困惑'], '🤔'], [['孤独', '寂寞'], '😔'], [['自信', '骄傲'], '😎'], [['绝望', '崩溃'], '😭']]
  for (const [kw, e] of map) if (kw.some(k => m.includes(k))) return e
  return store.ageAvatar
})
const moodParticle = computed(() => {
  const m = store.currentMood
  const map = [[['开心', '喜悦', '快乐'], '✨'], [['幸福', '满足', '温暖', '感动'], '💕'], [['兴奋', '激动'], '🔥'], [['悲伤', '难过', '失落'], '💧'], [['愤怒', '生气'], '💢'], [['焦虑', '紧张'], '💦'], [['期待', '好奇'], '💫'], [['自信'], '⭐']]
  for (const [kw, e] of map) if (kw.some(k => m.includes(k))) return e
  return ''
})
const moodGlow = computed(() => {
  const m = store.currentMood
  if (isMoodPos(m)) return '0 4px 20px rgba(16,185,129,0.15)'
  if (isMoodNeg(m)) return '0 4px 20px rgba(239,68,68,0.15)'
  return '0 4px 16px rgba(0,0,0,0.2)'
})
const moodRingClass = computed(() => {
  const m = store.currentMood
  if (isMoodPos(m)) return 'bg-emerald-500/[0.08] border-emerald-500/30'
  if (isMoodNeg(m)) return 'bg-rose-500/[0.08] border-rose-500/30'
  return 'bg-white/[0.03] border-white/[0.06]'
})
const moodBadgeClass = computed(() => {
  const m = store.currentMood
  if (isMoodPos(m)) return 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15'
  if (isMoodNeg(m)) return 'bg-rose-500/10 text-rose-400/80 border border-rose-500/15'
  return 'bg-white/[0.04] text-gray-500 border border-white/[0.05]'
})
const lifeStageColor = computed(() => ({ baby: 'bg-pink-500', child: 'bg-blue-500', youth: 'bg-emerald-500', middle: 'bg-amber-500', elder: 'bg-purple-500' })[store.lifeStage.key] + ' text-white')
// Scene banner gradient by scene type
const sceneBannerGradients = {
  work:      'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)',
  love:      'linear-gradient(135deg, #831843 0%, #e11d48 50%, #be185d 100%)',
  study:     'linear-gradient(135deg, #312e81 0%, #6366f1 50%, #4338ca 100%)',
  adventure: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #b45309 100%)',
  family:    'linear-gradient(135deg, #064e3b 0%, #10b981 50%, #059669 100%)',
  health:    'linear-gradient(135deg, #7f1d1d 0%, #ef4444 50%, #dc2626 100%)',
  social:    'linear-gradient(135deg, #7c2d12 0%, #f97316 50%, #ea580c 100%)',
  crisis:    'linear-gradient(135deg, #450a0a 0%, #991b1b 50%, #7f1d1d 100%)',
  leisure:   'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #6d28d9 100%)',
  milestone: 'linear-gradient(135deg, #713f12 0%, #eab308 50%, #ca8a04 100%)',
}
const sceneBannerStyle = computed(() => ({
  background: sceneBannerGradients[currentSceneType.value] || sceneBannerGradients.leisure,
}))

// Age-themed portrait banner
const portraitBannerBg = computed(() => {
  const k = store.lifeStage.key
  const gradients = {
    infant:  'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 70%, #f9a8d4 100%)',  // 粉色温馨
    toddler: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fcd34d 70%, #fbbf24 100%)',  // 金色童年
    child:   'linear-gradient(135deg, #dbeafe 0%, #93c5fd 30%, #60a5fa 70%, #3b82f6 100%)',  // 蓝色天空
    teen:    'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 30%, #818cf8 70%, #6366f1 100%)',  // 靛蓝青春
    youth:   'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 30%, #34d399 70%, #10b981 100%)',  // 翠绿朝气
    prime:   'linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #f59e0b 70%, #d97706 100%)',  // 琥珀鼎盛
    middle:  'linear-gradient(135deg, #ffedd5 0%, #fdba74 30%, #f97316 70%, #ea580c 100%)',  // 橙色沉稳
    elder:   'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 30%, #a78bfa 70%, #7c3aed 100%)',  // 紫色回忆
  }
  return gradients[k] || gradients.youth
})

const recentTimeline = computed(() => [...store.timeline].reverse().slice(0, 30))

// Timeline grouped by age (reversed so newest first)
const timelineGroups = computed(() => {
  const entries = [...store.timeline].reverse().slice(0, 40)
  const groups = []
  let currentAge = null
  for (const e of entries) {
    if (e.age !== currentAge) {
      currentAge = e.age
      groups.push({ age: e.age, entries: [] })
    }
    groups[groups.length - 1].entries.push(e)
  }
  return groups
})
function timelineAgeColor(age) {
  if (age < 3) return '#f472b6'    // pink
  if (age < 6) return '#fb923c'    // orange
  if (age < 12) return '#38bdf8'   // sky
  if (age < 18) return '#818cf8'   // indigo
  if (age < 30) return '#34d399'   // emerald
  if (age < 50) return '#fbbf24'   // amber
  if (age < 65) return '#f97316'   // orange
  return '#a78bfa'                  // violet
}
function sceneColor(type) {
  const map = { work: '#3b82f6', love: '#f43f5e', study: '#818cf8', adventure: '#f59e0b', family: '#10b981', health: '#ef4444', social: '#f97316', crisis: '#dc2626', leisure: '#a78bfa', milestone: '#eab308' }
  return map[type] || '#6b7280'
}
const pastEntries = computed(() => store.timeline.length <= 1 ? [] : store.timeline.slice(0, -1))
const showOptions = computed(() => store.currentOptions.length > 0 && !store.isLoading && !store.isGameOver && !isTyping.value && store.currentNarrative)

// NPC helpers
function npcEmoji(rel) {
  const r = (rel.relation || '').toLowerCase()
  if (r.includes('恋') || r.includes('爱') || r.includes('伴侣') || r.includes('妻') || r.includes('夫')) return '💑'
  if (r.includes('父') || r.includes('爸')) return '👨‍🦳'
  if (r.includes('母') || r.includes('妈')) return '👩‍🦳'
  if (r.includes('兄') || r.includes('弟') || r.includes('姐') || r.includes('妹')) return '👫'
  if (r.includes('老师') || r.includes('师')) return '🧑‍🏫'
  if (r.includes('老板') || r.includes('上司') || r.includes('领导')) return '🧑‍💼'
  if (r.includes('同事') || r.includes('同学')) return '🤝'
  if (r.includes('朋友') || r.includes('好友')) return '😊'
  if (r.includes('敌') || r.includes('对手')) return '😤'
  if (r.includes('子') || r.includes('女儿') || r.includes('儿')) return '👶'
  return '👤'
}
function relStyle(r) { const a = r.affection ?? 50; if (a >= 70) return 'bg-emerald-500/[0.08] border-emerald-500/20'; if (a >= 40) return 'bg-white/[0.03] border-white/[0.06]'; return 'bg-rose-500/[0.08] border-rose-500/20' }
function relBarColorClass(r) { const a = r.affection ?? 50; return a >= 70 ? 'bg-emerald-500' : a >= 40 ? 'bg-gray-500' : 'bg-rose-500' }
function toggleExpand(i) { expandedEntries.has(i) ? expandedEntries.delete(i) : expandedEntries.add(i) }

// Actions
function restartLife() { showMenu.value = false; showRestartDialog.value = true }
function confirmRestart() { showRestartDialog.value = false; store.saveGame(); router.push('/create') }
function goHome() { showMenu.value = false; store.saveGame(); router.push('/') }
function openSettings() { showMenu.value = false; showSettings.value = true }
function openDashboard() { showMenu.value = false; showDashboard.value = true }

function shareToTwitter(type) {
  showMenu.value = false
  let text = ''
  const name = store.character.name
  const world = store.world.settingLabel
  const age = store.age

  if (type === 'gameover') {
    const score = store.lifeScore
    const months = store.totalMonths
    const milestones = store.milestones.length
    const rels = store.relationships.length
    text = `🌟 我在「人生进程」完成了一段人生！\n\n` +
      `👤 ${name} · ${world}\n` +
      `📅 活了 ${age} 岁（${months} 个月）\n` +
      `🏆 ${milestones} 个里程碑 · 遇见 ${rels} 个人\n` +
      `📊 人生评分: ${score}/100\n` +
      (store.family.spouse ? `💑 配偶: ${store.family.spouse}\n` : '') +
      (store.family.children.length ? `👶 子女: ${store.family.children.map(c => c.name).join('、')}\n` : '') +
      `\n每次人生都独一无二 ✨\n#人生进程 #AIGame`
  } else if (type === 'milestone') {
    const latest = store.milestones[store.milestones.length - 1]
    if (latest) {
      text = `🏆 人生里程碑达成！\n\n` +
        `${latest.icon} ${latest.title}\n` +
        `👤 ${name} · ${age}岁 · ${world}\n` +
        `📝 ${latest.description}\n` +
        `\n#人生进程 #AIGame`
    }
  } else {
    // progress share
    const score = store.lifeScore
    const mood = store.currentMood
    text = `🎮 我正在「人生进程」中体验另一段人生\n\n` +
      `👤 ${name} · ${age}岁 · ${world}\n` +
      `💫 当前心情: ${mood}\n` +
      `📊 人生评分: ${score}/100\n` +
      (store.career ? `💼 职业: ${store.career}\n` : '') +
      (store.milestones.length ? `🏆 已达成 ${store.milestones.length} 个里程碑\n` : '') +
      `\n每个选择都在改变命运 ✨\n#人生进程 #AIGame`
  }

  // 获取当前页面链接
  const pageUrl = window.location.origin || 'https://github.com/0xshunli/life-loop'
  const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`
  window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer')
}

// --- Notifications ---
const prevAttrs = ref({ ...store.attributes })
watch(() => ({ ...store.attributes }), nv => {
  const meta = { health: ['健康', '❤️'], intelligence: ['智力', '🧠'], charisma: ['魅力', '✨'], wealth: ['财富', '💰'], happiness: ['幸福', '😊'], social: ['社交', '👥'] }
  for (const k of Object.keys(nv)) {
    const d = nv[k] - (prevAttrs.value[k] ?? nv[k])
    if (d !== 0 && meta[k]) { const id = ++nc; notifications.value.push({ id, label: meta[k][0], icon: meta[k][1], value: d }); setTimeout(() => { notifications.value = notifications.value.filter(n => n.id !== id) }, 2200) }
  }
  prevAttrs.value = { ...nv }
}, { deep: true })

watch(() => store.milestones.length, (nv, ov) => {
  if (nv > (ov || 0)) {
    const m = store.milestones[store.milestones.length - 1]
    const id = ++nc
    notifications.value.push({ id, label: m.title, icon: m.icon, type: 'milestone' })
    setTimeout(() => { notifications.value = notifications.value.filter(n => n.id !== id) }, 3500)
  }
})

// --- Typewriter ---
watch(() => store.currentNarrative, v => {
  if (!v) return
  if (typewriterTimer) clearInterval(typewriterTimer)
  const latest = store.timeline[store.timeline.length - 1]
  currentTitle.value = latest?.title || ''
  currentSceneType.value = latest?.sceneType || 'leisure'
  currentWeather.value = latest?.weather || ''

  if (!store.settings.enableTypewriter) {
    displayedNarrative.value = v
    isTyping.value = false
    scrollBottom()
    return
  }

  displayedNarrative.value = ''
  isTyping.value = true
  let i = 0
  const speed = store.settings.textSpeed || 25
  typewriterTimer = setInterval(() => {
    if (i < v.length) { displayedNarrative.value += v[i]; i++; if (i % 15 === 0) scrollBottom() }
    else { clearInterval(typewriterTimer); typewriterTimer = null; isTyping.value = false; scrollBottom() }
  }, speed)
})

watch(() => store.isLoading, v => { if (v) loadingTip.value = loadingTips[Math.floor(Math.random() * loadingTips.length)] })

onMounted(() => {
  checkMobile(); window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleKey)
})
onUnmounted(() => {
  if (typewriterTimer) clearInterval(typewriterTimer)
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleKey)
})

function checkMobile() { isMobile.value = window.innerWidth < 1024 }

function handleKey(e) {
  if (showSettings.value || showRestartDialog.value || showMenu.value || showDashboard.value) return
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  if (e.key === 'Escape') { showSettings.value = true; return }
  if (e.key === 'Tab') { e.preventDefault(); showDashboard.value = true; return }
  if (!showOptions.value) return
  const num = parseInt(e.key)
  if (num >= 1 && num <= 3 && store.currentOptions[num - 1]) {
    makeChoice(store.currentOptions[num - 1])
  }
}

function scrollBottom() { nextTick(() => { if (narrativeContainer.value) narrativeContainer.value.scrollTop = narrativeContainer.value.scrollHeight }) }
async function startFirstTurn() { await store.playTurn() }
async function makeChoice(o) { await store.playTurn(o) }
async function submitFreeInput() { if (!freeInput.value.trim()) return; const v = freeInput.value.trim(); freeInput.value = ''; await store.playTurn(v) }
</script>
