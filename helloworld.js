const log = console.log;
var app;
var firstBT, secondBT;
var firstBG, secondBG;
var scale;
var timer;
var buttons = new Array();
var numberTex;
var numbers = new Array();

var firstOfPair, secondOfPair;

var test_button;
//Поиск парного значения для функции подрагивания
function FindPair()
{
    for(var i = 0; i < 16; i++)
    {
        if(buttons[i].value == firstOfPair.value && i != firstOfPair)
        {
            secondOfPair = buttons[i];
        }
    }
};

const shake = new PIXI.ticker.Ticker();
var angle = 0;
var rotateDirect = 1;
shake.stop();
shake.add(() =>{
    angle += rotateDirect * (Math.PI / (180 * 60)); 
    firstOfPair.rotation = angle;
    secondOfPair.rotation = angle;
    if(angle > 2 * (Math.PI / 180))
    {
        log("angle: {0}",angle);
        rotateDirect = -1;
        angle = 2 * (Math.PI / 180);
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
var elapsedTime = 0;
const shakingTicker = new PIXI.ticker.Ticker();
shakingTicker.stop();
shakingTicker.add(() =>{
    elapsedTime++;
    //log("elapse time: {0}",elapsedTime);
    if(elapsedTime > 50)
    {
        firstOfPair = null;
        secondOfPair = null;
        while(secondOfPair == null)
        {
            firstOfPair = buttons[Math.round(Math.random() * 15)]
            FindPair(firstOfPair);
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

//Добавляет новые значения полученные с сервера
function newValueForBT(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/numbers.json', false);
    xhr.send();
    log(xhr.responseText);
    var num = JSON.parse(xhr.responseText);
    firstBT.children[0].destroy();
    secondBT.children[0].destroy();
    firstBT.value = num['first'];
    secondBT.value = num['second'];
    addNumber(firstBT);
    addNumber(secondBT);
}
//Ticker для анимации уменьшения и увелечения кнопок
var direct = -1;
const ticker = new PIXI.ticker.Ticker();
ticker.stop();
ticker.add(() =>{
    scale = scale + direct * 0.05;
    firstBT.scale.set(scale);
    secondBT.scale.set(scale);
    if(scale < 0)
    {
        scale = 0;
        ticker.stop();
        firstBT.scale.set(scale);
        secondBT.scale.set(scale);
        firstBT.removeChild(firstBG);
        secondBT.removeChild(secondBG);
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
    if(firstBT == null)
    {
        firstBT = event.currentTarget;
        var glowTexture = PIXI.Texture.fromImage('glow.png');
        firstBG = new PIXI.Sprite(glowTexture);
        firstBG.anchor.set(0.5);
        firstBT.addChild(firstBG);
    }
    else if(secondBT == null)
        {
            secondBT = event.currentTarget;
            if(secondBT == firstBT)
            {
                secondBT = null;
                return;
            }
            var glowTexture = PIXI.Texture.fromImage('glow.png');
            secondBG = new PIXI.Sprite(glowTexture);
            secondBG.anchor.set(0.5);
            secondBT.addChild(secondBG);

            if(firstBT.value == secondBT.value)
            {
                scale = 1;
                ticker.start();
                soundDown.play();
            }
            else
            {
                firstBT.removeChild(firstBG);
                secondBT.removeChild(secondBG);
                firstBT = null;
                secondBT = null;
            }
        }
}
//Добавление соответствующей цифры на кнопку
function addNumber(button){
    if(button.value == 10)
            {
                var ten = new PIXI.Sprite() ;
                var number = new PIXI.Sprite(numbers[1]);
                number.scale.set(1.2);
                number.anchor.set(0.5);
                number.x = -10;
                number.y = 3;
                ten.addChild(number);
                number = new PIXI.Sprite(numbers[0]);
                number.anchor.set(0.5);
                number.scale.set(1.2);
                number.x = 10;
                number.y = 0;
                ten.addChild(number);
                ten.anchor.set(0.5);
                button.addChild(ten);
            }
            else
            {
                var number = new PIXI.Sprite(numbers[button.value]);
                number.anchor.set(0.5);
                number.scale.set(1.2);
                button.addChild(number);
            }
};
//Добавление кнопки на игровое поле
function addButton(){
    var button = new PIXI.Sprite.fromImage('chip.png');
    button.interactive = true;
    button.buttonMode = true;
    button.value = Math.round(Math.random() * 9) + 1;
    button.anchor.set(0.5);
    addNumber(button);                    
    button.on('pointerdown', onClick);
    return button;
};
//Создание текстур для цифр
function initNumbers(){
    numberTex = PIXI.Texture.fromImage("/BetFont/SafeDigits-hd.png");
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(0,57,20,20)));//0
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(115,0,13,20)));//1
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(0,39,20,18)));//2
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(0,20,20,19)));//3
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(0,0,20,20)));//4
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(78,0,20,20)));//5
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(59,00,20,20)));//6
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(98,0,17,20)));//7
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(40,0,18,20)));//8
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(20,0,20,20)));//9
};
//Основна функция
function init()
{
    initMusic();
    initNumbers();
    app = new PIXI.Application(window.innerWidth, 2000);
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
            button = addButton();
            button.x = 102 + (204) * col;
            button.y = 102 + (204) * row;
            buttons.push(button);
            app.stage.addChild(buttons[row * 4 + col]);
        }
    }
    shakingTicker.start();
    test_button = buttons[0];
}