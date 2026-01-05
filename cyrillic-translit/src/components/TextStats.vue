<script setup lang="ts">
import { useTextStats } from '@/composables/useTextStats'

const { charCount, charCountNoSpaces, wordCount, sentenceCount, paragraphCount, lineCount } = useTextStats()
</script>

<template>
  <div class="px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div class="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-200 dark:border-gray-700">
      <font-awesome-icon icon="fa-solid fa-chart-simple" class="text-emerald-500" />
      <span class="font-medium text-gray-800 dark:text-gray-200 text-sm">Statistics</span>
    </div>
    <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
      <div class="flex items-center gap-1.5">
        <font-awesome-icon icon="fa-solid fa-text-width" class="text-blue-500 text-[10px]" />
        <span>{{ wordCount }} words</span>
      </div>
      <div class="flex items-center gap-1.5">
        <font-awesome-icon icon="fa-solid fa-font" class="text-green-500 text-[10px]" />
        <span>{{ charCount }} chars</span>
      </div>
      <div class="flex items-center gap-1.5">
        <font-awesome-icon icon="fa-solid fa-text-slash" class="text-purple-500 text-[10px]" />
        <span>{{ charCountNoSpaces }} no spaces</span>
      </div>
      <div class="flex items-center gap-1.5">
        <font-awesome-icon icon="fa-solid fa-comment-dots" class="text-orange-500 text-[10px]" />
        <span>{{ sentenceCount }} sentences</span>
      </div>
      <div class="flex items-center gap-1.5">
        <font-awesome-icon icon="fa-solid fa-paragraph" class="text-pink-500 text-[10px]" />
        <span>{{ paragraphCount }} paragraphs</span>
      </div>
      <div class="flex items-center gap-1.5">
        <font-awesome-icon icon="fa-solid fa-list" class="text-cyan-500 text-[10px]" />
        <span>{{ lineCount }} lines</span>
      </div>
    </div>
  </div>
</template>
