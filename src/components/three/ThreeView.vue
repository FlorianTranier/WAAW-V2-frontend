<script setup lang="ts">
import { ThreeApp } from '@/composables/three/ThreeApp'
import { ref } from '@vue/reactivity'
import { onMounted, watch } from '@vue/runtime-core'

const threeContainer = ref<HTMLElement>()
let threeApp: ThreeApp

const props = withDefaults(defineProps<{audioData: number[]}>(), {
  audioData: () => []
})

onMounted(() => {
  if (threeContainer.value) {
    threeApp = new ThreeApp(threeContainer.value)
  }

})

watch(() => props.audioData, () => {
  if (threeApp) {
    threeApp.render(props.audioData)
  }
})

</script>

<template>
  <div
    id="three-container"
    ref="threeContainer"
  />
</template>

<style scoped>
#three-container {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>