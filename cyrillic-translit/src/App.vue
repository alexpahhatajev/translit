<script setup lang="ts">
import { onMounted } from 'vue'
import TextEditor from '@/components/TextEditor.vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { init } = useDarkMode()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
    <div class="max-w-4xl mx-auto px-4">
      <div class="flex items-center justify-between py-8">
        <div class="w-32"></div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">TRANSLIT</h1>
        <div class="w-32 flex justify-end">
          <DarkModeToggle />
        </div>
      </div>
      <TextEditor />
    </div>
  </div>
</template>
