import { AdditiveBlending, BufferGeometry, DynamicDrawUsage, Float32BufferAttribute, PointsMaterial, ShaderMaterial, TextureLoader } from 'three'
import { sphereSceneParticlesColoredFragmentShader, sphereSceneParticlesColoredVertexShader } from './shaders/sphereSceneParticlesColoredShader'

/**
 * initialize a PointsMaterial for particles
 * @param color Color of particles
 * @param size Size of particles
 * @returns PointsMaterial for particles
 */
export const getParticlePointMaterial = (color: string | number, size: number): PointsMaterial => {
  return new PointsMaterial({
    color: color,
    size: size,
    map: new TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png'),
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false
  })
}

/**
 * initialize a ShaderMaterial with SphereSceneParticlesColoredShader
 * @returns ShaderMaterial with SphereSceneParticlesColoredShader
 */
export const getSphereSceneParticlesColoredShaderMaterial = (): ShaderMaterial => {
  const uniforms = {
    pointTexture: { value: new TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png') }
  }
  return new ShaderMaterial({
    uniforms: uniforms,
    vertexShader: sphereSceneParticlesColoredVertexShader,
    fragmentShader: sphereSceneParticlesColoredFragmentShader,
    blending: AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
  })
}

/**
 * Generate a discrete sphere
 * @param radius Radius of the sphere
 * @param nbPoints Number of points that popullate the sphere
 * @param turns Number of times to turn around the y-axis
 * @returns BufferGeometry representing a sphere
 */
export const generateSphereBufferGeometry = (radius = 100, nbPoints = 4000, turns = 60): BufferGeometry => {
  // Generate discrete 3D sphere
  const step = 2 / nbPoints
  const geometry = new BufferGeometry()

  const positions: number[] = []

  for (let i = -1; i <= 1; i += step) {
    const phi = Math.acos(i)
    const theta = (2 * turns * phi) % (2 * Math.PI)

    positions.push(Math.sin(theta) * Math.sin(phi) * radius)
    positions.push(Math.cos(phi) * radius)
    positions.push(Math.cos(theta) * Math.sin(phi) * radius)
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3).setUsage(DynamicDrawUsage))
  return geometry
}

/**
 * Calculate a new position for each particle of the sphere based on the current audio listened
 * @param audioData Audio data of the current played audio
 * @param particleCount Number of particles in the sphere
 * @param startPositions Base position of each particle of the sphere
 * @returns Array containing the new positions ready to pass to shader
 */
export const getSphereUpdatedPositions = (audioData: number[], particleCount: number, startPositions: ArrayLike<number>): number[] => {
  const positions = Object.assign(new Array<number>(), startPositions)

  const step = audioData.length / (particleCount / 2)

  // Update the particles
  for (let i = 0; i < particleCount / 2; i++) {
    if (Math.floor(i * step) < audioData.length){
      const factor = audioData[Math.floor(i * step)] / 256 + 1 // between 1 and 2

      positions[Math.floor((particleCount * 3) / 2) - 1 + 3 * i] *= factor
      positions[(Math.floor((particleCount * 3) / 2) - 1 + 3 * i) + 1] *= factor
      positions[(Math.floor((particleCount * 3) / 2) - 1 + 3 * i) + 2] *= factor

      positions[Math.floor((particleCount * 3) / 2) - 1 - 3 * i] *= factor
      positions[(Math.floor((particleCount * 3) / 2) - 1 - 3 * i) + 1] *= factor
      positions[(Math.floor((particleCount * 3) / 2) - 1 - 3 * i) + 2] *= factor
    }
  }

  return positions
}

/**
 * Calculate a new position for each particle of the sphere based on the current audio listened
 * @param audioData Audio data of the current played audio
 * @param particleCount Number of particles in the sphere
 * @param startPositions Base position of each particle of the sphere
 * @param defaultSize Default size of particle
 * @returns Array containing the new positions ready to pass to shader
 */
export const getSphereUpdatedPositionsAndSizes = (audioData: number[], particleCount: number, startPositions: ArrayLike<number>, defaultSize = 10):
{ positions: number[], sizes: number[] } => {
  const positions = Object.assign(new Array<number>(), startPositions)
  const sizes: number[] = new Array<number>(particleCount).fill(defaultSize)
  const step = audioData.length / (particleCount / 2)

  // Update the particles
  for (let i = 0; i < particleCount / 2; i++) {
    if (Math.floor(i * step) < audioData.length){
      const factor = audioData[Math.floor(i * step)] / 256 + 1 // between 1 and 2

      positions[Math.floor((particleCount * 3) / 2) - 1 + 3 * i] *= factor
      positions[(Math.floor((particleCount * 3) / 2) - 1 + 3 * i) + 1] *= factor
      positions[(Math.floor((particleCount * 3) / 2) - 1 + 3 * i) + 2] *= factor
      sizes[Math.floor(particleCount  / 2) + i] /= factor * 2

      positions[Math.floor((particleCount * 3) / 2) - 1 - 3 * i] *= factor
      positions[(Math.floor((particleCount * 3) / 2) - 1 - 3 * i) + 1] *= factor
      positions[(Math.floor((particleCount * 3) / 2) - 1 - 3 * i) + 2] *= factor
      sizes[Math.floor(particleCount  / 2) - i] /= factor * 2
    }
  }

  return { positions, sizes }
}