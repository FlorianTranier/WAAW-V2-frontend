import { BufferGeometry, Color, DynamicDrawUsage, Float32BufferAttribute, Material, PerspectiveCamera, Points, Scene, WebGLRenderer } from 'three'
import { IScene } from '@composables/three/templates/IScene'
import { generateSphereBufferGeometry, getSphereSceneParticlesColoredShaderMaterial, getSphereUpdatedPositionsAndSizes } from '@utils/three/sphereUtils'

export class ShaderedSphereScene implements IScene {
  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  geometry: BufferGeometry
  particleSystem: Points<BufferGeometry, Material>
  initialPositions: ArrayLike<number>

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.renderer = new WebGLRenderer({ alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)
    // this.orbit = new OrbitControls(this.camera, this.renderer.domElement)

    const particleMaterial = getSphereSceneParticlesColoredShaderMaterial()

    this.geometry = generateSphereBufferGeometry(100, 8000, 15)
    this.initialPositions = this.geometry.attributes.position.array
    const colors = new Array<number>(this.initialPositions.length).fill(new Color('#dadada').r)
    const sizes = new Array<number>(this.initialPositions.length / 3).fill(10)
    this.geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
    this.geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1))

    // Create the particle system
    this.particleSystem = new Points(this.geometry, particleMaterial)
    this.scene.add(this.particleSystem)

    this.camera.position.set(0, 0, 300)
    this.particleSystem.rotation.set(Math.PI / 4, 0, Math.PI / 8)

    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render = (audioData: number[]) => {
    const { positions, sizes } = getSphereUpdatedPositionsAndSizes(audioData, this.initialPositions.length / 3, this.initialPositions, 10)
    this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3).setUsage(DynamicDrawUsage))
    this.geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1))
    this.renderer.render(this.scene, this.camera)
  }

  resizeHandler = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate = () => {
    requestAnimationFrame(this.animate)

    this.renderer.render(this.scene, this.camera)
  }
}