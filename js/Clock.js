export class Clock {
    #listeners = [];

    constructor(){
        this.#tick();
    }

    #tick(timestamp) {
        for (let listener of this.#listeners) {
            if (!listener.lastTick) listener.lastTick = timestamp;
            if (timestamp - listener.lastTick > listener.tickDuration) {
                listener.onTick({
                    now: timestamp,
                    deltaTime: timestamp - listener.lastTick
                });
                listener.lastTick = timestamp;
            }
        }
        this.#listeners = this.#listeners.filter(l => !l.isFinished); // filter out finished processes
        requestAnimationFrame(this.#tick.bind(this));
    }

    addInterval(onTick, intervalDurationMilliseconds = 0) {
        this.#listeners.push({
            tickDuration: intervalDurationMilliseconds,
            onTick: onTick,
            isFinished: false
        });
    }

    queue(callback, queueAfterMilliseconds) {
        this.#listeners.push({
            tickDuration: queueAfterMilliseconds,
            onTick(time) {
                callback(time);
                this.isFinished = true;
            },
            isFinished: false
        })
    }
}