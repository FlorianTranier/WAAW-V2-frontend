import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, PerspectiveCamera, Points, ShaderMaterial, Scene, WebGLRenderer, DynamicDrawUsage } from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
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

export class SphereScene implements IScene {
  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  
  startPositions: Float32Array
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  
  particles: BufferGeometry
  particleSystem: Points<BufferGeometry, ShaderMaterial>
  // orbit: OrbitControls
  count = 2500 // Number of particles

  private time = 0

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

    // Generate sphere using Fibonacci spiral (more uniform)
    const radius = 100
    this.positions = new Float32Array(this.count * 3)
    this.colors = new Float32Array(this.count * 3)
    this.sizes = new Float32Array(this.count)
    
    const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians

    for (let i = 0; i < this.count; i++) {
      const y = 1 - (i / (this.count - 1)) * 2 // y goes from 1 to -1
      const r = Math.sqrt(1 - y * y) // radius at y
      const theta = phi * i // golden angle increment

      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r

      this.positions[i * 3] = x * radius
      this.positions[i * 3 + 1] = y * radius
      this.positions[i * 3 + 2] = z * radius

      // Initial color (cool gray/white)
      this.colors[i * 3] = 1.8
      this.colors[i * 3 + 1] = 1.8
      this.colors[i * 3 + 2] = 1.8

      this.sizes[i] = 4.0
    }

    this.startPositions = new Float32Array(this.positions)
    
    this.particles.setAttribute('position', new Float32BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage))
    this.particles.setAttribute('color', new Float32BufferAttribute(this.colors, 3).setUsage(DynamicDrawUsage))
    this.particles.setAttribute('size', new Float32BufferAttribute(this.sizes, 1).setUsage(DynamicDrawUsage))

    // Create the particle system
    this.particleSystem = new Points(this.particles, particleMaterial)
    this.scene.add(this.particleSystem)

    this.camera.position.set(0, 0, 700)
    this.particleSystem.rotation.set(Math.PI / 2, 0, Math.PI / 2)

    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render = (audioData: number[]) => {
    this.time += 0.01
    this.particleSystem.material.uniforms.time.value = this.time
    
    // Global rotations
    this.particleSystem.rotation.x += 0.01

    // Global pulse (breathing)
    const pulseFactor = 9 + Math.sin(this.time)
    
    const positions = this.particles.attributes.position.array as Float32Array
    const colors = this.particles.attributes.color.array as Float32Array
    const sizes = this.particles.attributes.size.array as Float32Array

    // Audio intensity (average of middle-to-high frequencies usually carries more impact)
    const intensity = 0
    if (audioData.length > 0) {
      const startFreq = 200
      const endFreq = 1800
      const range = Math.min(audioData.length, endFreq) - startFreq
      if (range > 0) {
        let sum = 0
        for (let i = startFreq; i < startFreq + range; i++) {
          sum += audioData[i]
        }         // Normalize to 0-1
      }
    }

    // Update each particle
    for (let i = 0; i < this.count; i++) {
      // Map audio frequency to particle
      // We use different segments of audio data for different particles
      const audioIdx = Math.floor((i / (this.count * 2)) * audioData.length * 0.5)
      const audioValue = (audioData[audioIdx] || 0) / 255
      
      // Dynamic displacement factor
      const factor = 1 + (audioValue * 0.5) * pulseFactor
      
      // Get base position
      const bx = this.startPositions[i * 3]
      const by = this.startPositions[i * 3 + 1]
      const bz = this.startPositions[i * 3 + 2]

      // Organic noise-like movement
      const noiseX = Math.sin(this.time * 0.5 + i) * 2
      const noiseY = Math.cos(this.time * 0.3 + i * 0.5) * 2
      const noiseZ = Math.sin(this.time * 0.7 + i * 1.5) * 2

      // Apply transformation
      positions[i * 3] = bx * factor + noiseX
      positions[i * 3 + 1] = by * factor + noiseY
      positions[i * 3 + 2] = bz * factor + noiseZ

      // Color gradient: dark blue -> blue -> purple -> pink -> white/yellow based on audioValue
      let r = 0, g = 0, b = 0
      if (audioValue < 0.2) {
        // Deep blue to electric cyan
        const t = audioValue / 0.2
        r = 0.02 * (1 - t) + 0.0 * t
        g = 0.08 * (1 - t) + 1.0 * t
        b = 0.35 * (1 - t) + 1.0 * t
      } else if (audioValue < 0.4) {
        // Cyan to neon green
        const t = (audioValue - 0.2) / 0.2
        r = 0.0 * (1 - t) + 0.1 * t
        g = 1.0 * (1 - t) + 1.0 * t
        b = 1.0 * (1 - t) + 0.2 * t
      } else if (audioValue < 0.6) {
        // Neon green to hot magenta
        const t = (audioValue - 0.4) / 0.2
        r = 0.1 * (1 - t) + 1.0 * t
        g = 1.0 * (1 - t) + 0.0 * t
        b = 0.2 * (1 - t) + 0.9 * t
      } else if (audioValue < 0.8) {
        // Magenta to blazing red/orange
        const t = (audioValue - 0.6) / 0.2
        r = 1.0 * (1 - t) + 1.0 * t
        g = 0.0 * (1 - t) + 0.35 * t
        b = 0.9 * (1 - t) + 0.0 * t
      } else {
        // Red/orange to bright yellow/white
        const t = (audioValue - 0.8) / 0.2
        r = 1.0 * (1 - t) + 1.0 * t
        g = 0.35 * (1 - t) + 1.0 * t
        b = 0.0 * (1 - t) + 0.6 * t
      }

      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b

      // Reactive sizes: audio makes particles bigger
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