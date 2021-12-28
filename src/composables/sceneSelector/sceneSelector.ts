import { ref } from '@vue/reactivity'
import { IScene } from '@composables/three/templates/IScene'

export const selectedScene = ref('SPHERE')

export const selectedSceneInstance = ref<IScene>()