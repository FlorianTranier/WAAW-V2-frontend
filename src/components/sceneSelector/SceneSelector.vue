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
  display: grid;
  font-size: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  grid-template-rows: repeat(10, 1fr);
  color: var(--custom-white);
  gap: 2rem;
}

.scene {
  border: var(--custom-white) solid 0.1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 100ms ease-in-out;
  max-width: 20vw;

  &:hover {
    border-width: 0.2rem;
  }
}

</style>