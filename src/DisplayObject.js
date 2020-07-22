// Всё, что может быть нарисовано (даже без отображения).
export default class DisplayObject {
	constructor (props = {}) {
		// Видимый ли элемент?
		this.visible = props.visible ?? true
		// Координаты элемента.
		this.x = props.x ?? 0
		this.y = props.y ?? 0
		// Размеры элемента.
		this.width = props.width ?? 0
		this.height = props.height ?? 0

		// Включен ли режим с отрисовкой размеров фреймов?
		this.debug = props.debug ?? false
	}

	update () {
		
	}

	// Метод отрисовывает элемент.
	draw (context) {
		// Если нужно отрисовать размеры фреймов:
		if (this.debug) {
			context.beginPath()
			context.rect(this.x, this.y, this.width, this.height)
			context.fillStyle = 'rgba(0, 255, 0, 0.3)'
			context.fill()

			context.beginPath()
			context.rect(this.x, this.y, this.width, this.height)
			context.lineWidth = 3
			context.strokeStyle = 'rgba(0, 255, 0, 1)'
			context.stroke()

			context.beginPath()
			context.moveTo(this.x, this.y)
			context.lineTo(this.x + this.width, this.y + this.height)
			context.stroke()
		}
	}
}