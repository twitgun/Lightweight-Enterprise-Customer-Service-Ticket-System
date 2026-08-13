import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'

const saved = localStorage.getItem('ts_lang') || 'zh'

const i18n = createI18n({
  legacy: false,
  locale: saved,
  fallbackLocale: 'zh',
  messages: { zh, en }
})

export default i18n
