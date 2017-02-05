"use strict";

function vants(){

    var	canvas = document.getElementById('vants'),
      	ctx = canvas.getContext('2d'),
      	counter = 0;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    var width = Math.round(canvas.width/8),
      	height = Math.round(canvas.height/8);

    var directions = {
    	N: new Vector(0,-1),
    	E: new Vector(1,0),
    	S: new Vector(0,1),
    	W: new Vector(-1,0)
    };

    function randomDir(){
    	return Object.keys(directions)[Math.floor(Math.random()*4)];
    }

    // n = 1: go right, n = -1, go left
    function dirPlus(dir, n){
    	var index = Object.keys(directions).indexOf(dir);
    	return Object.keys(directions)[(index + n + 4) % 4];
    }

    function Grid(width, height, cells){
    	this.width = width;
    	this.height = height;
    	this.cells = cells || [];
    	this.cellWidth = canvas.width / this.width;
    	this.cellHeight = canvas.height / this.height;
    }

    Grid.prototype.makeCells = function(){

    		for (var j = 0; j < this.height; j++) {
    			for (var i = 0; i < this.width; i++) {
    			var newCell = new Cell(
    				i*this.cellWidth,
    				j*this.cellHeight,
    				1
    			);
    			this.cells.push(newCell);
    			drawRect(newCell.x, newCell.y, this.cellWidth, this.cellHeight,'black');
    		}
    	}
    };

    Grid.prototype.render = function(cells){
    	for(var i = 0; i < cells.length; i++){
    		var x = this.getValue(cells[i],'x');
    		var y = this.getValue(cells[i],'y');
    		var val = this.getValue(cells[i],'val');
    		if (val > 0){
    			drawRect(x, y, this.cellWidth-0.2, this.cellHeight-1,'black');
    		} else {
    			var r,g,b,randColor;
    			r = Math.floor(Math.random()*255);
    			g = Math.floor(Math.random()*255);
    			b = Math.floor(Math.random()*255);

    			var hslVar = (Math.sin(counter)+1)*50+260;
        		var color = 'hsl(' + counter + ', 80%,' + '50%)';
    			drawRect(x, y, this.cellWidth, this.cellHeight,color);
    		}
    	}
    };

    function drawRect(x, y, width, height, fill){
    	ctx.beginPath();
    	ctx.rect(x, y, width, height);
    	ctx.fillStyle = fill;
    	ctx.fill();
    	//ctx.lineWidth = 0.5;
    	//ctx.strokeStyle = '#888';
    	//ctx.stroke();
    }

    Grid.prototype.setValue = function(vector, property, value){
    	var index = vector.y * this.width + vector.x;
    	this.cells[index][property] = value;
    };

    Grid.prototype.getValue = function(vector, property){
    	var index = vector.y * this.width + vector.x;
    	return this.cells[index][property];
    };

    Grid.prototype.toggleVal = function(vector){
    	var index = vector.y * this.width + vector.x;
    	this.cells[index].val *= -1;
    };

    function World(grid, vants){
    	this.grid = grid;
    	this.vants = vants;
    }

    World.prototype.turn = function(){
    	var cellsToUpdate = [];
    	this.vants.forEach(function(vant){
    		var newPosition = vant.move(this);
    		this.grid.toggleVal(newPosition); // toggle the cell value
    		cellsToUpdate.push(newPosition);
    	}.bind(this));
    	this.grid.render(cellsToUpdate); // redraw cells that vants moved through
    };

    Vant.prototype.move = function(world){

    	var tempPos = this.position;

    	tempPos.add(directions[this.dir]);

    	// Vants wrap to other side
    	if (tempPos.x >= world.grid.width){
    		tempPos.x = 0;
    	} else if(tempPos.x < 0){
    		tempPos.x = world.grid.width-1;
    	}
    	if (tempPos.y >= world.grid.height){
    		tempPos.y = 0;
    	} else if(tempPos.y < 0){
    		tempPos.y = world.grid.height-1;
    	}

    	var newPosition = tempPos = this.position;
    	var newPositionVal = world.grid.getValue(newPosition, 'val'); // value of that cell

    	if (newPositionVal > 0) {
    		this.dir = dirPlus(this.dir,-1); // turn L if cell is black
    	} else {
    		this.dir = dirPlus(this.dir,1); // turn R if cell is white
    	}

    	return newPosition;
    };

    function Vant(dir, position){
    	this.dir = dir || null;
    	this.position = position || null;
    }

    function Cell(x, y, val){
    	this.x = x;
    	this.y = y;
    	this.val = val || 0;
    }

    function Vector(x, y) {
      	this.x = x || 0;
      	this.y = y || 0;
    }

    Vector.prototype.add = function(vector) {
      	this.x += vector.x;
      	this.y += vector.y;
    };

    canvas.addEventListener("mousedown", function(evt){
    	var mousePos = getMousePos(canvas, evt);

    	var x = Math.round(mousePos.x/world.grid.cellWidth);
    	var y = Math.round(mousePos.y/world.grid.cellHeight);

    	var cell = new Vector(x,y);

    	var vant1 = new Vant('E', cell);
    	var vant2 = new Vant('E', new Vector(x-1,y));
    	world.vants.push(vant1);
    	world.vants.push(vant2);

    }, false);

    function getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

    var grid = new Grid(width,height);
    var vants = [new Vant('E', new Vector(Math.round(width/2),Math.round(height/2))),new Vant('E', new Vector(Math.round(width/2)-1,Math.round(height/2)))];
    var world = new World(grid,vants);
    world.grid.makeCells();

    function loop() {
    	world.turn();
    	window.requestAnimationFrame(loop);
    	counter +=0.05;
    }

    loop();
}

vants();
