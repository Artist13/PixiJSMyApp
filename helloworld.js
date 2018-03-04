const log = console.log;
var app;
var firstBT, secondBT;
var firstBG, secondBG;
var scale;
var timer;
var buttons = new Array();
var numberTex;
var numbers = new Array();

//Для запроса новых значений с сервера необходимо запустить test.js в папке express


var firstOfPair, secondOfPair;

var test_button;
//Поиск парного значения для функции подрагивания
function FindPair()
{
    var k = 0;
    while((secondOfPair == null) && (k < 16)){
        var trySecond = Math.round(Math.random() * 15);
        if((buttons[trySecond].value == firstOfPair.value) && (buttons[trySecond] != firstOfPair))
        {
            secondOfPair = buttons[trySecond];
        }
        k++;
    }
    log(k);
};



//Подрагивание элементов
//в каждый тик происходит поворот на часть необходимого угла
//при достижении необходимого угла множитель задающий направление приравнивается к -1
const shake = new PIXI.ticker.Ticker();
var angle = 0;
var rotateDirect = 1;
const maxAngle = 10;//Угол на который поворачиваются фишки P.S. 1 градус незаметен для глаза
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
            firstOfPair = buttons[Math.round(Math.random() * 15)]
            FindPair(firstOfPair);
            log(firstOfPair);
            log
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
    xhr.open('GET', 'http://localhost:3030/', false);//Запрос новых значений для элементов
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
                number.x = -25;
                number.y = 0;
                ten.addChild(number);
                number = new PIXI.Sprite(numbers[0]);
                number.anchor.set(0.5);
                number.scale.set(1.2);
                number.x = 15;
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