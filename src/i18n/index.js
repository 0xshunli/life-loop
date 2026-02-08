/**
 * 轻量级 i18n 系统
 */
import { reactive, computed } from 'vue'
import zh from './zh'
import en from './en'
import ja from './ja'

const locales = { zh, en, ja }
const STORAGE_KEY = 'lifeprocess_locale'

const state = reactive({
  locale: localStorage.getItem(STORAGE_KEY) || 'zh',
})

export function setLocale(lang) {
  if (locales[lang]) {
    state.locale = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }
}

export function t(key, params) {
  const dict = locales[state.locale] || locales.zh
  let text = key.split('.').reduce((o, k) => o?.[k], dict)
  if (text === undefined) {
    // 回退到中文
    text = key.split('.').reduce((o, k) => o?.[k], locales.zh)
  }
  if (text === undefined) return key
  // 简单模板替换 {name} -> params.name
  if (params && typeof text === 'string') {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
    }
  }
  return text
}

export function useI18n() {
  return {
    t,
    locale: computed(() => state.locale),
    setLocale,
    localeOptions: [
      { value: 'zh', label: '简体中文' },
      { value: 'en', label: 'English' },
      { value: 'ja', label: '日本語' },
    ],
  }
}

export default { t, setLocale, useI18n, state }
