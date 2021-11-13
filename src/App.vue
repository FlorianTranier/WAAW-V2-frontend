<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { onMounted, onBeforeUnmount } from '@vue/runtime-core'
import { watch } from 'vue'
import { useRoute } from 'vue-router'


const route = useRoute()

watch(
  () => route.query.v,
  () => { audioElement.value.src = `https://obscure-stream-04186.herokuapp.com/https://api.v2.waaw.space/audio/${route.query.v}` }
)

const audioElement = ref()

const audioCtx = new AudioContext()
const audioAnalyser = ref(audioCtx.createAnalyser())
audioAnalyser.value.connect(audioCtx.destination)
const audioRawData = ref(new Uint8Array(audioAnalyser.value.frequencyBinCount))
const audioProcessedData = ref<number[]>([])
const hidePlayInitBtn = ref(false)

onMounted(() => {
  const mediaElementSource = audioCtx.createMediaElementSource(audioElement.value)
  mediaElementSource.connect(audioAnalyser.value)
  audioAnalyser.value.connect(audioCtx.destination)

  audioAnalyser.value.fftSize = 32768
  audioAnalyser.value.minDecibels = -80
  audioAnalyser.value.maxDecibels = -10
  audioAnalyser.value.smoothingTimeConstant = 0.0

  audioElement.value.volume = 0.5
})

const analyserLoop = setInterval(() => {
  audioAnalyser.value.getByteFrequencyData(audioRawData.value)
  audioProcessedData.value = processAudioData()
}, 1000 / 60)

const processAudioData = (): number[] => {
  const processedData = []
  for (let [i, j] = [40, 41]; i < audioRawData.value.length; i = j) {
    j *= 1.01
    const sum = audioRawData.value.slice(i, j).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    const mean = sum / (j - i)

    processedData.push(mean ** (1.2 + i / 10000) + 1)
  }
  return processedData
}

onBeforeUnmount(() => {
  clearInterval(analyserLoop)
})

const play = () => {
  audioElement.value.play()
  hidePlayInitBtn.value = true
}

</script>

<template>
  <main id="main">
    <audio
      id="audio"
      ref="audioElement"
      crossorigin="anonymous"
    />

    <button
      id="play-init-btn"
      :class="{'hide': hidePlayInitBtn}"
      @click="play"
    >
      PLAY
    </button>
  </main>
</template>

<style scoped lang="scss">

#main {
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: hsla(0, 0%, 0%, 0.9);
}

#audio {
  opacity: 0;
  max-width: 0px;
  max-height: 0px;
  z-index: -1000;
}

#play-init-btn {
  display: block;
  margin: auto;
  border: solid white 0.1rem;
  color: white;
  font-size: 2rem;
  padding: 1rem 2.5rem;
  background-color: transparent;

  &.hide {
    display: none;
  }
}

</style>
