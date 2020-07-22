import Sprite from "./Sprite.js";

// Анимированный спрайт (обновляет фреймы сам).
export default class Cinematic extends Sprite {
	constructor (props = {}) {
		super(props)

		// Вся анимация.
		this.animations = props.animations ?? {}
		// Текущая анимация.
		this.animation = null
		// Сколько мс должно проходить между обновлениями фреймов.
		this.cooldown = 0
		// Сколько времени прошло с момента смены фрейма.
		this.timer = 0
		// Какой фрейм отрисовывается сейчас.
		this.frameNumber = 0

		// Функция, которая должна выполниться в конце очереди анимаций.
		this.onEnd = null
	}

	// Запуск выбранной анимации.
	start (name, param = {}) {
		const animation = this.animations.find(x => x.name === name)

		// Если есть нужная анимация и она отличается от предыдущей:
		if (animation && this.animation !== animation) {
			this.animation = animation
			this.cooldown = this.animation.duration / this.animation.frames.length
			this.timer = 0
			this.frameNumber = 0
			this.frame = this.animation.frames[0]
		}

		if (param.onEnd) {
			this.onEnd = param.onEnd
		}
	}

	// Метод останавливает анимацию.
	stop () {
		this.animation = null
		this.cooldown = 0
		this.timer = 0
		this.frameNumber = 0
		this.frame = null
	}

	// Метод следит, чтобы изображение обновлялось в нужный момент.
	update (delta) {
		super.update(delta)

		// Анимация должна выполняться, только если она задана.
		if (this.animation) {
			this.timer += delta
	
			// Если пришло время обновления фрейма:
			if (this.timer >= this.cooldown) {
				this.frameNumber = (this.frameNumber + 1) % this.animation.frames.length
				this.frame = this.animation.frames[this.frameNumber]
				this.timer = 0
	
				if (this.frameNumber === 0 && this.onEnd) {
					this.onEnd()
				}
			}
		}
	}
}