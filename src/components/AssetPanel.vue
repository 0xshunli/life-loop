<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[92] flex items-center justify-center bg-black/70 backdrop-blur-md px-4" @click.self="$emit('close')">
      <div class="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-white/[0.08] shadow-2xl"
        style="background: linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(10,15,26,0.99) 100%);">

        <button @click="$emit('close')" class="absolute top-4 right-4 z-10 btn-ghost p-2 text-gray-500 hover:text-white">✕</button>

        <!-- Header -->
        <div class="px-6 pt-6 pb-4">
          <h2 class="text-lg font-bold text-gray-200 flex items-center gap-2">{{ t('assets.title') }}</h2>
          <p class="text-[11px] text-gray-500 mt-1">{{ t('assets.desc') }}</p>
          <div class="mt-3 flex items-center gap-2">
            <span class="text-[10px] text-gray-600 uppercase tracking-wider">{{ t('assets.totalValue') }}</span>
            <span class="text-lg font-bold font-mono text-amber-400">{{ store.totalAssetValue }}</span>
          </div>
        </div>

        <div class="px-6 pb-8 space-y-5">
          <!-- Asset categories -->
          <div v-for="cat in assetCategories" :key="cat.type">
            <div v-if="cat.items.length" class="mb-4">
              <h3 class="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <span>{{ cat.icon }}</span> {{ cat.label }}
              </h3>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="asset in cat.items" :key="asset.id"
                  class="glass-card p-3 text-center relative overflow-hidden group hover:border-white/[0.12] transition-all">
                  <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 to-amber-400/10"></div>
                  <div class="text-3xl mb-1">{{ asset.icon }}</div>
                  <p class="text-[12px] font-medium text-gray-300">{{ asset.name }}</p>
                  <p class="text-[9px] text-gray-600 mt-0.5">{{ t('assets.value') }} {{ asset.value }} · {{ t('assets.acquiredAt', { age: asset.acquiredAge }) }}</p>
                  <!-- Effects -->
                  <div class="flex justify-center gap-1 mt-1.5 flex-wrap">
                    <span v-for="(v, k) in asset.effects" :key="k"
                      class="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/10">
                      {{ attrIcon(k) }}+{{ v }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="store.assets.length === 0" class="text-center py-10">
            <div class="text-4xl mb-3 opacity-30">🏠</div>
            <p class="text-sm text-gray-500">{{ t('assets.noAssets') }}</p>
            <p class="text-[11px] text-gray-600 mt-1">{{ t('assets.noAssetsDesc') }}</p>
          </div>

          <!-- Available assets (catalog) -->
          <section v-if="unownedAssets.length">
            <h3 class="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <span class="w-6 h-px bg-white/10"></span> {{ t('assets.unowned') }}
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="asset in unownedAssets" :key="asset.id"
                class="p-2 rounded-xl text-center opacity-30 bg-white/[0.01] border border-dashed border-white/[0.06]">
                <div class="text-xl mb-0.5 grayscale">{{ asset.icon }}</div>
                <p class="text-[9px] text-gray-700">{{ asset.name }}</p>
              </div>
            </div>
          </section>
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

const ASSET_CATALOG = {
  apartment: { name: '公寓', icon: '🏢', type: 'property', value: 30 },
  house: { name: '别墅', icon: '🏡', type: 'property', value: 60 },
  mansion: { name: '豪宅', icon: '🏰', type: 'property', value: 95 },
  bicycle: { name: '自行车', icon: '🚲', type: 'vehicle', value: 5 },
  car: { name: '轿车', icon: '🚗', type: 'vehicle', value: 25 },
  sports_car: { name: '跑车', icon: '🏎️', type: 'vehicle', value: 70 },
  painting: { name: '名画', icon: '🖼️', type: 'collectible', value: 40 },
  antique: { name: '古董', icon: '🏺', type: 'collectible', value: 50 },
  watch: { name: '名表', icon: '⌚', type: 'luxury', value: 35 },
  jewelry: { name: '珠宝', icon: '💎', type: 'luxury', value: 55 },
  yacht: { name: '游艇', icon: '🛥️', type: 'luxury', value: 90 },
}

const attrIcons = { health: '❤️', intelligence: '🧠', charisma: '✨', wealth: '💰', happiness: '😊', social: '👥' }
function attrIcon(k) { return attrIcons[k] || k }

const assetCategories = computed(() => {
  const types = [
    { type: 'property', label: t('assets.property'), icon: '🏠' },
    { type: 'vehicle', label: t('assets.vehicle'), icon: '🚗' },
    { type: 'collectible', label: t('assets.collectible'), icon: '🖼️' },
    { type: 'luxury', label: t('assets.luxury'), icon: '💎' },
  ]
  return types.map(t => ({
    ...t,
    items: store.assets.filter(a => a.type === t.type),
  }))
})

const unownedAssets = computed(() => {
  const ownedIds = new Set(store.assets.map(a => a.id))
  return Object.entries(ASSET_CATALOG)
    .filter(([id]) => !ownedIds.has(id))
    .map(([id, def]) => ({ id, ...def }))
})
</script>
