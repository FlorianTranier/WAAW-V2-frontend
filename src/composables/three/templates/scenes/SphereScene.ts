import { BufferGeometry, Float32BufferAttribute, Material, PerspectiveCamera, Points, Scene, WebGLRenderer } from 'three'
import { IScene } from '@composables/three/templates/IScene'
import { generateSphereBufferGeometry, getParticlePointMaterial, getSphereUpdatedPositions } from '@utils/three/sphereUtils'

export class SphereScene implements IScene {
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

    const particleMaterial = getParticlePointMaterial('#dadada', 4)

    this.geometry = generateSphereBufferGeometry()
    this.initialPositions = this.geometry.attributes.position.array

    // Create the particle system
    this.particleSystem = new Points(this.geometry, particleMaterial)
    this.particleSystem.rotation.set(Math.PI / 4, 0, Math.PI / 8)
    this.scene.add(this.particleSystem)

    this.camera.position.set(0, 0, 300)

    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render = (audioData: number[]) => {
    const positions = getSphereUpdatedPositions(audioData, this.initialPositions.length / 3, this.initialPositions)
    this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    this.renderer.render(this.scene, this.camera)
  }

  resizeHandler = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}