<script setup lang="ts">
import Button from 'primevue/button'
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">You did it!</h1>
      <p class="text-gray-600 mb-4">
        Visit
        <a
          href="https://vuejs.org/"
          target="_blank"
          rel="noopener"
          class="text-blue-600 hover:text-blue-800 underline"
        >
          vuejs.org
        </a>
        to read the documentation
      </p>
      <Button label="PrimeVue Button" />
    </div>
  </div>
</template>
