<script setup lang="ts">
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggle } = useDarkMode()
</script>

<template>
  <button
    @click="toggle"
    class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <font-awesome-icon
      :icon="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"
      class="text-xl text-gray-600 dark:text-yellow-400"
    />
  </button>
</template>
