import { Ref } from '@vue/reactivity'
import { SceneParameterType } from '@composables/three/templates/SceneParameterType'

export class SceneParameter {
  label: string
  result: Ref<number|string>
  type: SceneParameterType
  range?: {low: number, high: number}

  constructor(p: {label: string, result: Ref<number|string>, type: SceneParameterType, range?: {low: number, high: number} | undefined}) {
    this.label = p.label
    this.result = p.result
    this.type = p.type
    this.range = p.range
  }
}