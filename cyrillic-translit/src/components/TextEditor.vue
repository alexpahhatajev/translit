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

  // Default format to apply to all text
  const defaultFormat = { font: 'serif' }

  quill.on('text-change', (delta: any, _oldDelta: any, source: string) => {
    // Save content to localStorage on any change
    const html = quill.getSemanticHTML()
    localStorage.setItem(STORAGE_KEY, html)

    if (source === 'user') {
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
</style>
