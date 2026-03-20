import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, PerspectiveCamera, Points, ShaderMaterial, Scene, WebGLRenderer, DynamicDrawUsage } from 'three'
import { IScene } from '@composables/three/templates/IScene'
import { SceneParameter } from '@composables/three/templates/SceneParameter'

const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (dist > 0.5) discard;
    
    // Smooth circle
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    
    // Core glow
    float core = 1.0 - smoothstep(0.0, 0.2, dist);
    
    // Soft outer glow
    float outerGlow = 1.0 - smoothstep(0.0, 0.5, dist);
    
    vec3 finalColor = vColor + core * 0.4 + outerGlow * 0.2;
    gl_FragColor = vec4(finalColor, alpha * outerGlow);
  }
`

export class MorphingScene implements IScene {
  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  
  count = 10000 // Number of particles
  
  // Base positions for each shape
  spherePositions: Float32Array
  cubePositions: Float32Array
  pyramidPositions: Float32Array
  
  // Current and next target positions for interpolation
  currentPositions: Float32Array
  targetPositions: Float32Array
  
  // Buffer arrays for the current frame
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  
  particles: BufferGeometry
  particleSystem: Points<BufferGeometry, ShaderMaterial>

  private time = 0
  private lastSwitchTime = 0
  private transitionDuration = 2.0 // Seconds for smooth transition
  private cycleInterval = 5.0 // Seconds between transitions
  private shapeIndex = 0 // 0: Sphere, 1: Cube, 2: Pyramid
  private shapes: Float32Array[]

  constructor(container: HTMLElement) {
    this.scene = new Scene()
    this.camera = new PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 2000)
    this.renderer = new WebGLRenderer({ 
      alpha: true,
      antialias: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    // Initialize position arrays
    this.spherePositions = new Float32Array(this.count * 3)
    this.cubePositions = new Float32Array(this.count * 3)
    this.pyramidPositions = new Float32Array(this.count * 3)
    
    this.positions = new Float32Array(this.count * 3)
    this.colors = new Float32Array(this.count * 3)
    this.sizes = new Float32Array(this.count)

    this.generateSphere()
    this.generateCube()
    this.generatePyramid()

    this.shapes = [this.spherePositions, this.cubePositions, this.pyramidPositions]
    
    // Start with sphere
    this.currentPositions = new Float32Array(this.spherePositions)
    this.targetPositions = new Float32Array(this.spherePositions)
    this.positions.set(this.spherePositions)

    // Particles
    this.particles = new BufferGeometry()
    const particleMaterial = new ShaderMaterial({
      uniforms: {
        time: { value: 0.0 }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: AdditiveBlending,
      transparent: false,
      depthWrite: false
    })

    this.particles.setAttribute('position', new Float32BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage))
    this.particles.setAttribute('color', new Float32BufferAttribute(this.colors, 3).setUsage(DynamicDrawUsage))
    this.particles.setAttribute('size', new Float32BufferAttribute(this.sizes, 1).setUsage(DynamicDrawUsage))

    // Create the particle system
    this.particleSystem = new Points(this.particles, particleMaterial)
    this.scene.add(this.particleSystem)

    this.camera.position.set(0, 0, 700)
    
    // Add global rotations to make it look like the other scenes
    this.particleSystem.rotation.set(Math.PI / 2, 0, Math.PI / 2)
    
    window.addEventListener('resize', this.resizeHandler)
    this.lastSwitchTime = performance.now() / 1000
    this.render([])
  }

  private generateSphere() {
    const radius = 100
    const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle
    for (let i = 0; i < this.count; i++) {
      const y = 1 - (i / (this.count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = phi * i
      this.spherePositions[i * 3] = Math.cos(theta) * r * radius
      this.spherePositions[i * 3 + 1] = y * radius
      this.spherePositions[i * 3 + 2] = Math.sin(theta) * r * radius
    }
  }

  private generateCube() {
    const size = 100
    for (let i = 0; i < this.count; i++) {
      const face = i % 6
      const u = (Math.random() * 2 - 1) * size
      const v = (Math.random() * 2 - 1) * size
      let x = 0, y = 0, z = 0
      switch(face) {
      case 0: x =  size; y = u; z = v; break
      case 1: x = -size; y = u; z = v; break
      case 2: x = u; y =  size; z = v; break
      case 3: x = u; y = -size; z = v; break
      case 4: x = u; y = v; z =  size; break
      case 5: x = u; y = v; z = -size; break
      }
      this.cubePositions[i * 3] = x
      this.cubePositions[i * 3 + 1] = y
      this.cubePositions[i * 3 + 2] = z
    }
  }

  private generatePyramid() {
    const size = 100
    const A = { x: -size, y: -size, z: -size }, B = { x:  size, y: -size, z: -size },
      C = { x:  size, y: -size, z:  size }, D = { x: -size, y: -size, z:  size },
      Apex = { x: 0, y: size, z: 0 }
    for (let i = 0; i < this.count; i++) {
      const face = i % 5
      let x = 0, y = 0, z = 0
      if (face === 0) {
        x = (Math.random() * 2 - 1) * size
        y = -size
        z = (Math.random() * 2 - 1) * size
      } else {
        const r1 = Math.random(), r2 = Math.random()
        const sqrtR1 = Math.sqrt(r1)
        let v1, v2, v3
        switch(face) {
        case 1: v1 = Apex; v2 = A; v3 = B; break
        case 2: v1 = Apex; v2 = B; v3 = C; break
        case 3: v1 = Apex; v2 = C; v3 = D; break
        case 4: v1 = Apex; v2 = D; v3 = A; break
        default: v1 = Apex; v2 = A; v3 = B
        }
        x = (1 - sqrtR1) * v1.x + (sqrtR1 * (1 - r2)) * v2.x + (sqrtR1 * r2) * v3.x
        y = (1 - sqrtR1) * v1.y + (sqrtR1 * (1 - r2)) * v2.y + (sqrtR1 * r2) * v3.y
        z = (1 - sqrtR1) * v1.z + (sqrtR1 * (1 - r2)) * v2.z + (sqrtR1 * r2) * v3.z
      }
      this.pyramidPositions[i * 3] = x
      this.pyramidPositions[i * 3 + 1] = y
      this.pyramidPositions[i * 3 + 2] = z
    }
  }

  render = (audioData: number[]) => {
    const now = performance.now() / 1000
    const elapsedSinceSwitch = now - this.lastSwitchTime
    this.time += 0.01
    this.particleSystem.material.uniforms.time.value = this.time
    
    // Check for shape switch
    if (elapsedSinceSwitch >= this.cycleInterval) {
      this.lastSwitchTime = now
      this.shapeIndex = (this.shapeIndex + 1) % this.shapes.length
      this.currentPositions.set(this.targetPositions) // Previous target is now current
      this.targetPositions.set(this.shapes[this.shapeIndex])
      if (this.shapeIndex === 0) {
        this.particleSystem.rotation.set(Math.PI / 2, 0, Math.PI / 2)
      } else if (this.shapeIndex === 1) {
        this.particleSystem.rotation.set(0, 0, 0)
      } else {
        this.particleSystem.rotation.set(0, 0, 0)
      }
    }

    // Camera adjustment based on current shape
    // Sphere: (0, 0, 700), Cube: (0, 0, 700), Pyramid: (0, -50, 700)
    const targetCamY = this.shapeIndex === 2 ? -50 : 0
    // Smoothly transition camera Y
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05

    // Interpolation factor (0 to 1)
    let t = Math.min(elapsedSinceSwitch / this.transitionDuration, 1.0)
    // Smoothstep interpolation
    t = t * t * (3 - 2 * t)

    if (this.shapeIndex === 0) {
      this.particleSystem.rotation.x += 0.01
    } else {
      this.particleSystem.rotation.y += 0.01
    }

    const pulseFactor = 4 + Math.sin(this.time)
    
    const positions = this.particles.attributes.position.array as Float32Array
    const colors = this.particles.attributes.color.array as Float32Array
    const sizes = this.particles.attributes.size.array as Float32Array

    for (let i = 0; i < this.count; i++) {
      const audioIdx = Math.floor((i / (this.count * 2)) * audioData.length * 0.5)
      const audioValue = (audioData[audioIdx] || 0) / 255
      const factor = 1 + (audioValue * 0.5) * pulseFactor
      
      // Interpolate base positions
      const bx = this.currentPositions[i * 3] * (1 - t) + this.targetPositions[i * 3] * t
      const by = this.currentPositions[i * 3 + 1] * (1 - t) + this.targetPositions[i * 3 + 1] * t
      const bz = this.currentPositions[i * 3 + 2] * (1 - t) + this.targetPositions[i * 3 + 2] * t

      // Organic noise-like movement
      const noiseX = Math.sin(this.time * 0.5 + i) * 2
      const noiseY = Math.cos(this.time * 0.3 + i * 0.5) * 2
      const noiseZ = Math.sin(this.time * 0.7 + i * 1.5) * 2

      positions[i * 3] = bx * factor + noiseX
      positions[i * 3 + 1] = by * factor + noiseY
      positions[i * 3 + 2] = bz * factor + noiseZ

      // Color logic (reused from SphereScene)
      let r = 0, g = 0, b = 0
      if (audioValue < 0.2) {
        const tc = audioValue / 0.2
        r = 0.02 * (1 - tc) + 0.0 * tc
        g = 0.08 * (1 - tc) + 1.0 * tc
        b = 0.35 * (1 - tc) + 1.0 * tc
      } else if (audioValue < 0.4) {
        const tc = (audioValue - 0.2) / 0.2
        r = 0.0 * (1 - tc) + 0.1 * tc
        g = 1.0 * (1 - tc) + 1.0 * tc
        b = 1.0 * (1 - tc) + 0.2 * tc
      } else if (audioValue < 0.6) {
        const tc = (audioValue - 0.4) / 0.2
        r = 0.1 * (1 - tc) + 1.0 * tc
        g = 1.0 * (1 - tc) + 0.0 * tc
        b = 0.2 * (1 - tc) + 0.9 * tc
      } else if (audioValue < 0.8) {
        const tc = (audioValue - 0.6) / 0.2
        r = 1.0 * (1 - tc) + 1.0 * tc
        g = 0.0 * (1 - tc) + 0.35 * tc
        b = 0.9 * (1 - tc) + 0.0 * tc
      } else {
        const tc = (audioValue - 0.8) / 0.2
        r = 1.0 * (1 - tc) + 1.0 * tc
        g = 0.35 * (1 - tc) + 1.0 * tc
        b = 0.0 * (1 - tc) + 0.6 * tc
      }

      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
      sizes[i] = 4.0 + audioValue * 15.0
    }

    this.particles.attributes.position.needsUpdate = true
    this.particles.attributes.color.needsUpdate = true
    this.particles.attributes.size.needsUpdate = true

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
