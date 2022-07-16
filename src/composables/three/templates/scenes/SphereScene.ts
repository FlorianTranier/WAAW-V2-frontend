import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, PerspectiveCamera, Points, PointsMaterial, Scene, TextureLoader, WebGLRenderer } from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { IScene } from '@composables/three/templates/IScene'
import { SceneParameter } from '@composables/three/templates/SceneParameter'

export class SphereScene implements IScene {
  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  startPositions: number[]
  positions: number[]
  colors: number[]
  sizes: number[]
  particles: BufferGeometry
  particleSystem: Points<BufferGeometry, PointsMaterial>
  // orbit: OrbitControls
  count: number

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.renderer = new WebGLRenderer({ alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)
    // this.orbit = new OrbitControls(this.camera, this.renderer.domElement)


    // Particles
    this.particles = new BufferGeometry()
    const particleMaterial = new PointsMaterial({
      color: 0xDADADA,
      size: 4,
      map: new TextureLoader().load('./particle.png'),
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false
    })


    // Generate discrete 3D sphere
    const radius = 100
    const nbPoints = 4000
    const step = 2 / nbPoints
    const turns = 60 // Number of times to turn around the y-axis


    this.positions = []
    this.colors = []
    this.sizes = []
    this.count = 0

    const color = new Color('#dadada')

    for (let i = -1; i <= 1; i += step) {
      const phi = Math.acos(i)
      const theta = (2 * turns * phi) % (2 * Math.PI)

      this.positions.push(Math.sin(theta) * Math.sin(phi) * radius)
      this.positions.push(Math.cos(phi) * radius)
      this.positions.push(Math.cos(theta) * Math.sin(phi) * radius)

      //color.setHSL(i / nbPoints, 1.0, 0.5)

      this.colors.push(color.r, color.g, color.b)

      this.sizes.push(100)
      this.count++

    }
    this.startPositions = [...this.positions]
    this.particles.setAttribute('position', new Float32BufferAttribute(this.positions, 3))
    this.particles.setAttribute( 'color', new Float32BufferAttribute( this.colors, 3 ) )
    // this.particles.setAttribute( 'size', new Float32BufferAttribute( this.sizes, 1 ).setUsage( DynamicDrawUsage ) )

    // Create the particle system
    this.particleSystem = new Points(this.particles, particleMaterial)
    this.scene.add(this.particleSystem)

    this.camera.position.set(0, 0, 300)
    this.particleSystem.rotation.set(Math.PI / 8, 0, Math.PI / 8)

    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render = (audioData: number[]) => {
    // requestAnimationFrame(() => this.render(audioData))
    const skipFrequencies = 620
    // Update the particles
    for (let i = 0; i < this.count / 2; i++) {
      if (i + skipFrequencies < audioData.length){
        const factor = audioData[i + skipFrequencies] / 256 + 1 // between 1 and 2
        this.positions[(Math.floor((this.count * 3) / 2) + 3 * i)] = this.startPositions[(Math.floor((this.count * 3) / 2) + 3 * i)] * factor
        this.positions[(Math.floor((this.count * 3) / 2) + 3 * i) + 1] = this.startPositions[(Math.floor((this.count * 3) / 2) + 3 * i) + 1] * factor
        this.positions[(Math.floor((this.count * 3) / 2) + 3 * i) + 2] = this.startPositions[(Math.floor((this.count * 3) / 2) + 3 * i) + 2] * factor

        this.positions[(Math.floor((this.count * 3) / 2) - 3 * i)] = this.startPositions[(Math.floor((this.count * 3) / 2) - 3 * i)] * factor
        this.positions[(Math.floor((this.count * 3) / 2) - 3 * i) + 1] = this.startPositions[(Math.floor((this.count * 3) / 2) - 3 * i) + 1] * factor
        this.positions[(Math.floor((this.count * 3) / 2) - 3 * i) + 2] = this.startPositions[(Math.floor((this.count * 3) / 2) - 3 * i) + 2] * factor
      }
    }

    this.particles.setAttribute('position', new Float32BufferAttribute(this.positions, 3))

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

  getParameters = (): SceneParameter[] => []
}