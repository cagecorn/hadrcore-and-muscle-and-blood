export const GAME_EVENTS = {
    UNIT_DEATH: 'unitDeath',
    SKILL_EXECUTED: 'skillExecuted',
    BATTLE_START: 'battleStart',
    BATTLE_END: 'battleEnd',
    TURN_START: 'turnStart',
    UNIT_TURN_START: 'unitTurnStart',
    UNIT_TURN_END: 'unitTurnEnd',
    UNIT_ATTACK_ATTEMPT: 'unitAttackAttempt',
    TURN_PHASE: 'turnPhase',
    DAMAGE_CALCULATED: 'DAMAGE_CALCULATED',
    DISPLAY_DAMAGE: 'displayDamage',
    STATUS_EFFECT_APPLIED: 'statusEffectApplied',
    STATUS_EFFECT_REMOVED: 'statusEffectRemoved',
    LOG_MESSAGE: 'logMessage',
    WEAPON_DROPPED: 'weaponDropped',
    UNIT_DISARMED: 'unitDisarmed',
    REQUEST_STATUS_EFFECT_APPLICATION: 'requestStatusEffectApplication',
    DRAG_START: 'dragStart',
    DRAG_MOVE: 'dragMove',
    DROP: 'drop',
    DRAG_CANCEL: 'dragCancel',
    SYNERGY_ACTIVATED: 'synergyActivated',   // 이전 요청에 의해 추가된 코드
    SYNERGY_DEACTIVATED: 'synergyDeactivated', // 이전 요청에 의해 추가된 코드
    CANVAS_MOUSE_MOVED: 'canvasMouseMoved', // ✨ 마우스 이동 이벤트 추가
    CRITICAL_ERROR: 'criticalError', // ✨ 심각한 오류 발생 시 발행될 이벤트
    ASSET_LOAD_PROGRESS: 'assetLoadProgress', // ✨ 에셋 로딩 진행 이벤트 추가
    ASSETS_LOADED: 'assetsLoaded'             // ✨ 모든 에셋 로딩 완료 이벤트 추가
};

export const UI_STATES = {
    MAP_SCREEN: 'mapScreen',
    COMBAT_SCREEN: 'combatScreen',
    HERO_PANEL_OVERLAY: 'heroPanelOverlay'
};

export const BUTTON_IDS = {
    // 캔버스에 그려지는 버튼 ID (현재는 사용하지 않음)
    // BATTLE_START: 'battleStartButton',

    // HTML 버튼 ID
    TOGGLE_HERO_PANEL: 'toggleHeroPanelBtn',
    BATTLE_START_HTML: 'battleStartHtmlBtn'
};

export const ATTACK_TYPES = {
    MELEE: 'melee',
    PHYSICAL: 'physical',
    MAGIC: 'magic',
    STATUS_EFFECT: 'statusEffect',
    MERCENARY: 'mercenary',
    ENEMY: 'enemy'
};

export const SKILL_TYPES = {
    ACTIVE: 'active',
    PASSIVE: 'passive',
    DEBUFF: 'debuff',
    REACTION: 'reaction',
    BUFF: 'buff'
};

export const GAME_DEBUG_MODE = true; // ✨ 디버그 모드 플래그 (배포 시 false로 설정)
