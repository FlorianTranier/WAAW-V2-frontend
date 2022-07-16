import { BufferGeometry, Line, LineBasicMaterial, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three'
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

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.renderer = new WebGLRenderer({ alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    this.material = new LineBasicMaterial({ color: this.color.value })

    this.bufferGeometry = new BufferGeometry()

    this.camera.position.set(0, 0, 1000)
    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render(audioData: number[]): void {
    this.material = new LineBasicMaterial({ color: this.color.value })

    const data = audioData.filter((_, index) => index % (100 - this.filterNumberOfPointsFactor.value) === 0)
    const xGap = window.innerWidth / data.length
    const yGap = window.innerHeight / 500
    const points = []
    if (!audioData) {
      points.push( new Vector2( -window.innerWidth / 2, 0 ) )
      points.push( new Vector2(window.innerWidth / 2, 0 ) )
    } else {
      points.push(...data.map((data, index) => new Vector2(index * xGap, data * yGap)))
    }
    

    this.bufferGeometry.setFromPoints(points)
  

    const upperRightLine = (new Line(this.bufferGeometry, this.material)).translateY(30)
    const lowerRightLine = upperRightLine.clone().translateY(-30).rotateX(Math.PI)
    const upperLeftLine = upperRightLine.clone().rotateY(Math.PI)
    const lowerLeftLine = upperLeftLine.clone().translateY(-30).rotateX(Math.PI)

    this.scene.clear()
    this.scene.add( upperLeftLine, upperRightLine, lowerRightLine, lowerLeftLine )
    this.renderer.render( this.scene, this.camera )
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
    new SceneParameter({ label: 'Details', result: this.filterNumberOfPointsFactor, type: SceneParameterType.RANGE, range: { low: 0, high: 99 } }),
    new SceneParameter({ label: 'Color', result: this.color, type: SceneParameterType.COLOR })
  ]

}