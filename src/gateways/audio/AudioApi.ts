import axios from 'axios'
import { AudioInfo } from './responses/AudioInfo'


const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/audio`
})

const getAudioInfo = async (audioQuery: string): Promise<AudioInfo> => {
  return <AudioInfo>{ ...(await client.get(`${audioQuery}/info`)).data, query: audioQuery }
}

export const AudioAPI = {
  getAudioInfo
}