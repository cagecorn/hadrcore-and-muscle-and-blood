export class Preloader {
    constructor(scene) {
        this.scene = scene;
    }
    preload() {
        this.scene.load.image('warrior-hire', 'assets/territory/warrior-hire.png');
        this.scene.load.image('gunner-hire', 'assets/territory/gunner-hire.png');
        // Additional UI images for unit details
        this.scene.load.image('warrior-ui', 'assets/territory/warrior-ui.png');
        this.scene.load.image('gunner-ui', 'assets/territory/gunner-ui.png');
    }
}
