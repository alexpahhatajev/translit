<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EditorLoadEvent } from 'primevue/editor'
import Editor from 'primevue/editor'
import { transliterate, tryMultiCharTranslit } from '@/utils/translit'

const STORAGE_KEY = 'translit-editor-content'
const text = ref('')

// Load saved content on mount
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    text.value = saved
  }
})

const onEditorLoad = (event: EditorLoadEvent) => {
  const quill = event.instance
  quill.format('font', 'serif')
  quill.format('header', 2)

  quill.on('text-change', (delta: any, _oldDelta: any, source: string) => {
    // Save content to localStorage on any change
    const html = quill.getSemanticHTML()
    localStorage.setItem(STORAGE_KEY, html)
    if (source === 'user') {
      // Handle transliteration for inserted text
      const ops = delta.ops || []
      for (const op of ops) {
        if (op.insert && typeof op.insert === 'string') {
          const insertedText = op.insert
          const selection = quill.getSelection()

          if (selection && insertedText.length === 1) {
            // Single character typed - check for multi-char sequence
            const cursorPos = selection.index
            const editorText = quill.getText()

            // Get up to 3 previous characters
            const prevChars = editorText.slice(Math.max(0, cursorPos - 4), cursorPos - 1)

            // Try to form a multi-char sequence
            const multiResult = tryMultiCharTranslit(prevChars, insertedText)

            if (multiResult) {
              // Delete previous chars + new char, insert the combined result
              const deleteStart = cursorPos - 1 - multiResult.charsToDelete
              const deleteLength = multiResult.charsToDelete + 1

              quill.deleteText(deleteStart, deleteLength, 'silent')
              quill.insertText(deleteStart, multiResult.result, 'silent')
              quill.setSelection(deleteStart + multiResult.result.length, 0, 'silent')
            } else {
              // No multi-char match, just transliterate the single char
              const transliterated = transliterate(insertedText)
              if (transliterated !== insertedText) {
                const insertIndex = cursorPos - 1
                quill.deleteText(insertIndex, 1, 'silent')
                quill.insertText(insertIndex, transliterated, 'silent')
                quill.setSelection(insertIndex + transliterated.length, 0, 'silent')
              }
            }
          } else if (selection && insertedText.length > 1) {
            // Multiple characters (e.g., paste) - transliterate the whole thing
            const transliterated = transliterate(insertedText)
            if (transliterated !== insertedText) {
              const insertIndex = selection.index - insertedText.length
              quill.deleteText(insertIndex, insertedText.length, 'silent')
              quill.insertText(insertIndex, transliterated, 'silent')
              quill.setSelection(insertIndex + transliterated.length, 0, 'silent')
            }
          }
        }
      }

      // Maintain default formatting
      const selection = quill.getSelection()
      if (selection) {
        const format = quill.getFormat(selection.index)
        if (!format.font) {
          setTimeout(() => quill.format('font', 'serif', 'silent'), 0)
        }
        if (!format.header) {
          setTimeout(() => quill.format('header', 2, 'silent'), 0)
        }
      }
    }
  })
}
</script>

<template>
  <div class="w-full max-w-4xl">
    <Editor v-model="text" editorStyle="height: 500px" @load="onEditorLoad">
      <template #toolbar>
        <span></span>
      </template>
    </Editor>
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
</style>
