//Declare my variables

var canvas;
var context;
var timer;
var interval;

var player;
var hook;

var water;

var fish0;
var fish1;
var fish2;
var fish;

var lineCast = false;
var castPower = 0;

var gravity = 0.8;

var fX = .98;
var fY = .99;

canvas = document.getElementById("canvas");
context = canvas.getContext("2d");

//Fishing rod position
player = new GameObject({
	x: canvas.width/2,
	y: 80,
	width: 40,
	height: 40,
	color: "#663300"
});

//Hook
hook = new GameObject({
	x: player.x,
	y: player.y,
	width: 12,
	height: 12,
	color: "#ff0000"
});

//Water
water = new GameObject({
	x: canvas.width/2,
	y: canvas.height - 80,
	width: canvas.width,
	height: 160,
	color: "#3399ff"
});

//Fish
fish0 = new GameObject({
	x: 250,
	y: canvas.height - 70,
	width: 30,
	height: 20,
	color:"#ffff00"
});

fish1 = new GameObject({
	x: 450,
	y: canvas.height - 90,
	width: 30,
	height: 20,
	color:"#ff9933"
});

fish2 = new GameObject({
	x: 650,
	y: canvas.height - 60,
	width: 30,
	height: 20,
	color:"#ff66cc"
});

fish = [fish0, fish1, fish2];

interval = 1000/60;
timer = setInterval(animate, interval);

function animate()
{
	context.clearRect(0,0,canvas.width, canvas.height);

	//Sky
	context.fillStyle = "#99ddff";
	context.fillRect(0,0,canvas.width, canvas.height);

	//Cast Power
	if(w && !lineCast)
	{
		castPower += .4;

		if(castPower > 20)
		{
			castPower = 20;
		}
	}

	//Release Cast
	if(!w && castPower > 0 && !lineCast)
	{
		hook.x = player.x;
		hook.y = player.y;

		hook.vx = castPower * .6;
		hook.vy = -castPower * .9;

		lineCast = true;
		castPower = 0;
	}

	//Hook Physics
	if(lineCast)
	{
		hook.vy += gravity;

		hook.vx *= fX;
		hook.vy *= fY;

		hook.x += Math.round(hook.vx);
		hook.y += Math.round(hook.vy);

		//Water Resistance
		if(hook.hitTestObject(water))
		{
			hook.vx *= .9;
			hook.vy *= .9;
		}
	}
	else
	{
		hook.x = player.x;
		hook.y = player.y;
	}

	//Fish Movement + Catching
	for(let i = 0; i < fish.length; i++)
	{
		fish[i].x += Math.sin(Date.now()/500 + i) * .5;

		if(lineCast && hook.hitTestObject(fish[i]))
		{
			fish[i].caught = true;
		}

		if(fish[i].caught)
		{
			fish[i].x = hook.x;
			fish[i].y = hook.y - 20;
		}
	}

	//Reel In
	if(s && lineCast)
	{
		hook.y -= 5;

		if(hook.y <= player.y + 20)
		{
			lineCast = false;
			hook.vx = 0;
			hook.vy = 0;
		}
	}

	//Reset Hook
	if(hook.y > canvas.height + 100)
	{
		lineCast = false;
		hook.vx = 0;
		hook.vy = 0;
	}

	//Draw Water
	water.drawRect();

	//Draw Fish
	for(let i = 0; i < fish.length; i++)
	{
		if(!fish[i].caught)
		{
			fish[i].drawRect();
		}
	}

	//Fishing Line
	player.drawLine(hook);

	//Draw Objects
	player.drawRect();
	hook.drawCircle();

	//UI
	context.fillStyle = "black";
	context.font = "20px Arial";
	context.fillText("Hold W To Cast", 20, 30);
	context.fillText("Press S To Reel In", 20, 60);
	context.fillText("Power: " + Math.round(castPower), 20, 90);
}