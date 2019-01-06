/**
 * Generic tile game
 * See: https://photonstorm.github.io/phaser3-docs/index.html
 * API: https://github.com/photonstorm/phaser3-docs
 */
var game;

var opts = {
    tileSize: 200,
    tileSpacing: 20,
    boardSize: {
        rows: 4,
        cols: 4
    },
    tweenSpeed: 500,
    swipeMaxTime: 1000,
    swipeMinDistance: 20,
    swipeMinNormal: 0.85
}

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

const ASSETS_LOC = "assets/";

window.onload = function() {    

    var gameConfig = {
        width: opts.boardSize.cols * (opts.tileSize + opts.tileSpacing) + opts.tileSpacing,
        height: opts.boardSize.rows * (opts.tileSize + opts.tileSpacing) + opts.tileSpacing,
        backgroundColor: 0xffffff,
        scene: [bootGame, playGame]
    }

    game = new Phaser.Game(gameConfig);
    window.focus();
    resizeGame();
    window.addEventListener("resize", resizeGame)
    console.log('initialised');
}

// Scene 1: TODO: Move
class bootGame extends Phaser.Scene {
    constructor(){
        super("BootGame");
    }

    preload() {
        this.load.image("empty", ASSETS_LOC + "/empty.png");        

        this.load.spritesheet("tiles", ASSETS_LOC + "tiles.png", {
            frameWidth: opts.tileSize,
            frameHeight: opts.tileSize
        });
        this.load.audio("move", ["assets/move.mp3"]);
    }

    create() {
        console.log("Boot Game");
        // Transition
        this.scene.start("PlayGame");        
    }
}

// Scene 2: TODO: Move
class playGame extends Phaser.Scene {

    constructor() {
        super("PlayGame");
    }

    create() {
        console.log("Play Game");
        
        this.board = [];

        // Setup the board rows
        this.createBoardRows();

        this.tweenComplete = false;

        // Setup our input
        this.input.keyboard.on("keydown", this.handleKeyPress, this);
        this.input.on("pointerup", this.handleMouse, this);

        this.moveSound = this.sound.add("move");
    }

    createBoardRows() {

        var numberOfRows = opts.boardSize.rows;
        for(var rowNum = 0; rowNum < numberOfRows; rowNum++) {
            this.board[rowNum] = [];
            this.createColumnsForRow(rowNum);
        }

        this.addTile();        
    }

    handleKeyPress(e) {

        if (this.tweenComplete) {

            switch (e.code) {

                case "KeyA":
                case "ArrowLeft":
                this.makeMove(LEFT);
                break;

                case "KeyD":
                case "ArrowRight":
                this.makeMove(RIGHT);
                break;

                case "KeyW":
                case "ArrowUp":
                this.makeMove(UP);
                break;

                case "KeyS":
                case "ArrowDown":
                this.makeMove(DOWN);
                break;
            }
        }

        var keyPressed = e.code;
        console.log("key handled " + keyPressed);        
    }

    makeMove(d) {
        console.log("make your move");
        this.moveSound.play();
    }

    handleMouse(e) {

        if (this.tweenComplete) {
            var swipeTime = e.upTime - e.downTime;
            var fastEnough = swipeTime < opts.swipeMaxTime;
            var swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
            var swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
            var longEnough = swipeMagnitude > opts.swipeMinDistance;

            if(longEnough && fastEnough) {

                Phaser.Geom.Point.SetMagnitude(swipe, 1);
                if(swipe.x > opts.swipeMinNormal){
                    this.makeMove(RIGHT);
                }
                if(swipe.x < -opts.swipeMinNormal){
                    this.makeMove(LEFT);
                }
                if(swipe.y > opts.swipeMinNormal){
                    this.makeMove(DOWN);
                }
                if(swipe.y < -opts.swipeMinNormal){
                    this.makeMove(UP);
                }
            }
        }
    }

    addTile() {

        var chosenTile = Phaser.Utils.Array.GetRandom(this.board);
        this.board[0][0].tileValue = 1;
        this.board[0][0].tileSprite.visible = true;
        this.board[0][0].tileSprite.setFrame(0);
        this.board[0][0].tileSprite.alpha = 0;

        // Animate using the alpha (Add a tween)
        this.tweens.add({
            targets: [this.board[0][0].tileSprite],
            alpha: 1,
            duration: opts.tweenSpeed,
            callbackScope: this, onComplete: function() {
                console.log("tween completed");
                this.tweenComplete = true;
            }
        });
    }

    createColumnsForRow(rowNum) {

        var numberOfColumns = opts.boardSize.cols;
        for (var colNum = 0; colNum < numberOfColumns; colNum++) {

            var tilePosition = this.getTilePosition(rowNum, colNum);

            // Base image
            this.add.image(tilePosition.x, tilePosition.y, "empty");
            
            // Overlay the image number from the sprite sheet
            var tileNumber = 3;

            // https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Sprite.html
            var tileSprite = this.add.sprite(tilePosition.x, tilePosition.y, "tiles", tileNumber);                
            tileSprite.visible = false;

            this.board[rowNum][colNum] = {
                tileValue: 0,
                tileSprite: tileSprite
            }
        }
    }

    // Get tile x, y position given the row and column number
    // return as a Geom.point
    getTilePosition(row, col){
        var posX = opts.tileSpacing * (col + 1) + opts.tileSize *
          (col + 0.5);
        var posY = opts.tileSpacing * (row + 1) + opts.tileSize *
          (row + 0.5);
        return new Phaser.Geom.Point(posX, posY);
    }
}

function resizeGame() {

    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;

    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    } else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    } 
}