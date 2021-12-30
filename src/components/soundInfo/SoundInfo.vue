<script setup lang="ts">

import { currentTime, getAudioInfo } from '@composables/audioInfo/audioInfo'
import { inject, watch } from '@vue/runtime-core'
import { Ref, ref } from '@vue/reactivity'
import { showOverlay } from '@composables/overlay/overlay'
import { watchEffect } from 'vue'

const props = withDefaults(defineProps<{audioId: string}>(), {
  audioId: ''
})

const audioElement = inject<Ref<HTMLAudioElement>>('audioElement')

const progressBarTrack = ref<HTMLDivElement|undefined>()

const title = ref('')
const thumbnailsUrl = ref('')
const durationInSeconds = ref<number>(0)

watch(
  () => props.audioId,
  async () => {
    if (props.audioId) {
      const info = await getAudioInfo(props.audioId)
      title.value = info.title
      thumbnailsUrl.value = info.thumbnailsUrl
      durationInSeconds.value = info.durationInSeconds
    }
  }
)

watchEffect(() => {
  if (audioElement && progressBarTrack.value)
    progressBarTrack.value.style.width = `${currentTime.value * 100 / durationInSeconds.value}%`
})


</script>

<template>
  <div>
    <div
      id="container"
      class="overlay-element"
      :class="{'overlay-element-show': showOverlay}"
    >
      <img
        id="thumbnail"
        :src="thumbnailsUrl"
        alt="Video thumbnail"
      >
      <div id="title">
        {{ title }}
      </div>
    </div>
    <div
      id="progress-bar"
      class="overlay-element"
      :class="{'overlay-element-show': showOverlay}"
    >
      <div
        id="progress-bar-track"
        ref="progressBarTrack"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">

#container {
  height: 10vh;
  width: 40vw;
  color: var(--custom-white);
  display: flex;
  gap: 1em;
  justify-content: left;
  align-items: center;
  overflow: hidden;
}

#thumbnail {
  max-height: 100%;
}

#title {
  font-size: 1.5rem;
}

#progress-bar {
  background: var(--bg-gray);
  width: 100%;
}

#progress-bar-track {
  border: var(--custom-white) solid 0.1em;
  width: 0;
}

@media only screen and (max-width: 1280px) {
  #thumbnail {
    display: none;
  }

  #container {
    margin-left: 2vw;
    height: fit-content;
  }
}

</style>