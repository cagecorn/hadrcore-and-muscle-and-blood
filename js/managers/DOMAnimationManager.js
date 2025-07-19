export class DOMAnimationManager {
    constructor(containerId, battleSimulationManager) {
        console.log("\uD83C\uDFAC DOMAnimationManager initialized. Handling temporary animated elements. \uD83C\uDFAC");
        this.container = document.getElementById(containerId);
        this.battleSimulationManager = battleSimulationManager;
        this.animatedElements = []; // { element, unitId, startTime, duration, yOffset }
    }

    /**
     * Add a new animated DOM element.
     * @param {string} unitId - Target unit ID
     * @param {string} text - Text to display
     * @param {string} className - CSS class to apply
     * @param {string} color - Text color
     * @param {number} duration - Animation duration in ms
     * @param {number} yOffset - Y offset relative to unit
     */
    add(unitId, text, className, color, duration = 1000, yOffset = 0) {
        if (!this.container) return;

        const element = document.createElement('div');
        element.className = className;
        element.textContent = text;
        element.style.color = color;
        element.style.animationDuration = `${duration}ms`;

        this.container.appendChild(element);

        this.animatedElements.push({
            element,
            unitId,
            startTime: performance.now(),
            duration,
            yOffset
        });
    }

    update() {
        if (!this.battleSimulationManager) return;

        const now = performance.now();
        const { effectiveTileSize, gridOffsetX, gridOffsetY } = this.battleSimulationManager.getGridRenderParameters();

        for (let i = this.animatedElements.length - 1; i >= 0; i--) {
            const item = this.animatedElements[i];

            // Remove if animation is finished
            if (now - item.startTime > item.duration) {
                item.element.remove();
                this.animatedElements.splice(i, 1);
                continue;
            }

            // Update position based on unit location
            const unit = this.battleSimulationManager.getUnitById(item.unitId);
            if (unit) {
                const { drawX, drawY } = this.battleSimulationManager.animationManager.getRenderPosition(
                    unit.id,
                    unit.gridX,
                    unit.gridY,
                    effectiveTileSize,
                    gridOffsetX,
                    gridOffsetY
                );

                const xPos = drawX + effectiveTileSize / 2;
                const yPos = drawY - item.yOffset;

                item.element.style.transform = `translate(-50%, -100%) translate(${xPos}px, ${yPos}px)`;
            }
        }
    }

    clearAll() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.animatedElements = [];
    }
}
