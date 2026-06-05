import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  Mesh, ShadowGenerator, DynamicTexture, Animation
} from '@babylonjs/core'
import type { LevelData, PlatformDef } from '../levels/levelData'

export class LevelBuilder {
  private platforms: Mesh[] = []
  private goalMesh: Mesh | null = null
  private movingPlatformData: { mesh: Mesh; def: PlatformDef }[] = []

  constructor(private scene: Scene, private shadowGen: ShadowGenerator) {}

  build(level: LevelData) {
    this.platforms = []
    this.goalMesh = null
    this.movingPlatformData = []

    // Ground / starter platform is first in list
    for (const p of level.platforms) {
      this.buildPlatform(p)
    }

    // Goal flag
    this.buildGoal(level.goalPos)

    // Animate moving platforms
    this.scene.registerBeforeRender(() => {
      const t = performance.now() / 1000
      for (const { mesh, def } of this.movingPlatformData) {
        if (def.move) {
          const { axis, amplitude, speed } = def.move
          const offset = Math.sin(t * speed) * amplitude
          const origin = def.position
          mesh.position.x = origin.x + (axis === 'x' ? offset : 0)
          mesh.position.z = origin.z + (axis === 'z' ? offset : 0)
          mesh.position.y = origin.y + (axis === 'y' ? offset : 0)
        }
      }
    })
  }

  private buildPlatform(def: PlatformDef) {
    const mat = new StandardMaterial(`platMat_${def.position.x}`, this.scene)

    // Color by type
    if (def.type === 'ground') {
      mat.diffuseColor = new Color3(0.1, 0.05, 0.3)
      mat.emissiveColor = new Color3(0.03, 0.0, 0.1)
      mat.specularColor = new Color3(0.6, 0.4, 1.0)
    } else if (def.type === 'moving') {
      mat.diffuseColor = new Color3(0.0, 0.5, 0.8)
      mat.emissiveColor = new Color3(0.0, 0.15, 0.3)
    } else if (def.type === 'danger') {
      mat.diffuseColor = new Color3(0.8, 0.1, 0.2)
      mat.emissiveColor = new Color3(0.3, 0.0, 0.05)
    } else {
      mat.diffuseColor = new Color3(0.15, 0.08, 0.4)
      mat.emissiveColor = new Color3(0.05, 0.0, 0.15)
    }

    const mesh = MeshBuilder.CreateBox(`platform`, {
      width: def.size.x,
      height: def.size.y,
      depth: def.size.z
    }, this.scene)

    mesh.position = new Vector3(def.position.x, def.position.y, def.position.z)
    mesh.material = mat
    mesh.receiveShadows = true
    mesh.checkCollisions = true
    mesh.metadata = { isGround: true, type: def.type }

    // Neon edge glow lines (thin boxes along edges)
    this.addEdgeGlow(mesh, def, mat.emissiveColor)

    this.shadowGen.addShadowCaster(mesh)
    this.platforms.push(mesh)

    if (def.move) {
      this.movingPlatformData.push({ mesh, def })
    }

    return mesh
  }

  private addEdgeGlow(parent: Mesh, def: PlatformDef, baseColor: Color3) {
    const edgeMat = new StandardMaterial(`edge_${parent.name}`, this.scene)
    edgeMat.emissiveColor = new Color3(
      Math.min(baseColor.r * 6 + 0.2, 1.0),
      Math.min(baseColor.g * 6 + 0.2, 1.0),
      Math.min(baseColor.b * 6 + 0.3, 1.0)
    )
    edgeMat.disableLighting = true

    // Top edge strips
    const edgeH = 0.06
    const edgeW = 0.06
    const w = def.size.x
    const d = def.size.z
    const h = def.size.y

    const strips = [
      // front/back top edges
      { w, h: edgeH, d: edgeW, x: 0, y: h / 2 + edgeH / 2, z: -d / 2 },
      { w, h: edgeH, d: edgeW, x: 0, y: h / 2 + edgeH / 2, z:  d / 2 },
      // left/right top edges
      { w: edgeW, h: edgeH, d, x: -w / 2, y: h / 2 + edgeH / 2, z: 0 },
      { w: edgeW, h: edgeH, d, x:  w / 2, y: h / 2 + edgeH / 2, z: 0 },
    ]

    for (const s of strips) {
      const edge = MeshBuilder.CreateBox(`edge`, { width: s.w, height: s.h, depth: s.d }, this.scene)
      edge.position = new Vector3(s.x, s.y, s.z)
      edge.parent = parent
      edge.material = edgeMat
      edge.metadata = { isGround: false }
    }
  }

  private buildGoal(pos: Vector3) {
    // Pole
    const pole = MeshBuilder.CreateCylinder('pole', { height: 6, diameter: 0.2 }, this.scene)
    pole.position = new Vector3(pos.x, pos.y + 3, pos.z)
    const poleMat = new StandardMaterial('poleMat', this.scene)
    poleMat.emissiveColor = new Color3(1.0, 0.8, 0.0)
    poleMat.diffuseColor = new Color3(1.0, 0.8, 0.0)
    pole.material = poleMat
    pole.metadata = { isGround: false }

    // Flag
    const flag = MeshBuilder.CreatePlane('flag', { width: 2, height: 1.5 }, this.scene)
    flag.position = new Vector3(pos.x + 1, pos.y + 5.5, pos.z)
    const flagMat = new StandardMaterial('flagMat', this.scene)
    flagMat.diffuseColor = new Color3(0.0, 1.0, 0.5)
    flagMat.emissiveColor = new Color3(0.0, 0.6, 0.3)
    flagMat.backFaceCulling = false
    flag.material = flagMat
    flag.metadata = { isGround: false }

    // Animate flag wave
    let t = 0
    this.scene.registerBeforeRender(() => {
      t += 0.05
      flag.rotation.y = Math.sin(t) * 0.3
    })

    this.goalMesh = pole
  }

  getGoalPosition(): Vector3 | null {
    return this.goalMesh ? this.goalMesh.position.clone() : null
  }
}