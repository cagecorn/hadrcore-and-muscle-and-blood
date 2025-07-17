// js/managers/SkillIconManager.js

import { GAME_DEBUG_MODE } from '../constants.js';
import { WARRIOR_SKILLS } from '../../data/warriorSkills.js';
import { STATUS_EFFECTS } from '../../data/statusEffects.js';

export class SkillIconManager {
    /**
     * SkillIconManager를 초기화합니다.
     * @param {AssetLoaderManager} assetLoaderManager - 이미지 에셋 로드를 위한 AssetLoaderManager 인스턴스
     * @param {IdManager} idManager - 스킬 데이터를 조회할 IdManager 인스턴스
     */
    constructor(assetLoaderManager, idManager) {
        if (GAME_DEBUG_MODE) console.log("\uD83D\uDDBC\uFE0F SkillIconManager initialized. Ready to fetch skill icons. \uD83D\uDDBC\uFE0F");
        if (!assetLoaderManager) {
            throw new Error("[SkillIconManager] Missing AssetLoaderManager. Cannot initialize.");
        }
        if (!idManager) {
            throw new Error("[SkillIconManager] Missing IdManager. Cannot initialize.");
        }

        this.assetLoaderManager = assetLoaderManager;
        this.idManager = idManager;
        this.skillIcons = new Map(); // key: skillId, value: HTMLImageElement

        // 아이콘 로드 실패 시 사용할 기본 플레이스홀더 이미지 생성
        this.placeholderIcon = new Image();
        // 투명한 1x1 png 데이터
        this.placeholderIcon.src =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hHgAHggJ/p14WAAAAAElFTkSuQmCC';
    }

    /**
     * 모든 스킬 및 상태 효과 데이터에서 아이콘을 찾아 미리 로드합니다.
     * 이 메서드는 GameEngine의 초기화 과정에서 호출되어야 합니다.
     * @private
     */
    async _loadAllIcons() {
        if (GAME_DEBUG_MODE) console.log("[SkillIconManager] Loading all defined skill and status icons...");
        const allSkillsAndEffects = {
            ...WARRIOR_SKILLS,
            ...STATUS_EFFECTS
            // 나중에 다른 직업 스킬도 여기에 추가: ...MAGE_SKILLS
        };

        const loadPromises = [];

        for (const key in allSkillsAndEffects) {
            const item = allSkillsAndEffects[key];
            if (item.icon && !this.skillIcons.has(item.id)) {
                const url = item.icon;
                const assetId = `icon_${item.id}`;

                const promise = this.assetLoaderManager.loadImage(assetId, url)
                    .then(img => {
                        this.skillIcons.set(item.id, img);
                        if (GAME_DEBUG_MODE) console.log(`[SkillIconManager] Loaded icon for ${item.id}.`);
                    })
                    .catch(error => {
                        console.error(`[SkillIconManager] Failed to load icon for ${item.id} from ${url}:`, error);
                        this.skillIcons.set(item.id, this.placeholderIcon);
                    });
                loadPromises.push(promise);
            }
        }

        await Promise.all(loadPromises);
        if (GAME_DEBUG_MODE) console.log("[SkillIconManager] All defined icons loading process complete.");
    }

    /**
     * 특정 스킬 ID에 해당하는 아이콘 이미지를 반환합니다.
     * @param {string} skillId - 스킬의 고유 ID (예: 'skill_warrior_battle_cry')
     * @returns {HTMLImageElement | undefined} 스킬 아이콘 이미지 또는 찾을 수 없는 경우 undefined
     */
    getSkillIcon(skillId) {
        if (!skillId) {
            console.warn("[SkillIconManager] getSkillIcon called with null or undefined skillId.");
            return undefined;
        }
        const icon = this.skillIcons.get(skillId);
        if (!icon) {
            if (GAME_DEBUG_MODE) console.warn(`[SkillIconManager] Icon not found for skill ID: ${skillId}. Using placeholder.`);
            return this.placeholderIcon;
        }
        return icon;
    }
}
