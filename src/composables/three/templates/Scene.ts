import { FlatLineScene } from './scenes/FlatLineScene'
import { SphereScene } from '@composables/three/templates/scenes/SphereScene'
import { CubeScene } from '@composables/three/templates/scenes/CubeScene'
import { PyramidScene } from '@composables/three/templates/scenes/PyramidScene'
import { HyperSpaceScene } from './scenes/HyperSpaceScene'

interface SceneSignature {
  [key: string]: typeof SphereScene | typeof FlatLineScene | typeof HyperSpaceScene | typeof CubeScene | typeof PyramidScene,
  'SPHERE': typeof SphereScene,
  'CUBE': typeof CubeScene,
  'PYRAMID': typeof PyramidScene,
  'FLATLINE': typeof FlatLineScene,
  'HYPER SPACE': typeof HyperSpaceScene
}

export const Scenes: SceneSignature = {
  'SPHERE': SphereScene,
  'CUBE': CubeScene,
  'PYRAMID': PyramidScene,
  'FLATLINE': FlatLineScene,
  'HYPER SPACE': HyperSpaceScene
}
