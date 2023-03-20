import { Clock } from "./Clock.js";

const TIME_SCALE = 0.06;
const DIRECTION = Object.freeze({
    FORWARD : 0,
    RIGHT   : 1,
    UP      : 2,
    LEFT    : 3,
    DOWN    : 4
});

const gameClock = new Clock();

export class BlockBlock {
    canvas;
    width;
    height;
    
    player;
    blocks = [];

    #BLOCK_SPEED = 1;

    bounds;

    constructor(width = 720, height = 480) {
        this.width = width;
        this.height = height;
        this.bounds = Object.freeze({
            RIGHT   : width * 0.5,
            TOP     : -height * 0.75,
            LEFT    : -width * 0.5,
            BOTTOM  : height * 0.25
        });

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.bindControls();

        this.player = new Player();
    
        gameClock.addInterval(this.update.bind(this));
        gameClock.addInterval((() => {
            this.blocks.push(this.createRandomBlock());
        }).bind(this), 500);
    }

    //#region view
    draw() {
        const ctx = this.canvas.getContext('2d');
        
        //#region draw background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.width, this.height);
        //#endregion draw background

        ctx.save();
        ctx.translate(this.width * 0.5, this.height * 0.75);

        //#region draw ground
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(this.bounds.LEFT, 0);
        ctx.lineTo(this.bounds.RIGHT, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        //#endregion draw ground
        
        this.player.draw(ctx);
        this.blocks.forEach(b => b.draw(ctx));
        
        ctx.restore();
    }
    //#endregion view

    //#region model
    update(time) {
        this.draw();
        this.player.update(time.deltaTime);
        this.blocks.forEach(b => b.update(time.deltaTime));
        this.cleanup();
    }

    cleanup() {
        this.blocks = this.blocks.filter(b => {
            if (b.x - Block.SIZE > this.bounds.RIGHT) return false;
            if (b.x + Block.SIZE < this.bounds.LEFT) return false;
            if (b.y + Block.SIZE < this.bounds.TOP) return false;
            if (b.y - Block.SIZE > this.bounds.BOTTOM) return false;
            return true;
        });
    }
    //#endregion model

    //#region control
    bindControls() {
        window.addEventListener('keydown', this.#onKeydown.bind(this));
    }

    #onKeydown(e) {
        switch (e.code) {
            case "ArrowRight":
                this.player.facing = DIRECTION.RIGHT;
                break;
            case "ArrowUp":
                this.player.facing = DIRECTION.UP;
                break;
            case "ArrowLeft":
                this.player.facing = DIRECTION.LEFT;
                break;
            case "ArrowDown":
                this.player.facing = DIRECTION.DOWN;
                break;
            case "Space":
                this.player.jump();
                break;
            default:
                return;
        }
    }
    //#endregion control

    //#region helpers
    createRandomBlock() {
        const random = Math.random();
        if (random < 0.33) return new Block(this.bounds.RIGHT, 0, this.#BLOCK_SPEED, DIRECTION.RIGHT);
        if (random < 0.66) return new Block(0, this.bounds.TOP, this.#BLOCK_SPEED, DIRECTION.UP);
        if (random < 1.00) return new Block(this.bounds.LEFT, 0, this.#BLOCK_SPEED, DIRECTION.LEFT);
    }
    //#endregion helpers
}

class Player {
    x;
    y;
    #facingIndex = 0;
    #facing;

    set facing(value) {
        this.#facingIndex++;
        this.#facing = value;
        gameClock.queue((() => {
            this.#facingIndex--;
            if (this.#facingIndex == 0) {
                this.#facing = DIRECTION.FORWARD;
            }
        }).bind(this), 100);
    }

    state;


    static SIZE = 50;

    static PLAYER_STATE = Object.freeze({
        IDLE    : 0,
        JUMPING : 1
    });

    #sinceJump;
    #JUMP_HEIGHT = 150;
    #TWO_ROOT_JUMP_HEIGHT;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.#facing = DIRECTION.FORWARD;
        this.state = Player.PLAYER_STATE.IDLE;
        this.#TWO_ROOT_JUMP_HEIGHT = 2 * Math.sqrt(this.#JUMP_HEIGHT);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.translate(-Player.SIZE * 0.5, -Player.SIZE * 0.5);
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.fillRect(0, 0, Player.SIZE, Player.SIZE);
        ctx.strokeRect(0, 0, Player.SIZE, Player.SIZE);
        
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        switch (this.#facing) {
            case DIRECTION.RIGHT:
                ctx.moveTo(Player.SIZE, -0);
                ctx.lineTo(Player.SIZE, Player.SIZE);
                break;
            case DIRECTION.UP:
                ctx.moveTo(0, 0);
                ctx.lineTo(Player.SIZE, 0);
                break;
            case DIRECTION.LEFT:
                ctx.moveTo(0, 0);
                ctx.lineTo(0, Player.SIZE);
                break;
            case DIRECTION.DOWN:
                ctx.moveTo(Player.SIZE, Player.SIZE);
                ctx.lineTo(0, Player.SIZE);
                break;
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    update(deltaTime) {
        if (this.state == Player.PLAYER_STATE.JUMPING) {
            this.#sinceJump += deltaTime;
            this.y = -(this.#TWO_ROOT_JUMP_HEIGHT - this.#sinceJump * TIME_SCALE) * this.#sinceJump * TIME_SCALE;
            if (this.y > 0) {
                this.y = 0;
                this.state = Player.PLAYER_STATE.IDLE;
            }
        }
    }

    jump() {
        if (this.state !== Player.PLAYER_STATE.IDLE) return;
        this.state = Player.PLAYER_STATE.JUMPING;
        this.#sinceJump = 0;
    }
}

class Block {
    x;
    y;
    moving;
    speed;
    
    static SIZE = 40;

    constructor(x, y, speed, from) {
        this.x = x;
        this.y = y;
        this.speed = speed;

        switch (from) {
            case DIRECTION.RIGHT:
                this.moving = DIRECTION.LEFT;
                break;
            case DIRECTION.UP:
                this.moving = DIRECTION.DOWN;
                break;
            case DIRECTION.LEFT:
                this.moving = DIRECTION.RIGHT;
                break;
            case DIRECTION.DOWN:
                this.moving = DIRECTION.UP;
                break;
        }
    }

    update(deltaTime) {
        switch (this.moving) {
            case DIRECTION.RIGHT:
                this.x += this.speed * deltaTime;
                break;
            case DIRECTION.UP:
                this.y -= this.speed * deltaTime;
                break;
            case DIRECTION.LEFT:
                this.x -= this.speed * deltaTime;
                break;
            case DIRECTION.DOWN:
                this.y += this.speed * deltaTime;
                break;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.translate(-Block.SIZE * 0.5, -Block.SIZE * 0.5);
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.fillRect(0, 0, Block.SIZE, Block.SIZE);
        ctx.strokeRect(0, 0, Block.SIZE, Block.SIZE);
        ctx.restore();
    }
}