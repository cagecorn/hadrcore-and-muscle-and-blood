import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 게임 오브젝트와 그에 종속된 다른 요소들을 함께 움직이게 관리하는 엔진
 */
class BindingManager {
    constructor(scene) {
        this.scene = scene;
        this.bindings = new Map(); // 주 오브젝트와 종속 요소들의 매핑

        this.scene.events.on('update', this.update, this);
        this.scene.events.on('shutdown', this.shutdown, this);

        debugLogEngine.log('BindingManager', '바인딩 매니저가 활성화되었습니다.');
    }

    /**
     * 주 오브젝트에 다른 요소들을 바인딩합니다.
     * @param {Phaser.GameObjects.GameObject} primaryObject 중심이 될 오브젝트
     * @param {Array<Phaser.GameObjects.GameObject>} elementsToBind 함께 움직일 요소 배열
     */
    bind(primaryObject, elementsToBind = []) {
        if (!primaryObject) return;

        const boundElements = this.bindings.get(primaryObject) || [];
        elementsToBind.forEach(element => {
            if (element) {
                element.setData('offsetX', element.x - primaryObject.x);
                element.setData('offsetY', element.y - primaryObject.y);
                boundElements.push(element);
            }
        });

        this.bindings.set(primaryObject, boundElements);
        debugLogEngine.log('BindingManager', `${elementsToBind.length}개의 요소를 바인딩했습니다.`);
    }

    /**
     * 매 프레임마다 바인딩된 요소들의 위치를 갱신합니다.
     */
    update() {
        for (const [primary, boundElements] of this.bindings.entries()) {
            if (!primary.active) {
                boundElements.forEach(el => el.setVisible(false));
                continue;
            } else {
                boundElements.forEach(el => el.setVisible(true));
            }

            boundElements.forEach(element => {
                const offsetX = element.getData('offsetX') || 0;
                const offsetY = element.getData('offsetY') || 0;
                element.x = primary.x + offsetX;
                element.y = primary.y + offsetY;
            });
        }
    }

    /**
     * 씬이 종료될 때 모든 바인딩 정보를 초기화합니다.
     */
    shutdown() {
        this.bindings.clear();
        this.scene.events.off('update', this.update, this);
        this.scene.events.off('shutdown', this.shutdown, this);
        debugLogEngine.log('BindingManager', '바인딩 매니저를 종료합니다.');
    }
}

// 각 씬에서 인스턴스를 생성하여 사용합니다.
export { BindingManager };
