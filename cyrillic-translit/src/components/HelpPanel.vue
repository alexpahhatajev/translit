<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'

const STORAGE_KEY = 'translit-help-sections'

const openSections = reactive(new Set<string>())

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const sections = JSON.parse(saved) as string[]
    sections.forEach(section => openSections.add(section))
  }
})

watch(openSections, () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...openSections]))
}, { deep: true })

const toggleSection = (section: string) => {
  if (openSections.has(section)) {
    openSections.delete(section)
  } else {
    openSections.add(section)
  }
}

const isOpen = (section: string) => openSections.has(section)

const multiCharRules = [
  { latin: 'shh', cyrillic: 'щ' },
  { latin: 'sh', cyrillic: 'ш' },
  { latin: 'ch', cyrillic: 'ч' },
  { latin: 'zh', cyrillic: 'ж' },
  { latin: 'ts', cyrillic: 'ц' },
  { latin: 'yu', cyrillic: 'ю' },
  { latin: 'ya', cyrillic: 'я' },
  { latin: 'yo', cyrillic: 'ё' },
  { latin: 'ye', cyrillic: 'е' },
  { latin: 'kh', cyrillic: 'х' },
  { latin: 'ja', cyrillic: 'я' },
  { latin: 'ju', cyrillic: 'ю' },
  { latin: 'je', cyrillic: 'э' },
]

const singleCharRules = [
  { latin: 'a', cyrillic: 'а' },
  { latin: 'b', cyrillic: 'б' },
  { latin: 'v', cyrillic: 'в' },
  { latin: 'g', cyrillic: 'г' },
  { latin: 'd', cyrillic: 'д' },
  { latin: 'e', cyrillic: 'е' },
  { latin: 'z', cyrillic: 'з' },
  { latin: 'i', cyrillic: 'и' },
  { latin: 'j', cyrillic: 'й' },
  { latin: 'k', cyrillic: 'к' },
  { latin: 'l', cyrillic: 'л' },
  { latin: 'm', cyrillic: 'м' },
  { latin: 'n', cyrillic: 'н' },
  { latin: 'o', cyrillic: 'о' },
  { latin: 'p', cyrillic: 'п' },
  { latin: 'r', cyrillic: 'р' },
  { latin: 's', cyrillic: 'с' },
  { latin: 't', cyrillic: 'т' },
  { latin: 'u', cyrillic: 'у' },
  { latin: 'f', cyrillic: 'ф' },
  { latin: 'h', cyrillic: 'х' },
  { latin: 'c', cyrillic: 'ц' },
  { latin: 'w', cyrillic: 'в' },
  { latin: 'x', cyrillic: 'кс' },
  { latin: 'y', cyrillic: 'ы' },
]

const specialCharRules = [
  { latin: "'", cyrillic: 'ь', description: 'soft sign' },
  { latin: '"', cyrillic: 'ъ', description: 'hard sign' },
]

const shortcuts = [
  { key: 'F1', description: 'Toggle transliteration ON/OFF' },
  { key: 'F2', description: 'Toggle spell check ON/OFF' },
  { key: 'F3', description: 'Toggle voice dictation (Russian)' },
  { key: 'ESC', description: 'Copy all text to clipboard' },
]
</script>

<template>
  <div class="w-full max-w-2xl lg:max-w-[calc(42rem+16px+16rem)]">
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div class="border-b border-gray-200 dark:border-gray-700">
          <button
            @click="toggleSection('shortcuts')"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span class="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
              <font-awesome-icon icon="fa-solid fa-keyboard" class="text-blue-500" />
              Keyboard Shortcuts
            </span>
            <font-awesome-icon
              :icon="isOpen('shortcuts') ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"
              class="text-gray-400"
            />
          </button>
          <Transition name="accordion">
            <div v-if="isOpen('shortcuts')" class="px-4 pb-4">
              <div class="grid gap-2">
                <div
                  v-for="shortcut in shortcuts"
                  :key="shortcut.key"
                  class="flex items-center gap-3"
                >
                  <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-800 dark:text-gray-200 min-w-16 text-center">
                    {{ shortcut.key }}
                  </kbd>
                  <span class="text-gray-600 dark:text-gray-400 text-sm">{{ shortcut.description }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="border-b border-gray-200 dark:border-gray-700">
          <button
            @click="toggleSection('multi')"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span class="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
              <font-awesome-icon icon="fa-solid fa-layer-group" class="text-purple-500" />
              Multi Character Combinations
            </span>
            <font-awesome-icon
              :icon="isOpen('multi') ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"
              class="text-gray-400"
            />
          </button>
          <Transition name="accordion">
            <div v-if="isOpen('multi')" class="px-4 pb-4">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                These combinations are converted as a single unit (case-sensitive):
              </p>
              <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                <div
                  v-for="rule in multiCharRules"
                  :key="rule.latin"
                  class="flex items-center justify-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                >
                  <span class="font-mono text-blue-600 dark:text-blue-400">{{ rule.latin }}</span>
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-gray-400 text-xs" />
                  <span class="font-semibold text-gray-800 dark:text-gray-200">{{ rule.cyrillic }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="border-b border-gray-200 dark:border-gray-700">
          <button
            @click="toggleSection('single')"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span class="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
              <font-awesome-icon icon="fa-solid fa-font" class="text-green-500" />
              Single Character Mapping
            </span>
            <font-awesome-icon
              :icon="isOpen('single') ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"
              class="text-gray-400"
            />
          </button>
          <Transition name="accordion">
            <div v-if="isOpen('single')" class="px-4 pb-4">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Each Latin letter maps to its Cyrillic equivalent:
              </p>
              <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                <div
                  v-for="rule in singleCharRules"
                  :key="rule.latin"
                  class="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                >
                  <span class="font-mono text-blue-600 dark:text-blue-400">{{ rule.latin }}</span>
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-gray-400 text-xs" />
                  <span class="font-semibold text-gray-800 dark:text-gray-200">{{ rule.cyrillic }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div>
          <button
            @click="toggleSection('special')"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span class="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
              <font-awesome-icon icon="fa-solid fa-star" class="text-yellow-500" />
              Special Characters
            </span>
            <font-awesome-icon
              :icon="isOpen('special') ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"
              class="text-gray-400"
            />
          </button>
          <Transition name="accordion">
            <div v-if="isOpen('special')" class="px-4 pb-4">
              <div class="grid gap-2">
                <div
                  v-for="rule in specialCharRules"
                  :key="rule.latin"
                  class="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <kbd class="px-2 py-1 bg-white dark:bg-gray-600 rounded text-sm font-mono text-gray-800 dark:text-gray-200 min-w-8 text-center border border-gray-200 dark:border-gray-500">
                    {{ rule.latin }}
                  </kbd>
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-gray-400" />
                  <span class="font-semibold text-gray-800 dark:text-gray-200 text-lg">{{ rule.cyrillic }}</span>
                  <span class="text-gray-500 dark:text-gray-400 text-sm">({{ rule.description }})</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 800px;
}
</style>
