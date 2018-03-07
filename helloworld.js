const log = console.log;
var app;
var firstBT, secondBT;
var scale;
var timer;
var buttons = new Array();
var numberTex;
var numbers = new Array();

//Для запроса новых значений с сервера необходимо запустить test.js в папке express

class Button extends PIXI.Sprite{
    constructor(){
        super();
        this.texture = PIXI.Texture.fromImage('chip.png');
        this.interactive = true;
        this.buttonMode = true;
        this.value = Math.round(Math.random() * 9) + 1;
        this.anchor.set(0.5);
        this.addNumber();                    
        this.on('pointerdown', onClick);
    }
    addNumber(){
        this.num = new Numer(this.value);
        this.addChild(this.num);
    }
    removeNumber(){
        this.removeChild(this.num);
    }
    setBG(image){
        this.BG = new PIXI.Sprite.fromImage(image);
        this.BG.anchor.set(0.5);
        this.addChild(this.BG);
    }
    removeBG(){
        this.removeChild(this.BG);
        this.BG = null;
    }
    getNewValue(newVal){
        this.removeNumber();
        this.value = newVal;
        this.addNumber();
    }
}

function newValueForBT(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3030/', false);//Запрос новых значений для элементов
    xhr.send();
    var num = JSON.parse(xhr.responseText);
    firstBT.getNewValue(num['first']);
    secondBT.getNewValue(num['second']);
}

class Numer extends PIXI.Sprite{
    constructor(value){
        if(value == 10)
        {
            super();
            var number = new PIXI.Sprite(numbers[1]);
            number.scale.set(1.5);
            number.anchor.set(0.5);
            number.x = -35;
            number.y = 0;
            this.addChild(number);
            number = new PIXI.Sprite(numbers[0]);
            number.anchor.set(0.5);
            number.scale.set(1.5);
            number.x = 25;
            number.y = 0;
            this.addChild(number);
            this.anchor.set(0.5);
        }
        else
        {
            super(numbers[value]);
            //var number = new PIXI.Sprite(numbers[button.value]);
            this.anchor.set(0.5);
            this.scale.set(1.5);
        }
    }
}

var firstOfPair, secondOfPair;

//Поиск парного значения для функции подрагивания
function FindPair()
{
    var tempArr = buttons.filter(x => x.value == firstOfPair.value && x != firstOfPair);
    var index = Math.round(Math.random() * (tempArr.length - 1));
    secondOfPair = tempArr[index];    
};




//Подрагивание элементов
//в каждый тик происходит поворот на часть необходимого угла
//при достижении необходимого угла множитель задающий направление приравнивается к -1
const shake = new PIXI.ticker.Ticker();
var angle = 0;
var rotateDirect = 1;
const maxAngle = 1;//Угол на который поворачиваются фишки P.S. 1 градус незаметен для глаза
shake.stop();
shake.add(() =>{
    angle += rotateDirect * (maxAngle * Math.PI / (180 * 15));//Регулировка скорости поворота. Частота кадров 60
    firstOfPair.rotation = angle;
    secondOfPair.rotation = angle;
    if(angle > maxAngle * (Math.PI / 180))
    {
        rotateDirect = -1;
        angle = maxAngle * (Math.PI / 180);
        firstOfPair.rotation = angle;
        secondOfPair.rotation = angle; 
    }
    if(angle < 0)
    {
        angle = 0;
        rotateDirect = 1;
        firstOfPair.rotation = 0;
        secondOfPair.rotation = 0;
        shake.stop();
        firstOfPair = null;
        secondOfPair = null;
        shakingTicker.start();
    }
});

//Подрагивание фишек при ожидании
//каждые delay тиков выбирает две фишки и вызывает их подергивание
var elapsedTime = 0;
var delay = 120;
const shakingTicker = new PIXI.ticker.Ticker();
shakingTicker.stop();
shakingTicker.add(() =>{
    elapsedTime++;
    //log("elapse time: {0}",elapsedTime);
    if(elapsedTime > delay)
    {
        firstOfPair = null;
        secondOfPair = null;
        while(secondOfPair == null)
        {
            var index = Math.round(Math.random() * 15);
            firstOfPair = buttons[index];
            FindPair();
        }
        shakingTicker.stop();
        shake.start();
        elapsedTime = 0;
    }
});
//Инициализация звуков
var soundUp;
var soundDown;
function initMusic(){
    soundUp = PIXI.sound.Sound.from("./up.mp3");  
    soundDown = PIXI.sound.Sound.from("./down.mp3");  
};

//Ticker для анимации уменьшения и увелечения кнопок
//каждый тик уменьшает scale фишки
//при достижении scale 0 заменяет значения на фишках и начинает их уеличивать
var direct = -1;
const ticker = new PIXI.ticker.Ticker();
ticker.stop();
ticker.add(() =>{
    scale += direct * 0.0666;//скорость уменьшения/увеличения
    firstBT.scale.set(scale);
    secondBT.scale.set(scale);
    if(scale < 0)
    {
        scale = 0;
        ticker.stop();
        firstBT.scale.set(scale);
        secondBT.scale.set(scale);
        firstBT.removeBG();
        secondBT.removeBG();
        newValueForBT();
        direct = 1;
        ticker.start();
        soundUp.play();
    }
    if(scale > 1)
    {
        scale = 1;
        ticker.stop();
        firstBT.scale.set(scale);
        secondBT.scale.set(scale);
        firstBT = null;
        secondBT = null;
        direct = -1;
    }
});
//Обработка нажатия на кнопку
const onClick = event =>{
    shakingTicker.stop();
    if(firstBT == null)
    {
        firstBT = event.currentTarget;
        firstBT.setBG('glow.png');
    }
    else if(secondBT == null)
        {
            secondBT = event.currentTarget;
            if(secondBT == firstBT)
            {
                secondBT = null;
                return;
            }
            secondBT.setBG('glow.png');

            if(firstBT.value == secondBT.value)
            {
                scale = 1;
                ticker.start();
                soundDown.play();
            }
            else
            {
                firstBT.removeBG();
                secondBT.removeBG();
                firstBT = null;
                secondBT = null;
            }
        }
    elapsedTime = 0;
    shakingTicker.start();
}

//Создание текстур для цифр
function initNumbers(){
    numberTex = PIXI.Texture.fromImage("/BetFont/SafeDigits-ipadhd.png");
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(49,58,40,54)));//0 x="49" y="58" width="40" height="54"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(91,113,29,54)));//1 x="91" y="113" width="29" height="54"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(91,58,40,53)));//2  x="91" y="58" width="40" height="53"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(135,2,40,54)));//3  x="135" y="2" width="40" height="54"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(2,2,45,54)));//4   x="2" y="2" width="45" height="54"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(92,2,41,53)));//5  x="92" y="2" width="41" height="53"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(49,2,41,54)));//6  x="49" y="2" width="41" height="54"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(49,114,40,53)));//7  x="49" y="114" width="40" height="53"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(2,114,41,54)));//8  x="2" y="114" width="41" height="54"
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(2,58,41,54)));//9  x="2" y="58" width="41" height="54"
};
//Основна функция
function init()
{
    initMusic();
    initNumbers();
    app = new PIXI.Application(Window.innerWidth, 2000);
    app.renderer = PIXI.autoDetectRenderer(816, 816,{antialiasing: false, transparent: false, resolution: 1});
    document.body.appendChild(app.view);
    app.renderer.backgroundColor = 0xffffff;

    var bgtexture = PIXI.Texture.fromImage("game_area.png");
    bg = new PIXI.Sprite(bgtexture);
    bg.position.x = 0;
    bg.position.y = 0;
    app.stage.addChild(bg);

    for(var row = 0; row < 4; row++)
    {
        for(var col = 0; col < 4; col++)
        {
            var temp = new Button();
            temp.x = 102 + (204) * col;
            temp.y = 102 + (204) * row;
            buttons.push(temp);
            app.stage.addChild(buttons[row * 4 + col]);
        }
    }
    shakingTicker.start();
    test_button = buttons[0];
}