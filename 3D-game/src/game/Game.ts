import {
  Engine, Scene, Vector3, HemisphericLight, DirectionalLight,
  Color3, Color4, MeshBuilder, StandardMaterial,
  FollowCamera, ShadowGenerator, GlowLayer
} from '@babylonjs/core'
import { Player } from './Player'
import { LevelBuilder } from './LevelBuilder'
import { EnemyManager } from './EnemyManager'
import { CoinManager } from './CoinManager'
import { InputManager } from './InputManager'
import { LEVELS } from '../levels/levelData'

export class Game {
  engine: Engine
  scene!: Scene
  player!: Player
  levelBuilder!: LevelBuilder
  enemyManager!: EnemyManager
  coinManager!: CoinManager
  input!: InputManager
  shadowGen!: ShadowGenerator

  private currentLevel = 1
  private score = 0
  private lives = 3
  private coins = 0
  private gameActive = false

  // HUD refs
  private scoreEl = document.getElementById('score-val')!
  private livesEl = document.getElementById('lives-val')!
  private levelEl = document.getElementById('level-val')!
  private coinsEl = document.getElementById('coins-val')!

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
    window.addEventListener('resize', () => this.engine.resize())
  }

  startLevel(levelNum: number) {
    this.currentLevel = levelNum
    this.levelEl.textContent = String(levelNum)
    this.buildScene()
    this.gameActive = true
  }

  restart() {
    this.score = 0
    this.lives = 3
    this.coins = 0
    this.updateHUD()
    this.startLevel(1)
  }

  nextLevel() {
    const next = this.currentLevel + 1
    if (next > LEVELS.length) {
      // loop levels with more enemies
      this.startLevel(1)
    } else {
      this.startLevel(next)
    }
  }

  private buildScene() {
    if (this.scene) {
      this.scene.dispose()
    }

    const scene = new Scene(this.engine)
    this.scene = scene

    // Neon dark atmosphere
    scene.clearColor = new Color4(0.02, 0.00, 0.06, 1)
    scene.fogMode = Scene.FOGMODE_EXP2
    scene.fogColor = new Color3(0.04, 0.0, 0.1)
    scene.fogDensity = 0.018
    scene.gravity = new Vector3(0, -25, 0)
    scene.collisionsEnabled = true

    // Lighting
    const ambient = new HemisphericLight('amb', new Vector3(0, 1, 0), scene)
    ambient.intensity = 0.3
    ambient.diffuse = new Color3(0.4, 0.3, 0.8)
    ambient.groundColor = new Color3(0.1, 0.05, 0.2)

    const sun = new DirectionalLight('sun', new Vector3(-1, -2, -1), scene)
    sun.intensity = 1.2
    sun.diffuse = new Color3(0.8, 0.9, 1.0)
    sun.position = new Vector3(40, 50, 40)

    // Glow layer for neon effect
    const glow = new GlowLayer('glow', scene)
    glow.intensity = 0.6

    // Shadow generator
    this.shadowGen = new ShadowGenerator(1024, sun)
    this.shadowGen.useBlurExponentialShadowMap = true

    // Managers
    this.input = new InputManager(scene)
    this.levelBuilder = new LevelBuilder(scene, this.shadowGen)
    this.coinManager = new CoinManager(scene, glow)
    this.enemyManager = new EnemyManager(scene, this.shadowGen)

    // Build level
    const levelData = LEVELS[this.currentLevel - 1]
    this.levelBuilder.build(levelData)
    this.coinManager.spawn(levelData.coins)
    this.enemyManager.spawn(levelData.enemies)

    // Player
    this.player = new Player(scene, this.shadowGen, this.input, levelData.playerStart)

    // Camera follows player
    const cam = new FollowCamera('cam', new Vector3(0, 10, -20), scene)
    cam.lockedTarget = this.player.mesh
    cam.radius = 18
    cam.heightOffset = 8
    cam.rotationOffset = 180
    cam.cameraAcceleration = 0.05
    cam.maxCameraSpeed = 20
    scene.activeCamera = cam

    // Game loop
    scene.registerBeforeRender(() => {
      if (!this.gameActive) return
      this.update()
    })

    this.engine.runRenderLoop(() => scene.render())
  }

  private update() {
    const playerPos = this.player.mesh.position

    // Fell off the world
    if (playerPos.y < -12) {
      this.loseLife()
      return
    }

    // Coin collection
    const collected = this.coinManager.checkCollection(playerPos)
    if (collected > 0) {
      this.coins += collected
      this.score += collected * 100
      this.coinsEl.textContent = String(this.coins)
      this.scoreEl.textContent = String(this.score)
    }

    // Enemy collision
    const hitByEnemy = this.enemyManager.checkPlayerCollision(playerPos)
    if (hitByEnemy) {
      this.loseLife()
      return
    }

    // Enemy stomp (player falls on top of enemy)
    const stomped = this.enemyManager.checkStomp(playerPos, this.player.getVelocityY())
    if (stomped > 0) {
      this.score += stomped * 200
      this.player.bounce()
      this.scoreEl.textContent = String(this.score)
    }

    // Goal flag
    const goalPos = this.levelBuilder.getGoalPosition()
    if (goalPos && Vector3.Distance(playerPos, goalPos) < 3) {
      this.levelComplete()
    }
  }

  private loseLife() {
    this.lives--
    this.livesEl.textContent = String(this.lives)
    if (this.lives <= 0) {
      this.gameOver()
    } else {
      // Respawn
      const levelData = LEVELS[this.currentLevel - 1]
      this.player.respawn(levelData.playerStart)
    }
  }

  private gameOver() {
    this.gameActive = false
    document.getElementById('final-score')!.textContent = String(this.score)
    document.getElementById('gameover-screen')!.style.display = 'flex'
  }

  private levelComplete() {
    this.gameActive = false
    this.score += 500 + this.coins * 50
    document.getElementById('win-score')!.textContent = String(this.score)
    document.getElementById('win-screen')!.style.display = 'flex'
  }

  private updateHUD() {
    this.scoreEl.textContent = String(this.score)
    this.livesEl.textContent = String(this.lives)
    this.coinsEl.textContent = String(this.coins)
  }
}