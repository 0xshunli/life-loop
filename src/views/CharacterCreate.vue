<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
    :style="dynamicBg">

    <!-- ═══ Animated Background ═══ -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Large ambient orbs that shift color based on step -->
      <div class="absolute -top-20 -left-20 w-[700px] h-[700px] rounded-full blur-[130px] animate-breathe transition-all duration-[2500ms]"
        :style="{ background: orbColors[0], animationDuration: '8s' }" />
      <div class="absolute -bottom-20 -right-20 w-[600px] h-[600px] rounded-full blur-[110px] animate-breathe transition-all duration-[2500ms]"
        :style="{ background: orbColors[1], animationDelay: '3s', animationDuration: '12s' }" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] animate-breathe transition-all duration-[2500ms]"
        :style="{ background: orbColors[2], animationDelay: '5s', animationDuration: '15s' }" />
    </div>

    <!-- Subtle grid pattern -->
    <div class="absolute inset-0 opacity-[0.025]"
      style="background-image: linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 50px 50px;" />

    <!-- Floating themed particles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div v-for="p in floatingParticles" :key="p.id"
        class="absolute select-none animate-scene-deco opacity-0"
        :style="{
          left: p.x + '%', top: p.y + '%', fontSize: p.size + 'px',
          '--deco-dur': p.dur + 's', '--deco-delay': p.delay + 's',
          '--deco-drift-x': p.dx + 'px', '--deco-drift-y': p.dy + 'px',
          filter: `blur(${p.blur}px)`,
        }">{{ p.emoji }}</div>
    </div>

    <!-- Sparkle particles that appear on interaction -->
    <TransitionGroup name="fade" tag="div" class="absolute inset-0 pointer-events-none z-20">
      <div v-for="sp in sparkles" :key="sp.id"
        class="absolute text-base animate-ping"
        :style="{ left: sp.x + 'px', top: sp.y + 'px', animationDuration: '0.8s' }">{{ sp.emoji }}</div>
    </TransitionGroup>

    <!-- ═══ Main Content ═══ -->
    <div class="relative z-10 flex gap-6 w-full max-w-4xl">

      <!-- Left: Form -->
      <div class="glass-card p-6 sm:p-8 flex-1 min-w-0 relative overflow-hidden">
        <!-- Card top accent glow -->
        <div class="absolute top-0 left-0 right-0 h-1 transition-all duration-700"
          :style="{ background: `linear-gradient(90deg, transparent, ${stepAccentColor}, transparent)` }"></div>

        <!-- Header -->
        <div class="mb-8">
          <button @click="$router.push('/')" class="btn-ghost text-gray-600 text-xs mb-4 -ml-2 group flex items-center gap-1 hover:text-emerald-400 transition-colors">
            <svg class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            {{ t('create.backHome') }}
          </button>
          <h2 class="text-2xl font-bold flex items-center gap-3">
            <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent animate-gradient" style="background-size: 200% 200%;">{{ t('create.title') }}</span>
            <span class="text-lg animate-float" style="animation-duration: 3s;">{{ stepEmoji }}</span>
          </h2>
          <p class="text-xs text-dark-500 mt-1">{{ t('create.subtitle') }}</p>
        </div>

        <!-- Step indicator (enhanced with icons) -->
        <div class="flex items-center gap-2 mb-6">
          <div v-for="(s, i) in steps" :key="i"
            class="flex-1 flex items-center gap-1.5 cursor-pointer group"
            @click="i < step ? step = i : null">
            <div class="flex items-center gap-1.5 flex-1">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all duration-500 shrink-0"
                :class="step > i ? 'bg-emerald-500 border-emerald-500 text-white scale-90' : step === i ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 scale-105' : 'bg-dark-800 border-white/[0.06] text-dark-600'">
                <span v-if="step > i">✓</span>
                <span v-else>{{ s.icon }}</span>
              </div>
              <div class="flex-1 h-1 rounded-full transition-all duration-500"
                :class="step > i ? 'bg-emerald-500' : step === i ? 'bg-gradient-to-r from-emerald-500 to-emerald-500/20' : 'bg-dark-800'">
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 mb-5">
          <span class="text-base">{{ steps[step].icon }}</span>
          <p class="text-[11px] text-dark-500 uppercase tracking-[0.15em]">
            {{ steps[step].label }} <span class="text-dark-700">· {{ step + 1 }}/{{ steps.length }}</span>
          </p>
        </div>

        <!-- Steps (animated transitions) -->
        <transition :name="slideDirection" mode="out-in">

          <!-- Step 1: Basic Info -->
          <div v-if="step === 0" key="s0" class="space-y-5">
            <div class="group">
              <label class="text-xs text-gray-500 mb-2 block flex items-center gap-1.5">
                <span class="w-1 h-1 rounded-full bg-emerald-500"></span> {{ t('create.nameLabel') }}
              </label>
              <div class="relative">
                <input v-model="form.name" class="input-field text-lg pr-12" :placeholder="t('create.namePlaceholder')" maxlength="20" @keyup.enter="nextStep" />
                <span v-if="form.name" class="absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-all" :class="form.name.length > 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'">{{ previewAvatar }}</span>
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-3 block flex items-center gap-1.5">
                <span class="w-1 h-1 rounded-full bg-emerald-500"></span> {{ t('create.genderLabel') }}
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button v-for="g in genders" :key="g.value" @click="form.gender = g.value; spawnSparkle($event, g.icon)"
                  :class="['relative p-4 rounded-2xl text-center transition-all duration-300 border group/g overflow-hidden',
                    form.gender === g.value
                      ? 'border-emerald-500/40 bg-emerald-500/[0.08] shadow-lg shadow-emerald-500/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]']">
                  <div class="absolute inset-0 transition-opacity duration-300"
                    :class="form.gender === g.value ? 'opacity-100' : 'opacity-0'"
                    :style="{ background: `radial-gradient(circle at 50% 80%, ${g.glow}, transparent 70%)` }"></div>
                  <span class="text-3xl block mb-1.5 transition-all duration-300 relative z-10"
                    :class="form.gender === g.value ? 'scale-110 drop-shadow-lg' : 'group-hover/g:scale-110'">{{ g.icon }}</span>
                  <p class="text-xs relative z-10" :class="form.gender === g.value ? 'text-emerald-400 font-medium' : 'text-gray-500'">{{ g.label }}</p>
                  <div v-if="form.gender === g.value" class="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold animate-scale-in">✓</div>
                </button>
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-2 block flex items-center gap-1.5">
                <span class="w-1 h-1 rounded-full bg-emerald-500"></span> {{ t('create.ageLabel') }}
              </label>
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <input type="range" v-model.number="form.startAge" min="0" max="60" step="1" class="w-full accent-emerald-500" />
                  <div class="flex justify-between text-[9px] text-dark-600 mt-1">
                    <span>{{ t('create.ageBirth') }}</span><span>{{ t('create.ageTeen') }}</span><span>{{ t('create.ageYouth') }}</span><span>{{ t('create.ageMiddle') }}</span>
                  </div>
                </div>
                <div class="w-16 shrink-0 text-center">
                  <input v-model.number="form.startAge" type="number" min="0" max="80" class="input-field text-center text-lg font-bold !px-2 !py-1.5" />
                  <p class="text-[9px] text-dark-600 mt-0.5">{{ t('create.ageUnit') }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <button v-for="preset in agePresets" :key="preset.age" @click="form.startAge = preset.age"
                  :class="['px-2.5 py-1 rounded-lg text-[11px] border transition-all duration-200',
                    form.startAge === preset.age
                      ? 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400 shadow-sm shadow-emerald-500/10'
                      : 'border-white/[0.05] bg-white/[0.02] text-gray-500 hover:bg-white/[0.04]']">
                  {{ preset.icon }} {{ preset.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Avatar -->
          <div v-else-if="step === 1" key="s1">
            <label class="text-xs text-gray-500 mb-1.5 block">{{ t('create.avatarTitle') }}</label>
            <p class="text-[10px] text-dark-600 mb-4">{{ t('create.avatarDesc') }}</p>

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

            <!-- Avatar grid (enhanced hover) -->
            <div class="grid grid-cols-5 sm:grid-cols-7 gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              <button v-for="a in avatarCategories[selectedCategory].avatars" :key="a + selectedCategory" @click="form.avatar = a; spawnSparkle($event, '✨')"
                :class="['relative w-full aspect-square rounded-xl flex items-center justify-center text-2xl sm:text-3xl border transition-all duration-200 group/av',
                  form.avatar === a
                    ? 'border-emerald-500/50 bg-emerald-500/[0.12] shadow-lg shadow-emerald-500/15 scale-110 ring-2 ring-emerald-500/30 z-10'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] hover:scale-110 hover:z-10']">
                <span class="transition-transform duration-200 group-hover/av:scale-110" :class="form.avatar === a ? 'drop-shadow-lg' : ''">{{ a }}</span>
                <div v-if="form.avatar === a" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold shadow-md animate-scale-in">✓</div>
              </button>
            </div>

            <!-- Selected preview (enhanced) -->
            <div class="mt-4 flex items-center gap-3 min-h-[48px]">
              <template v-if="form.avatar">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10 animate-scale-in">
                  {{ form.avatar }}
                </div>
                <div>
                  <p class="text-xs text-emerald-400 font-medium">{{ t('create.avatarSelected') }}</p>
                  <p class="text-[10px] text-dark-600">{{ t('create.avatarChangeHint') }}</p>
                </div>
              </template>
              <p v-else class="text-[10px] text-dark-600 italic flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500/50 animate-pulse"></span> {{ t('create.avatarPlease') }}
              </p>
            </div>
          </div>

          <!-- Step 3: Personality -->
          <div v-else-if="step === 2" key="s2">
            <label class="text-xs text-gray-500 mb-1.5 block">{{ t('create.traitTitle') }}</label>
            <p class="text-[10px] text-dark-600 mb-4">{{ t('create.traitDesc', { n: 3 }) }}</p>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="trait in traits" :key="trait.key" @click="toggleTrait(trait.zhLabel); spawnSparkle($event, '⭐')"
                :disabled="form.personality.length >= 3 && !form.personality.includes(trait.zhLabel)"
                :class="['relative py-2.5 px-2 rounded-xl text-sm transition-all duration-200 border overflow-hidden group/t',
                  form.personality.includes(trait.zhLabel)
                    ? 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400 shadow-sm shadow-emerald-500/10'
                    : 'border-white/[0.05] bg-white/[0.02] text-gray-500 hover:bg-white/[0.04] hover:text-gray-300 hover:border-white/[0.1]',
                  form.personality.length >= 3 && !form.personality.includes(trait.zhLabel) ? 'opacity-20 !cursor-not-allowed' : '']">
                <div v-if="form.personality.includes(trait.zhLabel)" class="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] to-transparent"></div>
                <span class="relative">{{ trait.label }}</span>
                <span v-if="form.personality.includes(trait.zhLabel)"
                  class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold animate-scale-in">
                  {{ form.personality.indexOf(trait.zhLabel) + 1 }}
                </span>
              </button>
            </div>
            <div class="flex items-center gap-2 mt-5 min-h-[32px]">
              <TransitionGroup name="fade" tag="div" class="flex gap-1.5">
                <span v-for="p in form.personality" :key="p"
                  class="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 animate-scale-in">{{ p }}</span>
              </TransitionGroup>
              <span v-if="form.personality.length < 3" class="text-[10px] text-dark-600 flex items-center gap-1">
                <span class="inline-flex gap-0.5">
                  <span v-for="i in 3" :key="i" class="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    :class="i <= form.personality.length ? 'bg-emerald-500' : 'bg-dark-700'"></span>
                </span>
                {{ t('create.traitRemaining', { n: 3 - form.personality.length }) }}
              </span>
            </div>
          </div>

          <!-- Step 4: Backstory -->
          <div v-else-if="step === 3" key="s3">
            <label class="text-xs text-gray-500 mb-2 block flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-emerald-500"></span> {{ t('create.storyLabel') }}
            </label>
            <div class="relative">
              <textarea v-model="form.backstory" class="input-field h-48 resize-none leading-relaxed"
                :placeholder="t('create.storyPlaceholder')" maxlength="500" />
              <!-- Word count ring -->
              <div class="absolute bottom-3 right-3 w-8 h-8">
                <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3" />
                  <circle cx="18" cy="18" r="14" fill="none"
                    :stroke="form.backstory.length >= 10 ? '#10b981' : '#6b7280'"
                    stroke-width="3" stroke-linecap="round"
                    :stroke-dasharray="`${(form.backstory.length / 500) * 88} 88`" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center text-[7px] font-mono" :class="form.backstory.length >= 10 ? 'text-emerald-400/70' : 'text-dark-600'">
                  {{ form.backstory.length }}
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center mt-2.5">
              <span class="text-[10px] text-dark-600">
                <span :class="form.backstory.length >= 10 ? 'text-emerald-500/70' : ''">{{ form.backstory.length }}</span> / 500
              </span>
              <button @click="generateBackstory" :disabled="isGenerating"
                class="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg transition-all
                  bg-emerald-500/[0.06] text-emerald-400/80 border border-emerald-500/15 hover:bg-emerald-500/[0.12] hover:shadow-md hover:shadow-emerald-500/10
                  disabled:opacity-40">
                <span v-if="isGenerating" class="w-3 h-3 border-[1.5px] border-emerald-400/60 border-t-transparent rounded-full animate-spin"></span>
                <span v-else class="animate-pulse-soft">✨</span>
                {{ isGenerating ? t('create.generating') : t('create.aiGenerate') }}
              </button>
            </div>
          </div>

          <!-- Step 5: Confirm -->
          <div v-else key="s4">
            <div class="rounded-2xl border border-white/[0.06] overflow-hidden">
              <!-- Character banner -->
              <div class="relative h-32 overflow-hidden" :style="{ background: confirmBannerBg }">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="w-20 h-20 mx-auto rounded-2xl bg-black/20 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-5xl shadow-2xl animate-float" style="animation-duration: 4s;">
                      {{ previewAvatar }}
                    </div>
                  </div>
                </div>
                <!-- Floating emojis in banner -->
                <div class="absolute inset-0 flex items-center justify-around opacity-15 text-2xl">
                  <span v-for="(e, i) in form.personality.slice(0,3)" :key="i" class="animate-float"
                    :style="{ animationDelay: i * 1 + 's', animationDuration: (3 + i) + 's' }">{{ traitEmoji(e) }}</span>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[rgba(10,15,26,0.95)] to-transparent"></div>
              </div>

              <div class="p-5 -mt-2 relative bg-gradient-to-b from-white/[0.02] to-transparent">
                <div class="text-center mb-4">
                  <h3 class="font-bold text-xl text-gray-200">{{ form.name }}</h3>
                  <p class="text-[11px] text-gray-500 mt-0.5">{{ form.gender }} · {{ form.startAge }}{{ t('create.ageUnit') }} · {{ ageStageName(form.startAge) }}</p>
                </div>
                <div class="flex justify-center flex-wrap gap-1.5 mb-4">
                  <span v-for="p in form.personality" :key="p"
                    class="px-2.5 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15 flex items-center gap-1">
                    {{ traitEmoji(p) }} {{ p }}
                  </span>
                </div>
                <div class="h-px bg-white/[0.05] mb-3"></div>
                <p class="text-gray-400 text-sm leading-relaxed max-h-28 overflow-y-auto scrollbar-thin">{{ form.backstory }}</p>
              </div>
            </div>
            <div class="mt-4 text-center">
              <p class="text-[11px] text-emerald-500/50 flex items-center justify-center gap-2">
                <span class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                {{ t('create.confirmHint') }}
                <span class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              </p>
            </div>
          </div>
        </transition>

        <!-- Navigation (enhanced) -->
        <div class="flex justify-between mt-8">
          <button v-if="step > 0" @click="goBack" class="btn-secondary text-sm py-2.5 group flex items-center gap-1">
            <svg class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            {{ t('nav.prev') }}
          </button>
          <div v-else></div>
          <button v-if="step < 4" @click="nextStep" class="btn-primary text-sm py-2.5 group flex items-center gap-1" :disabled="!canNext">
            {{ t('nav.next') }}
            <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
          <button v-else @click="confirmCreate" class="btn-primary text-sm py-2.5 animate-glow group flex items-center gap-1.5">
            <span>{{ t('create.selectWorld') }}</span>
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </button>
        </div>
      </div>

      <!-- ═══ Right: Live Preview (desktop) ═══ -->
      <div class="hidden lg:flex w-72 flex-col gap-4">
        <div class="glass-card p-5 flex-1 flex flex-col border-gradient relative overflow-hidden">
          <!-- Accent corner glow -->
          <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] transition-all duration-1000"
            :style="{ background: `radial-gradient(circle, ${stepAccentColor}25, transparent)` }"></div>

          <p class="text-[9px] text-dark-500 uppercase tracking-[0.2em] mb-4 relative">{{ t('create.preview') }}</p>

          <!-- Avatar with animation -->
          <div class="text-center mb-5 relative">
            <div class="w-24 h-24 mx-auto rounded-2xl border flex items-center justify-center text-5xl mb-3 transition-all duration-500 relative"
              :class="form.name ? 'opacity-100 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/15 shadow-lg shadow-emerald-500/10' : 'opacity-30 bg-white/[0.02] border-white/[0.06]'">
              <span class="transition-all duration-300" :class="form.name ? 'scale-100' : 'scale-75'">{{ previewAvatar }}</span>
              <!-- Mood ring -->
              <div v-if="form.name" class="absolute -inset-1 rounded-2xl border border-emerald-500/20 animate-breathe" style="animation-duration: 4s;"></div>
            </div>
            <h3 class="font-bold text-base transition-all" :class="form.name ? 'text-gray-200' : 'text-dark-600'">
              {{ form.name || t('create.unnamed') }}
            </h3>
            <p class="text-[11px] text-gray-600 mt-0.5">{{ form.gender || '?' }} · {{ form.startAge }}{{ t('create.ageUnit') }} · {{ ageStageName(form.startAge) }}</p>
          </div>

          <!-- Traits (animated) -->
          <div class="mb-4">
            <p class="text-[9px] text-dark-500 uppercase tracking-wider mb-2">{{ t('create.personality') }}</p>
            <div class="flex flex-wrap gap-1">
              <TransitionGroup name="fade">
                <span v-for="p in form.personality" :key="p"
                  class="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15 flex items-center gap-0.5">
                  {{ traitEmoji(p) }} {{ p }}
                </span>
              </TransitionGroup>
              <span v-for="i in Math.max(0, 3 - form.personality.length)" :key="'e'+i"
                class="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.02] text-dark-600 border border-white/[0.04]">?</span>
            </div>
          </div>

          <!-- Story preview -->
          <div class="flex-1">
            <p class="text-[9px] text-dark-500 uppercase tracking-wider mb-2">{{ t('create.storyLabel') }}</p>
            <p class="text-[11px] text-gray-500 leading-relaxed line-clamp-6" :class="form.backstory ? '' : 'italic text-dark-600'">
              {{ form.backstory || t('create.awaitStory') }}
            </p>
          </div>

          <!-- Completeness (enhanced ring) -->
          <div class="mt-4 pt-3 border-t border-white/[0.04]">
            <div class="flex items-center gap-3">
              <div class="relative w-10 h-10 shrink-0">
                <svg viewBox="0 0 40 40" class="w-full h-full -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="3" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke-width="3" stroke-linecap="round"
                    :stroke="completeness === 100 ? '#10b981' : '#3b82f6'"
                    :stroke-dasharray="`${completeness * 1.005} 100.5`"
                    class="transition-all duration-700" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center text-[9px] font-bold font-mono"
                  :class="completeness === 100 ? 'text-emerald-400' : 'text-gray-500'">
                  {{ completeness }}%
                </div>
              </div>
              <div>
                <p class="text-[10px]" :class="completeness === 100 ? 'text-emerald-400 font-medium' : 'text-dark-500'">
                  {{ completeness === 100 ? t('create.ready') : t('create.completeness') }}
                </p>
                <p class="text-[9px] text-dark-600">{{ completedItems.join(' · ') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import aiService from '../services/ai'
import { t } from '../i18n'

const router = useRouter()
const store = useGameStore()
const step = ref(0)
const slideDirection = ref('slide-up')
const steps = computed(() => t('create.steps').map((label, i) => ({
  label, icon: t('create.stepsIcon')[i],
})))
const isGenerating = ref(false)

// Sparkle effects
const sparkles = ref([])
let sparkleId = 0
function spawnSparkle(event, emoji) {
  const rect = event.currentTarget?.getBoundingClientRect()
  if (!rect) return
  const id = ++sparkleId
  sparkles.value.push({ id, x: rect.left + rect.width / 2 - 8, y: rect.top - 10, emoji })
  setTimeout(() => { sparkles.value = sparkles.value.filter(s => s.id !== id) }, 800)
}

// Step accent colors
const stepAccentColor = computed(() => {
  return ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'][step.value]
})
const stepEmoji = computed(() => ['📝', '🎭', '💫', '📖', '🚀'][step.value])

// Dynamic background that shifts per step
const dynamicBg = computed(() => {
  const hues = [168, 195, 265, 35, 155]
  const h = hues[step.value]
  return {
    background: `radial-gradient(ellipse at 70% 80%, hsla(${h}, 50%, 18%, 0.12) 0%, transparent 50%), linear-gradient(160deg, hsl(${h - 20}, 50%, 12%) 0%, hsl(${h}, 40%, 10%) 35%, hsl(${h + 30}, 45%, 13%) 65%, hsl(${h + 10}, 50%, 9%) 100%)`,
    transition: 'background 1.5s ease',
  }
})

// Orb colors per step
const orbColors = computed(() => {
  const palettes = [
    ['rgba(16,185,129,0.16)', 'rgba(6,182,212,0.12)', 'rgba(52,211,153,0.08)'],
    ['rgba(6,182,212,0.16)', 'rgba(99,102,241,0.12)', 'rgba(14,165,233,0.08)'],
    ['rgba(139,92,246,0.16)', 'rgba(192,132,252,0.12)', 'rgba(99,102,241,0.08)'],
    ['rgba(245,158,11,0.16)', 'rgba(251,191,36,0.12)', 'rgba(217,119,6,0.08)'],
    ['rgba(16,185,129,0.18)', 'rgba(52,211,153,0.14)', 'rgba(6,182,212,0.10)'],
  ]
  const p = palettes[step.value]
  return [
    `radial-gradient(circle, ${p[0]}, transparent 65%)`,
    `radial-gradient(circle, ${p[1]}, transparent 65%)`,
    `radial-gradient(circle, ${p[2]}, transparent 65%)`,
  ]
})

// Floating decoration particles
const decoEmojis = ['✨', '🌟', '💫', '⭐', '🎭', '🎨', '📝', '🌸', '🍀', '💎', '🔮', '🌙']
const floatingParticles = computed(() => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `fp-${i}`,
    emoji: decoEmojis[i % decoEmojis.length],
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    dx: (Math.random() - 0.5) * 60,
    dy: (Math.random() - 0.5) * 50,
    dur: 14 + Math.random() * 16,
    delay: Math.random() * 12,
    size: 14 + Math.random() * 14,
    blur: Math.random() > 0.6 ? 1 : 0,
  }))
})

const genders = computed(() => [
  { value: '男', label: t('create.genderMale'), icon: '👨', glow: 'rgba(59,130,246,0.15)' },
  { value: '女', label: t('create.genderFemale'), icon: '👩', glow: 'rgba(244,114,182,0.15)' },
  { value: '其他', label: t('create.genderOther'), icon: '🧑', glow: 'rgba(139,92,246,0.15)' },
])
const traitKeys = ['brave', 'cautious', 'kind', 'cold', 'smart', 'naive', 'humorous', 'serious', 'romantic', 'pragmatic', 'rebel', 'gentle', 'ambitious', 'easygoing', 'extrovert', 'introvert', 'just', 'goWithFlow']
const traitZh = ['勇敢', '谨慎', '善良', '冷酷', '聪明', '天真', '幽默', '严肃', '浪漫', '务实', '叛逆', '温顺', '野心勃勃', '淡泊名利', '外向开朗', '内向沉静', '正义感强', '随波逐流']
const traits = computed(() => traitKeys.map((k, i) => ({ key: k, label: t('traits.' + k), zhLabel: traitZh[i] })))

const avatarCatIcons = ['👤', '💼', '🧙', '🐾', '🎭']
const avatarCatAvatars = [
  ['👶', '👦', '👧', '👨', '👩', '🧑', '👴', '👵', '🧒', '👱', '👱‍♀️', '🧔', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳', '🧑‍🦱', '🧑‍🦰'],
  ['👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀', '👨‍🍳', '👩‍🍳', '👨‍✈️', '👩‍✈️', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍🌾', '👩‍🌾', '🕵️', '🕵️‍♀️'],
  ['🧙', '🧙‍♀️', '🧝', '🧝‍♀️', '🧛', '🧛‍♀️', '🧜', '🧜‍♀️', '🧚', '🧚‍♀️', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🥷', '👸', '🤴', '🤖', '👻', '👽'],
  ['🐱', '🐶', '🦊', '🐺', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐉', '🦅', '🦋', '🐧', '🐬', '🦄', '🐙', '🦎', '🐝', '🦉'],
  ['🎭', '👑', '⭐', '🌙', '🔥', '💎', '🌸', '🍀', '🌊', '⚡', '🎪', '🎯', '🏆', '💫', '🌈', '🎵', '🗡️', '🛡️', '🔮', '💀'],
]
const avatarCategories = computed(() => t('create.avatarCats').map((label, i) => ({
  label, icon: avatarCatIcons[i], avatars: avatarCatAvatars[i],
})))
const selectedCategory = ref(0)

const agePresets = computed(() => [0, 6, 18, 30].map((age, i) => ({
  age, ...t('create.agePresets')[i],
})))
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

const completedItems = computed(() => {
  const items = []
  if (form.value.name.trim()) items.push(t('create.items.name'))
  if (form.value.gender) items.push(t('create.items.gender'))
  if (form.value.avatar) items.push(t('create.items.avatar'))
  if (form.value.personality.length === 3) items.push(t('create.items.traits'))
  if (form.value.backstory.trim().length >= 10) items.push(t('create.items.story'))
  return items.length ? items : [t('create.notStarted')]
})

function traitEmoji(trait) {
  const map = { '勇敢': '🦁', '谨慎': '🛡️', '善良': '💛', '冷酷': '🧊', '聪明': '🧠', '天真': '🌸', '幽默': '😄', '严肃': '🎩', '浪漫': '🌹', '务实': '⚙️', '叛逆': '🔥', '温顺': '🕊️', '野心勃勃': '🚀', '淡泊名利': '🍃', '外向开朗': '☀️', '内向沉静': '🌙', '正义感强': '⚖️', '随波逐流': '🌊' }
  return map[trait] || '✨'
}

function toggleTrait(t) {
  const i = form.value.personality.indexOf(t)
  if (i >= 0) form.value.personality.splice(i, 1)
  else if (form.value.personality.length < 3) form.value.personality.push(t)
}
function nextStep() {
  if (canNext.value) {
    slideDirection.value = 'slide-up'
    step.value++
  }
}
function goBack() {
  slideDirection.value = 'slide-down'
  step.value--
}

// Confirm banner gradient
const confirmBannerBg = computed(() => {
  const g = form.value.gender
  if (g === '女') return 'linear-gradient(135deg, #831843 0%, #e11d48 40%, #f472b6 70%, #fce7f3 100%)'
  if (g === '男') return 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 40%, #60a5fa 70%, #dbeafe 100%)'
  return 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 40%, #a78bfa 70%, #ede9fe 100%)'
})

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
  if (age < 3) return t('create.ageStages.infant')
  if (age < 6) return t('create.ageStages.toddler')
  if (age < 12) return t('create.ageStages.child')
  if (age < 18) return t('create.ageStages.teen')
  if (age < 30) return t('create.ageStages.youth')
  if (age < 50) return t('create.ageStages.prime')
  if (age < 65) return t('create.ageStages.middle')
  return t('create.ageStages.elder')
}

const previewAvatar = computed(() => {
  if (form.value.avatar) return form.value.avatar
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

<style scoped>
.slide-up-enter-active, .slide-up-leave-active,
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-leave-to { opacity: 0; transform: translateY(-20px); }
.slide-down-enter-from { opacity: 0; transform: translateY(-20px); }
.slide-down-leave-to { opacity: 0; transform: translateY(20px); }

@keyframes scale-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
</style>
