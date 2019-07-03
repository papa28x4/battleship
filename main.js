let view = {
	displayMessage: function(msg){
		let messageArea = $('#messageArea');
		messageArea.html(msg);
	},
	displayHit: function(location){
		playHitAudio();
		let cell = $('#' + location);
		cell.addClass('hit');
		this.displayMessage("HIT!");
	},
	displayMiss: function(location){
		playMissAudio();
		let cell = $('#' + location);
		cell.addClass('miss');
		this.displayMessage("You missed.");
	}
}

//view.displayMessage('what');
//view.displayHit('14');
//view.displayMiss('23');



let model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,

	// ships: [{locations: ["06","16","26"], hits:["","",""]},
	// 		{locations: ["24","34","44"], hits:["","",""]},
	// 		{locations: ["10","11","12"], hits:["","",""]}
	// 	],
	
	ships: [ { locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] } ],
	
	fire: function(guess){
		for(let i=0; i<this.numShips; i++){
			let ship = this.ships[i];
			let index = ship.locations.indexOf(guess);
			if(index >= 0){
				ship.hits[index] = "hit";
				view.displayHit(guess);
				if(this.isSunk(ship)){
					view.displayMessage("You sank a battleship!");
					this.shipsSunk++;
				}
				return true;
			}
			
		}
		view.displayMiss(guess);
		return false
	},

	isSunk: function(ship){
		for(let i=0; i<this.shipLength; i++){
			if(ship.hits[i] !== "hit"){
				return false
			}
		}
		return true;
	},

	generateShipLocations: function(){
		let locations;
		for(let i = 0; i<this.numShips; i++){
			do{
				locations = this.generateShip();
			}while (this.collision(locations));
			this.ships[i].locations = locations;
		}
	},

	generateShip: function(){
		let direction = Math.floor(Math.random()*2);
		let row, col;
		if(direction === 1){
		//Generate a starting location for a horizontal ship
		row = Math.floor(Math.random() * this.boardSize);
		col= Math.floor(Math.random() * (this.boardSize - this.shipLength));
	} else{
		//Generate a starting location for a vertical ship
		row = Math.floor(Math.random()*(this.boardSize - this.shipLength));
		col = Math.floor(Math.random() * this.boardSize);
	}

	let newShipLocations = [];
	for(let i =0; i < this.shipLength; i++){
		if (direction === 1){
			newShipLocations.push(row + "" + (col + i));
			
		}else{
			newShipLocations.push((row + i) + "" + col);
			
		}
		
		}
		return newShipLocations;
	},

	collision: function(locations) {
		for (let i = 0; i < this.numShips; i++) {
			let ship = model.ships[i];
			for (let j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
				return true;
				}
			}
		}
			return false;
	}

}


let controller = {
	guesses: 0,

	processGuess: function(guess){
		let location = parseGuess(guess);
		if (location){
			this.guesses++;
			let hit = model.fire(location);
			if(hit && model.shipsSunk === model.numShips){
				playWinningAudio()
				view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");
				gameLock();
			}
		}
	}
}

function parseGuess(guess){
	let alphabet = ["A", "B", "C", "D", "E", "F", "G"];
	
	if(guess === null || guess.length !== 2){
		alert("Oops, please enter a letter and a number on the board.");
	}else{
		let firstChar = guess.charAt(0).toUpperCase();
		
		let row = alphabet.indexOf(firstChar);
		let column = guess.charAt(1);
		
		if(isNaN(row) || isNaN(column)){
			alert("Oops, that isn't on the board.");
		} else if(row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize){
			alert("Oops, that's off the board!");
		} else{
			return row + column;
		}
	}
	return null;
}

function init(){
	let fireButton = $("#fireButton");
	fireButton.on('click', handleFireButton);
	let guessInput = $("#guessInput")
	guessInput.on('keypress', handleKeyPress)
	activateClick();
	model.generateShipLocations();
}

function handleKeyPress(e){
	let fireButton = $("#fireButton");
	if(e.keyCode === 13){
		handleFireButton()
		return false;
	}
}

function handleFireButton(b){
	let guessInput = $("#guessInput");
	let guess = guessInput.val() || b;
	
	controller.processGuess(guess);
	guessInput.val('');
}

function activateClick(){
	let table = $('#gameBoard');
	table.on('click', 'td', function(){
	   let b = this.dataset.cell
	   handleFireButton(b)
	}) 
}

let audio = document.createElement('audio');
let winAudio = document.createElement('audio');

function playHitAudio(){
	audio.src = "explosion.mp3"
	audio.play();
}

function playMissAudio(){
	audio.src = "Error-sound.mp3"
	audio.play();
}

function playWinningAudio(){
	winAudio.src = "you-win.mp3"
	winAudio.play();
}

function gameLock(){
	let table = $('#gameBoard');
	let fireButton = $("#fireButton");
	let guessInput = $("#guessInput");
	fireButton.off()
	table.off()
	guessInput.off()
}

window.onload = init;

