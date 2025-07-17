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
    constructor(canvasId, eventManager, measureManager) {
        console.log("\ud83c\udfa8 RenderEngine initialized.");
        this.renderer = new Renderer(canvasId);
        this.cameraEngine = new CameraEngine(this.renderer, null, null); // 논리 매니저는 추후 주입
        this.layerEngine = new LayerEngine(this.renderer, this.cameraEngine);

        this.particleEngine = new ParticleEngine(measureManager, this.cameraEngine, null);
        this.animationManager = new AnimationManager(measureManager, null, this.particleEngine);

        this.buttonEngine = new ButtonEngine();
        this.uiEngine = new UIEngine(this.renderer, measureManager, eventManager, null, this.buttonEngine, null);
        this.inputManager = new InputManager(this.renderer, this.cameraEngine, this.uiEngine, this.buttonEngine, eventManager);
    }

    injectDependencies(battleSim, logicManager, sceneManager) {
        this.cameraEngine.logicManager = logicManager;
        this.cameraEngine.sceneManager = sceneManager;
        this.particleEngine.battleSimulationManager = battleSim;
        this.animationManager.battleSimulationManager = battleSim;
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
