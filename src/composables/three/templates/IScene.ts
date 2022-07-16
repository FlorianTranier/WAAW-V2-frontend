/* eslint-disable no-unused-vars */
import { SceneParameter } from '@composables/three/templates/SceneParameter'

export interface IScene {
  render(audioData: number[]): void
  animate(): void
  getParameters(): SceneParameter[]
}