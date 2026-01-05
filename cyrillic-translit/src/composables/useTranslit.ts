import { ref } from 'vue'

const translitEnabled = ref(true)

export function useTranslit() {
  const toggle = () => {
    translitEnabled.value = !translitEnabled.value
  }

  return { translitEnabled, toggle }
}
