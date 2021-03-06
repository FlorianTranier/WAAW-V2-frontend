<script setup lang="ts">
import { inject, onMounted, watch } from '@vue/runtime-core'
import { Ref, ref } from '@vue/reactivity'
import { showOverlay } from '@/composables/overlay/overlay'
import { getAudioInfo, currentTime } from '@composables/audioInfo/audioInfo'

const props = withDefaults(defineProps<{audioId: string}>(), {
  audioId: ''
})

const durationInSeconds = ref(0)

const audioElement = inject<Ref<HTMLAudioElement>>('audioElement')
const audioCtx = inject<AudioContext>('audioContext')

const showVolume = ref<boolean>(false)

const volume = ref<number>(1)

let volumeBeforeMuted = 0

const isPlaying = ref<boolean>(false)
const isMuted = ref<boolean>(false)
const isFullScreen = ref<boolean>(false)
const isLoopToggled = ref<boolean>(false)

const handlePlayPauseState = () => {
  if (audioElement && audioCtx) {
    if (isPlaying.value) {
      audioElement.value.pause()
      isPlaying.value = false
    } else {
      audioElement.value.play()
      audioCtx.resume()
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

const handleLoopState = () => {
  isLoopToggled.value = !isLoopToggled.value
}

const enableFullScreen = () => {
  document.documentElement.requestFullscreen()
  isFullScreen.value = true
}

const disableFullScreen = () => {
  document.exitFullscreen()
  isFullScreen.value = false
}

const forwardAudio = (seconds: number) => {
  if (audioElement)
    audioElement.value.currentTime += seconds
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
  if (audioElement) {
    audioElement.value.onended = () => {
      if (isLoopToggled.value)
        audioElement.value.play()
      else isPlaying.value = false
    }
  }
})


</script>

<template>
  <div>
    <div
      id="control-bar"
      class="overlay-element"
      :class="{'overlay-element-show': showOverlay}"
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
      <span
        class="icon"
        :class="{'icon-enabled': isLoopToggled}"
      >
        <img
          src="@/assets/icons/loop.svg"
          alt="loop"
          @click="handleLoopState"
        >
      </span>
      <span class="icon">
        <img
          src="@/assets/icons/rewind-10.svg"
          alt="forward-10"
          @click="forwardAudio(-10)"
        >
      </span>
      <p class="duration">
        {{ Math.floor(currentTime / 60).toString().padStart(2, '0') }}:{{ Math.floor(currentTime % 60).toString().padStart(2, '0') }} /
        {{ Math.floor(durationInSeconds / 60).toString().padStart(2, '0') }}:{{ (durationInSeconds % 60).toString().padStart(2, '0') }}
      </p>
      <span class="icon">
        <img
          src="@/assets/icons/forward-10.svg"
          alt="forward-10"
          @click="forwardAudio(10)"
        >
      </span>
      <span class="icon">
        <img
          v-show="!isFullScreen"
          src="@/assets/icons/fullscreen.svg"
          alt="fullscreen-on"
          @click="enableFullScreen"
        >
        <img
          v-show="isFullScreen"
          src="@/assets/icons/fullscreen-exit.svg"
          alt="fullscreen-off"
          @click="disableFullScreen"
        >
      </span>
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

  &>.duration {
    color: hsl(0, 0%, 100%);
    font-size: 1.5rem;
    font-family: 'Roboto Mono', monospace;
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

  &>.icon-enabled {
    filter: none;
    background-color: #dadada;
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

</style>