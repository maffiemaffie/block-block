export class Sprite {
    image;
    constructor(url) {
        const image = new Image();
        image.onload = () => this.image = image;
        image.onerror = (e) => console.error(e);

        image.src = url;
    }
}