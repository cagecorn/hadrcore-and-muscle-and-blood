/**
 * WebGL \uceb4\uacfc\uc2a4\uc5d0 \uc9c8\uc2dd \ud14d\uc2a4\ud2b8\ub97c \uadf8\ub9b4\uc5b4 \uc120\uba85\ud55c \uc774\ub984\ud3a0 \ub4f1\uc744 \ud45c\uc2dc\ud558\ub294 \uc5d0\uc9c4.
 * 2\ubc88 \ud574\uc0c1\ub85c \ud14d\uc2a4\ud2b8\ub97c \ub808\ub354\ub9c1\ud55c \ud6c4 0.5\ubc84\ub2e4\ub97c \ucd95\uc18c\ud558\uc5ec \uc120\uba85\ub3c4\ub97c \ub192\uc784\ub2c8\ub2e4.
 */
export class OffscreenTextEngine {
    /**
     * @param {Phaser.Scene} scene \ud14d\uc2a4\ud2b8\ub97c \ucd94\uac00\ud560 Phaser \uc2fc
     */
    constructor(scene) {
        this.scene = scene;
        this.labels = []; // \uc0dd\uc131\ub41c \ubaa8\ub450 \uc774\ub984\ud3a0\ub97c \ucd94\uc9c1\ud558\uc5ec \uad00\ub9ac
    }

    /**
     * \uc9c0\uc815\ub41c \uc2a4\ud504\ub808\uc774\ud2b8 \uc704\uc5d0 \uc774\ub984\ud3a0\ub97c \uc0dd\uc131\ud569\ub2c8\ub2e4.
     * @param {Phaser.GameObjects.Sprite} sprite \uc774\ub984\ud3a0\uc774 \ub530\ub77c\ub2e4\ub2d0 \ub300\uc0c1 \uc2a4\ud504\ub808\uc774\ud2b8
     * @param {string} text \ud45c\uc2dc\ud560 \ud14d\uc2a4\ud2b8
     * @param {string} color \ud14d\uc2a4\ud2b8 \uc0c9\uc0c1
     */
    createLabel(sprite, text, color = '#ffffff') {
        const label = this.scene.add.text(sprite.x, sprite.y, text, {
            fontFamily: '"Arial Black", Arial, sans-serif',
            fontSize: '28px', // 2\ubc88 \ud06c\uae30\ub85c \ud3f0\ud2b8 \uc124\uc815
            color: color,
            stroke: '#000000',
            strokeThickness: 5,
        });

        // 이름표가 캐릭터의 머리 위에 위치하도록 기준점을 중간 하단으로 설정합니다.
        label.setOrigin(0.5, 1);
        label.setResolution(2);  // 해상도를 2배로 설정
        label.setScale(0.5);     // \ud06c\uae30\ub97c 0.5\ubc84\ub2e4\ub97c \ucd95\uc18c\ud558\uc5ec \uc120\uba85\ub3c4 \ud655\ub960

        // ✨ 유닛 머리 위와의 여백을 더 확보하여 토큰과 바 영역을 만듭니다.
        label.y = sprite.y - (sprite.displayHeight / 2) - 15;

        this.labels.push({ label, sprite });
        return label;
    }

    /**
     * \ub9e4 \ud504\ub808\uc784\ub9c8\ub2e4 \ubaa8\ub450 \uc774\ub984\ud3a0\uc758 \uc704\uce58\ub97c \ud574\ub2f9 \uc2a4\ud504\ub808\uc774\ud2b8\uc5d0 \ub9de\uac8c \uc5c5\ub370\uc774\ud2b8\ud569\ub2c8\ub2e4.
     * \uc774 \uba54\uc18c\ub4dc\ub294 \uc2fc\uc758 update \ub8e8\ud504\uc5d0\uc11c \ud638\ucd9c\ub418\uc5b4\uc57c \ud569\ub2c8\ub2e4.
     */
    update() {
        this.labels.forEach(item => {
            if (item.sprite.active) {
                item.label.x = item.sprite.x;
                // ✨ 여백 값을 동일하게 조정해 다른 UI와 간섭하지 않도록 합니다.
                item.label.y = item.sprite.y - (item.sprite.displayHeight / 2) - 15;
            } else {
                // \uc2a4\ud504\ub808\uc774\ud2b8\uac00 \ube44\ud65c\uc131\ud654\ub418\uba74 \uc774\ub984\ud3a0\ub3c4 \uc228\uae38\ub9ac\ub2c8\ub2e4.
                item.label.setVisible(false);
            }
        });
    }

    /**
     * \uc0dd\uc131\ub41c \ubaa8\ub4e0 \ud14d\uc2a4\ud2b8 \uac1d\uccb4\ub97c \ud30c\uad34\ud569\ub2c8\ub2e4.
     */
    shutdown() {
        this.labels.forEach(item => item.label.destroy());
        this.labels = [];
    }
}
