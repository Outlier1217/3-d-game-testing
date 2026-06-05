import { Scene, ActionManager, ExecuteCodeAction } from '@babylonjs/core'

export class InputManager {
  private keys: Record<string, boolean> = {}

  constructor(scene: Scene) {
    scene.actionManager = new ActionManager(scene)

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
      // prevent page scroll on space/arrows
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
    })
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
  }

  isDown(code: string): boolean {
    return !!this.keys[code]
  }

  isAnyDown(...codes: string[]): boolean {
    return codes.some(c => !!this.keys[c])
  }

  // Consume a key press (one-shot)
  consume(code: string): boolean {
    if (this.keys[code]) {
      this.keys[code] = false
      return true
    }
    return false
  }
}