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

	// Game Reset (R Key)

	if(r)
	{
		lineCast = false;

		hook.x = player.x;
		hook.y = player.y;

		hook.vx = 0;
		hook.vy = 0;

		castPower = 0;

		for(let i = 0; i < fish.length; i++)
		{
			fish[i].caught = false;
			fish[i].y = canvas.height - 80;
		}
	}

	// Cast Power

	if(w && !lineCast)
	{
		castPower += .4;

		if(castPower > 20)
		{
			castPower = 20;
		}
	}

	// Cast the line!
	if(!w && castPower > 0 && !lineCast)
	{
		hook.x = player.x;
		hook.y = player.y;

		hook.vx = castPower * .6;
		hook.vy = -castPower * .9;

		lineCast = true;
		castPower = 0;
	}

	// Hook Physics

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
			hook.vx *= .90;
			hook.vy *= .90;
		}
	}
	else
	{
		hook.x = player.x;
		hook.y = player.y;
	}

	// Fish Movement + Catch

	for(let i = 0; i < fish.length; i++)
	{
		if(!fish[i].caught)
		{
			fish[i].x += Math.sin(Date.now()/500 + i) * .5;
		}

		if(lineCast && !fish[i].caught && hook.hitTestObject(fish[i]))
		{
			fish[i].caught = true;
		}

		if(fish[i].caught)
		{
			fish[i].x = hook.x;
			fish[i].y = hook.y - 20;
		}
	}

	// Reel in (S Key Fixed (hopefully))

	if(s && lineCast)
	{
		var dx = player.x - hook.x;
		var dy = player.y - hook.y;

		var distance = Math.sqrt(dx * dx + dy * dy);

		if(distance > 0)
		{
			dx /= distance;
			dy /= distance;
		}

		var reelSpeed = 8;

		hook.x += dx * reelSpeed;
		hook.y += dy * reelSpeed;

		hook.vx = 0;
		hook.vy = 0;

		for(let i = 0; i < fish.length; i++)
		{
			if(fish[i].caught)
			{
				fish[i].x = hook.x;
				fish[i].y = hook.y - 20;
			}
		}

		if(distance < 15)
		{
			lineCast = false;

			hook.x = player.x;
			hook.y = player.y;

			hook.vx = 0;
			hook.vy = 0;

			for(let i = 0; i < fish.length; i++)
			{
				if(fish[i].caught)
				{
					fish[i].y = 10000;
				}
			}
		}
	}

	// Draw Water

	water.drawRect();

	// Draw Fish

	for(let i = 0; i < fish.length; i++)
	{
		if(fish[i].y < 9999)
		{
			fish[i].drawRect();
		}
	}

	// Fishing Line
	player.drawLine(hook);

	// Draw Objects
	player.drawRect();
	hook.drawCircle();

	// UI

	context.fillStyle = "black";
	context.font = "20px Arial";

	context.fillText("Hold W To Cast", 20, 30);
	context.fillText("Hold S To Reel In", 20, 60);
	context.fillText("Hold R To Reset", 20, 90);
	context.fillText("Power: " + Math.round(castPower), 20, 120);

	// Power Bar 
	var barX = 20;
	var barY = 140;
	var barWidth = 220;
	var barHeight = 20;

	context.fillStyle = "#444444";
	context.fillRect(barX, barY, barWidth, barHeight);

	var fillWidth = (castPower / 20) * barWidth;

	context.fillStyle = "#ffff66";
	context.fillRect(barX, barY, fillWidth, barHeight);

	// Left red marker
	context.strokeStyle = "red";
	context.lineWidth = 3;

	context.beginPath();
	context.moveTo(barX + 30, barY);
	context.lineTo(barX + 30, barY + barHeight);
	context.stroke();

	// Middle green marker
	context.strokeStyle = "lime";

	context.beginPath();
	context.moveTo(barX + barWidth / 2, barY);
	context.lineTo(barX + barWidth / 2, barY + barHeight);
	context.stroke();

	// Right red marker
	context.strokeStyle = "red";

	context.beginPath();
	context.moveTo(barX + barWidth - 30, barY);
	context.lineTo(barX + barWidth - 30, barY + barHeight);
	context.stroke();
}