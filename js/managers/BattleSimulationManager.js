// js/managers/BattleSimulationManager.js

export class BattleSimulationManager {
    constructor(measureManager, assetLoaderManager, idManager, logicManager, animationManager, valorEngine) {
        console.log("\u2694\ufe0f BattleSimulationManager initialized. Preparing units for battle. \u2694\ufe0f");
        this.measureManager = measureManager;
        this.assetLoaderManager = assetLoaderManager;
        this.idManager = idManager; // Keep for other potential uses, though not directly in draw
        this.logicManager = logicManager;
        this.animationManager = animationManager;
        this.valorEngine = valorEngine;
        this.unitsOnGrid = [];
        this.gridRows = 9;  // 16:9 비율에 맞춘 행 수
        this.gridCols = 16; // 16:9 비율에 맞춘 열 수

        // DOD 스타일 컴포넌트 저장소 초기화
        this.nextEntityId = 0;
        this.components = {
            position: new Map(),
            stats: new Map(),
            render: new Map(),
            info: new Map()
        };
    }

    createEntity() {
        return this.nextEntityId++;
    }

    /**
     * 유닛을 특정 그리드 타일에 배치합니다.
     * @param {object} fullUnitData - IdManager로부터 완전히 로드된 유닛 데이터
     * @param {HTMLImageElement} unitImage - 로드된 유닛의 스프라이트 이미지
     * @param {number} gridX
     * @param {number} gridY
     */
    addUnit(fullUnitData, unitImage, gridX, gridY) {
        const entityId = this.createEntity();

        const initialBarrier = this.valorEngine.calculateInitialBarrier(fullUnitData.baseStats.valor || 0);

        // 컴포넌트 저장
        this.components.position.set(entityId, { x: gridX, y: gridY });
        this.components.stats.set(entityId, {
            ...fullUnitData.baseStats,
            currentHp: fullUnitData.baseStats.hp,
            currentBarrier: initialBarrier,
            maxBarrier: initialBarrier
        });
        this.components.render.set(entityId, { spriteId: fullUnitData.spriteId, image: unitImage });
        this.components.info.set(entityId, { id: entityId, name: fullUnitData.name, classId: fullUnitData.classId, type: fullUnitData.type, fullUnitData });

        const unitInstance = {
            id: entityId,
            name: fullUnitData.name,
            spriteId: fullUnitData.spriteId,
            image: unitImage,
            classId: fullUnitData.classId,
            gridX,
            gridY,
            baseStats: fullUnitData.baseStats,
            type: fullUnitData.type,
            fullUnitData: fullUnitData,
            currentHp: fullUnitData.baseStats.hp,
            currentBarrier: initialBarrier,
            maxBarrier: initialBarrier
        };
        this.unitsOnGrid.push(unitInstance);
        console.log(`[BattleSimulationManager] Created entity ${entityId} for unit ${fullUnitData.name}`);
        return entityId;
    }

    /**
     * 유닛의 그리드 위치를 업데이트합니다.
     * @param {string} unitId - 이동할 유닛의 ID
     * @param {number} newGridX - 새로운 그리드 X 좌표
     * @param {number} newGridY - 새로운 그리드 Y 좌표
     * @returns {boolean} 이동 성공 여부
     */
    moveUnit(unitId, newGridX, newGridY) {
        const unit = this.unitsOnGrid.find(u => u.id === unitId);
        if (unit) {
            const oldX = unit.gridX;
            const oldY = unit.gridY;

            if (newGridX >= 0 && newGridX < this.gridCols &&
                newGridY >= 0 && newGridY < this.gridRows) {
                if (this.isTileOccupied(newGridX, newGridY, unitId)) {
                    console.warn(`[BattleSimulationManager] Destination tile (${newGridX}, ${newGridY}) is occupied. Move cancelled.`);
                    return false;
                }
                unit.gridX = newGridX;
                unit.gridY = newGridY;
                const pos = this.components.position.get(unitId);
                if (pos) {
                    pos.x = newGridX;
                    pos.y = newGridY;
                }
                console.log(`[BattleSimulationManager] Unit '${unitId}' moved from (${oldX}, ${oldY}) to (${newGridX}, ${newGridY}).`);
                return true;
            } else {
                console.warn(`[BattleSimulationManager] Unit '${unitId}' attempted to move out of bounds to (${newGridX}, ${newGridY}).`);
                return false;
            }
        } else {
            console.warn(`[BattleSimulationManager] Cannot move unit '${unitId}'. Unit not found.`);
            return false;
        }
    }

    /**
     * 특정 타일이 다른 유닛에 의해 점유되어 있는지 확인합니다.
     * @param {number} gridX
     * @param {number} gridY
     * @param {string} [ignoreUnitId] - 점유 여부 확인에서 제외할 유닛 ID
     * @returns {boolean} 타일 점유 여부
     */
    isTileOccupied(gridX, gridY, ignoreUnitId = null) {
        for (const [id, pos] of this.components.position.entries()) {
            if (id === ignoreUnitId) continue;
            const stats = this.components.stats.get(id);
            if (pos.x === gridX && pos.y === gridY && stats && stats.currentHp > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * 특정 그리드 좌표에 있는 유닛을 반환합니다. (죽은 유닛은 제외)
     * @param {number} gridX
     * @param {number} gridY
     * @returns {object | undefined} 해당 위치의 유닛 객체 또는 없으면 undefined
     */
    getUnitAt(gridX, gridY) {
        for (const [id, pos] of this.components.position.entries()) {
            const stats = this.components.stats.get(id);
            const info = this.components.info.get(id);
            if (pos.x === gridX && pos.y === gridY && stats && stats.currentHp > 0) {
                return { id, name: info.name, gridX: pos.x, gridY: pos.y, currentHp: stats.currentHp };
            }
        }
        return undefined;
    }

    /**
     * 유닛 렌더링에 필요한 그리드 관련 파라미터를 반환합니다.
     * 이 값들은 BattleGridManager와 VFXManager에서도 사용됩니다.
     * @returns {{effectiveTileSize: number, gridOffsetX: number, gridOffsetY: number, totalGridWidth: number, totalGridHeight: number}}
     */
    getGridRenderParameters() {
        const sceneContentDimensions = this.logicManager.getCurrentSceneContentDimensions();
        const canvasWidth = this.measureManager.get('gameResolution.width');
        const canvasHeight = this.measureManager.get('gameResolution.height');

        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        const tileSizeBasedOnWidth = gridContentWidth / this.gridCols;
        const tileSizeBasedOnHeight = gridContentHeight / this.gridRows;
        const effectiveTileSize = Math.min(tileSizeBasedOnWidth, tileSizeBasedOnHeight);

        const totalGridWidth = effectiveTileSize * this.gridCols;
        const totalGridHeight = effectiveTileSize * this.gridRows;

        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        return {
            effectiveTileSize,
            gridOffsetX,
            gridOffsetY,
            totalGridWidth,
            totalGridHeight
        };
    }

    /**
     * 배틀 그리드에 배치된 모든 유닛을 그립니다.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const sceneContentDimensions = this.logicManager.getCurrentSceneContentDimensions(); // 이제 순수 그리드 크기를 반환
        const canvasWidth = this.measureManager.get('gameResolution.width'); // 캔버스 실제 CSS 너비
        const canvasHeight = this.measureManager.get('gameResolution.height'); // 캔버스 실제 CSS 높이

        // LogicManager에서 계산된 순수 그리드 컨텐츠 크기 (패딩 제외)
        const gridContentWidth = sceneContentDimensions.width;
        const gridContentHeight = sceneContentDimensions.height;

        // BattleGridManager와 동일한 로직으로 타일 크기를 계산
        const tileSizeBasedOnWidth = gridContentWidth / this.gridCols;
        const tileSizeBasedOnHeight = gridContentHeight / this.gridRows;
        const effectiveTileSize = Math.min(tileSizeBasedOnWidth, tileSizeBasedOnHeight);

        // 실제 그려질 그리드의 총 크기
        const totalGridWidth = effectiveTileSize * this.gridCols;
        const totalGridHeight = effectiveTileSize * this.gridRows;

        // 그리드를 캔버스 중앙에 배치하기 위한 오프셋 계산
        const gridOffsetX = (canvasWidth - totalGridWidth) / 2;
        const gridOffsetY = (canvasHeight - totalGridHeight) / 2;

        for (const unit of this.unitsOnGrid) {
            const image = unit.image;
            if (!image) {
                console.warn(`[BattleSimulationManager] Image not available for unit '${unit.id}'. Skipping draw.`);
                continue;
            }

            const { drawX, drawY } = this.animationManager.getRenderPosition(
                unit.id,
                unit.gridX,
                unit.gridY,
                effectiveTileSize,
                gridOffsetX,
                gridOffsetY
            );

            const imageSize = effectiveTileSize;
            const imgOffsetX = (effectiveTileSize - imageSize) / 2;
            const imgOffsetY = (effectiveTileSize - imageSize) / 2;

            ctx.drawImage(image, drawX + imgOffsetX, drawY + imgOffsetY, imageSize, imageSize);
        }
    }
}
