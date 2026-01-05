import { ref } from 'vue'

export type TranslitDirection = 'latin-to-cyrillic' | 'cyrillic-to-latin'

const translitEnabled = ref(true)
const direction = ref<TranslitDirection>('latin-to-cyrillic')

export function useTranslit() {
  const toggle = () => {
    translitEnabled.value = !translitEnabled.value
  }

  const toggleDirection = () => {
    direction.value = direction.value === 'latin-to-cyrillic'
      ? 'cyrillic-to-latin'
      : 'latin-to-cyrillic'
  }

  const setDirection = (dir: TranslitDirection) => {
    direction.value = dir
  }

  return { translitEnabled, direction, toggle, toggleDirection, setDirection }
}
