<script setup lang="ts">
import { inject, onMounted, watch } from '@vue/runtime-core'
import { Ref, ref } from '@vue/reactivity'
import { showOverlay } from '@/composables/overlay/overlay'
import { getAudioInfo, currentTime } from '@composables/audioInfo/audioInfo'

const props = withDefaults(defineProps<{audioId: string}>(), {
  audioId: ''
})

const duration = ref(0)

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
      duration.value = (await getAudioInfo(props.audioId)).duration
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
        {{ Math.floor(duration / 60).toString().padStart(2, '0') }}:{{ (duration % 60).toString().padStart(2, '0') }}
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
      <div
        id="volume-container"
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
        <div 
          class="volume-slider-wrapper"
          :class="{'show-volume': showVolume}"
        >
          <input
            v-model="volume"
            class="volume"
            type="range"
            name="volume"
            min="0"
            max="1"
            step="0.01"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

#control-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 400px;
  height: 4rem;
  background: var(--bg-glass);
  backdrop-filter: blur(var(--blur-amount));
  -webkit-backdrop-filter: blur(var(--blur-amount));
  border: 1px solid var(--border-glass);
  border-radius: 2rem;
  padding: 0 2rem;
  gap: 2rem;
  box-shadow: var(--shadow-main);
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-glass-heavy);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &>.duration {
    color: var(--text-primary);
    font-size: 0.9rem;
    font-family: 'Roboto Mono', monospace;
    font-weight: 500;
    min-width: 120px;
    text-align: center;
  }
  
  &>.icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.5rem;
    min-width: 1.5rem;
    width: auto;
    transition: transform 0.2s ease, opacity 0.2s ease;
    opacity: 0.7;
    filter: invert(100%);
    cursor: pointer;

    &.icon-enabled {
      opacity: 1;
      filter: none;
      background: var(--accent-primary);
      padding: 0.4rem;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    &:hover {
      opacity: 1;
      transform: scale(1.05);
    }

    &>img {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}

#volume-container {
  display: flex;
  align-items: center;
  width: auto;
  transition: all 0.3s ease;
}

.volume-slider-wrapper {
  width: 0;
  opacity: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.show-volume {
    width: 80px;
    opacity: 1;
    margin-left: 1rem;
  }
}

.volume {
  -webkit-appearance: none;
  width: 80px;
  background: rgba(255, 255, 255, 0.1);
  height: 4px;
  border-radius: 2px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
  }

  &::-moz-range-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
  }
}

@media only screen and (max-width: 600px) {
  #control-bar {
    min-width: 90vw;
    gap: 1rem;
    padding: 0 1rem;
    
    &>.duration {
      font-size: 0.75rem;
      min-width: 100px;
    }
  }
}

</style>