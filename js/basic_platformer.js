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

// New Variables
var bottomMode = false;
var underwaterSpeed = 5;

var tension = 0;
var maxTension = 100;

var fightingFish = null;

var score = 0;

canvas = document.getElementById("canvas");
context = canvas.getContext("2d");

// Fishing rod position
player = new GameObject({
	x: canvas.width / 2,
	y: 80,
	width: 40,
	height: 40,
	color: "#663300"
});

// Hook
hook = new GameObject({
	x: player.x,
	y: player.y,
	width: 12,
	height: 12,
	color: "#ff0000"
});

// Water
water = new GameObject({
	x: canvas.width / 2,
	y: canvas.height - 80,
	width: canvas.width,
	height: 160,
	color: "#3399ff"
});

// Fish
fish0 = new GameObject({
	x: 250,
	y: canvas.height - 70,
	width: 30,
	height: 20,
	color: "#ffff00"
});

fish1 = new GameObject({
	x: 450,
	y: canvas.height - 90,
	width: 30,
	height: 20,
	color: "#ff9933"
});

fish2 = new GameObject({
	x: 650,
	y: canvas.height - 60,
	width: 30,
	height: 20,
	color: "#ff66cc"
});

// Fish Strengths
fish0.strength = 1;
fish1.strength = 2;
fish2.strength = 3;

// Fish fight direction
fish0.direction = 1;
fish1.direction = 1;
fish2.direction = 1;

fish = [fish0, fish1, fish2];

interval = 1000 / 60;
timer = setInterval(animate, interval);

function animate()
{
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Sky
	context.fillStyle = "#99ddff";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Game Reset
	if(r)
	{
		lineCast = false;
		bottomMode = false;

		hook.x = player.x;
		hook.y = player.y;

		hook.vx = 0;
		hook.vy = 0;

		castPower = 0;

		tension = 0;
		fightingFish = null;

		score = 0;

		for(let i = 0; i < fish.length; i++)
		{
			fish[i].caught = false;

			if(i == 0)
			{
				fish[i].x = 250;
				fish[i].y = canvas.height - 70;
			}
			else if(i == 1)
			{
				fish[i].x = 450;
				fish[i].y = canvas.height - 90;
			}
			else
			{
				fish[i].x = 650;
				fish[i].y = canvas.height - 60;
			}
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

	// Cast Line
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

		if(hook.hitTestObject(water))
		{
			hook.vx *= .90;
			hook.vy *= .90;
		}

		if(hook.x < 0)
		{
			hook.x = 0;
			hook.vx = 0;
		}

		if(hook.x > canvas.width)
		{
			hook.x = canvas.width;
			hook.vx = 0;
		}

		if(hook.y < 0)
		{
			hook.y = 0;
			hook.vy = 0;
		}

		if(hook.y > canvas.height - hook.height)
		{
			hook.y = canvas.height - hook.height;
			hook.vy = 0;
			bottomMode = true;
		}

		if(bottomMode)
		{
			if(a) hook.x -= underwaterSpeed;
			if(d) hook.x += underwaterSpeed;
		}
	}
	else
	{
		hook.x = player.x;
		hook.y = player.y;
	}

	// Fish Movement + Catching
	for(let i = 0; i < fish.length; i++)
	{
		// Makes it so fish do not float or wander outside or above the water
		if(!fish[i].caught)
		{
			fish[i].x += Math.sin(Date.now() / 500 + i) * fish[i].strength;
			fish[i].y += Math.cos(Date.now() / 700 + i) * .3;

			var waterTop = water.y - water.height / 2;
			var waterBottom = water.y + water.height / 2;

			if(fish[i].y < waterTop + fish[i].height / 2)
			{
				fish[i].y = waterTop + fish[i].height / 2;
			}

			if(fish[i].y > waterBottom - fish[i].height / 2)
			{
				fish[i].y = waterBottom - fish[i].height / 2;
			}

			if(fish[i].x < fish[i].width / 2)
			{
				fish[i].x = fish[i].width / 2;
			}

			if(fish[i].x > canvas.width - fish[i].width / 2)
			{
				fish[i].x = canvas.width - fish[i].width / 2;
			}
		}

		if(lineCast &&
		   !fish[i].caught &&
		   hook.hitTestObject(fish[i]))
		{
			fish[i].caught = true;
			fightingFish = fish[i];
			tension = 20;
		}

		if(fish[i].caught)
		{
			fish[i].x = hook.x;
			fish[i].y = hook.y - 20;
		}
	}

	// Fish stop fighting when above water
	if(fightingFish != null && lineCast)
	{
		var waterTop = water.y - water.height / 2;
		var fishAboveWater = fightingFish.y < waterTop;

		if(!fishAboveWater)
		{
			if(Math.random() < 0.03)
			{
				fightingFish.direction =
					Math.random() < .5 ? -1 : 1;
			}

			hook.x += fightingFish.direction * fightingFish.strength * 2;

			tension += fightingFish.strength * .3;

			if(a)
			{
				hook.x -= 4;
				tension -= 1;
			}

			if(d)
			{
				hook.x += 4;
				tension -= 1;
			}
		}
		else
		{
			// Fish is above water → stops resisting
			tension -= 2;
			if(tension < 0) tension = 0;
		}

		if(tension < 0)
		{
			tension = 0;
		}

		if(tension >= maxTension)
		{
			alert("The fish got away!");

			fightingFish.caught = false;
			fightingFish = null;
			tension = 0;

			lineCast = false;
			bottomMode = false;

			hook.x = player.x;
			hook.y = player.y;

			hook.vx = 0;
			hook.vy = 0;
		}
	}

	// Reel in
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
			bottomMode = false;

			hook.x = player.x;
			hook.y = player.y;

			hook.vx = 0;
			hook.vy = 0;

			for(let i = 0; i < fish.length; i++)
			{
				if(fish[i].caught)
				{
					score += fish[i].strength * 10;
					fish[i].y = 10000;
				}
			}

			fightingFish = null;
			tension = 0;
		}
	}

	// Draw water
	water.drawRect();

	for(let i = 0; i < fish.length; i++)
	{
		if(fish[i].y < 9999)
		{
			fish[i].drawRect();
		}
	}

	player.drawLine(hook);
	player.drawRect();
	hook.drawCircle();

	// UI (unchanged)
	context.fillStyle = "black";
	context.font = "20px Arial";

	context.fillText("Hold W To Cast", 20, 30);
	context.fillText("Hold S To Reel In", 20, 60);
	context.fillText("A/D To Fight Fish", 20, 90);
	context.fillText("Hold R To Reset", 20, 120);
	context.fillText("Power: " + Math.round(castPower), 20, 150);
	context.fillText("Score: " + score, 20, 180);

	var barX = 20;
	var barY = 200;
	var barWidth = 220;
	var barHeight = 20;

	context.fillStyle = "#444444";
	context.fillRect(barX, barY, barWidth, barHeight);

	var fillWidth = (castPower / 20) * barWidth;

	context.fillStyle = "#ffff66";
	context.fillRect(barX, barY, fillWidth, barHeight);

	context.strokeStyle = "red";
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(barX + 30, barY);
	context.lineTo(barX + 30, barY + barHeight);
	context.stroke();

	context.strokeStyle = "lime";
	context.beginPath();
	context.moveTo(barX + barWidth / 2, barY);
	context.lineTo(barX + barWidth / 2, barY + barHeight);
	context.stroke();

	context.strokeStyle = "red";
	context.beginPath();
	context.moveTo(barX + barWidth - 30, barY);
	context.lineTo(barX + barWidth - 30, barY + barHeight);
	context.stroke();

	context.fillStyle = "black";
	context.fillText("Line Tension", 20, 250);

	context.fillStyle = "#444";
	context.fillRect(20, 260, 220, 20);

	var tensionWidth = (tension / maxTension) * 220;

	if(tension < 40) context.fillStyle = "lime";
	else if(tension < 75) context.fillStyle = "yellow";
	else context.fillStyle = "red";

	context.fillRect(20, 260, tensionWidth, 20);
}