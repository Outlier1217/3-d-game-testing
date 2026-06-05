import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  Mesh, GlowLayer
} from '@babylonjs/core'

const COLLECT_RADIUS = 1.8

export class CoinManager {
  private coins: Mesh[] = []

  constructor(private scene: Scene, private glow: GlowLayer) {}

  spawn(positions: Vector3[]) {
    this.coins = []
    for (const pos of positions) {
      const coin = MeshBuilder.CreateCylinder(`coin`, {
        height: 0.15,
        diameter: 0.8,
        tessellation: 16
      }, this.scene)

      coin.position = pos.clone()
      coin.rotation.x = Math.PI / 2

      const mat = new StandardMaterial(`coinMat`, this.scene)
      mat.diffuseColor = new Color3(1.0, 0.85, 0.0)
      mat.emissiveColor = new Color3(0.8, 0.6, 0.0)
      mat.specularColor = new Color3(1.0, 1.0, 0.5)
      mat.specularPower = 64
      coin.material = mat
      coin.metadata = { isGround: false }

      this.glow.referenceMeshToUseItsOwnMaterial(coin)
      this.coins.push(coin)
    }

    // Animate all coins
    let t = 0
    this.scene.registerBeforeRender(() => {
      t += 0.04
      for (let i = 0; i < this.coins.length; i++) {
        const c = this.coins[i]
        if (!c.isDisposed()) {
          c.rotation.z = t + i * 0.5
          c.position.y = (c.metadata?.baseY ?? c.position.y) + Math.sin(t + i) * 0.3
          if (!c.metadata?.baseY) {
            c.metadata = { ...c.metadata, baseY: c.position.y }
          }
        }
      }
    })
  }

  checkCollection(playerPos: Vector3): number {
    let count = 0
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i]
      if (!c.isDisposed() && Vector3.Distance(playerPos, c.position) < COLLECT_RADIUS) {
        c.dispose()
        this.coins.splice(i, 1)
        count++
      }
    }
    return count
  }
}