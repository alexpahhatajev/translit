import { ref, shallowRef } from 'vue'
import { createDebouncedSpellCheck, type SpellerError } from '@/services/yandexSpeller'

const spellCheckEnabled = ref(true)
const errors = shallowRef<SpellerError[]>([])
const isChecking = ref(false)

const debouncedCheck = createDebouncedSpellCheck(800)

export function useSpellCheck() {
  const toggle = () => {
    spellCheckEnabled.value = !spellCheckEnabled.value
    if (!spellCheckEnabled.value) {
      errors.value = []
    }
  }

  const checkText = (text: string) => {
    if (!spellCheckEnabled.value || !text.trim()) {
      errors.value = []
      return
    }

    isChecking.value = true
    debouncedCheck(text, (result) => {
      errors.value = result
      isChecking.value = false
    })
  }

  const clearErrors = () => {
    errors.value = []
  }

  const getErrorAtPosition = (pos: number): SpellerError | undefined => {
    return errors.value.find(err => pos >= err.pos && pos < err.pos + err.len)
  }

  return {
    spellCheckEnabled,
    errors,
    isChecking,
    toggle,
    checkText,
    clearErrors,
    getErrorAtPosition,
  }
}
