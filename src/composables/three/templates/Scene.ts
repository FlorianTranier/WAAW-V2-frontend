import { FlatLineScene } from './scenes/FlatLineScene'
import { SphereScene } from '@composables/three/templates/scenes/SphereScene'
import { CubeScene } from '@composables/three/templates/scenes/CubeScene'
import { PyramidScene } from '@composables/three/templates/scenes/PyramidScene'
import { HyperSpaceScene } from './scenes/HyperSpaceScene'
import { MorphingScene } from './scenes/MorphingScene'

interface SceneSignature {
  [key: string]: typeof SphereScene | typeof FlatLineScene | typeof HyperSpaceScene | typeof CubeScene | typeof PyramidScene | typeof MorphingScene,
  'SPHERE': typeof SphereScene,
  'CUBE': typeof CubeScene,
  'PYRAMID': typeof PyramidScene,
  'MORPHING': typeof MorphingScene,
  'FLATLINE': typeof FlatLineScene,
  'HYPER SPACE': typeof HyperSpaceScene,

}

export const Scenes: SceneSignature = {
  'SPHERE': SphereScene,
  'CUBE': CubeScene,
  'PYRAMID': PyramidScene,
  'MORPHING': MorphingScene,
  'FLATLINE': FlatLineScene,
  'HYPER SPACE': HyperSpaceScene,
}
