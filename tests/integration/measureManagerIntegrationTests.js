export function runMeasureManagerIntegrationTest(gameEngine) {
    console.log("--- MeasureManager Integration Test Start ---");

    const measureManager = gameEngine.getMeasureManager();
    const uiEngine = gameEngine.getUIEngine();
    const mapManager = gameEngine.getMapManager();

    let testCount = 0;
    let passCount = 0;

    testCount++;
    const initialTileSize = measureManager.get('tileSize');
    const initialMapGridCols = measureManager.get('mapGrid.cols');
    const initialMapPanelWidthRatio = measureManager.get('ui.mapPanelWidthRatio');

    const uiInitialMapPanelWidth = uiEngine.getMapPanelDimensions().width;
    const mapInitialTileSize = mapManager.getTileSize();
    const mapInitialGridCols = mapManager.getGridDimensions().cols;

    if (uiInitialMapPanelWidth > 0 && mapInitialTileSize === initialTileSize && mapInitialGridCols === initialMapGridCols) {
        console.log("Integration Test: Initial dimensions loaded correctly. [PASS]");
        passCount++;
    } else {
        console.error("Integration Test: Initial dimensions mismatch. [FAIL]");
    }

    testCount++;
    const newTileSize = 256;
    const newMapGridCols = 20;
    const newMapPanelWidthRatio = 0.5;

    measureManager.set('tileSize', newTileSize);
    measureManager.set('mapGrid.cols', newMapGridCols);
    measureManager.set('ui.mapPanelWidthRatio', newMapPanelWidthRatio);

    uiEngine.recalculateUIDimensions();
    mapManager.recalculateMapDimensions();

    const uiNewMapPanelWidth = uiEngine.getMapPanelDimensions().width;
    const mapNewTileSize = mapManager.getTileSize();
    const mapNewGridCols = mapManager.getGridDimensions().cols;

    const expectedUIMapPanelWidth = gameEngine.getRenderer().canvas.width * newMapPanelWidthRatio;

    if (mapNewTileSize === newTileSize && mapNewGridCols === newMapGridCols && uiNewMapPanelWidth === expectedUIMapPanelWidth) {
        console.log("Integration Test: Dimensions updated correctly after MeasureManager change. [PASS]");
        passCount++;
    } else {
        console.error("Integration Test: Dimensions did not update as expected. [FAIL]");
        console.error(`Expected Map Tile Size: ${newTileSize}, Actual: ${mapNewTileSize}`);
        console.error(`Expected Map Grid Cols: ${newMapGridCols}, Actual: ${mapNewGridCols}`);
        console.error(`Expected UI Map Panel Width: ${expectedUIMapPanelWidth}, Actual: ${uiNewMapPanelWidth}`);
    }

    console.log(`--- MeasureManager Integration Test End: ${passCount}/${testCount} tests passed ---`);
}
