/* 
	Контейнер для нескольких DisplayObject'ов.
	Хранит в себе все элементы, которые нужно отрисовать на канвасе. 
*/
import DisplayObject from './DisplayObject.js'

export default class Group extends DisplayObject {
	constructor (props = {}) {
		super(props)

		this.container = new Set
		// Смещение группы элементов относительно верхнего левого угла.
		this.offsetX = 0
		this.offsetY = 0
	}

	// Геттер возвращает контейнер объектов в виде массива.
	get items () {
		return Array.from(this.container)
	}

	// Метод добавляет объекты типа DisplayObject.
	add (...dos) {
		for (const displayObject of dos) {
			this.container.add(displayObject)
		}
	}
	
	// Метод удаляет объекты типа DisplayObject.
	remove (...dos) {
		for (const displayObject of dos) {
			this.container.delete(displayObject)
		}
	}

	update (delta) {
		this.items.forEach(x => x.update(delta))
	}

	draw (context) {
		context.save()
		context.translate(this.offsetX, this.offsetY)
		this.items.forEach(x => x.draw(context))
		context.restore()
	}
}