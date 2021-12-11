import { FlatLineScene } from './scenes/FlatLineScene'
import { SphereScene } from '@composables/three/templates/scenes/SphereScene'

interface SceneSignature {
  [key: string]: typeof SphereScene | typeof FlatLineScene,
  'SPHERE': typeof SphereScene,
  'FLATLINE': typeof FlatLineScene
}

export const Scenes: SceneSignature = {
  'SPHERE': SphereScene,
  'FLATLINE': FlatLineScene
}
