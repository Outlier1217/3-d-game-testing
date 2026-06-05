import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3,
  Mesh, ShadowGenerator, PhysicsImpostor
} from '@babylonjs/core'
import { InputManager } from './InputManager'

const MOVE_SPEED = 12
const JUMP_FORCE = 14
const GRAVITY = -35
const DOUBLE_JUMP_FORCE = 12

export class Player {
  mesh: Mesh
  private mat: StandardMaterial
  private scene: Scene
  private input: InputManager

  private velocityY = 0
  private onGround = false
  private canDoubleJump = false
  private hasDoubleJumped = false
  private jumpConsumed = false

  // Invincibility frames after hit
  private invincible = 0

  constructor(scene: Scene, shadowGen: ShadowGenerator, input: InputManager, startPos: Vector3) {
    this.scene = scene
    this.input = input

    // Body (capsule-like: box + sphere on top)
    const body = MeshBuilder.CreateBox('playerBody', { width: 1, height: 1.2, depth: 1 }, scene)
    const head = MeshBuilder.CreateSphere('playerHead', { diameter: 0.9 }, scene)
    head.parent = body
    head.position.y = 1.0

    this.mesh = body
    this.mesh.position = startPos.clone()
    this.mesh.checkCollisions = true
    this.mesh.isPickable = false

    this.mat = new StandardMaterial('playerMat', scene)
    this.mat.diffuseColor = new Color3(0.0, 1.0, 0.8)
    this.mat.emissiveColor = new Color3(0.0, 0.4, 0.3)
    this.mat.specularColor = new Color3(0.5, 1.0, 0.9)
    body.material = this.mat

    const headMat = new StandardMaterial('headMat', scene)
    headMat.diffuseColor = new Color3(0.9, 0.7, 0.3)
    headMat.emissiveColor = new Color3(0.3, 0.2, 0.0)
    head.material = headMat

    shadowGen.addShadowCaster(body)
    shadowGen.addShadowCaster(head)

    // Register per-frame movement
    scene.registerBeforeRender(() => this.updateMovement())
  }

  getVelocityY(): number {
    return this.velocityY
  }

  bounce() {
    this.velocityY = JUMP_FORCE * 0.7
    this.onGround = false
    this.canDoubleJump = true
    this.hasDoubleJumped = false
  }

  respawn(pos: Vector3) {
    this.mesh.position = pos.clone()
    this.velocityY = 0
    this.onGround = false
    this.invincible = 120 // 2 sec invincibility
  }

  isInvincible(): boolean {
    return this.invincible > 0
  }

  private updateMovement() {
    const dt = this.scene.getEngine().getDeltaTime() / 1000

    // --- Horizontal movement ---
    const forward = new Vector3(0, 0, 1)
    const right = new Vector3(1, 0, 0)
    let move = Vector3.Zero()

    if (this.input.isAnyDown('KeyW', 'ArrowUp'))    move.addInPlace(forward)
    if (this.input.isAnyDown('KeyS', 'ArrowDown'))  move.addInPlace(forward.negate())
    if (this.input.isAnyDown('KeyA', 'ArrowLeft'))  move.addInPlace(right.negate())
    if (this.input.isAnyDown('KeyD', 'ArrowRight')) move.addInPlace(right)

    if (move.length() > 0) {
      move.normalize().scaleInPlace(MOVE_SPEED * dt)
      // Rotate player to face movement
      const angle = Math.atan2(move.x, move.z)
      this.mesh.rotation.y = angle
    }

    // --- Jump ---
    const jumpPressed = this.input.isAnyDown('Space')

    if (jumpPressed && !this.jumpConsumed) {
      if (this.onGround) {
        this.velocityY = JUMP_FORCE
        this.onGround = false
        this.canDoubleJump = true
        this.hasDoubleJumped = false
        this.jumpConsumed = true
      } else if (this.canDoubleJump && !this.hasDoubleJumped) {
        this.velocityY = DOUBLE_JUMP_FORCE
        this.hasDoubleJumped = true
        this.canDoubleJump = false
        this.jumpConsumed = true
        // Visual flash on double jump
        this.mat.emissiveColor = new Color3(0.5, 1.0, 0.5)
        setTimeout(() => {
          this.mat.emissiveColor = new Color3(0.0, 0.4, 0.3)
        }, 120)
      }
    }

    if (!jumpPressed) {
      this.jumpConsumed = false
    }

    // --- Gravity ---
    this.velocityY += GRAVITY * dt

    // --- Apply vertical movement with ground check ---
    const newY = this.mesh.position.y + this.velocityY * dt
    const groundY = this.checkGroundCollision(
      this.mesh.position.x + move.x,
      newY,
      this.mesh.position.z + move.z
    )

    if (newY <= groundY) {
      this.mesh.position.y = groundY
      this.velocityY = 0
      this.onGround = true
      this.canDoubleJump = true
      this.hasDoubleJumped = false
    } else {
      this.mesh.position.y = newY
      // Check if we just walked off a ledge
      const standingGround = this.checkGroundCollision(
        this.mesh.position.x + move.x,
        this.mesh.position.y - 0.2,
        this.mesh.position.z + move.z
      )
      this.onGround = (this.mesh.position.y - standingGround) < 0.3
    }

    // Horizontal
    this.mesh.position.x += move.x
    this.mesh.position.z += move.z

    // Invincibility countdown
    if (this.invincible > 0) {
      this.invincible--
      // Blink effect
      this.mesh.isVisible = Math.floor(this.invincible / 5) % 2 === 0
      if (this.invincible <= 0) this.mesh.isVisible = true
    }
  }

  private checkGroundCollision(x: number, y: number, z: number): number {
    // Sample all meshes with "platform" or "ground" metadata
    const scene = this.scene
    let highestGround = -9999

    for (const mesh of scene.meshes) {
      if (!mesh.metadata?.isGround) continue
      const bb = mesh.getBoundingInfo().boundingBox

      // Check XZ overlap with some tolerance
      const minX = bb.minimumWorld.x - 0.3
      const maxX = bb.maximumWorld.x + 0.3
      const minZ = bb.minimumWorld.z - 0.3
      const maxZ = bb.maximumWorld.z + 0.3
      const topY = bb.maximumWorld.y

      if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
        if (y >= topY - 0.5 && topY > highestGround) {
          highestGround = topY
        }
      }
    }

    return highestGround
  }
}