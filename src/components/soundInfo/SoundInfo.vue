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
const author = ref('')
const durationInSeconds = ref<number>(0)

watch(
  () => props.audioId,
  async () => {
    if (props.audioId) {
      const info = await getAudioInfo(props.audioId)
      title.value = info.title
      thumbnailsUrl.value = info.thumbnail
      author.value = info.author
      durationInSeconds.value = info.duration
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
      <div id="content">
        <div id="title">
          {{ title }}
        </div>
        <div id="author">
          {{ author }}
        </div>
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
  height: auto;
  min-height: 80px;
  width: fit-content;
  max-width: 450px;
  padding: 1.25rem;
  background: var(--bg-glass);
  backdrop-filter: blur(var(--blur-amount));
  -webkit-backdrop-filter: blur(var(--blur-amount));
  border: 1px solid var(--border-glass);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-main);
  color: var(--text-primary);
  display: flex;
  gap: 1.25rem;
  align-items: center;
  transition: all 0.3s ease;
}

#thumbnail {
  height: 60px;
  width: 60px;
  object-fit: cover;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

#content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

#title {
  font-size: 1.1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#author {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 400;
}

#progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

#progress-bar-track {
  height: 100%;
  background: var(--accent-primary);
  width: 0;
  transition: width 0.1s linear;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

@media only screen and (max-width: 768px) {
  #container {
    max-width: 80vw;
    padding: 1rem;
  }
  
  #thumbnail {
    width: 48px;
    height: 48px;
  }
}

</style>