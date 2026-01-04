import { ref, watch } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  const init = () => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      isDark.value = stored === 'true'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateClass()
  }

  const updateClass = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggle = () => {
    isDark.value = !isDark.value
  }

  watch(isDark, (value) => {
    localStorage.setItem('darkMode', String(value))
    updateClass()
  })

  return {
    isDark,
    toggle,
    init,
  }
}
