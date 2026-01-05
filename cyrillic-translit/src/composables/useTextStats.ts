import { ref, computed } from 'vue'

const text = ref('')

export function setTextForStats(newText: string) {
  text.value = newText
}

export function useTextStats() {
  const charCount = computed(() => text.value.length)

  const charCountNoSpaces = computed(() =>
    text.value.replace(/\s/g, '').length
  )

  const wordCount = computed(() => {
    const trimmed = text.value.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).filter(word => word.length > 0).length
  })

  const sentenceCount = computed(() => {
    const trimmed = text.value.trim()
    if (!trimmed) return 0
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0)
    return sentences.length
  })

  const paragraphCount = computed(() => {
    const trimmed = text.value.trim()
    if (!trimmed) return 0
    const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    return paragraphs.length || (trimmed.length > 0 ? 1 : 0)
  })

  const lineCount = computed(() => {
    if (!text.value) return 0
    return text.value.split('\n').length
  })

  return {
    charCount,
    charCountNoSpaces,
    wordCount,
    sentenceCount,
    paragraphCount,
    lineCount,
  }
}
