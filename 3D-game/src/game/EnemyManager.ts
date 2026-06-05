import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  Mesh, ShadowGenerator
} from '@babylonjs/core'
import type { EnemyDef } from '../levels/levelData'

const HIT_RADIUS = 1.4
const STOMP_RADIUS = 1.8
const STOMP_VERTICAL = 1.2 // player must be above enemy by this much

export class EnemyManager {
  private enemies: { mesh: Mesh; def: EnemyDef; dir: number; t: number }[] = []

  constructor(private scene: Scene, private shadowGen: ShadowGenerator) {}

  spawn(defs: EnemyDef[]) {
    this.enemies = []
    for (const def of defs) {
      const body = MeshBuilder.CreateBox(`enemy`, { width: 1.2, height: 1.0, depth: 1.2 }, this.scene)
      body.position = new Vector3(def.position.x, def.position.y, def.position.z)

      const mat = new StandardMaterial(`enemyMat`, this.scene)
      mat.diffuseColor = new Color3(1.0, 0.2, 0.4)
      mat.emissiveColor = new Color3(0.4, 0.0, 0.1)
      mat.specularColor = new Color3(1.0, 0.5, 0.5)
      body.material = mat
      body.metadata = { isGround: false }

      // Eyes
      const eyeL = MeshBuilder.CreateSphere('eL', { diameter: 0.25 }, this.scene)
      const eyeR = MeshBuilder.CreateSphere('eR', { diameter: 0.25 }, this.scene)
      eyeL.parent = body; eyeL.position = new Vector3(-0.28, 0.2, -0.5)
      eyeR.parent = body; eyeR.position = new Vector3( 0.28, 0.2, -0.5)
      const eyeMat = new StandardMaterial('eyeMat', this.scene)
      eyeMat.emissiveColor = new Color3(1, 1, 0)
      eyeMat.disableLighting = true
      eyeL.material = eyeMat
      eyeR.material = eyeMat
      eyeL.metadata = { isGround: false }
      eyeR.metadata = { isGround: false }

      this.shadowGen.addShadowCaster(body)

      this.enemies.push({ mesh: body, def, dir: 1, t: 0 })
    }

    // Patrol movement
    this.scene.registerBeforeRender(() => {
      const dt = this.scene.getEngine().getDeltaTime() / 1000
      for (const e of this.enemies) {
        if (e.mesh.isDisposed()) continue
        e.t += dt * e.def.speed * e.dir
        const offset = Math.sin(e.t) * e.def.patrolRange
        if (e.def.patrolAxis === 'x') {
          e.mesh.position.x = e.def.position.x + offset
          e.mesh.rotation.y = e.dir > 0 ? 0 : Math.PI
        } else {
          e.mesh.position.z = e.def.position.z + offset
        }
        // Flip direction at range edges
        if (Math.abs(offset) >= e.def.patrolRange * 0.99) {
          e.dir *= -1
        }
      }
    })
  }

  checkPlayerCollision(playerPos: Vector3): boolean {
    for (const e of this.enemies) {
      if (e.mesh.isDisposed()) continue
      const dist = Vector3.Distance(
        new Vector3(playerPos.x, 0, playerPos.z),
        new Vector3(e.mesh.position.x, 0, e.mesh.position.z)
      )
      if (dist < HIT_RADIUS) {
        // Only damage if player is not above enemy (i.e., not stomping)
        const above = playerPos.y > e.mesh.position.y + STOMP_VERTICAL
        if (!above) return true
      }
    }
    return false
  }

  checkStomp(playerPos: Vector3, velocityY: number): number {
    if (velocityY >= 0) return 0 // Only stomp when falling
    let stomped = 0
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]
      if (e.mesh.isDisposed()) continue
      const dist = Vector3.Distance(
        new Vector3(playerPos.x, 0, playerPos.z),
        new Vector3(e.mesh.position.x, 0, e.mesh.position.z)
      )
      const above = playerPos.y > e.mesh.position.y + 0.3
      if (dist < STOMP_RADIUS && above) {
        e.mesh.dispose()
        this.enemies.splice(i, 1)
        stomped++
      }
    }
    return stomped
  }
}