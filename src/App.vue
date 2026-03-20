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
  audioProcessedData.value = processAudioData()
}, 1000 / 60)

const processAudioData = (): number[] => {
  const numBins = 128
  const processedData = new Array(numBins).fill(0)
  
  // We use a power function to distribute bins logarithmically.
  // Higher power = more bins for low frequencies.
  const power = 2
  const rawDataLength = audioRawData.value.length

  for (let i = 0; i < numBins; i++) {
    const startRatio = Math.pow(i / numBins, power)
    const endRatio = Math.pow((i + 1) / numBins, power)
    
    const start = Math.floor(startRatio * rawDataLength)
    const end = Math.floor(endRatio * rawDataLength)

    const slice = audioRawData.value.slice(start, Math.max(end, start + 1))
    const sum = slice.reduce((acc, val) => acc + val, 0)
    processedData[i] = sum / slice.length
  }

  return processedData
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
      preload="auto"
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
    left: 50%;
    top: 2rem;
    transform: translate(-50%, 0);
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
