import Game from './Game.js';
import { loadImage, loadJSON } from './Loader.js';
import Sprite from './Sprite.js';
import Cinematic from './Cinematic.js';
import { haveCollision, getRandomFrom } from './Additional.js';
import DisplayObject from './DisplayObject.js';

// Масштаб отрисовки игры.
const scale = 3

export default async function main () {
	// Игра.
	const game = new Game({
		// Ширина и высота игрового поля.
		width: 672,
		height: 744,
		background: 'black'
	})

	document.body.append(game.canvas)

	const image = await loadImage('./sets/spritesheet.png')
	const atlas = await loadJSON('/sets/atlas.json')

	// Лабиринт.
	const maze = new Sprite({
		image,
		x: 0,
		y: 0,
		width: atlas.maze.width * scale,
		height: atlas.maze.height * scale,
		frame: atlas.maze
	})
	game.canvas.width = maze.width
	game.canvas.height = maze.height

	// Еда.
	let foods = atlas.maze.foods
		.map(food => ({
			...food,
			x: food.x * scale,
			y: food.y * scale,
			width: food.width * scale,
			height: food.height * scale
		}))
		.map(food => new Sprite({
			image,
			frame: atlas.food,
			...food
		}))

	const pacman = new Cinematic({
		image,
		x: atlas.position.pacman.x * scale,
		y: atlas.position.pacman.y * scale,
		width: atlas.pacman[0].frames[0].width * scale,
		height: atlas.pacman[0].frames[0].height * scale,
		animations: atlas.pacman,
		// debug: true,
		speedX: 1
	})
	pacman.start('right')
	// console.log('pacman: ', pacman);

	// Привидения.
	let ghosts = ['red', 'pink', 'turquoise', 'banana']
		.map(color => {
			const ghost = new Cinematic({
				image,
				x: atlas.position[color].x * scale,
				y: atlas.position[color].y * scale,
				width: atlas[`${color}Ghost`][0].frames[0].width * scale,
				height: atlas[`${color}Ghost`][0].frames[0].height * scale,
				animations: atlas[`${color}Ghost`],
				// debug: true
			})
			ghost.start(atlas.position[color].direction)
			ghost.nextDirection = atlas.position[color].direction
			// Может ли пакман съесть привидение?
			ghost.isBlue = false

			return ghost
		})

	// Стены лабиринта (не для отображения, а для определения столкновений).
	const walls = atlas.maze.walls.map(wall => new DisplayObject({
		x: wall.x *scale,
		y: wall.y *scale,
		width: wall.width *scale,
		height: wall.height *scale,
		// debug: true
	}))

	// Левый портал.
	const leftPortal = new DisplayObject({
		x: atlas.position.leftPortal.x * scale,
		y: atlas.position.leftPortal.y * scale,
		width: atlas.position.leftPortal.width * scale,
		height: atlas.position.leftPortal.height * scale,
		// debug: true
	})

	// Правый портал.
	const rightPortal = new DisplayObject({
		x: atlas.position.rightPortal.x * scale,
		y: atlas.position.rightPortal.y * scale,
		width: atlas.position.rightPortal.width * scale,
		height: atlas.position.rightPortal.height * scale,
		// debug: true
	})

	// Таблетки.
	const tablets = atlas.position.tablets
		.map(tablet => new Sprite({
			image,
			frame: atlas.tablet,
			x: tablet.x * scale,
			y: tablet.y * scale,
			width: tablet.width * scale,
			height: tablet.height * scale
		}))

	game.stage.add(maze)
	foods.forEach(food => game.stage.add(food))
	game.stage.add(pacman)
	ghosts.forEach(ghost => game.stage.add(ghost))
	walls.forEach(wall => game.stage.add(wall))
	game.stage.add(leftPortal)
	game.stage.add(rightPortal)
	tablets.forEach(tablet => game.stage.add(tablet))

	game.update = () => {
		// Съеденная еда.
		const eated = []

		// Проверка на столкновение пакмана с едой.
		for (const food of foods) {
			if (haveCollision(pacman, food)) {
				// Съесть еду.
				eated.push(food)
				game.stage.remove(food)
			}
		}

		// Оставим на игровом поле только несъеденную еду.
		foods = foods.filter(food => !eated.includes(food))

		// Проверка столкновения привидений со стенами и пакманом.
		for (const ghost of ghosts) {
			// Если привидение уже съедено:
			if (!ghost.play) {
				ghosts = ghosts.filter(ghost => ghost.play)

				return
			}

			// Стена, с которой может столкнуться привидение на следующей итерации.
			const wall = getWallCollision(ghost.getNextPosition())
			
			// Если привидение столкнулось со стеной:
			if (wall) {
				ghost.speedX = 0
				ghost.speedY = 0
			}

			if (ghost.speedX === 0 && ghost.speedY === 0) {
				// Назначить привидению новое направление движения.
				if (ghost.animation.name === 'up') {
					ghost.nextDirection = getRandomFrom('left', 'right', 'down')
				}
	
				else if (ghost.animation.name === 'down') {
					ghost.nextDirection = getRandomFrom('left', 'right', 'up')
				}
	
				else if (ghost.animation.name === 'left') {
					ghost.nextDirection = getRandomFrom('down', 'right', 'up')
				}
	
				else if (ghost.animation.name === 'right') {
					ghost.nextDirection = getRandomFrom('left', 'down', 'up')
				}
			}

			// Если привидение столкнулось с пакманом:
			if (pacman.play && ghost.play && haveCollision(pacman, ghost)) {
				// Если пакман может съесть привидение:
				if (ghost.isBlue) {
					ghost.play = false
					ghost.speedX = 0
					ghost.speedY = 0
					game.stage.remove(ghost)
				}

				// Если пакман НЕ может съесть привидение:
				else {
					pacman.speedX = 0
					pacman.speedY = 0
					pacman.start('die', {
						onEnd () {
							pacman.play = false
							pacman.stop()
							game.stage.remove(pacman)
						}
					})
				}
			}
		}

		// Смена направления движения.
		changeDirection(pacman)
		ghosts.forEach(changeDirection)

		// Стена, с которой может столкнуться пакман на следующей итерации.
		const wall = getWallCollision(pacman.getNextPosition())
		// Если пакман столкнулся со стеной:
		if (wall) {
			pacman.start(`wait${pacman.animation.name}`)
			pacman.speedX = 0
			pacman.speedY = 0
		}

		// Если пакман вошел в левый портал:
		if (haveCollision(pacman, leftPortal)) {
			pacman.x = atlas.position.rightPortal.x * scale - pacman.width - 1
		}

		// Если пакман вошел в правый портал:
		if (haveCollision(pacman, rightPortal)) {
			pacman.x = atlas.position.leftPortal.x * scale + pacman.width + 1
		}

		// Проверка столкновений пакмана с таблетками.
		for (let i = 0; i < tablets.length; i++) {
			const tablet = tablets[i]

			if (haveCollision(pacman, tablet)) {
				tablets.splice(i, 1)
				game.stage.remove(tablet)

				ghosts.forEach(ghost => {
					// Исходные анимации привидения.
					ghost.originalAnimations = ghost.animations
					ghost.animations = atlas.blueGhost
					ghost.isBlue = true
					ghost.start(ghost.animation.name)
				})

				// Через 5с привидения вернутся к исходному состоянию.
				setTimeout(() => {
					ghosts.forEach(ghost => {
						ghost.animations = ghost.originalAnimations
						ghost.isBlue = false
						ghost.start(ghost.animation.name)
					})
				}, 5000)

				break
			}
		}
	}

	document.addEventListener('keydown', event => {
		// Если пакман уже мёртв:
		if (!pacman.play) {
			return
		}

		// Если pacman должен двигаться налево:
		if (event.key === "ArrowLeft") {
			pacman.nextDirection = 'left'
		}
		// Если pacman должен двигаться направо:
		else if (event.key === "ArrowRight") {
			pacman.nextDirection = 'right'
		}
		// Если pacman должен двигаться вверх:
		else if (event.key === "ArrowUp") {
			pacman.nextDirection = 'up'
		}
		// Если pacman должен двигаться вниз:
		else if (event.key === "ArrowDown") {
			pacman.nextDirection = 'down'
		}
	})

	/* 
		Функция определяет, столкнулся ли переданный ей объект со стеной. 
		Если столкнулся, возвращает с какой именно. 
	*/
	function getWallCollision (obj) {
		for (const wall of walls) {
			if (haveCollision(wall, obj)) {
				return wall
			}
		}

		return false
	}

	/* 
		Смена направления движения переданного объекта в соответствии с 
		запомненным следующим направлением движения с учётом возможного люфта 
		между стенами лабиринта 
		(если объект может пройти 10px в запомненном следующем направлении, 
		то при первой возможности он в этом направлении пойдёт).
	*/
	function changeDirection (sprite) {
		if (!sprite.nextDirection) {
			return
		}

		if (sprite.nextDirection === 'up') {
			sprite.y -= 10
			if (!getWallCollision(sprite)) {
				sprite.nextDirection = null
				sprite.speedX = 0
				sprite.speedY = -1
				sprite.start('up')
			}
			sprite.y += 10
		}

		else if (sprite.nextDirection === 'down') {
			sprite.y += 10
			if (!getWallCollision(sprite)) {
				sprite.nextDirection = null
				sprite.speedX = 0
				sprite.speedY = 1
				sprite.start('down')
			}
			sprite.y -= 10
		}

		else if (sprite.nextDirection === 'left') {
			sprite.x -= 10
			if (!getWallCollision(sprite)) {
				sprite.nextDirection = null
				sprite.speedX = -1
				sprite.speedY = 0
				sprite.start('left')
			}
			sprite.x += 10
		}

		else if (sprite.nextDirection === 'right') {
			sprite.x += 10
			if (!getWallCollision(sprite)) {
				sprite.nextDirection = null
				sprite.speedX = 1
				sprite.speedY = 0
				sprite.start('right')
			}
			sprite.x -= 10
		}
	}
}