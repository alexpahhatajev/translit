<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslit } from '@/composables/useTranslit'
import { insertTextAtCursor } from '@/composables/useClipboard'

const { direction } = useTranslit()

const shiftActive = ref(false)

const latinToCyrillic: Record<string, string> = {
  'q': 'я', 'w': 'в', 'e': 'е', 'r': 'р', 't': 'т',
  'y': 'ы', 'u': 'у', 'i': 'и', 'o': 'о', 'p': 'п',
  'a': 'а', 's': 'с', 'd': 'д', 'f': 'ф', 'g': 'г',
  'h': 'х', 'j': 'й', 'k': 'к', 'l': 'л',
  'z': 'з', 'x': 'кс', 'c': 'ц', 'v': 'в', 'b': 'б',
  'n': 'н', 'm': 'м',
}

const latinToCyrillicUpper: Record<string, string> = {
  'Q': 'Я', 'W': 'В', 'E': 'Е', 'R': 'Р', 'T': 'Т',
  'Y': 'Ы', 'U': 'У', 'I': 'И', 'O': 'О', 'P': 'П',
  'A': 'А', 'S': 'С', 'D': 'Д', 'F': 'Ф', 'G': 'Г',
  'H': 'Х', 'J': 'Й', 'K': 'К', 'L': 'Л',
  'Z': 'З', 'X': 'КС', 'C': 'Ц', 'V': 'В', 'B': 'Б',
  'N': 'Н', 'M': 'М',
}

const keyboardRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

const multiCharKeys = ['sh', 'ch', 'zh', 'ts', 'yu', 'ya', 'yo', 'kh', 'shch']
const multiCharMappings: Record<string, string> = {
  'sh': 'ш', 'ch': 'ч', 'zh': 'ж', 'ts': 'ц',
  'yu': 'ю', 'ya': 'я', 'yo': 'ё', 'kh': 'х', 'shch': 'щ',
}

const multiCharMappingsUpper: Record<string, string> = {
  'Sh': 'Ш', 'Ch': 'Ч', 'Zh': 'Ж', 'Ts': 'Ц',
  'Yu': 'Ю', 'Ya': 'Я', 'Yo': 'Ё', 'Kh': 'Х', 'Shch': 'Щ',
}

const specialKeys = [
  { latin: "'", cyrillic: 'ь', latinLabel: "'→ь", cyrillicLabel: 'ь' },
  { latin: '"', cyrillic: 'ъ', latinLabel: '"→ъ', cyrillicLabel: 'ъ' },
]

const toggleShift = () => {
  shiftActive.value = !shiftActive.value
}

const getDisplayKey = (key: string) => {
  return shiftActive.value ? key.toUpperCase() : key
}

const getMapping = computed(() => {
  return (key: string) => {
    if (direction.value === 'latin-to-cyrillic') {
      if (shiftActive.value) {
        return latinToCyrillicUpper[key.toUpperCase()] || key.toUpperCase()
      }
      return latinToCyrillic[key] || key
    } else {
      return shiftActive.value ? key.toUpperCase() : key
    }
  }
})

const isLatinToCyrillic = computed(() => direction.value === 'latin-to-cyrillic')

const handleKeyClick = (key: string) => {
  const actualKey = shiftActive.value ? key.toUpperCase() : key
  if (direction.value === 'latin-to-cyrillic') {
    insertTextAtCursor(actualKey)
  } else {
    const cyrillic = shiftActive.value
      ? latinToCyrillicUpper[actualKey] || latinToCyrillic[key]?.toUpperCase()
      : latinToCyrillic[key]
    if (cyrillic) {
      insertTextAtCursor(cyrillic)
    }
  }
}

const getComboDisplay = (combo: string) => {
  if (shiftActive.value) {
    return combo.charAt(0).toUpperCase() + combo.slice(1)
  }
  return combo
}

const getComboMapping = (combo: string) => {
  if (shiftActive.value) {
    const upperCombo = combo.charAt(0).toUpperCase() + combo.slice(1)
    return multiCharMappingsUpper[upperCombo] || multiCharMappings[combo].toUpperCase()
  }
  return multiCharMappings[combo]
}

const handleMultiCharClick = (combo: string) => {
  const actualCombo = shiftActive.value
    ? combo.charAt(0).toUpperCase() + combo.slice(1)
    : combo
  if (direction.value === 'latin-to-cyrillic') {
    insertTextAtCursor(actualCombo)
  } else {
    const cyrillic = getComboMapping(combo)
    if (cyrillic) {
      insertTextAtCursor(cyrillic)
    }
  }
}

const handleSpecialClick = (special: { latin: string, cyrillic: string }) => {
  if (direction.value === 'latin-to-cyrillic') {
    insertTextAtCursor(special.latin)
  } else {
    insertTextAtCursor(special.cyrillic)
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="text-xs text-gray-500 dark:text-gray-400">
        Click keys to insert
      </div>
      <button
        @click="toggleShift"
        :class="[
          'px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer',
          shiftActive
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
        ]"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-up" class="mr-1" />
        Shift
      </button>
    </div>

    <div class="flex flex-col items-center gap-0.5">
      <div
        v-for="(row, rowIndex) in keyboardRows"
        :key="rowIndex"
        class="flex gap-px"
        :style="{ marginLeft: rowIndex === 1 ? '12px' : rowIndex === 2 ? '24px' : '0' }"
      >
        <button
          v-for="key in row"
          :key="key"
          @click="handleKeyClick(key)"
          class="w-6 h-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex flex-col items-center justify-center shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer active:scale-95"
        >
          <span class="text-[8px] text-gray-500 dark:text-gray-400 font-mono leading-none">{{ getDisplayKey(key) }}</span>
          <span class="text-[10px] font-semibold text-blue-600 dark:text-blue-400 leading-none">{{ getMapping(key) }}</span>
        </button>
      </div>
    </div>

    <div v-if="isLatinToCyrillic" class="pt-2 border-t border-gray-200 dark:border-gray-700">
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        Combos
      </div>
      <div class="flex flex-wrap gap-0.5 justify-center">
        <button
          v-for="combo in multiCharKeys"
          :key="combo"
          @click="handleMultiCharClick(combo)"
          class="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded text-[10px] hover:bg-purple-100 dark:hover:bg-purple-800/50 cursor-pointer active:scale-95 transition-all"
        >
          <span class="font-mono text-purple-700 dark:text-purple-300">{{ getComboDisplay(combo) }}</span>
          <span class="text-gray-400 mx-0.5">→</span>
          <span class="font-semibold text-purple-900 dark:text-purple-100">{{ getComboMapping(combo) }}</span>
        </button>
      </div>
    </div>

    <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        Specials
      </div>
      <div class="flex gap-1.5 justify-center">
        <button
          v-for="special in specialKeys"
          :key="special.latin"
          @click="handleSpecialClick(special)"
          class="px-1.5 py-0.5 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded text-[10px] hover:bg-yellow-100 dark:hover:bg-yellow-800/50 cursor-pointer active:scale-95 transition-all"
        >
          <span class="font-semibold text-yellow-900 dark:text-yellow-100">{{ isLatinToCyrillic ? special.latinLabel : special.cyrillicLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
