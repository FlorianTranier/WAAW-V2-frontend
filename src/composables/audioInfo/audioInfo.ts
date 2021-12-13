import { ref } from '@vue/reactivity'
import { AudioInfo } from '@/gateways/audio/responses/AudioInfo'
import { AudioAPI } from '@/gateways/audio/AudioApi'

const soundHistory = ref<AudioInfo[]>([])

export const currentTime = ref(0)

export const getAudioInfo = async (audioQuery: string): Promise<AudioInfo> => {
  let sound = soundHistory.value.find(sound => sound.query === audioQuery)

  if (sound) return sound

  sound = await AudioAPI.getAudioInfo(audioQuery)
  soundHistory.value.push(sound)

  return sound
}

export const setCurrentTimeListener = (audioElement: HTMLAudioElement) => {
  audioElement.ontimeupdate = () => currentTime.value = audioElement.currentTime
}