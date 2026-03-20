import { ref } from '@vue/reactivity'
import { IScene } from '@composables/three/templates/IScene'

export const selectedScene = ref('MORPHING')

export const selectedSceneInstance = ref<IScene>()