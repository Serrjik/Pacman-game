import Group from "./Group.js";

// Реализация игры.
export default class Game {
	constructor (props = {}) {
		this.canvas = document.createElement('canvas')
		this.context = this.canvas.getContext('2d')
		/* 
			Главный контейнер, который будем отрисовывать первым.
			Будем вкладывать в него то, что нужно отрисовать. 
		*/
		this.stage = new Group

		this.canvas.width = props.width ?? 50
		this.canvas.height = props.height ?? 50
		this.background = props.background ?? "black"

		// Предыдущий timestamp.
		this.pTimestamp = 0
		requestAnimationFrame(x => this.render(x))
	}

	update () {}

	clearCanvas () {
		this.canvas.width = this.canvas.width
	}

	// Метод заполняет канвас одним цветом.
	drawBackground () {
		this.context.beginPath()
		this.context.rect(0, 0, this.canvas.width, this.canvas.height)
		this.context.fillStyle = this.background
		this.context.fill()
	}

	// Метод перерисовывает игру.
	render (timestamp) {
		requestAnimationFrame(x => this.render(x))
		// Сколько мс прошло между вызовами render.
		const delta = timestamp - this.pTimestamp
		this.pTimestamp = timestamp

		this.update()
		this.stage.update(delta)

		this.clearCanvas()
		this.drawBackground()

		// Отрисовать все элементы, что есть в контейнере.
		this.stage.draw(this.context)
	}
}