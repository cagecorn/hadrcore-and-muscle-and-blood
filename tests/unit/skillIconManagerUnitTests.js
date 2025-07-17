// tests/unit/skillIconManagerUnitTests.js

import { SkillIconManager } from '../../js/managers/SkillIconManager.js';
import { GAME_DEBUG_MODE } from '../../js/constants.js';

export function runSkillIconManagerUnitTests(assetLoaderManager, idManager) {
    console.log("--- SkillIconManager Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockAssetLoaderManager = assetLoaderManager || {
        loadImage: async (assetId, url) => {
            if (GAME_DEBUG_MODE) console.log(`[MockAssetLoaderManager] Loading mock image: ${assetId} from ${url}`);
            return { src: url, width: 32, height: 32 };
        },
        getImage: (assetId) => {
            if (assetId === 'icon_skill_warrior_charge') return { src: 'assets/icons/skills/charge.png' };
            if (assetId === 'icon_status_poison') return { src: 'assets/icons/status_effects/poison.png' };
            return undefined;
        }
    };

    const mockIdManager = idManager || {};

    testCount++;
    try {
        const sim = new SkillIconManager(mockAssetLoaderManager, mockIdManager);
        if (sim.assetLoaderManager === mockAssetLoaderManager && sim.skillIcons instanceof Map) {
            console.log("SkillIconManager: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("SkillIconManager: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("SkillIconManager: Error during initialization. [FAIL]", e);
    }

    testCount++;
    try {
        const sim = new SkillIconManager(mockAssetLoaderManager, mockIdManager);
        await sim._loadDefaultSkillIcons();
        const expectedIconCount = 5 + 5;
        if (sim.skillIcons.size === expectedIconCount && sim.skillIcons.has('skill_warrior_charge')) {
            console.log("SkillIconManager: _loadDefaultSkillIcons loaded icons correctly. [PASS]");
            passCount++;
        } else {
            console.error(`SkillIconManager: _loadDefaultSkillIcons failed. Expected ${expectedIconCount} icons, got ${sim.skillIcons.size}. [FAIL]`);
        }
    } catch (e) {
        console.error("SkillIconManager: Error during _loadDefaultSkillIcons test. [FAIL]", e);
    }

    testCount++;
    try {
        const sim = new SkillIconManager(mockAssetLoaderManager, mockIdManager);
        await sim._loadDefaultSkillIcons();
        const icon = sim.getSkillIcon('skill_warrior_charge');
        if (icon && icon.src && icon.src.includes('charge.png')) {
            console.log("SkillIconManager: getSkillIcon returned correct icon. [PASS]");
            passCount++;
        } else {
            console.error("SkillIconManager: getSkillIcon failed to return correct icon. [FAIL]", icon);
        }
    } catch (e) {
        console.error("SkillIconManager: Error during getSkillIcon (existing) test. [FAIL]", e);
    }

    testCount++;
    try {
        const sim = new SkillIconManager(mockAssetLoaderManager, mockIdManager);
        await sim._loadDefaultSkillIcons();
        const icon = sim.getSkillIcon('non_existent_skill_icon');
        if (icon && icon.src && icon.src.startsWith('data:image')) {
            console.log("SkillIconManager: getSkillIcon returned placeholder for non-existent icon. [PASS]");
            passCount++;
        } else {
            console.error("SkillIconManager: getSkillIcon failed to return placeholder for non-existent icon. [FAIL]", icon);
        }
    } catch (e) {
        console.error("SkillIconManager: Error during getSkillIcon (non-existent) test. [FAIL]", e);
    }

    console.log(`--- SkillIconManager Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
