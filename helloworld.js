var app;
var buttons = new Array();
var numbers = new Array();
var firstBT, secondBT;

var direct = -1;
const ticker = new PIXI.ticker.Ticker();
ticker.stop();
ticker.add((delta) =>{
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
            direct = 1;
            ticker.start();
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

function addButton(){
    var button = new PIXI.Sprite.fromImage('chip.png');
    button.interactive = true;
    button.buttonMode = true;
    button.anchor.set(0.5);
	button.value = Math.round(Math.random() * 10);
	addNumber(button);                    
	button.on('pointerdown', onClick);
    return button;
};

function initNumbers(){
    var numberTex = PIXI.Texture.fromImage("/BetFont/SafeDigits-hd.png");
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(0,57,20,20)));//0
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(115,0,13,20)));//1
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(0,39,20,18)));//2
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(0,20,20,19)));//3
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(0,0,20,20)));//4
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(78,0,20,20)));//5
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(59,00,20,20)));//6
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(98,0,18,20)));//7
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(40,0,20,20)));//8
    numbers.push(new PIXI.Texture(numberTex, new PIXI.Rectangle(20,0,20,20)));//9
};

function init()
{
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
}