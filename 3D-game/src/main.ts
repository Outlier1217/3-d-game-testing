import { Game } from './game/Game'

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
const game = new Game(canvas)

document.getElementById('start-btn')!.addEventListener('click', () => {
  document.getElementById('start-screen')!.style.display = 'none'
  game.startLevel(1)
})

document.getElementById('restart-btn')!.addEventListener('click', () => {
  document.getElementById('gameover-screen')!.style.display = 'none'
  game.restart()
})

document.getElementById('next-btn')!.addEventListener('click', () => {
  document.getElementById('win-screen')!.style.display = 'none'
  game.nextLevel()
})