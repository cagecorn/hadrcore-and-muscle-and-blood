export const GAME_EVENTS = {
    UNIT_DEATH: 'unitDeath',
    DISPLAY_SKILL_NAME: 'displaySkillName', // 스킬 이름 표시 요청 이벤트
    BATTLE_START: 'battleStart',
    BATTLE_END: 'battleEnd',
    TURN_START: 'turnStart',
    UNIT_TURN_START: 'unitTurnStart',
    UNIT_TURN_END: 'unitTurnEnd',
    UNIT_ATTACK_ATTEMPT: 'unitAttackAttempt',
    BASIC_ATTACK_LANDED: 'basicAttackLanded', // AttackManager에서 사용
    UNIT_MOVED: 'unitMoved', // ✨ 추가
    TURN_PHASE: 'turnPhase',
    DAMAGE_CALCULATED: 'DAMAGE_CALCULATED',
    DISPLAY_DAMAGE: 'displayDamage',
    STATUS_EFFECT_APPLIED: 'statusEffectApplied',
    APPLY_STATUS_EFFECT: 'applyStatusEffect',
    STATUS_EFFECT_REMOVED: 'statusEffectRemoved',
    LOG_MESSAGE: 'logMessage',
    WEAPON_DROPPED: 'weaponDropped',
    UNIT_DISARMED: 'unitDisarmed',
    UNIT_REMOVED_FROM_GRID: 'unitRemovedFromGrid',
    SKILL_EXECUTED: 'skillExecuted', // 스킬이 실행됨
    SKILL_SLOT_ACTIVATED: 'skillSlotActivated', // N번째 스킬 슬롯이 활성화됨
    PASSIVE_SKILL_MAINTAINED: 'passiveSkillMaintained', // 패시브 스킬이 턴마다 유지됨
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
    AI_ACTION_DECIDED: 'aiActionDecided', // JudgementManager에서 사용
    ASSETS_LOADED: 'assetsLoaded'             // ✨ 모든 에셋 로딩 완료 이벤트 추가
};

export const UI_STATES = {
    MAP_SCREEN: 'mapScreen',
    COMBAT_SCREEN: 'combatScreen',
    TAVERN_SCREEN: 'tavernScreen',
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

export const SKILL_TYPE_COLORS = {
    [SKILL_TYPES.BUFF]: 'blue',
    [SKILL_TYPES.DEBUFF]: 'red',
    [SKILL_TYPES.ACTIVE]: 'orange',
    [SKILL_TYPES.REACTION]: 'purple',
    [SKILL_TYPES.PASSIVE]: 'green'
};

export const UNIT_NAME_BG_COLORS = {
    [ATTACK_TYPES.MERCENARY]: 'rgba(0,0,255,0.5)',
    [ATTACK_TYPES.ENEMY]: 'rgba(255,0,0,0.5)'
};

export const GAME_DEBUG_MODE = true; // ✨ 디버그 모드 플래그 (배포 시 false로 설정)
