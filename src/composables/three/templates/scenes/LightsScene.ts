import { IScene } from '@composables/three/templates/IScene'
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  PerspectiveCamera,
  PointLight,
  Scene, Sphere, SphereGeometry, SpotLight, SpotLightHelper, Vector3,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class LightsScene implements IScene {

  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  material: LineBasicMaterial
  bufferGeometry: BufferGeometry
  //lights: SpotLight[]

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera( 30, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    this.material = new LineBasicMaterial({ color: 0xdadada })

    this.bufferGeometry = new BufferGeometry()



    const geometry = new BoxGeometry( 100, 100, 1 )
    const material = new MeshPhongMaterial({ emissive: '#0a0a0a' })
    const sphere = new Mesh( geometry, material )

    this.scene.add(sphere)


    this.camera.position.set(0, 0, 90)
    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render(audioData: number[]): void {
    const filteredData = audioData.filter((_, index) => index % 300 === 0)
    this.scene.clear()
    const geometry = new BoxGeometry( 100, 100, 1 )
    const material = new MeshPhongMaterial({ emissive: '#0a0a0a' })
    const sphere = new Mesh( geometry, material )

    this.scene.add(sphere)
    const lights = filteredData.map((data, index) => {
      const light = new SpotLight('red', data / 10, 0, 0.0001 * data)
      light.position.set(0, -150, 3)
      light.target.position.set(index * 3, data - 150, 0)

      const light2 = new SpotLight('yellow', data / 10, 0, 0.0001 * data)
      light2.position.set(0, -150, 3)
      light2.target.position.set(-index * 3, data - 150, 0)
      return [light, light2]
    }).flat()

    lights.forEach(light => {
      this.scene.add(light)
      this.scene.add(light.target)
    })

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

}