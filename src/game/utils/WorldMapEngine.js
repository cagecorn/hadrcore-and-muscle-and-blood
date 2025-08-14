import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { cityEngine } from './CityEngine.js';

/**
 * 간단한 월드 맵 엔진. Tilemap API 대신 각 타일을 이미지로 직접 배치합니다.
 */
export class WorldMapEngine {
    /**
     * @param {Phaser.Scene} scene 월드맵이 생성될 씬
     */
    constructor(scene) {
        this.scene = scene;
        this.tiles = []; // 배치된 타일 스프라이트를 저장할 배열

        // 사용자 요청에 따라 맵 크기를 20x20으로 조정합니다.
        this.MAP_WIDTH_IN_TILES = 20;
        this.MAP_HEIGHT_IN_TILES = 20;
        this.TILE_WIDTH = 512;
        this.TILE_HEIGHT = 512;

        this.widthInPixels = this.MAP_WIDTH_IN_TILES * this.TILE_WIDTH;
        this.heightInPixels = this.MAP_HEIGHT_IN_TILES * this.TILE_HEIGHT;
    }

    /**
     * 월드맵을 생성하고 랜덤 타일로 채웁니다.
     */
    create() {
        const tileImageKeys = [];
        for (let i = 1; i <= 15; i++) {
            tileImageKeys.push(`mab-tile-${i}`);
        }

        for (let y = 0; y < this.MAP_HEIGHT_IN_TILES; y++) {
            for (let x = 0; x < this.MAP_WIDTH_IN_TILES; x++) {
                const randomKey = Phaser.Math.RND.pick(tileImageKeys);
                const tileX = x * this.TILE_WIDTH;
                const tileY = y * this.TILE_HEIGHT;

                // 각 타일을 Scene에 직접 이미지로 추가하고 원점에 맞게 배치합니다.
                const tile = this.scene.add.image(tileX, tileY, randomKey).setOrigin(0, 0);
                this.tiles.push(tile);
            }
        }

        // 도시 아이콘을 추가합니다.
        const cities = cityEngine.getCities();
        cities.forEach(city => {
            const cityX = city.tileX * this.TILE_WIDTH;
            const cityY = city.tileY * this.TILE_HEIGHT;
            const cityIcon = this.scene.add.image(cityX, cityY, city.icon).setOrigin(0, 0);
            cityIcon.setDepth(1);
        });

        // 카메라 경계를 설정합니다.
        this.scene.cameras.main.setBounds(0, 0, this.widthInPixels, this.heightInPixels);
    }
}

