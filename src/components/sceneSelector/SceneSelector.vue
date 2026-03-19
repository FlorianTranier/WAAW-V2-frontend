<script setup lang="ts">
import { showOverlay } from '@/composables/overlay/overlay'
import { selectedScene } from '@/composables/sceneSelector/sceneSelector'
import { Scenes } from '@/composables/three/templates/Scene'


const scenes = Object.keys(Scenes)

const handleSceneSelection = (scene: string) => selectedScene.value = scene

</script>

<template>
  <div
    id="container"
    class="overlay-element"
    :class="{'overlay-element-show': showOverlay}"
  >
    <div
      v-for="scene in scenes"
      :key="scene"
      class="scene"
      :class="{'scene-active': selectedScene === scene}"
      @click="() => handleSceneSelection(scene)"
    >
      {{ scene }}
    </div>
  </div>
</template>

<style lang="scss" scoped>

#container {
  height: auto;
  max-height: 80vh;
  width: auto;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  background: var(--bg-glass);
  backdrop-filter: blur(var(--blur-amount));
  -webkit-backdrop-filter: blur(var(--blur-amount));
  border: 1px solid var(--border-glass);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-main);
  color: var(--text-primary);
  gap: 0.5rem;
  overflow-y: auto;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

  &::before {
    content: 'SCENES';
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
    padding-left: 1.25rem;
    opacity: 0.6;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-glass);
    border-radius: 10px;
  }
}

.scene {
  position: relative;
  padding: 0.85rem 1.25rem;
  border-radius: 0.75rem;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  white-space: nowrap;
  color: var(--text-secondary);
  text-transform: uppercase;

  &::after {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: white;
    opacity: 0;
    transition: all 0.3s ease;
    transform: scale(0);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
    padding-left: 1.5rem;
  }
}

.scene-active {
  background: var(--bg-glass-heavy) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &::after {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 10px white;
  }
}

@media only screen and (max-width: 768px) {
  #container {
    max-height: 25vh;
    flex-direction: row;
    width: calc(100vw - 3rem);
    overflow-x: auto;
    overflow-y: hidden;
    padding: 1rem;
    align-items: center;

    &::before {
      display: none;
    }
  }

  .scene {
    padding: 0.6rem 1rem;
  }
}

</style>