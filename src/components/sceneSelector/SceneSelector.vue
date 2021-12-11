<script setup lang="ts">
import { showOverlay } from '@/composables/overlay/overlay'
import { selectedScene } from '@/composables/sceneSelector/sceneSelector'
import { Scenes } from '@/composables/three/templates/Scene'


const scenes = Object.keys(Scenes)

const handleSceneSelection = (scene: string) => selectedScene.value = scene

</script>

<template>
  <div>
    <div
      id="container"
      class="overlay-element"
      :class="{'overlay-element-show': showOverlay}"
    >
      <div
        v-for="scene in scenes"
        :key="scene"
        class="scene"
        @click="() => handleSceneSelection(scene)"
      >
        {{ scene }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

#container {
  height: 100vh;
  width: 20vw;
  margin: 2rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(10, 1fr);
  color: white;
  gap: 2rem;
}

.scene {
  border: white solid 0.1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

</style>