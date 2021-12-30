import { FlatLineScene } from './scenes/FlatLineScene'
import { SphereScene } from '@composables/three/templates/scenes/SphereScene'
import { HyperSpaceScene } from './scenes/HyperSpaceScene'

interface SceneSignature {
  [key: string]: typeof SphereScene | typeof FlatLineScene | typeof HyperSpaceScene,
  'SPHERE': typeof SphereScene,
  'FLATLINE': typeof FlatLineScene,
  'HYPER SPACE': typeof HyperSpaceScene
}

export const Scenes: SceneSignature = {
  'SPHERE': SphereScene,
  'FLATLINE': FlatLineScene,
  'HYPER SPACE': HyperSpaceScene
}
