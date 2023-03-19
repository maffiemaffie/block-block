import { BlockBlock } from "./BlockBlock.js";

(() => {
    const game = new BlockBlock();
    document.querySelector("#game-container").insertAdjacentElement("afterbegin", game.canvas);
})();