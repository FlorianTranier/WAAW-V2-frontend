import { AdditiveBlending, BufferGeometry, PerspectiveCamera, Points, PointsMaterial, Scene, TextureLoader, Vector3, WebGLRenderer } from 'three'
import { IScene } from '../IScene'
import { SceneParameter } from '@composables/three/templates/SceneParameter'
export class HyperSpaceScene implements IScene {

  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  material: PointsMaterial
  geometry: BufferGeometry

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(100, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.renderer = new WebGLRenderer({ alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    this.material = new PointsMaterial({
      color: 0xdadada,
      size: 10,
      map: new TextureLoader().load('./particle.png'),
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false
    })

    this.geometry = new BufferGeometry()

    this.camera.position.set(0, 0, 1000)
    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render(audioData: number[]): void {

    const data = audioData.filter((_, index) => index % 150 === 0)
    const xGap = window.innerWidth / 120
    const yGap = window.innerHeight / 120
    const points = []
    if (!audioData) {
      points.push(new Vector3(-window.innerWidth / 2, 0, 0))
      points.push(new Vector3(window.innerWidth / 2, 0, 0))
    } else {
      points.push(...data.map((data, index) => {
        const vertices = []
        for (let i = 0; i <= index; i++) {
          if (data > 0) {
            vertices.push(new Vector3(-data * xGap, data * yGap / i, 0))
            vertices.push(new Vector3(-data * xGap / i, data * yGap, 0))
          

          
            vertices.push(new Vector3(data * xGap, data * yGap / i, 0))
            vertices.push(new Vector3(data * xGap / i, data * yGap, 0))
          

            vertices.push(new Vector3(data * xGap, -data * yGap / i, 0))
            vertices.push(new Vector3(data * xGap / i, -data * yGap, 0))
          
          
            vertices.push(new Vector3(-data * xGap, -data * yGap / i, 0))
            vertices.push(new Vector3(-data * xGap / i, -data * yGap, 0))
          }
        }
        return vertices
      }))
    }

    this.geometry.setFromPoints(points.flatMap(v => v))

    this.scene.clear()
    this.scene.add(new Points(this.geometry, this.material))
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

  getParameters = (): SceneParameter[] => []

}