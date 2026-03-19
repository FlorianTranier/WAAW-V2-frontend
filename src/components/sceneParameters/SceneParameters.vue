<script setup lang="ts">
import { SceneParameter } from '@composables/three/templates/SceneParameter'
import { SceneParameterType } from '@composables/three/templates/SceneParameterType'
import { watch } from '@vue/runtime-core'
import { selectedScene, selectedSceneInstance } from '@composables/sceneSelector/sceneSelector'
import { Ref, ref } from '@vue/reactivity'
import { showOverlay } from '@/composables/overlay/overlay'

const sceneParameters: Ref<SceneParameter[]> = ref([])

watch(selectedScene, () => {
  if (selectedSceneInstance.value)
    sceneParameters.value = selectedSceneInstance.value.getParameters()
})
</script>

<template>
  <div
    id="container"
    class="overlay-element"
    :class="{'overlay-element-show': showOverlay}"
  >
    <div
      v-for="parameter in sceneParameters"
      :key="parameter.label"
      class="parameter-group"
    >
      <label
        :for="parameter.label"
        class="label"
      >{{ parameter.label }}</label>
      <div class="input-container">
        <input
          v-if="parameter.type === SceneParameterType.RANGE"
          :id="parameter.label"
          v-model="parameter.result"
          type="range"
          :min="parameter.range?.low ?? 0"
          :max="parameter?.range?.high ?? 100"
          class="range-input"
        >
        <input
          v-if="parameter.type === SceneParameterType.COLOR"
          :id="parameter.label"
          v-model="parameter.result"
          type="color"
          class="color-input"
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

#container {
  padding: 1.5rem;
  background: var(--bg-glass);
  backdrop-filter: blur(var(--blur-amount));
  -webkit-backdrop-filter: blur(var(--blur-amount));
  border: 1px solid var(--border-glass);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-main);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 240px;
  transition: all 0.3s ease;
}

.parameter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.range-input {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent-primary);
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);

    &:hover {
      transform: scale(1.2);
    }
  }
}

.color-input {
  -webkit-appearance: none;
  width: 100%;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
}

@media only screen and (max-width: 768px) {
  #container {
    bottom: 120px;
    right: 1.5rem;
    margin: 0;
  }
}

</style>