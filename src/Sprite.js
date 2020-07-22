// Рисовка фрагмента изображения.
import DisplayObject from './DisplayObject.js'

export default class Sprite extends DisplayObject {
	// Обрабатывать или нет нажатия клавиш.
	play = true

	constructor (props = {}) {
		super(props)

		// Изображение, откуда брать текстуры.
		this.image = props.image ?? null
		// Текстура (какой фрейм?).
		this.frame = props.frame ?? null

		// Скорости объекта по осям:
		this.speedX = props.speedX ?? 0
		this.speedY = props.speedY ?? 0
		/* 
			Направление, в котором объект должен начать двигаться 
			при наступлении возможности для движения в этом направлении. 
		*/
		this.nextDirection = null
	}

	// Метод возвращает следующую позицию спрайта (которая могла бы быть).
	getNextPosition () {
		return {
			x: this.x + this.speedX,
			y: this.y + this.speedY,
			width: this.width,
			height: this.height
		}
	}

	update () {
		this.x += this.speedX
		this.y += this.speedY
	}

	// Метод отрисовывает изображение.
	draw (context) {
		// Рисовать изображение, только если фрейм есть.
		if (this.frame) {
			context.drawImage(
				this.image,
	
				// Текстура.
				this.frame.x,
				this.frame.y,
				this.frame.width,
				this.frame.height,
	
				// Где именно нужно отрисовать текстуру.
				this.x,
				this.y,
				this.width,
				this.height
			)
		}

		super.draw(context)
	}
}