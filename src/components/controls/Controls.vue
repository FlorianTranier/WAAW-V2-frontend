<script setup lang="ts">
import { inject, onMounted, watch } from '@vue/runtime-core'
import { Ref, ref } from '@vue/reactivity'
import { getAudioInfo } from '@/gateways/audio/AudioApi'

const props = withDefaults(defineProps<{audioId: string}>(), {
  audioId: ''
})

const durationInSeconds = ref(0)
const currentTime = ref(0)

const mainElement = inject<Ref<HTMLElement>>('mainElement')
const audioElement = inject<Ref<HTMLAudioElement>>('audioElement')

const showVolume = ref<boolean>(false)
const showControlBar = ref<boolean>(false)
const volume = ref<number>(1)
let showControlBarTimeout: number

let volumeBeforeMuted = 0

const isPlaying = ref<boolean>(false)
const isMuted = ref<boolean>(false)

const handleControlBarAppearance = () => {
  clearTimeout(showControlBarTimeout)
  showControlBar.value = true
  showControlBarTimeout = window.setTimeout(() => showControlBar.value = false, 2000)
}

const handlePlayPauseState = () => {
  if (audioElement) {
    if (isPlaying.value) {
      audioElement.value.pause()
      isPlaying.value = false
    } else {
      audioElement.value.play()
      isPlaying.value = true
    }
  }
}

const handleMuteUnmuteState = () => {
  if (isMuted.value) {
    volume.value = volumeBeforeMuted
    isMuted.value = false
  } else {
    volumeBeforeMuted = volume.value
    volume.value = 0
    isMuted.value = true
  }
}

watch(
  volume,
  () => {
    if (audioElement)
      audioElement.value.volume = volume.value
  }
)

watch(
  () => props.audioId,
  async () => {
    if (props.audioId)
      durationInSeconds.value = (await getAudioInfo(props.audioId)).durationInSeconds
  }
)

onMounted(async () => {
  if (mainElement)
    mainElement.value.onmousemove = handleControlBarAppearance
  if (audioElement) {
    audioElement.value.ontimeupdate = () => currentTime.value = audioElement.value.currentTime
    audioElement.value.onended = () => isPlaying.value = false
  }
})


</script>

<template>
  <div>
    <div
      id="control-bar"
      :class="{'show-control-bar': showControlBar}"
      @mouseleave="showVolume = false"
    >
      <span
        class="icon"
        @click="handlePlayPauseState"
      >
        <img
          v-show="isPlaying"
          src="@/assets/icons/pause.svg"
          alt="pause"
        >
        <img
          v-show="!isPlaying"
          src="@/assets/icons/play.svg"
          alt="play"
        >
      </span>
      <p class="duration">
        {{ Math.floor(currentTime / 60).toString().padStart(2, '0') }}:{{ Math.ceil(currentTime % 60).toString().padStart(2, '0') }} /
        {{ Math.floor(durationInSeconds / 60).toString().padStart(2, '0') }}:{{ (durationInSeconds % 60).toString().padStart(2, '0') }}
      </p>
      <span
        id="volume-icon"
        class="icon"
        @mouseenter="showVolume = true"
      >
        <img
          v-show="isMuted"
          src="@/assets/icons/volume-mute.svg"
          alt="volume"
          @click="handleMuteUnmuteState"
        >
        <img
          v-show="!isMuted"
          src="@/assets/icons/volume.svg"
          alt="volume"
          @click="handleMuteUnmuteState"
        >
        <input
          v-model="volume"
          class="volume"
          :class="{'show-volume': showVolume}"
          type="range"
          name="volume"
          min="0"
          max="1"
          step="0.01"
        >
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>

#control-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 3rem;
  border-radius: 0.5rem;
  padding: 0.4rem 4rem;
  gap: 5rem;

  opacity: 0;
  transition: opacity 500ms ease-in-out;

  &>.duration {
    color: hsl(0, 0%, 100%);
    font-size: 1.5rem;
  }
  &>.icon {
    height: 100%;
    filter: invert(100%);
    cursor: pointer;

    &>svg, &>img {
      width: 100%;
      height: 100%;
    }
  }
}

#volume-icon {
  display: flex;
}

.volume {
  -webkit-appearance: none;
  position: absolute;
  display: inline-block;
  transition: opacity 1s ease-in-out;
  min-height: 100%;
  left: 140%;
  top: 0%;
  bottom: 0%;
  margin: auto;
  transform: scaleX(0);
  transform-origin: 0%;
  transition: all 200ms ease-in-out;
  background: transparent;
  cursor: pointer;

  &::-moz-range-thumb {
    filter: invert(100%);
    background-color: hsl(0, 0%, 100%);
    height: 0%;
    //border-radius: 0;
    width: 0%;
    border: none;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    //filter: invert(100%);
    height: 1rem;
    width: 1rem;
    background-color: hsl(0, 0%, 100%);
  }

  &::-moz-range-progress {
    filter: invert(100%);
    background-color: hsl(0, 0%, 100%);
    height: 50%;
  }

  &::-moz-range-track {
    background-color: hsl(0, 0%, 50%);
    height: 50%;
  }

  &::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    filter: invert(100%);
    background-color: hsl(0, 0%, 50%);
  }
}

.show-volume {
  transform: scaleX(1) !important;
}

.show-control-bar {
  opacity: 1 !important;
}

</style>