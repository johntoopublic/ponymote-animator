/* Set up elements. */
var icons = document.getElementById('icons');
var play = document.getElementById('play');
var stage = document.getElementById('stage');
var ctx = stage.getContext('2d');
var stageWidth = document.getElementById('width');
var stageHeight = document.getElementById('height');
stageWidth.oninput = stageHeight.oninput = function() {
	stage.width = stageWidth.valueAsNumber;	
	stage.height = stageHeight.valueAsNumber;	
}
var search = document.getElementById('search');
play.focus();

/* Lookup for pony actors. */
var ponies = {};

/* Cache of loaded ponymotes. */
var cache = {};

/* Main pony actor class. */
var Pony = function() {
	this.updates = {};
	this.time = 0;
	this.update();
}

/* Turn ponymote name into image. */
Pony.getImage = function(ponymote) {
	if (ponymote[0] != '/') ponymote = '/' + ponymote;
	if (PONIES[ponymote]) ponymote = PONIES[ponymote];
	return 'all-emotes/' + (ponymote.length == 4 ?  ponymote[1] : ponymote[2]) +
		'-table' + ponymote + '.png';
};

/* Draw ponymote once set. */
Pony.prototype.draw = function() {
	if (this.ponymote) {
		var image = cache[this.ponymote];
		var x = this.x - image.width / 2;
		var y = stage.height - image.height - this.y;
		ctx.drawImage(image, x, y);
	}
	if (this.talk) {
		ctx.font = '11px sans-serif';
		ctx.textAlign = 'center';
		var width = ctx.measureText(this.talk).width;
		var x = this.talkx;
		var y = stage.height - 90 - this.talky;
		if (x + width / 2 > stage.width)
			x = stage.width - width / 2;
		if (x - width / 2 < 0)
			x = width / 2;
		ctx.fillText(this.talk, x, y);
	}
};

/* Queue updates for playback. */
Pony.prototype.queue = function(time, data) {
	if (!this.updates[time]) this.updates[time] = {};
	for (var k in data) {
		if (data[k] != null) this.updates[time][k] = data[k]
	}
};

/* Play back through queued updates. */
Pony.prototype.update = function(time) {
	if (!time) {
		this.ponymote = '';
		this.talk = '';
		this.talkx = 0;
		this.talky = 0;
		this.x = 0;
		this.y = 0;
		this.time = 0;
	}
	for (; this.time <= time; this.time++) {
		var update = this.updates[this.time];
		if (!update) continue;
		if (update.ponymote) this.ponymote = update.ponymote;
		if (update.talk != null) {
			this.talk = update.talk;
			this.talkx = this.x;
			this.talky = this.y;
		}
		if (update.x != null) this.x = update.x;
		if (update.y != null) this.y = update.y;
		if (update.dx) this.x += update.dx;
		if (update.dy) this.y += update.dy;
	}
};

/* Add a new pony. */
var separator = /[ ,]+/;
var addPony = function(element, command) {
	var params = command[3].split(separator);
	element.icon.firstElementChild.src = Pony.getImage(command[2]);
	if (!ponies[command[1]]) {
		ponies[command[1]] = new Pony();
	}
	if (!cache[command[2]]) {
		cache[command[2]] = new Image();
		cache[command[2]].src = Pony.getImage(command[2]);
	}
	var data = {ponymote: command[2]};
	var x = parseInt(params[0]);
	var y = parseInt(params[1]);
	if (!isNaN(x)) data.x = x;
	if (!isNaN(y)) data.y = y;
	var pony = ponies[command[1]];
	pony.queue(time, data);
};

/* Queue an action on a pony. */
var action = function(element, command) {
	var duration = 0;
	var dx, talk;
	var mod = command[1];
	var glyph = command[3];
	var extra = command[4];
	if (glyph[0] == '<' || glyph[0] == '>') {
		duration = parseInt(extra) || 10;
		dx = glyph[0] == '<' ? -glyph.length : glyph.length;
	}
	if (glyph == ':') {
		duration = extra.length;
		talk = extra;
	}
	command[2].split(separator).forEach(function(index) {
		var pony = ponies[index];
		if (talk != null) {
			pony.queue(time, {talk: talk});
			pony.queue(time + duration, {talk: ''});
		}
		var up = false;
		for (var i = 0; i < duration; i++) {
			var data = {dx: dx};
			if (mod != '=') data.dy = up ? -1 : 1;
			pony.queue(time + i, data);
			up = !up;
		}
		if (up) pony.queue(time + i, {dy: -2});
	});
	if (mod != '+') time += duration;
};

/* Process the play. */
var process = function(element) {
	if (element.children.length) {
		for (var i = 0; i < element.children.length; i++) {
			process(element.children[i]);
		}
		return;
	}
	var init = /^(\w+) ?\(([a-z]+) ?(-?[0-9, ]*)\)$/;
	var verb = /^([+=]?)([\w,]+) ?([<:>]+) ?(.*)$/;
	var wait = /^(\.+)$/;
	var command;
	if (!element.icon) {
		element.icon = document.createElement('span');
		element.icon.textContent = ' ';
		element.icon.appendChild(document.createElement('img'));
	}
	if (!element.icon.parentNode) {
		icons.appendChild(element.icon);
	}
	element.icon.style.top = element.offsetTop;
	element.icon.firstChild.textContent = ' ';
	try {
		if (command = init.exec(element.textContent)) {
			addPony(element, command);
		} else if (command = verb.exec(element.textContent)) {
			action(element, command);
		} else if (command = wait.exec(element.textContent)) {
			time += command[1].length;
		} else if (element.icon) {
			element.icon.parentNode.removeChild(element.icon);
			element.icon = null;
		}
	} catch (e) {
		console.log(e);
		element.icon.firstChild.textContent = '=>';
	}
};

/* Run through the animation on repeat. */
var index = 0; // Current rendered frame.
setInterval(function() {
	ctx.clearRect(0, 0, stage.width, stage.height);
	var sorted = Object.keys(ponies);
	sorted.forEach(function(pony) {
		ponies[pony].update(index);
	});
	sorted.sort(function(a, b) {
		return ponies[b].y - ponies[a].y;
	});
	sorted.forEach(function(pony) {
		ponies[pony].draw();
	});
	if (index++ > time) index = 0;
}, 60);

/* Auto update on edit. */
var time = 0; // Current processed, generally set to max frame.
(play.oninput = function(e) {
	while(icons.firstChild) icons.removeChild(icons.firstChild);
	time = 0;
	ponies = {};
	process(play);
})();

/* Populate image results. */
search.oninput = function() {
	var results = document.getElementById('results');
	var keys = Object.keys(PONIES);
	keys.sort();
	while(results.firstChild) results.removeChild(results.firstChild);
	keys.forEach(function(pony) {
		if (pony.indexOf(search.value) > 0) {
			if (!cache[pony]) {
				cache[pony] = new Image();
				cache[pony].src = Pony.getImage(pony);
			}
			image = cache[pony];
			image.src = Pony.getImage(pony);
			image.title = pony;
			image.onerror = function() {image.style.display = 'none';}
			results.appendChild(cache[pony]);
		}
	});
};
