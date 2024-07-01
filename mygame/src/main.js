import kaboom from "kaboom"
kaboom();

// записываем необходимые константы в верхнем регистре, тк значения известны до запуска приложения и не изменяются

const GRAVITY = 3200;
const WIDTH = width();
const HEIGHT = height();

const BACKGROUND_COLOR = Color.fromHex('#b6e5ea'); //так мы задаем цвет неба 
const PIPE_COLOR = Color.fromHex('#74c02e'); //цвет трубы
const TEXT_COLOR = Color.fromHex('#000000')

const PIPE_WIDTH = 64; //ширина столба 
const PIPE_BORDER = 2; //бордер столба
const PIPE_OPEN = 280; //высота промежутка черех которые мы будем пролетать 
const PIPE_MIN_HEIGHT = 60; //минимальная высота трубы 

const JUMP_FORCE = 800; //сила прыжка
const SPEED = 320; //скорость
const CEILING = -60; //координата пола  

// загрузим ресурсы для игры 

loadSprite("bird", "/sprites/bird.png") //сюда загружаем картинку птицы 
// звуки
loadSound("score", "/sounds/sfx_point.wav") //звук при пролете трубы
loadSound("jump", "/sounds/sfx_swooshing.wav") //звук прыжка
loadSound("hit", "/sounds/sfx_hit.wav") //касание трубы (проигрыш)

//задаем параметры
setGravity(GRAVITY)
setBackground(BACKGROUND_COLOR)

//функция начала игры

const startGame = () => {
	go("game")
}

//создаем 2 сцены 

//сцена игры
scene("game", () => {
	let score = 0; //переменная со счетом

	const game = add([timer()]) //добавляем компоненты игры [timer()] - нужно потому что мы будем спамить трубы

	//создадим птицу
	const createBird = () => {
		const bird = game.add([
			sprite("bird"),
			pos(WIDTH / 4, 0),//позиция птица при начале игры 
			area(),//нужен чтобы у нас правильно работали компонент столкновения с трубами 
			body(),//привяжем элемент к гравитации
		])
		return bird
	}

	const bird = createBird()

	//функиця прыжка
	const jump = () => {
		bird.jump(JUMP_FORCE)
		//звук прыжка
		play("jump")
	}

	//задаем прыжок на кнопки 
	onClick(jump)
	onKeyPress("space",jump)

	//функция для созданяи труб 
	const createPipes = () => {
		//задаем рандомную высоту трубы
		const topPipeHeight = rand(PIPE_MIN_HEIGHT, HEIGHT - PIPE_MIN_HEIGHT - PIPE_OPEN)
		const bottomPipeHeight = HEIGHT - topPipeHeight - PIPE_OPEN

		game.add([
			//задаем фигуру для трубы и указываем на его размеры 
			rect(PIPE_WIDTH,topPipeHeight),
			//позиция
			pos(WIDTH,0),
			//цвет
			color(PIPE_COLOR),
			//бордер 
			outline(PIPE_BORDER),
			//столконовение с трубами
			area(),
			//для движения, чтобы столбы двигались 
			move(LEFT,SPEED),
			//нужно чтобы, когда трубы вышли за экран, они удалялись из памяти
			offscreen({destroy: true}),
			"pipe",
		])
		game.add([
			//задаем фигуру для трубы и указываем на его размеры 
			rect(PIPE_WIDTH,bottomPipeHeight),
			//позиция
			pos(WIDTH,topPipeHeight + PIPE_OPEN),
			//цвет
			color(PIPE_COLOR),
			//бордер 
			outline(PIPE_BORDER),
			//столконовение с трубами
			area(),
			//для движения, чтобы столбы двигались 
			move(LEFT,SPEED),
			//нужно чтобы, когда трубы вышли за экран, они удалялись из памяти
			offscreen({destroy: true}),
			"pipe",
			{ passed: false }
		])
	}

	game.loop(1, createPipes)

	bird.onUpdate(() => {
		const birdPosY = bird.pos.y
		if(birdPosY > HEIGHT || birdPosY <= CEILING){
			go("lose")
		}
	})
	bird.onCollide(() => {
		//звук проигрыша
		play("hit")
		go("lose", score)
	})

	const createScoreLabel = () => {
		const scoreLabel = game.add([
			text(score),
			anchor('center'),
			pos(WIDTH / 2, 80),
			//размер шрифта
			scale(2),
			fixed(),
			z(100),
		])
		return scoreLabel
	}


	const scoreLabel = createScoreLabel()

	const addScore = () => {
		score++
		scoreLabel.text = score
		play("score")
	}

	onUpdate("pipe", pipe => {
		if(bird.pos.x > pipe.pos.x + pipe.width && pipe.passed === false){
			addScore()
			pipe.passed = true
		}
	})
})  

//сцена проигрыша
scene("lose", (score = 0) => {
	add([
		text("Набрано очков: "+ score),
		color(TEXT_COLOR),
		pos(center()),
		scale(2),
		anchor("center"),
	])
	onKeyPress("space", startGame)
	onClick(startGame)
})

startGame()