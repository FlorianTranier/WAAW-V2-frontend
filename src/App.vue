<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { onMounted, onBeforeUnmount, provide } from '@vue/runtime-core'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import ThreeView from '@/components/three/ThreeView.vue'
import Controls from '@/components/controls/Controls.vue'


const route = useRoute()

watch(
  () => route.query.v,
  () => { if (audioElement.value) audioElement.value.src = `https://obscure-stream-04186.herokuapp.com/https://api.v2.waaw.space/audio/${route.query.v}` }
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

onMounted(() => {
  if (audioElement.value) {
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

    <Controls id="controls" />
  </main>
</template>

<style scoped lang="scss">

#main {
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: hsla(0, 0%, 0%, 0.959);
}

#controls {
  z-index: 2;
  position: fixed;
  bottom: 5vh;
  left: 50%;
  transform: translateX(-50%);
}

#audio {
  opacity: 0;
  max-width: 0px;
  max-height: 0px;
  z-index: -1000;
}

#template {
  width: 100%;
  height: 100%;
}

</style>
