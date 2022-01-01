import { SceneParameterType } from '@composables/three/templates/SceneParameterType'
import { ref, Ref } from '@vue/reactivity'
import {
  AdditiveBlending,
  BufferGeometry, Line,
  LineBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from 'three'
import { IScene } from '../IScene'
import { SceneParameter } from '@composables/three/templates/SceneParameter'
export class HyperSpaceScene implements IScene {

  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  material: PointsMaterial
  lineMaterial: LineBasicMaterial
  geometry: BufferGeometry
  lineGeometries: BufferGeometry[]
  originGapFactor: Ref<number> = ref(5)

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(100, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.renderer = new WebGLRenderer({ alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    this.lineGeometries = []

    this.material = new PointsMaterial({
      color: 0xdadada,
      size: 10,
      map: new TextureLoader().load('./particle.png'),
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false
    })

    this.lineMaterial = new LineBasicMaterial({ color: 0xdadada })

    this.geometry = new BufferGeometry()

    this.camera.position.set(0, 0, 1000)
    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render(audioData: number[]): void {
    this.lineGeometries.forEach(geometry => geometry.dispose())
    this.lineGeometries = []

    const data = audioData.filter((_, index) => index % 500 === 0)
    const xGap = window.innerWidth / 100
    const yGap = window.innerHeight / 100
    const lines: Line[] = []

    if (!audioData) {
      lines.push(new Line(new BufferGeometry().setFromPoints([
        new Vector3(0, 0),
        new Vector3(0, 0)
      ]), this.lineMaterial))
    } else {

      data.forEach((data, index) => {
        for (let i = 1; i <= index; i++) {
          if (data > 0) {

            this.lineGeometries.push(new BufferGeometry().setFromPoints([
              new Vector3(-data * this.originGapFactor.value / i, data * this.originGapFactor.value, 0),
              new Vector3(-data * xGap / i, data * yGap, data)
            ]))

            this.lineGeometries.push(new BufferGeometry().setFromPoints([
              new Vector3(data * this.originGapFactor.value / i, data * this.originGapFactor.value, 0),
              new Vector3(data * xGap / i, data * yGap, data)
            ]))

            this.lineGeometries.push(new BufferGeometry().setFromPoints([
              new Vector3(data * this.originGapFactor.value / i, -data * this.originGapFactor.value, 0),
              new Vector3(data * xGap / i, -data * yGap, data)
            ]))

            this.lineGeometries.push(new BufferGeometry().setFromPoints([
              new Vector3(-data * this.originGapFactor.value / i, -data * this.originGapFactor.value, 0),
              new Vector3(-data * xGap / i, -data * yGap, data)
            ]))

            this.lineGeometries.push(new BufferGeometry().setFromPoints([
              new Vector3(-data * xGap, data * yGap / i, data),
              new Vector3(-data * this.originGapFactor.value, data * this.originGapFactor.value / i, 0)
            ]))

            this.lineGeometries.push(new BufferGeometry().setFromPoints([
              new Vector3(data * this.originGapFactor.value, data * this.originGapFactor.value / i, 0),
              new Vector3(data * xGap, data * yGap / i, data)
            ]))

            this.lineGeometries.push(new BufferGeometry().setFromPoints([
              new Vector3(data * this.originGapFactor.value, -data * this.originGapFactor.value / i, 0),
              new Vector3(data * xGap, -data * yGap / i, data)
            ]))

            this.lineGeometries.push(new BufferGeometry().setFromPoints([
              new Vector3(-data * xGap, -data * yGap / i, data),
              new Vector3(-data * this.originGapFactor.value, -data * this.originGapFactor.value / i, 0)
            ]))
          }
        }
      })

      lines.push(...this.lineGeometries.map(geometry => new Line(geometry, this.lineMaterial)))
    }

    this.scene.clear()
    if (lines.length > 0)
      this.scene.add(...lines)
    this.renderer.render(this.scene, this.camera)
  }

  resizeHandler = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate(): void {
    requestAnimationFrame(this.animate)

    this.renderer.render(this.scene, this.camera)
  }

  getParameters = (): SceneParameter[] => [
    new SceneParameter({ label: 'Gap origin', result: this.originGapFactor, type: SceneParameterType.RANGE, range: { low: 0, high: 99 } }),
  ]

}