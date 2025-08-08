import { debugLogEngine } from '../utils/DebugLogEngine.js';

class DebugDisplayLogManager {
    constructor() {
        this.name = 'DebugDisplay';
        debugLogEngine.register(this);
    }

    /**
     * 게임 오브젝트(스프라이트)와 DOM 요소(이름표)의 생성 좌표를 로그로 남깁니다.
     * @param {Phaser.GameObjects.GameObject} sprite - 위치를 추적할 게임 오브젝트
     * @param {HTMLElement} domElement - 위치를 추적할 DOM 요소 (이름표)
     * @param {object} unitData - 해당 유닛의 정보
     */
    logCreationPoint(sprite, domElement, unitData) {
        const unitName = unitData.instanceName || unitData.name;
        
        console.groupCollapsed(
            `%c[${this.name}]`, 
            `color: #10b981; font-weight: bold;`, 
            `'${unitName}' (ID: ${unitData.uniqueId}) 표시 요소 생성됨`
        );

        debugLogEngine.log(this.name, `스프라이트 좌표: { x: ${sprite.x.toFixed(2)}, y: ${sprite.y.toFixed(2)} }`);
        
        if (domElement) {
            // OffscreenTextEngine으로 생성된 이름표는 이미 좌표가 설정되어 있습니다.
            debugLogEngine.log(this.name, `이름표 좌표: { x: ${domElement.x.toFixed(2)}, y: ${domElement.y.toFixed(2)} }`);
        }
        
        console.groupEnd();
    }
}

export const debugDisplayLogManager = new DebugDisplayLogManager();
