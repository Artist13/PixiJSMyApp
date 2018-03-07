const log = console.log;
var app;
var firstBT, secondBT;
var scale;
var buttons = new Array();
var numberTex;
var numbers = new Array();
var Shaking;

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
        this.on('pointerdown', this.Click);
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
    Click(event){
        Shaking.Stop();
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
    //Shaking.Start();
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
            this.anchor.set(0.5);
            this.scale.set(1.5);
        }
    }
}

FindPair()
    {
        var tempArr = buttons.filter(x => x.value == firstOfPair.value && x != firstOfPair);
        var index = Math.round(Math.random() * (tempArr.length - 1));
        secondOfPair = tempArr[index];    
    }

var angle = 0;
var rotateDirect = 1;
var maxAngle = 5;
var elapsedTicks = 0;
var delay = 120;
class AnimationRotation{ 
    constructor(){
        this.rot = {
            "angle": 0,
            "rotationDirect": 1,
            "maxAngle": 5
        };
        this.wait = {
            "elapsedTicks": 0,
            "delay": 120
        };
        log("create elapse");
        this.delay = 120;
        this.firstOfPair = null;
        this.secondOfPair = null;
        this.timer = new PIXI.ticker.Ticker();
        this.rotator = new PIXI.ticker.Ticker();
        this.timer.add(this.Tick);
        this.rotator.add(this.Rotate);
        //this.timer.stop();
        this.rotator.stop();
    }
    Rotate(){
        angle += rotationDirect * (maxAngle * Math.PI / (180 * 15));//Регулировка скорости поворота. Частота кадров 60
        this.firstOfPair.rotation = angle;
        this.secondOfPair.rotation = angle;
        if(angle > maxAngle * (Math.PI / 180))
        {
            rotateDirect = -1;
            angle = maxAngle * (Math.PI / 180);
            this.firstOfPair.rotation = angle;
            this.secondOfPair.rotation = angle; 
        }
        if(angle < 0)
        {
            angle = 0;
            rotateDirect = 1;
            firstOfPair.rotation = 0;
            secondOfPair.rotation = 0;
            this.rotator.stop();
            firstOfPair = null;
            secondOfPair = null;
            this.timer.start();
        }
    }
    Tick(){
        elapsedTicks++;
        if(elapsedTicks > delay){
            this.firstOfPair = null;
            this.secondOfPair = null;
            while(this.secondOfPair == null)
            {
                var index = Math.round(Math.random() * 15);
                this.firstOfPair = buttons[index];
                FindPair();
            }
            this.timer.stop();
            this.rotator.start();
            elapsedTicks = 0;
        }
    }
    Start(){
        this.timer.start();
    }
    Stop(){
        this.timer.stop();
    }
};


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
    Shaking = new AnimationRotation();
    //Shaking.Start();
}