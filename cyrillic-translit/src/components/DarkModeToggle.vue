<script setup lang="ts">
import { useDarkMode } from '@/composables/useDarkMode'
import ToggleSwitch from 'primevue/toggleswitch'

const { isDark, toggle } = useDarkMode()
</script>

<template>
  <div class="flex items-center gap-2">
    <font-awesome-icon icon="fa-solid fa-sun" class="text-gray-600 dark:text-gray-300" />
    <ToggleSwitch :modelValue="isDark" @update:modelValue="toggle" />
    <font-awesome-icon icon="fa-solid fa-moon" class="text-gray-600 dark:text-gray-300" />
  </div>
</template>
