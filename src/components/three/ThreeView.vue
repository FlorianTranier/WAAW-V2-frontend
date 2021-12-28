<script setup lang="ts">
import { selectedScene, selectedSceneInstance } from '@/composables/sceneSelector/sceneSelector'
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
    scene = new Scenes[selectedScene.value](threeContainer.value) //new Scenes.SPHERE(threeContainer.value)
  }
})

watch(selectedScene, () => {
  if (threeContainer.value) {
    if (threeContainer.value.lastChild) threeContainer.value.removeChild(threeContainer.value.lastChild)
    scene = new Scenes[selectedScene.value](threeContainer.value)
    selectedSceneInstance.value = scene
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