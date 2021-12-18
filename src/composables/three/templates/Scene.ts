import { FlatLineScene } from './scenes/FlatLineScene'
import { SphereScene } from '@composables/three/templates/scenes/SphereScene'
import { HyperSpaceScene } from './scenes/HyperSpaceScene'
import { LightsScene } from '@composables/three/templates/scenes/LightsScene'

interface SceneSignature {
  [key: string]: typeof SphereScene | typeof FlatLineScene | typeof HyperSpaceScene | typeof LightsScene,
  'SPHERE': typeof SphereScene,
  'FLATLINE': typeof FlatLineScene,
  'HYPER SPACE': typeof HyperSpaceScene,
  'LIGHTS': typeof LightsScene
}

export const Scenes: SceneSignature = {
  'SPHERE': SphereScene,
  'FLATLINE': FlatLineScene,
  'HYPER SPACE': HyperSpaceScene,
  'LIGHTS': LightsScene
}
