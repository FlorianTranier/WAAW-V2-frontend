<script setup lang="ts">
import { IScene } from '@composables/three/templates/IScene'
import { Scenes } from '@composables/three/templates/Scene'
import { ref } from '@vue/reactivity'
import { onMounted, watch } from '@vue/runtime-core'

const threeContainer = ref<HTMLElement>()
let scene: IScene

const props = withDefaults(defineProps<{audioData: number[]}>(), {
  audioData: () => []
})

onMounted(() => {
  if (threeContainer.value) {
    scene = new Scenes.SPHERE(threeContainer.value)
  }
})

watch(() => props.audioData, () => {
  if (scene) {
    scene.render(props.audioData)
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