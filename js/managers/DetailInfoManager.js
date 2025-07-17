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
        this.tooltipAlpha = 0;         // 툴팁 투명도 (페이드 효과)
        this.tooltipVisible = false;   // 툴팁 표시 여부

        this.tooltipFadeSpeed = 0.05;  // 툴팁 페이드 속도

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

        // 화면 좌표를 월드 좌표로 변환
        const worldMouse = this.cameraEngine
            ? this.cameraEngine.screenToWorld(this.lastMouseX, this.lastMouseY)
            : { x: this.lastMouseX, y: this.lastMouseY };

        let currentHoveredUnit = null;

        for (const unit of this.battleSimulationManager.unitsOnGrid) {
            if (unit.currentHp <= 0) continue; // 죽은 유닛은 감지하지 않음

            // AnimationManager로부터 유닛의 실제 렌더링 위치를 가져옵니다.
            const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            // 유닛 이미지의 실제 렌더링 영역
            const unitRenderWidth = effectiveTileSize;
            const unitRenderHeight = effectiveTileSize;

            // 변환된 월드 좌표로 마우스가 유닛 위에 있는지 확인
            if (
                worldMouse.x >= drawX && worldMouse.x <= drawX + unitRenderWidth &&
                worldMouse.y >= drawY && worldMouse.y <= drawY + unitRenderHeight
            ) {
                currentHoveredUnit = unit;
                break; // 한 유닛에만 호버링 가능
            }
        }

        if (currentHoveredUnit && currentHoveredUnit !== this.hoveredUnit) {
            // 새로운 유닛에 호버링 시작
            this.hoveredUnit = currentHoveredUnit;
            this.tooltipVisible = true;
            this.tooltipAlpha = 0; // 새로 시작
            console.log(`[DetailInfoManager] Hovering over: ${this.hoveredUnit.name}`);
        } else if (!currentHoveredUnit && this.hoveredUnit) {
            // 호버링 중이던 유닛에서 벗어남
            this.tooltipVisible = false;
            // this.hoveredUnit = null; // 페이드 아웃 후 null 처리
        }

        // 툴팁 페이드 인/아웃
        if (this.tooltipVisible) {
            this.tooltipAlpha = Math.min(1, this.tooltipAlpha + this.tooltipFadeSpeed * (deltaTime / 16));
        } else {
            this.tooltipAlpha = Math.max(0, this.tooltipAlpha - this.tooltipFadeSpeed * (deltaTime / 16));
            if (this.tooltipAlpha <= 0 && this.hoveredUnit) {
                this.hoveredUnit = null; // 완전히 사라지면 null 처리
            }
        }
    }

    /**
     * 툴팁 UI를 캔버스에 그립니다. LayerEngine에 의해 호출됩니다.
     * @param {CanvasRenderingContext2D} ctx - 캔버스 2D 렌더링 컨텍스트
     */
    async draw(ctx) { // ✨ draw 메서드를 async로 변경하여 await를 사용할 수 있도록 함
        if (!this.hoveredUnit || this.tooltipAlpha <= 0) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = this.tooltipAlpha; // 전체 툴팁 투명도 적용

        // 툴팁 위치 계산 (마우스 커서 근처에 표시)
        const tooltipWidth = 300; // 고정 너비
        const padding = 10;
        const lineHeight = 20;
        let currentYOffset = padding;

        let tooltipX = this.lastMouseX + 15; // 커서 오른쪽으로 살짝 이동
        let tooltipY = this.lastMouseY + 15; // 커서 아래로 살짝 이동

        // 캔버스 경계를 넘어가지 않도록 조정 (툴팁 높이는 내용에 따라 동적으로 계산)
        const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);

        // 먼저 내용을 그려보고 높이를 대략적으로 측정
        let contentHeight = 0;
        contentHeight += lineHeight; // 이름
        contentHeight += lineHeight; // 클래스/타입
        contentHeight += lineHeight * 2; // HP/Barrier
        contentHeight += lineHeight * 4; // 주요 스탯 묶음 (공격, 방어, 속도, 용맹)

        const heroDetails = await this.heroEngine.getHero(this.hoveredUnit.id); // 영웅 스킬/시너지 가져오기
        let classData = null;
        if (this.hoveredUnit.classId) {
            classData = await this.idManager.get(this.hoveredUnit.classId);
            if (!classData) {
                console.warn(`[DetailInfoManager] Class data not found or invalid for ID: ${this.hoveredUnit.classId}`);
            }
        }

        // 스킬 및 시너지 줄 수 계산
        if (heroDetails && heroDetails.skills && heroDetails.skills.length > 0) {
            contentHeight += lineHeight * (heroDetails.skills.length + 1); // 스킬 제목 + 각 스킬
        } else if (classData && classData.skills && classData.skills.length > 0) {
            contentHeight += lineHeight * (classData.skills.length + 1); // 스킬 제목 + 각 스킬
        }
        if (heroDetails && heroDetails.synergies && heroDetails.synergies.length > 0) {
            contentHeight += lineHeight * (heroDetails.synergies.length + 1); // 시너지 제목 + 각 시너지
        }

        const tooltipHeight = contentHeight + padding * 2;

        if (tooltipX + tooltipWidth > canvasWidth) {
            tooltipX = canvasWidth - tooltipWidth - padding;
        }
        if (tooltipY + tooltipHeight > canvasHeight) {
            tooltipY = canvasHeight - tooltipHeight - padding;
        }
        if (tooltipX < padding) tooltipX = padding;
        if (tooltipY < padding) tooltipY = padding;


        // 툴팁 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

        // 툴팁 테두리
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

        // 텍스트 그리기
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // 유닛 이름
        ctx.fillText(this.hoveredUnit.name, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight + 5; // 다음 줄과의 간격

        // 클래스 및 타입
        let className = '알 수 없음';
        if (classData && classData.name) {
            className = classData.name;
        }
        ctx.font = '14px Arial';
        ctx.fillText(`클래스: ${className} | 타입: ${this.hoveredUnit.type || '알 수 없음'}`, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight;

        ctx.font = '14px Arial';
        // HP 및 배리어
        ctx.fillStyle = '#FF4500'; // 빨간색
        const displayHp = this.hoveredUnit.currentHp !== undefined ? this.hoveredUnit.currentHp : (this.hoveredUnit.baseStats ? this.hoveredUnit.baseStats.hp : '?');
        const maxHp = this.hoveredUnit.baseStats ? this.hoveredUnit.baseStats.hp : '?';
        ctx.fillText(`HP: ${displayHp}/${maxHp}`, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight;

        ctx.fillStyle = '#FFFF00'; // 노란색
        const displayBarrier = this.hoveredUnit.currentBarrier !== undefined ? this.hoveredUnit.currentBarrier : '?';
        const maxBarrier = this.hoveredUnit.maxBarrier !== undefined ? this.hoveredUnit.maxBarrier : '?';
        ctx.fillText(`배리어: ${displayBarrier}/${maxBarrier}`, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight + 5; // 다음 섹션과의 간격

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        const baseStats = this.hoveredUnit.baseStats || {};
        ctx.fillText(`공격: ${baseStats.attack || 0} | 방어: ${baseStats.defense || 0}`, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight;
        ctx.fillText(`속도: ${baseStats.speed || 0} | 용맹: ${baseStats.valor || 0}`, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight;
        ctx.fillText(`힘: ${baseStats.strength || 0} | 인내: ${baseStats.endurance || 0}`, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight;
        ctx.fillText(`민첩: ${baseStats.agility || 0} | 지능: ${baseStats.intelligence || 0}`, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight;
        ctx.fillText(`지혜: ${baseStats.wisdom || 0} | 운: ${baseStats.luck || 0}`, tooltipX + padding, tooltipY + currentYOffset);
        currentYOffset += lineHeight + 5;

        // 스킬 정보 (HeroEngine에서 가져온 heroDetails에 스킬이 있다면)
        let skillsToList = [];
        if (heroDetails && heroDetails.skills && heroDetails.skills.length > 0) {
            skillsToList = heroDetails.skills;
        } else if (classData && classData.skills && classData.skills.length > 0) {
            skillsToList = classData.skills;
        }

        if (skillsToList.length > 0) {
            ctx.font = 'bold 16px Arial';
            ctx.fillText('스킬:', tooltipX + padding, tooltipY + currentYOffset);
            currentYOffset += lineHeight;
            for (const skillId of skillsToList) {
                const skillData = Object.values(WARRIOR_SKILLS).find(s => s.id === skillId);
                const icon = this.skillIconManager ? this.skillIconManager.getSkillIcon(skillId) : null;
                const iconSize = 20;
                const iconX = tooltipX + padding;
                const iconY = tooltipY + currentYOffset;
                if (icon) {
                    ctx.drawImage(icon, iconX, iconY, iconSize, iconSize);
                }
                ctx.font = '14px Arial';
                const textX = iconX + iconSize + 5;
                const textY = iconY + 2;
                ctx.fillText(skillData ? skillData.name : skillId, textX, textY);
                currentYOffset += iconSize + 5;
            }
            currentYOffset += 5; // 다음 섹션과의 간격
        }

        // 시너지 정보 (HeroEngine에서 가져온 heroDetails에 시너지가 있다면)
        if (heroDetails && heroDetails.synergies && heroDetails.synergies.length > 0) {
            ctx.font = 'bold 16px Arial';
            ctx.fillText('시너지:', tooltipX + padding, tooltipY + currentYOffset);
            currentYOffset += lineHeight;
            ctx.font = '14px Arial';
            for (const synergyId of heroDetails.synergies) {
                // 시너지 ID에서 "synergy_" 프리픽스 제거하여 표시
                ctx.fillText(`- ${synergyId.replace('synergy_', '')}`, tooltipX + padding, tooltipY + currentYOffset);
                currentYOffset += lineHeight;
            }
        }

        ctx.restore();
    }
}
