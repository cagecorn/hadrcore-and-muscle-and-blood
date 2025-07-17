// tests/unit/mapManagerUnitTests.js

import { MapManager } from '../../js/managers/MapManager.js';
import { MeasureManager } from '../../js/managers/MeasureManager.js';

export function runMapManagerUnitTests() {
    console.log("--- MapManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockMeasureManager = new MeasureManager();

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const mapManager = new MapManager(mockMeasureManager);
        if (mapManager.mapData instanceof Array && mapManager.gridRows > 0 && mapManager.gridCols > 0) {
            console.log("MapManager: Initialized correctly and mapData generated. [PASS]");
            passCount++;
        } else {
            console.error("MapManager: Initialization failed. [FAIL]", mapManager);
        }
    } catch (e) {
        console.error("MapManager: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: recalculateMapDimensions
    testCount++;
    try {
        const mapManager = new MapManager(mockMeasureManager);
        const originalTileSize = mapManager.tileSize;
        const originalGridCols = mapManager.gridCols;

        mockMeasureManager.set('tileSize', 128);
        mockMeasureManager.set('mapGrid.cols', 20);

        mapManager.recalculateMapDimensions();

        if (mapManager.tileSize === 128 && mapManager.gridCols === 20) {
            console.log("MapManager: recalculateMapDimensions updated correctly. [PASS]");
            passCount++;
        } else {
            console.error("MapManager: recalculateMapDimensions failed. [FAIL]", { tileSize: mapManager.tileSize, gridCols: mapManager.gridCols });
        }
        mockMeasureManager.set('tileSize', originalTileSize);
        mockMeasureManager.set('mapGrid.cols', originalGridCols);
    } catch (e) {
        console.error("MapManager: Error during recalculateMapDimensions test. [FAIL]", e);
    }

    // 테스트 3: getTileType - 유효한 타일
    testCount++;
    try {
        const mapManager = new MapManager(mockMeasureManager);
        const tileType = mapManager.getTileType(0, 0);
        if (tileType !== null && (tileType === 'obstacle' || tileType === 'grass')) {
            console.log("MapManager: getTileType returned valid tile type. [PASS]");
            passCount++;
        } else {
            console.error("MapManager: getTileType failed to return valid tile type. [FAIL]", tileType);
        }
    } catch (e) {
        console.error("MapManager: Error during getTileType (valid) test. [FAIL]", e);
    }

    // 테스트 4: getTileType - 유효하지 않은 타일
    testCount++;
    try {
        const mapManager = new MapManager(mockMeasureManager);
        const invalidTileType = mapManager.getTileType(-1, -1);
        if (invalidTileType === null) {
            console.log("MapManager: getTileType returned null for invalid tile. [PASS]");
            passCount++;
        } else {
            console.error("MapManager: getTileType failed to return null for invalid tile. [FAIL]", invalidTileType);
        }
    } catch (e) {
        console.error("MapManager: Error during getTileType (invalid) test. [FAIL]", e);
    }

    // 테스트 5: getMapRenderData
    testCount++;
    try {
        const mapManager = new MapManager(mockMeasureManager);
        const renderData = mapManager.getMapRenderData();
        if (renderData.mapData === mapManager.mapData &&
            renderData.gridCols === mapManager.gridCols &&
            renderData.gridRows === mapManager.gridRows &&
            renderData.tileSize === mapManager.tileSize) {
            console.log("MapManager: getMapRenderData returned correct data. [PASS]");
            passCount++;
        } else {
            console.error("MapManager: getMapRenderData failed. [FAIL]", renderData);
        }
    } catch (e) {
        console.error("MapManager: Error during getMapRenderData test. [FAIL]", e);
    }

    // 테스트 6: _createPathfindingEngine의 findPath (간접 테스트)
    testCount++;
    try {
        const mapManager = new MapManager(mockMeasureManager);
        const pathfindingEngine = mapManager.pathfindingEngine;
        const simplePathFound = pathfindingEngine.findPath(0, 0, 5, 0);
        const complexPathNotFound = pathfindingEngine.findPath(0, 0, 1, 1);

        if (simplePathFound === true && complexPathNotFound === false) {
            console.log("MapManager: PathfindingEngine findPath logic works as expected (simple). [PASS]");
            passCount++;
        } else {
            console.error("MapManager: PathfindingEngine findPath logic failed. [FAIL]", { simplePathFound, complexPathNotFound });
        }
    } catch (e) {
        console.error("MapManager: Error during pathfinding test. [FAIL]", e);
    }

    console.log(`--- MapManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
