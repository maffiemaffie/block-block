export class BlockBlock {
    canvas;
    width;
    height;
    
    player;
    blocks = [];

    #timePassed;

    static DIRECTION = Object.freeze({
        RIGHT: 0,
        UP: 1,
        LEFT: 2,
        DOWN: 3
    });

    constructor(width = 720, height = 480) {
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.bindControls();

        this.player = new Player();
        this.blocks.push(new Block(this.canvas.width * 0.5, this.canvas.height * 0.75, 5, BlockBlock.DIRECTION.RIGHT));
        requestAnimationFrame(this.update.bind(this));
    }

    draw() {
        const ctx = this.canvas.getContext('2d');
        
        //#region draw background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.width, this.height);
        //#endregion draw background

        ctx.save();
        ctx.translate(this.width * 0.5, this.height * 0.75);
        
        this.player.draw(ctx);
        this.blocks.forEach(b => b.draw(ctx));
        
        ctx.restore();
    }

    update(timestamp) {
        if (this.#timePassed === undefined) {
            this.#timePassed = timestamp;
            requestAnimationFrame(this.update.bind(this));
        }

        const deltaTime = timestamp - this.#timePassed;
        this.draw();
        this.player.update(deltaTime);
        this.blocks.forEach(b => b.update(deltaTime));

        this.#timePassed = timestamp;
        requestAnimationFrame(this.update.bind(this));
    }

    bindControls() {
        window.addEventListener('keydown', this.#onKeydown.bind(this));
    }

    #onKeydown(e) {
        switch (e.key) {
            case "ArrowRight":
                this.player.facing = BlockBlock.DIRECTION.RIGHT;
                break;
            case "ArrowUp":
                this.player.facing = BlockBlock.DIRECTION.UP;
                break;
            case "ArrowLeft":
                this.player.facing = BlockBlock.DIRECTION.LEFT;
                break;
            case "ArrowDown":
                this.player.facing = BlockBlock.DIRECTION.DOWN;
                break;
            default:
                return;
        }
    }
}

class Player {
    x;
    y;
    facing;
    static SIZE = 50;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.facing = BlockBlock.DIRECTION.RIGHT;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, Player.SIZE, Player.SIZE);
        
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        switch (this.facing) {
            case BlockBlock.DIRECTION.RIGHT:
                ctx.moveTo(Player.SIZE, -0);
                ctx.lineTo(Player.SIZE, Player.SIZE);
                break;
            case BlockBlock.DIRECTION.UP:
                ctx.moveTo(0, 0);
                ctx.lineTo(Player.SIZE, 0);
                break;
            case BlockBlock.DIRECTION.LEFT:
                ctx.moveTo(0, 0);
                ctx.lineTo(0, Player.SIZE);
                break;
            case BlockBlock.DIRECTION.DOWN:
                ctx.moveTo(Player.SIZE, Player.SIZE);
                ctx.lineTo(0, Player.SIZE);
                break;
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    update() {}
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
            case BlockBlock.DIRECTION.RIGHT:
                this.facing = BlockBlock.DIRECTION.LEFT;
                break;
            case BlockBlock.DIRECTION.UP:
                this.facing = BlockBlock.DIRECTION.DOWN;
                break;
            case BlockBlock.DIRECTION.LEFT:
                this.facing = BlockBlock.DIRECTION.RIGHT;
                break;
            case BlockBlock.DIRECTION.DOWN:
                this.facing = BlockBlock.DIRECTION.UP;
                break;
        }
    }

    update(deltaTime) {
        switch (this.moving) {
            case BlockBlock.DIRECTION.RIGHT:
                this.x += this.speed * deltaTime;
                break;
            case BlockBlock.DIRECTION.UP:
                this.y += this.speed * deltaTime;
                break;
            case BlockBlock.DIRECTION.LEFT:
                this.x -= this.speed * deltaTime;
                break;
            case BlockBlock.DIRECTION.DOWN:
                this.y -= this.speed * deltaTime;
                break;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = 'yellow';
        ctx.strokeRect(this.x, this.y, Block.SIZE, Block.SIZE);
        ctx.restore();
    }
}