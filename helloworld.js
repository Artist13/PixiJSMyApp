var app;
var buttons = new Array();


function addButton(){
    var button = new PIXI.Sprite.fromImage('chip.png');
    button.interactive = true;
    button.buttonMode = true;
    button.anchor.set(0.5);
    return button;
};

function init()
{
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