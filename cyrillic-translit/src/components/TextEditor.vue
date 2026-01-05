<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { EditorLoadEvent } from 'primevue/editor'
import Editor from 'primevue/editor'
import { transliterate, tryMultiCharTranslit } from '@/utils/translit'
import { useTranslit } from '@/composables/useTranslit'
import { useSpellCheck } from '@/composables/useSpellCheck'
import type { SpellerError } from '@/services/yandexSpeller'

const STORAGE_KEY = 'translit-editor-content'
const text = ref('')
const showCopiedToast = ref(false)
const { translitEnabled, toggle: toggleTranslit } = useTranslit()
const { spellCheckEnabled, errors, isChecking, checkText, toggle: toggleSpellCheck } = useSpellCheck()

// Suggestion popover state
const showSuggestions = ref(false)
const suggestionPosition = ref({ x: 0, y: 0 })
const currentError = ref<SpellerError | null>(null)

let quillInstance: any = null

// Handle keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  // ESC - copy text to clipboard
  if (e.key === 'Escape' && quillInstance) {
    const plainText = quillInstance.getText().trim()
    if (plainText) {
      navigator.clipboard.writeText(plainText)
      showCopiedToast.value = true
      setTimeout(() => {
        showCopiedToast.value = false
      }, 2000)
    }
  }

  // F1 - toggle transliteration
  if (e.key === 'F1') {
    e.preventDefault()
    toggleTranslit()
  }

  // F2 - toggle spell check
  if (e.key === 'F2') {
    e.preventDefault()
    toggleSpellCheck()
    if (spellCheckEnabled.value && quillInstance) {
      applySpellCheckHighlights()
    } else {
      clearSpellCheckHighlights()
    }
  }
}

// Apply red underline to spelling errors
const applySpellCheckHighlights = () => {
  if (!quillInstance || !spellCheckEnabled.value) return

  // First, clear existing highlights
  clearSpellCheckHighlights()

  // Apply underline to each error
  for (const error of errors.value) {
    quillInstance.formatText(error.pos, error.len, 'spellError', true, 'silent')
  }
}

// Clear all spell check highlights
const clearSpellCheckHighlights = () => {
  if (!quillInstance) return
  const length = quillInstance.getLength()
  quillInstance.formatText(0, length, 'spellError', false, 'silent')
}

// Handle click on editor to show suggestions
const handleEditorClick = (event: MouseEvent) => {
  if (!quillInstance || !spellCheckEnabled.value) return

  const selection = quillInstance.getSelection()
  if (!selection) return

  // Find if we clicked on an error
  const clickedError = errors.value.find(
    err => selection.index >= err.pos && selection.index <= err.pos + err.len
  )

  if (clickedError && clickedError.s.length > 0) {
    currentError.value = clickedError
    suggestionPosition.value = { x: event.clientX, y: event.clientY }
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
    currentError.value = null
  }
}

// Apply suggestion to fix error
const applySuggestion = (suggestion: string) => {
  if (!quillInstance || !currentError.value) return

  const error = currentError.value
  quillInstance.deleteText(error.pos, error.len, 'user')
  quillInstance.insertText(error.pos, suggestion, 'user')

  showSuggestions.value = false
  currentError.value = null
}

// Close suggestions popover
const closeSuggestions = () => {
  showSuggestions.value = false
  currentError.value = null
}

// Watch for error changes and apply highlights
watch(errors, () => {
  applySpellCheckHighlights()
}, { deep: true })

// Load saved content on mount
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    text.value = saved
  }
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const onEditorLoad = (event: EditorLoadEvent) => {
  const quill = event.instance
  quillInstance = quill

  // Register custom format for spell errors
  const Parchment = quill.constructor.import('parchment')
  const SpellErrorClass = new Parchment.ClassAttributor('spellError', 'spell-error', {
    scope: Parchment.Scope.INLINE,
  })
  quill.constructor.register(SpellErrorClass, true)

  // Default format to apply to all text
  const defaultFormat = { font: 'serif' }

  // Initial spell check
  setTimeout(() => {
    if (spellCheckEnabled.value) {
      checkText(quill.getText())
    }
  }, 500)

  quill.on('text-change', (delta: any, _oldDelta: any, source: string) => {
    // Save content to localStorage on any change
    const html = quill.getSemanticHTML()
    localStorage.setItem(STORAGE_KEY, html)

    // Trigger spell check
    if (spellCheckEnabled.value) {
      checkText(quill.getText())
    }

    if (source === 'user' && translitEnabled.value) {
      // Calculate insert position from delta ops
      let insertPos = 0
      const ops = delta.ops || []

      for (const op of ops) {
        if (op.retain) {
          insertPos = op.retain
        }

        if (op.insert && typeof op.insert === 'string') {
          const insertedText = op.insert
          const editorText = quill.getText()

          if (insertedText.length === 1) {
            // Single character typed - check for multi-char sequence
            // Get up to 3 previous characters (before the inserted char)
            const prevChars = editorText.slice(Math.max(0, insertPos - 3), insertPos)

            // Try to form a multi-char sequence
            const multiResult = tryMultiCharTranslit(prevChars, insertedText)

            if (multiResult) {
              // Delete previous chars + new char, insert the combined result
              const deleteStart = insertPos - multiResult.charsToDelete
              const deleteLength = multiResult.charsToDelete + 1

              quill.deleteText(deleteStart, deleteLength, 'silent')
              quill.insertText(deleteStart, multiResult.result, defaultFormat, 'silent')
              quill.setSelection(deleteStart + multiResult.result.length, 0, 'silent')
            } else {
              // No multi-char match, just transliterate the single char
              const transliterated = transliterate(insertedText)
              if (transliterated !== insertedText) {
                quill.deleteText(insertPos, 1, 'silent')
                quill.insertText(insertPos, transliterated, defaultFormat, 'silent')
                quill.setSelection(insertPos + transliterated.length, 0, 'silent')
              }
            }
          } else if (insertedText.length > 1) {
            // Multiple characters (e.g., paste) - transliterate the whole thing
            const transliterated = transliterate(insertedText)
            if (transliterated !== insertedText) {
              quill.deleteText(insertPos, insertedText.length, 'silent')
              quill.insertText(insertPos, transliterated, defaultFormat, 'silent')
              quill.setSelection(insertPos + transliterated.length, 0, 'silent')
            }
          }
        }
      }

      // Apply default formatting to newly typed text
      const selection = quill.getSelection()
      if (selection) {
        const format = quill.getFormat(selection.index > 0 ? selection.index - 1 : 0)
        if (!format.font) {
          quill.formatText(0, quill.getLength(), 'font', 'serif', 'silent')
        }
      }
    }
  })
}
</script>

<template>
  <div class="w-full max-w-4xl relative">
    <div @click="handleEditorClick">
      <Editor v-model="text" editorStyle="height: 500px" @load="onEditorLoad">
        <template #toolbar>
          <span></span>
        </template>
      </Editor>
    </div>

    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="showCopiedToast"
        class="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <font-awesome-icon icon="fa-solid fa-check" />
        <span>Copied to clipboard</span>
      </div>
    </Transition>

    <!-- Spell check suggestions popover -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSuggestions && currentError"
          class="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-48"
          :style="{ left: suggestionPosition.x + 'px', top: suggestionPosition.y + 10 + 'px' }"
        >
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
            Suggestions for "<span class="text-red-500">{{ currentError.word }}</span>"
          </div>
          <div class="flex flex-col">
            <button
              v-for="suggestion in currentError.s.slice(0, 5)"
              :key="suggestion"
              @click="applySuggestion(suggestion)"
              class="px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-200"
            >
              {{ suggestion }}
            </button>
          </div>
          <button
            @click="closeSuggestions"
            class="mt-2 w-full px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Close
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Click outside to close suggestions -->
    <div
      v-if="showSuggestions"
      class="fixed inset-0 z-40"
      @click="closeSuggestions"
    ></div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

:deep(.p-editor-content) {
  min-height: 24rem;
}

:deep(.p-editor) {
  @apply border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden;
}

:deep(.p-editor-toolbar) {
  @apply hidden;
}

:deep(.p-editor-content .ql-editor) {
  @apply text-gray-900 dark:text-gray-100;
  font-family: Georgia, 'Times New Roman', serif !important;
  font-size: 1.125rem;
  line-height: 1.75;
}

:deep(.p-editor-content .ql-editor p),
:deep(.p-editor-content .ql-editor span) {
  font-family: inherit !important;
  font-size: inherit !important;
}

:deep(.p-editor-content .ql-editor.ql-blank::before) {
  @apply text-gray-400 dark:text-gray-500;
}

:deep(.ql-container) {
  @apply border-none;
}

:deep(.ql-snow) {
  @apply border-gray-300 dark:border-gray-700;
}

/* Spell error underline */
:deep(.spell-error-true) {
  text-decoration: underline wavy red;
  text-decoration-skip-ink: none;
  cursor: pointer;
}

/* Toast transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* Fade transition for suggestions popover */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
