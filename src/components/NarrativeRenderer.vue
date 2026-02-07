<template>
  <div class="narrative-rich">
    <template v-for="(seg, i) in segments" :key="i">
      <span v-if="seg.type === 'dialogue'" class="nr-dialogue">{{ seg.text }}</span>
      <span v-else-if="seg.type === 'thought'" class="nr-thought">{{ seg.text }}</span>
      <span v-else-if="seg.type === 'emphasis'" class="nr-emphasis">{{ seg.text }}</span>
      <span v-else class="nr-text">{{ seg.text }}</span>
    </template>
    <span v-if="typing" class="inline-block w-0.5 h-[1.1em] bg-emerald-400/60 animate-pulse ml-0.5 align-text-bottom"></span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  typing: { type: Boolean, default: false },
})

const segments = computed(() => {
  if (!props.text) return []
  const result = []
  // Regex to match:
  // 1. 「...」 dialogue
  // 2. Thought patterns: text between ……markers or 内心:
  // 3. 【...】emphasis/system
  // 4. Regular text
  const regex = /(「[^」]*」)|(【[^】]*】)|((?:……[^「【\n]*……))/g
  let lastIndex = 0
  let match

  const str = props.text
  while ((match = regex.exec(str)) !== null) {
    // Push any text before this match
    if (match.index > lastIndex) {
      result.push({ type: 'text', text: str.slice(lastIndex, match.index) })
    }

    if (match[1]) {
      result.push({ type: 'dialogue', text: match[1] })
    } else if (match[2]) {
      result.push({ type: 'emphasis', text: match[2] })
    } else if (match[3]) {
      result.push({ type: 'thought', text: match[3] })
    }
    lastIndex = regex.lastIndex
  }

  // Push remaining text
  if (lastIndex < str.length) {
    result.push({ type: 'text', text: str.slice(lastIndex) })
  }

  return result
})
</script>
