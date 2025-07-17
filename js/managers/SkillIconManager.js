// js/managers/SkillIconManager.js

import { GAME_DEBUG_MODE } from '../constants.js'; // 디버그 모드 상수 임포트

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

        this._loadDefaultSkillIcons(); // 초기 스킬 아이콘 로드
    }

    /**
     * 기본 스킬 아이콘들을 미리 로드합니다.
     * 이 메서드는 게임 시작 시 호출되어야 합니다.
     * @private
     */
    async _loadDefaultSkillIcons() {
        if (GAME_DEBUG_MODE) console.log("[SkillIconManager] Loading default skill icons...");
        const skillIconPaths = {
            'skill_warrior_charge': 'assets/icons/skills/charge.png',
            'skill_warrior_battle_cry': 'assets/icons/skills/battle_cry.png',
            'skill_warrior_rending_strike': 'assets/icons/skills/rending_strike.png',
            'skill_warrior_retaliate': 'assets/icons/skills/retaliate.png',
            'skill_warrior_iron_will': 'assets/icons/skills/iron_will.png', // ✨ 아이언 윌 스킬 아이콘
            'status_poison': 'assets/icons/status_effects/poison.png',
            'status_stun': 'assets/icons/status_effects/stun.png',
            'status_bleed': 'assets/icons/status_effects/bleed.png', // ✨ 출혈 아이콘 경로 추가
            'status_berserk': 'assets/icons/status_effects/berserk.png',
            'status_battle_cry': 'assets/icons/skills/battle_cry.png', // ✨ 버프 아이콘 등록
            'status_disarmed': 'assets/icons/status_effects/disarmed.png'
        };

        const loadPromises = [];
        for (const skillId in skillIconPaths) {
            const url = skillIconPaths[skillId];
            loadPromises.push(
                this.assetLoaderManager.loadImage(`icon_${skillId}`, url)
                    .then(img => {
                        this.skillIcons.set(skillId, img);
                        if (GAME_DEBUG_MODE) console.log(`[SkillIconManager] Loaded icon for ${skillId}.`);
                    })
                    .catch(error => {
                        console.error(`[SkillIconManager] Failed to load icon for ${skillId} from ${url}:`, error);
                        this.skillIcons.set(skillId, this.placeholderIcon);
                    })
            );
        }
        await Promise.all(loadPromises);
        if (GAME_DEBUG_MODE) console.log("[SkillIconManager] Default skill icon loading complete.");
    }

    /**
     * 특정 스킬 ID에 해당하는 아이콘 이미지를 반환합니다.
     * @param {string} skillId - 스킬의 고유 ID (예: 'skill_warrior_charge')
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
