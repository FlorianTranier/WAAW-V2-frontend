import { BufferGeometry, Line, LineBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer, Vector3 } from 'three'
import { IScene } from './../IScene'
import { ref } from '@vue/reactivity'
import { SceneParameter } from '@composables/three/templates/SceneParameter'
import { SceneParameterType } from '@composables/three/templates/SceneParameterType'

export class FlatLineScene implements IScene {

  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  material: LineBasicMaterial
  bufferGeometry: BufferGeometry
  filterNumberOfPointsFactor = ref(10)
  color = ref('#dadada')
  amplitude = ref(100)
  yOffset = ref(30)

  private lines: Line[] = []

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 10000)
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    this.material = new LineBasicMaterial({ color: this.color.value })
    this.bufferGeometry = new BufferGeometry()

    this.camera.position.set(0, 0, 1000)
    window.addEventListener('resize', this.resizeHandler)

    // Pre-create the lines and add them to the scene
    for (let i = 0; i < 4; i++) {
      const line = new Line(this.bufferGeometry, this.material)
      this.lines.push(line)
      this.scene.add(line)
    }

    this.render([])
  }

  render(audioData: number[]): void {
    this.material.color.set(this.color.value as string)

    const data = audioData
    
    const points: Vector3[] = []
    
    if (!audioData || audioData.length === 0) {
      points.push(new Vector3(0, 0, 0))
      points.push(new Vector3(window.innerWidth, 0, 0))
    } else {
      const xGap = (window.innerWidth) / (data.length - 1 || 1)
      const yMultiplier = (this.amplitude.value as number) / 255
      
      points.push(...data.map((val, index) => {
        const x = index * xGap * 1.9
        const y = val * yMultiplier
        return new Vector3(x, y, 0)
      }))
    }

    this.bufferGeometry.setFromPoints(points)

    const offset = this.yOffset.value as number

    // Upper Right (original orientation, offset up)
    this.lines[0].position.set(0, offset, 0)
    this.lines[0].rotation.set(0, 0, 0)
    this.lines[0].scale.set(1, 1, 1)

    // Lower Right (mirrored Y, offset down)
    this.lines[1].position.set(0, -offset, 0)
    this.lines[1].rotation.set(Math.PI, 0, 0)
    this.lines[1].scale.set(1, 1, 1)

    // Upper Left (mirrored X, offset up)
    this.lines[2].position.set(0, offset, 0)
    this.lines[2].rotation.set(0, Math.PI, 0)
    this.lines[2].scale.set(1, 1, 1)

    // Lower Left (mirrored X and Y, offset down)
    this.lines[3].position.set(0, -offset, 0)
    this.lines[3].rotation.set(Math.PI, Math.PI, 0)
    this.lines[3].scale.set(1, 1, 1)

    this.renderer.render(this.scene, this.camera)
  }

  resizeHandler = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.render([])
  }

  animate(): void {
    requestAnimationFrame(() => this.animate())
    this.renderer.render(this.scene, this.camera)
  }

  getParameters = (): SceneParameter[] => [
    new SceneParameter({ label: 'Amplitude', result: this.amplitude, type: SceneParameterType.RANGE, range: { low: 0, high: 500 } }),
    new SceneParameter({ label: 'Y Offset', result: this.yOffset, type: SceneParameterType.RANGE, range: { low: 0, high: 500 } }),
  ]

}