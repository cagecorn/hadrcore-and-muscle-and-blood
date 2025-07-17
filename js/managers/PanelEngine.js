// js/managers/PanelEngine.js

export class PanelEngine {
    constructor() {
        console.log("\uD83D\uDD33 PanelEngine initialized. Ready to manage various game panels. \uD83D\uDD33");
        this.panels = new Map();
    }

    /**
     * \ud328\ub110\uc744 \ub4f1\ub85d\ud569\ub2c8\ub2e4.
     * @param {string} name - \ud328\ub110\uc758 \uace0\uc720 \uc774\ub984 (\uc608: 'mercenaryPanel')
     * @param {object} panelInstance - \uadf8\ub9ac\uae30 \uba54\uc11c\ub4dc(draw)\ub97c \uac16\uc740 \ud328\ub110 \ub9e4\ub2c8\uc800 \uc778\uc2a4\ud134\uc2a4
     */
    registerPanel(name, panelInstance) {
        if (!panelInstance || typeof panelInstance.draw !== 'function') {
            console.error(`[PanelEngine] Cannot register panel '${name}'. It must have a 'draw' method.`);
            return;
        }
        this.panels.set(name, panelInstance);
        console.log(`[PanelEngine] Panel '${name}' registered.`);
    }

    /**
     * \ud2b9\uc815 \ud328\ub110\uc744 \uadf8\ub9b4\uac83\uc785\ub2c8\ub2e4. LayerEngine\uc5d0 \uc758\ud574 \ud638\ucd9c\ub429\ub2c8\ub2e4.
     * PanelEngine\uc740 \ud328\ub110 \uc790\uccb4 \uce90\ubc84\uc2a4\uc5d0 \uadf8\ub9b0\uc758 \ucc45\uc784\uc744 \ud328\ub110 \uc778\uc2a4\ud134\uc2a4\uc5d0 \uc704\uc784\ud569\ub2c8\ub2e4.
     * @param {string} panelName - \uadf8\ub9ac\ub294 \ud328\ub110\uc758 \uc774\ub984
     * @param {CanvasRenderingContext2D} ctx - \ud328\ub110 \uce90\ubc84\uc2a4\uc758 2D \ub80c\ub354\ub9c1 \ucee8\ud2b8\ub799\uc2a4
     */
    drawPanel(panelName, ctx) {
        const panel = this.panels.get(panelName);
        if (panel) {
            // PanelEngine은 이제 패널 컨텍스트를 직접 전달하고, MercenaryPanelManager는 PanelEngine을 통해 그려지지 않습니다.
            // 따라서 이곳에서는 BattleLogManager만 예상됩니다.
            panel.draw(ctx);
        } else {
            console.warn(`[PanelEngine] Panel '${panelName}' not found.`);
        }
    }
}
