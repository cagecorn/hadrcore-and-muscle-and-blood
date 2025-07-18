// js/managers/DetailInfoManager.js

import { GAME_EVENTS } from '../constants.js'; // 이벤트 상수를 사용
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';

export class DetailInfoManager {
    /**
     * DetailInfoManager를 초기화합니다.
     * @param {EventManager} eventManager - 이벤트 구독을 위한 EventManager 인스턴스
     * @param {MeasureManager} measureManager - UI 크기 및 위치 계산을 위한 MeasureManager 인스턴스
     * @param {BattleSimulationManager} battleSimulationManager - 유닛 정보 및 위치 조회를 위한 BattleSimulationManager 인스턴스
     * @param {HeroEngine} heroEngine - 영웅별 상세 데이터(스킬, 시너지) 조회를 위한 HeroEngine 인스턴스
     * @param {IdManager} idManager - 클래스, 스킬, 시너지 이름 조회를 위한 IdManager 인스턴스
     * @param {CameraEngine} cameraEngine - 카메라 위치/줌 정보를 조회하기 위한 CameraEngine 인스턴스
     */
    constructor(eventManager, measureManager, battleSimulationManager, heroEngine, idManager, cameraEngine, skillIconManager) {
        console.log("🔍 DetailInfoManager initialized. Ready to show unit details on hover. 🔍");
        this.eventManager = eventManager;
        this.measureManager = measureManager;
        this.battleSimulationManager = battleSimulationManager;
        this.heroEngine = heroEngine;
        this.idManager = idManager;
        this.cameraEngine = cameraEngine;
        this.skillIconManager = skillIconManager;

        this.hoveredUnit = null;       // 현재 마우스가 올라간 유닛
        this.lastMouseX = 0;           // 마우스의 마지막 X 좌표 (논리적 캔버스 좌표)
        this.lastMouseY = 0;           // 마우스의 마지막 Y 좌표 (논리적 캔버스 좌표)

        // DOM 기반 툴팁 요소 생성
        this.tooltipElement = this._createTooltipElement();
        document.body.appendChild(this.tooltipElement);

        this._setupEventListeners();
    }

    /**
     * 이벤트 리스너를 설정합니다.
     * @private
     */
    _setupEventListeners() {
        // InputManager에서 발행하는 마우스 이동 이벤트 구독
        this.eventManager.subscribe(GAME_EVENTS.CANVAS_MOUSE_MOVED, this._onCanvasMouseMove.bind(this));
        console.log("[DetailInfoManager] Subscribed to CANVAS_MOUSE_MOVED event.");
    }

    /**
     * 툴팁으로 사용할 DOM 요소를 생성하고 초기화합니다.
     * @private
     */
    _createTooltipElement() {
        const tooltip = document.createElement('div');
        tooltip.id = 'unit-tooltip';
        tooltip.className = 'hidden';
        return tooltip;
    }

    /**
     * 캔버스 내 마우스 이동 이벤트를 처리합니다.
     * @param {{x: number, y: number}} data - 캔버스 내부의 논리적 마우스 X, Y 좌표
     * @private
     */
    _onCanvasMouseMove(data) {
        this.lastMouseX = data.x;
        this.lastMouseY = data.y;
    }

    /**
     * 매 프레임마다 호출되어 마우스 오버 유닛을 감지하고 툴팁 상태를 업데이트합니다.
     * @param {number} deltaTime - 지난 프레임과의 시간 차이 (밀리초)
     */
    update(deltaTime) {
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();

        const worldMouse = this.cameraEngine
            ? this.cameraEngine.screenToWorld(this.lastMouseX, this.lastMouseY)
            : { x: this.lastMouseX, y: this.lastMouseY };

        let currentHoveredUnit = null;

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue;

            const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            const unitRenderWidth = effectiveTileSize;
            const unitRenderHeight = effectiveTileSize;

            if (
                worldMouse.x >= drawX && worldMouse.x <= drawX + unitRenderWidth &&
                worldMouse.y >= drawY && worldMouse.y <= drawY + unitRenderHeight
            ) {
                currentHoveredUnit = unit;
                break;
            }
        }

        if (currentHoveredUnit && currentHoveredUnit !== this.hoveredUnit) {
            this.hoveredUnit = currentHoveredUnit;
            this._updateTooltipContent();
            this.tooltipElement.classList.remove('hidden');
            console.log(`[DetailInfoManager] Hovering over: ${this.hoveredUnit.name}`);
        } else if (!currentHoveredUnit && this.hoveredUnit) {
            this.hoveredUnit = null;
            this.tooltipElement.classList.add('hidden');
        }

        if (this.hoveredUnit) {
            this._updateTooltipPosition();
        }
    }

    /**
     * 툴팁 UI를 캔버스에 그립니다. LayerEngine에 의해 호출됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    async draw(ctx) {
        // DOM 기반으로 툴팁을 표시하므로 캔버스에는 그리지 않습니다.
        return;
    }

    /**
     * 호버된 유닛의 월드 좌표를 화면 좌표로 변환하여 툴팁 DOM 요소의 위치를 업데이트합니다.
     * @private
     */
    _updateTooltipPosition() {
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();

        const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
            this.hoveredUnit.id,
            this.hoveredUnit.gridX,
            this.hoveredUnit.gridY,
            effectiveTileSize,
            gridOffsetX,
            gridOffsetY
        );

        const screenPos = this.cameraEngine.worldToScreen(drawX, drawY);

        const canvasRect = this.battleSimulationManager.assetLoaderManager.canvas.getBoundingClientRect();
        const finalX = screenPos.x + canvasRect.left;
        const finalY = screenPos.y + canvasRect.top;

        this.tooltipElement.style.left = `${finalX}px`;
        this.tooltipElement.style.top = `${finalY}px`;
        this.tooltipElement.style.transform = 'translate(-50%, -110%)';
    }

    /**
     * 툴팁 DOM 요소의 내부 HTML을 유닛 정보로 채웁니다.
     * @private
     */
    async _updateTooltipContent() {
        if (!this.hoveredUnit) return;

        const baseStats = this.hoveredUnit.baseStats || {};
        let classData = await this.idManager.get(this.hoveredUnit.classId);
        let className = classData ? classData.name : '알 수 없음';

        this.tooltipElement.innerHTML = `
            <h3>${this.hoveredUnit.name}</h3>
            <p>클래스: ${className} | 타입: ${this.hoveredUnit.type}</p>
            <p style="color: #FF4500;">HP: ${this.hoveredUnit.currentHp}/${baseStats.hp}</p>
            <p style="color: #FFFF00;">배리어: ${this.hoveredUnit.currentBarrier}/${this.hoveredUnit.maxBarrier}</p>
            <hr>
            <p>공격: ${baseStats.attack || 0} | 방어: ${baseStats.defense || 0}</p>
            <p>속도: ${baseStats.speed || 0} | 용맹: ${baseStats.valor || 0}</p>
        `;
    }
}
