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
  <div>
    <div
      id="container"
      class="overlay-element"
      :class="{'overlay-element-show': showOverlay}"
    >
      <div
        v-for="parameter in sceneParameters"
        :key="parameter.label"
      >
        <label
          :for="parameter.label"
          class="label"
        >{{ parameter.label }}</label>
        <input
          v-if="parameter.type === SceneParameterType.RANGE"
          :id="parameter.label"
          v-model="parameter.result"
          type="range"
          :min="parameter.range?.low ?? 0"
          :max="parameter?.range?.high ?? 100"
          class="range"
        >
        <input
          v-if="parameter.type === SceneParameterType.COLOR"
          :id="parameter.label"
          v-model="parameter.result"
          type="color"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>

.label {
  color: var(--custom-white);
  display: block;
}

input[type='color'] {
  width: 100%;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  display: block;
  height: 1rem;
  background-color: transparent;
}

</style>