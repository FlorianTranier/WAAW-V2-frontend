<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { onMounted, onBeforeUnmount, provide } from '@vue/runtime-core'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import ThreeView from '@/components/three/ThreeView.vue'
import Controls from '@/components/controls/Controls.vue'
import { handleOverlayAppearance } from '@composables/overlay/overlay'
import SceneSelector from '@/components/sceneSelector/SceneSelector.vue'
import SoundInfo from '@/components/soundInfo/SoundInfo.vue'
import { setCurrentTimeListener } from '@composables/audioInfo/audioInfo'
import SceneParameters from '@components/sceneParameters/SceneParameters.vue'

const route = useRoute()
const audioId = ref(route.query.v?.toString() ?? '')

watch(
  () => route.query.v,
  () => {
    audioId.value = route.query.v?.toString() ?? ''
    if (audioElement.value) audioElement.value.src = `${import.meta.env.VITE_API_BASE_URL}/${audioId.value}`
  }
)

const audioElement = ref<HTMLAudioElement | undefined>()
const mainElement = ref<HTMLElement>()

const audioCtx = new AudioContext()
const audioAnalyser = ref(audioCtx.createAnalyser())
audioAnalyser.value.connect(audioCtx.destination)
audioAnalyser.value.fftSize = 8192

const audioRawData = ref(new Uint8Array(audioAnalyser.value.frequencyBinCount))
const audioProcessedData = ref<number[]>()

provide('mainElement', mainElement)
provide('audioElement', audioElement)
provide('audioContext', audioCtx)

onMounted(() => {
  if (audioElement.value) {
    setCurrentTimeListener(audioElement.value)
    const mediaElementSource = audioCtx.createMediaElementSource(audioElement.value)
    mediaElementSource.connect(audioAnalyser.value)
    audioAnalyser.value.connect(audioCtx.destination)

    // audioAnalyser.value.fftSize = 32768
    // audioAnalyser.value.minDecibels = -80
    // audioAnalyser.value.maxDecibels = -10
    // audioAnalyser.value.smoothingTimeConstant = 0.0
    audioAnalyser.value.smoothingTimeConstant = 0.8

    audioElement.value.volume = 0.5
  }

  document.onmousemove = () => {
    handleOverlayAppearance()
  }
})

const analyserLoop = setInterval(() => {
  audioAnalyser.value.getByteFrequencyData(audioRawData.value)
  // audioProcessedData.value = processAudioData()
  copyAudioData()
}, 1000 / 60)

// TODO FIX THIS
/*const processAudioData = (): number[] => {
  const processedData = []
  for (let [i, j] = [40, 41]; i < audioRawData.value.length; i = j) {
    j *= 1.005
    const sum = audioRawData.value.slice(i, j).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    const mean = sum / (j - i)

    processedData.push(mean)
  }
  return processedData
}*/

const copyAudioData = (): void => {
  audioProcessedData.value = []
  for (let i = 0; i < audioRawData.value.length; i++) {
    audioProcessedData.value.push(audioRawData.value[i])
  }
}

onBeforeUnmount(() => {
  clearInterval(analyserLoop)
})

</script>

<template>
  <main
    id="main"
    ref="mainElement"
  >
    <audio
      id="audio"
      ref="audioElement"
      crossorigin="anonymous"
    />

    <component
      :is="ThreeView"
      id="template"
      :audio-data="audioProcessedData"
    />

    <Controls
      id="controls"
      class="overlay-component"
      :audio-id="audioId"
    />

    <SceneSelector
      id="scene-selector"
      class="overlay-component"
    />

    <SoundInfo
      id="audio-info"
      class="overlay-component"
      :audio-id="audioId"
    />

    <SceneParameters
      id="scene-parameters"
      class="overlay-component"
    />
  </main>
</template>

<style scoped lang="scss">

#main {
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: #0a0a0a;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.overlay-component {
  z-index: 10;
  position: fixed;
  pointer-events: auto;

  &#controls {
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
  }

  &#scene-selector {
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
  }

  &#audio-info {
    left: 2rem;
    top: 2rem;
  }

  &#scene-parameters {
    right: 2rem;
    bottom: 2rem;
  }
}

#audio {
  display: none;
}

#template {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

</style>
