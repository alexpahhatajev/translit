<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TextEditor from '@/components/TextEditor.vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import HelpPanel from '@/components/HelpPanel.vue'
import KeyboardLayout from '@/components/KeyboardLayout.vue'
import TextStats from '@/components/TextStats.vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useTranslit } from '@/composables/useTranslit'
import { useSpellCheck } from '@/composables/useSpellCheck'
import { useClipboard } from '@/composables/useClipboard'

const { init } = useDarkMode()
const { translitEnabled, direction, toggle: toggleTranslit, toggleDirection } = useTranslit()
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
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-center py-8">
        <div class="w-full max-w-2xl lg:max-w-[calc(42rem+16px+16rem)] flex items-center justify-center relative">
          <div class="flex items-center gap-3">
            <img src="/favicon.svg" alt="Translit logo" class="w-10 h-10 logo-spin" />
            <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">TRANSLIT</h1>
          </div>
          <div class="absolute right-0">
            <DarkModeToggle />
          </div>
        </div>
      </div>

      <div class="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm">
        <button
          @click="toggleDirection"
          :class="[
            'w-44 px-3 py-1 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer hover:opacity-80',
            direction === 'latin-to-cyrillic'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
              : 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200'
          ]"
        >
          <font-awesome-icon icon="fa-solid fa-arrows-left-right" />
          <span>{{ direction === 'latin-to-cyrillic' ? 'A → Я' : 'Я → A' }}</span>
        </button>

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

      <div class="flex flex-col gap-4 justify-center items-center">
        <div class="flex flex-col lg:flex-row gap-4 w-full justify-center items-center lg:items-start">
          <div class="lg:hidden w-full max-w-2xl">
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <font-awesome-icon icon="fa-solid fa-keyboard" class="text-cyan-500" />
                <span class="font-medium text-gray-800 dark:text-gray-200 text-sm">Keyboard</span>
              </div>
              <KeyboardLayout />
            </div>
          </div>
          <div class="w-full max-w-2xl">
            <TextEditor />
          </div>
          <div class="hidden lg:flex lg:flex-col gap-3 w-64 shrink-0">
            <div class="sticky top-4 space-y-3">
              <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <font-awesome-icon icon="fa-solid fa-keyboard" class="text-cyan-500" />
                  <span class="font-medium text-gray-800 dark:text-gray-200 text-sm">Keyboard</span>
                </div>
                <KeyboardLayout />
              </div>
              <TextStats />
            </div>
          </div>
        </div>

        <HelpPanel />
      </div>

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
