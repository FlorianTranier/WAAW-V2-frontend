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

export class PyramidScene implements IScene {
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
  count = 10000 // Number of particles

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

    // Generate surface pyramid
    const size = 100 // Half-base length and height
    this.positions = new Float32Array(this.count * 3)
    this.colors = new Float32Array(this.count * 3)
    this.sizes = new Float32Array(this.count)
    
    // Corners of the square base at y = -size
    const A = { x: -size, y: -size, z: -size }
    const B = { x:  size, y: -size, z: -size }
    const C = { x:  size, y: -size, z:  size }
    const D = { x: -size, y: -size, z:  size }
    
    // Apex at y = size
    const Apex = { x: 0, y: size, z: 0 }

    for (let i = 0; i < this.count; i++) {
      // Choose one of the 5 faces randomly
      // 1: Base (square)
      // 2-5: Sides (triangles)
      const face = i % 5
      let x = 0, y = 0, z = 0

      if (face === 0) {
        // Square base
        x = (Math.random() * 2 - 1) * size
        y = -size
        z = (Math.random() * 2 - 1) * size
      } else {
        // Triangle face
        const r1 = Math.random()
        const r2 = Math.random()
        const sqrtR1 = Math.sqrt(r1)
        
        // P = (1 - sqrtR1) * A + (sqrtR1 * (1 - r2)) * B + (sqrtR1 * r2) * C
        let v1, v2, v3
        
        switch(face) {
        case 1: v1 = Apex; v2 = A; v3 = B; break // Front face
        case 2: v1 = Apex; v2 = B; v3 = C; break // Right face
        case 3: v1 = Apex; v2 = C; v3 = D; break // Back face
        case 4: v1 = Apex; v2 = D; v3 = A; break // Left face
        default: v1 = Apex; v2 = A; v3 = B
        }
        
        x = (1 - sqrtR1) * v1.x + (sqrtR1 * (1 - r2)) * v2.x + (sqrtR1 * r2) * v3.x
        y = (1 - sqrtR1) * v1.y + (sqrtR1 * (1 - r2)) * v2.y + (sqrtR1 * r2) * v3.y
        z = (1 - sqrtR1) * v1.z + (sqrtR1 * (1 - r2)) * v2.z + (sqrtR1 * r2) * v3.z
      }

      this.positions[i * 3] = x
      this.positions[i * 3 + 1] = y
      this.positions[i * 3 + 2] = z

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

    this.camera.position.set(0, -50, 700)
    // this.particleSystem.rotation.set(Math.PI / 2, 0, Math.PI / 2)

    window.addEventListener('resize', this.resizeHandler)
    this.render([])
  }

  render = (audioData: number[]) => {
    this.time += 0.01
    this.particleSystem.material.uniforms.time.value = this.time
    
    // Global rotations

    this.particleSystem.rotation.y += 0.01

    // Global pulse (breathing)
    const pulseFactor = 4 + Math.sin(this.time)
    
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