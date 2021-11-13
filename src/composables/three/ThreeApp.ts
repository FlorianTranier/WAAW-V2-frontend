import { AdditiveBlending, BufferGeometry, Color, DirectionalLight, DynamicDrawUsage, Float32BufferAttribute, PerspectiveCamera, Points, PointsMaterial, Scene, TextureLoader, WebGLRenderer } from "three"

export class ThreeApp {
  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  mainLight: DirectionalLight
  startPositions: number[]
  positions: number[]
  colors: number[]
  sizes: number[]
  particles: BufferGeometry
  particleSystem: Points<BufferGeometry, PointsMaterial>

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.renderer = new WebGLRenderer()
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)
    this.mainLight = new DirectionalLight('white', 1)
    this.mainLight.position.set(-75, 100, 75)
    this.mainLight.target.position.set(0, 0, 1)

    // Particles
    this.particles = new BufferGeometry()
    const particleMaterial = new PointsMaterial({
      color: 0xffffff,
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

    const color = new Color()

    for (let i = -1; i <= 1; i += step) {
      const phi = Math.acos(i)
      const theta = (2 * turns * phi) % (2 * Math.PI)

      this.positions.push(Math.cos(theta) * Math.sin(phi) * radius)
      this.positions.push(Math.sin(theta) * Math.sin(phi) * radius)
      this.positions.push(Math.cos(phi) * radius)

      color.setHSL(i / nbPoints, 1.0, 0.5)

      this.colors.push(color.r, color.g, color.b)

      this.sizes.push(2)

    }
    this.startPositions = [...this.positions]
    this.particles.setAttribute('position', new Float32BufferAttribute(this.positions, 3))
    this.particles.setAttribute( 'color', new Float32BufferAttribute( this.colors, 3 ) )
    this.particles.setAttribute( 'size', new Float32BufferAttribute( this.sizes, 1 ).setUsage( DynamicDrawUsage ) )

    // Create the particle system
    this.particleSystem = new Points(this.particles, particleMaterial)
    this.scene.add(this.particleSystem)



    // const geometry = new SphereBufferGeometry(2, 128, 128)
    // const material = new MeshPhongMaterial({ color: 'blue' })
    // this.sphere = new Mesh(geometry, material)
    // this.scene.add(this.mainLight, this.mainLight.target, this.sphere)
    this.scene.add(this.mainLight, this.mainLight.target)

    this.camera.position.set(0, 100, 270)
    this.camera.rotation.set(0, 0, Math.PI/4)
  }

  render = (audioData: number[]) => {
    // requestAnimationFrame(this.render)

    // Update the particles
    for (let i = 0; i < this.positions.length / 2; i++) {
      if (i < audioData.length){
        const factor = audioData[i] / 256 + 1 // between 1 and 2
        this.positions[(Math.floor(this.positions.length / 2) + i) * 3 - 1] = this.startPositions[(Math.floor(this.positions.length / 2) + i) * 3 - 1] * factor
        this.positions[(Math.floor(this.positions.length / 2) + i) * 3] = this.startPositions[(Math.floor(this.positions.length / 2) + i) * 3] * factor
        this.positions[(Math.floor(this.positions.length / 2) + i) * 3 + 1] = this.startPositions[(Math.floor(this.positions.length / 2) + i) * 3 + 1] * factor

        this.positions[(Math.floor(this.positions.length / 2) - i) * 3 - 1] = this.startPositions[(Math.floor(this.positions.length / 2) - i) * 3 - 1] * factor
        this.positions[(Math.floor(this.positions.length / 2) - i) * 3] = this.startPositions[(Math.floor(this.positions.length / 2) - i) * 3] * factor
        this.positions[(Math.floor(this.positions.length / 2) - i) * 3 + 1] = this.startPositions[(Math.floor(this.positions.length / 2) - i) * 3 + 1] * factor
      }
    }

    this.particles.setAttribute('position', new Float32BufferAttribute(this.positions, 3))
    this.particles.setAttribute( 'color', new Float32BufferAttribute( this.colors, 3 ) )
    this.particles.setAttribute( 'size', new Float32BufferAttribute( this.sizes, 1 ).setUsage( DynamicDrawUsage ) )

    this.renderer.render( this.scene, this.camera )
  }
}