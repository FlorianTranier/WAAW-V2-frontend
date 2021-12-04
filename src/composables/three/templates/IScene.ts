/* eslint-disable no-unused-vars */
export interface IScene {
  render(audioData: number[]): void
  animate(): void
}