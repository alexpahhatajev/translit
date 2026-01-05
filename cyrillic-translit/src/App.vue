<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TextEditor from '@/components/TextEditor.vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import HelpPanel from '@/components/HelpPanel.vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useTranslit } from '@/composables/useTranslit'
import { useSpellCheck } from '@/composables/useSpellCheck'
import { useClipboard } from '@/composables/useClipboard'

const { init } = useDarkMode()
const { translitEnabled, toggle: toggleTranslit } = useTranslit()
const { spellCheckEnabled, errors, isChecking, toggle: toggleSpellCheck } = useSpellCheck()
const { copyText } = useClipboard()

const showCopiedToast = ref(false)

const handleCopy = async () => {
  const success = await copyText()
  if (success) {
    showCopiedToast.value = true
    setTimeout(() => {
      showCopiedToast.value = false
    }, 2000)
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
    <div class="max-w-4xl mx-auto px-4">
      <div class="flex items-center justify-between py-8">
        <div class="w-32"></div>
        <div class="flex items-center gap-3">
          <img src="/favicon.svg" alt="Translit logo" class="w-10 h-10 logo-spin" />
          <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">TRANSLIT</h1>
        </div>
        <div class="w-32 flex justify-end">
          <DarkModeToggle />
        </div>
      </div>

      <div class="mb-4 flex items-center justify-center gap-3 text-sm">
        <button
          @click="toggleTranslit"
          :class="[
            'w-44 px-3 py-1 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer hover:opacity-80',
            translitEnabled
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
          ]"
        >
          <font-awesome-icon :icon="translitEnabled ? 'fa-solid fa-language' : 'fa-solid fa-font'" />
          <span>Translit: {{ translitEnabled ? 'ON' : 'OFF' }}</span>
          <span class="text-xs opacity-70">(F1)</span>
        </button>

        <button
          @click="toggleSpellCheck"
          :class="[
            'w-44 px-3 py-1 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer hover:opacity-80',
            spellCheckEnabled
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          ]"
        >
          <font-awesome-icon
            :icon="isChecking ? 'fa-solid fa-spinner' : 'fa-solid fa-spell-check'"
            :class="{ 'animate-spin': isChecking }"
          />
          <span>Spell: {{ spellCheckEnabled ? 'ON' : 'OFF' }}</span>
          <span v-if="spellCheckEnabled && errors.length > 0" class="bg-red-500 text-white text-xs px-1.5 rounded-full">
            {{ errors.length }}
          </span>
          <span class="text-xs opacity-70">(F2)</span>
        </button>

        <button
          @click="handleCopy"
          class="w-44 px-3 py-1 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer hover:opacity-80 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          <font-awesome-icon icon="fa-solid fa-copy" />
          <span>Copy Text</span>
          <span class="text-xs opacity-70">(ESC)</span>
        </button>
      </div>

      <Transition name="toast">
        <div
          v-if="showCopiedToast"
          class="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
        >
          <font-awesome-icon icon="fa-solid fa-check" />
          <span>Copied to clipboard</span>
        </div>
      </Transition>

      <TextEditor />

      <HelpPanel />

      <footer class="mt-8 pb-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>2026 MIT License - Free to use and modify</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.logo-spin {
  cursor: pointer;
}

.logo-spin:hover {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
