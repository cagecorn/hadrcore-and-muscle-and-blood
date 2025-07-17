// js/engines/RenderEngine.js

import { Renderer } from '../Renderer.js';
import { CameraEngine } from '../managers/CameraEngine.js';
import { LayerEngine } from '../managers/LayerEngine.js';
import { AnimationManager } from '../managers/AnimationManager.js';
import { ParticleEngine } from '../managers/ParticleEngine.js';
import { InputManager } from '../managers/InputManager.js';
import { UIEngine } from '../managers/UIEngine.js';
import { ButtonEngine } from '../managers/ButtonEngine.js';

/**
 * 렌더링과 시각 효과를 담당하는 엔진입니다.
 */
export class RenderEngine {
    // GameEngine에서 캔버스 요소를 직접 전달받도록 수정
    constructor(canvasElement, eventManager, measureManager, logicManager, sceneManager) {
        console.log("🎨 RenderEngine initialized.");
        // canvasId 대신 실제 DOM 요소를 받아 Renderer에 ID를 전달합니다.
        this.renderer = new Renderer(canvasElement.id);
        // 생성 시점에 logicManager와 sceneManager를 주입하여 CameraEngine을 초기화합니다.
        this.cameraEngine = new CameraEngine(this.renderer, logicManager, sceneManager);
        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine);

        // battleSimulationManager는 나중에 주입되므로 일단 null로 설정합니다.
        this.particleEngine = new ParticleEngine(measureManager, this.cameraEngine, null);
        this.animationManager = new AnimationManager(measureManager, null, this.particleEngine);

        this.buttonEngine = new ButtonEngine();
        // heroManager 역시 나중에 주입됩니다.
        this.uiEngine = new UIEngine(this.renderer, measureManager, eventManager, null, this.buttonEngine, null);
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine, this.buttonEngine, eventManager);
        // UIEngine 인스턴스를 ButtonEngine에 전달하여 버튼 클릭 시 UI 상호작용이 가능하도록 함
        this.inputManager.buttonEngine.uiEngine = this.uiEngine;
    }

    injectDependencies(battleSim, heroManager) {
        // 전투 관련 매니저를 주입하여 애니메이션과 파티클 시스템이 접근하도록 합니다.
        this.particleEngine.battleSimulationManager = battleSim;
        this.animationManager.battleSimulationManager = battleSim;

        if (this.uiEngine) {
            this.uiEngine.heroManager = heroManager;
        }

        // BattleSimulationManager가 LogicManager에 접근할 수 있도록 주입
        if (battleSim) {
            battleSim.logicManager = this.cameraEngine.logicManager;
        }
    }

    draw() {
        this.layerEngine.draw();
    }

    update(deltaTime) {
        this.animationManager.update(deltaTime);
        this.particleEngine.update(deltaTime);
    }

    getAnimationManager() { return this.animationManager; }
    getLayerEngine() { return this.layerEngine; }
}
