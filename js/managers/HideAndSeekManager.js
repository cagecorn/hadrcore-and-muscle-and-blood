// js/managers/HideAndSeekManager.js

/**
 * \uc2fc\uc5d0 \ubcf4\uc774\ub294, \uadf8\ub9ac\uace0 \ubcf4\uc774\uc9c0 \uc54a\uac8c \uc874\uc7ac\ud558\ub294 \ubaa8\ub4e0 \uc694\uc18c\ub97c \ucc3e\uc544\ub0b4\uc5b4
 * \ucf58\uc194\uc5d0 \ubcf4\uace0\ud558\ub294 \ub514\ubc84\uadf9\uc6a9 \ub9e4\ub2c8\uc800\uc785\ub2c8\ub2e4.
 */
export class HideAndSeekManager {
    constructor(gameEngine) {
        console.log("\uD83D\uDD75\uFE0F\u200D♂️ HideAndSeekManager initialized. Let the hide and seek begin!");
        // \ubaa8\ub4e0 \ub9e4\ub2c8\uc800\uc5d0 \uc811\uadfc\ud558\uae30 \uc704\ud574 GameEngine\uc758 \ucc38\uc870\ub97c \uc800\uc7a5\ud569\ub2c8\ub2e4.
        this.gameEngine = gameEngine;
    }

    /**
     * \uc9c0\uc815\ub41c \uc2fc\uc758 \ud604\uc7ac \uc0c1\ud0dc\ub97c \uc2a4\uce94\ud558\uace0 \ucf58\uc194\uc5d0 \ubcf4\uace0\ud569\ub2c8\ub2e4.
     * @param {string} sceneName - \uc2a4\uce94\ud560 \uc2fc\uc758 \uc774\ub984
     * @param {string} scanTime - \uc2a4\uce94 \uc2dc\uc810 (\uc608: 'before cleanup', 'after cleanup')
     */
    scanScene(sceneName, scanTime) {
        if (!sceneName) return;

        console.group(`%c[\uc228\ubc14\uaf49\uc2dc\ub984 \ub9e4\ub2c8\uc800] \uD83D\uDD75\uFE0F\u200D♂️ "${sceneName}" \uc2fc \uc218\uc0ac\uac74 (${scanTime})`, "color: #ffc107; font-weight: bold;");

        const battleSim = this.gameEngine.getBattleSimulationManager();
        if (battleSim) {
            console.log(`- \uc804\ud22c \uc720\ub2c8\ud2b8 (BattleSimulationManager): ${battleSim.unitsOnGrid.length} \uac1c`);
        }

        const vfx = this.gameEngine.getVFXManager();
        if (vfx) {
            const totalVFX = vfx.activeWeaponDrops.size;
            console.log(`- \uc2dc\uac01 \ud6a8\uacfc (VFXManager): ${totalVFX} \uac1c`);
        }

        const particles = this.gameEngine.getParticleEngine();
        if (particles) {
            console.log(`- \ud30c\ud2f0\ucee4 (ParticleEngine): ${particles.activeParticles.length} \uac1c`);
        }
        
        const animations = this.gameEngine.getAnimationManager();
        if (animations) {
            console.log(`- \ud65c\uc131 \uc560\ub2c8\uba54\uc774\uc158 (AnimationManager): ${animations.activeAnimations.size} \uac1c`);
        }

        const battleLog = this.gameEngine.getBattleLogManager();
        if (battleLog) {
            console.log(`- \uc804\ud22c \ub85c\uadf8 \uba54\uc2dc\uc9c0 (BattleLogManager): ${battleLog.logMessages.length} \uc904`);
        }

        const statusEffects = this.gameEngine.getTurnCountManager();
        if (statusEffects) {
            console.log(`- \uc0c1\ud0dc\uc774\uc0c1 \ud6a8\uacfc (TurnCountManager): ${statusEffects.activeEffects.size} \uc720\ub2c8\ud2b8`);
        }
        
        const territoryUI = this.gameEngine.getTerritoryUIManager ? this.gameEngine.getTerritoryUIManager() : null;
        if (territoryUI) {
            const tooltipVisible = territoryUI.tooltipElement && territoryUI.tooltipElement.style.display !== 'none';
            console.log(`- \uc601\uc9c0 \ud234\ud2b8\ud54f (TerritoryUIManager): ${tooltipVisible ? '\ubcf4\uc784' : '\uc228\uac8c\ub41c'}`);
        }

        console.groupEnd();
    }
}
