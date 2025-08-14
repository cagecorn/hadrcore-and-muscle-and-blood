import { statusEffectManager } from '../utils/StatusEffectManager.js';
import { tokenEngine } from '../utils/TokenEngine.js';
import { statusEffects } from '../data/status-effects.js';
import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';
import { cooldownManager } from '../utils/CooldownManager.js';
import { battleSimulatorEngine } from '../utils/BattleSimulatorEngine.js';
import { logDownloader } from '../utils/LogDownloader.js';
import { debugLogEngine } from '../utils/DebugLogEngine.js';
import { partyEngine } from '../utils/PartyEngine.js';
import { monsterEngine } from '../utils/MonsterEngine.js';

/**
 * 전투 중 활성화된 유닛의 상세 정보를 표시하는 하단 UI 매니저 (최적화 버전)
 * UI 구조를 한 번만 생성한 뒤 DOM 노드 참조를 캐시하여 필요한 부분만 갱신합니다.
 * 기존 구현은 턴마다 UI 전체를 다시 그려 성능 부담이 컸으나, 이제는 캐시된 노드를
 * 재사용하여 최소한의 조작만 수행합니다.
 */
export class CombatUIManager {
    constructor(battleSpeedManager) {
        this.container = document.getElementById('combat-ui-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'combat-ui-container';
            document.getElementById('ui-container').appendChild(this.container);
        }
        
        this.battleSpeedManager = battleSpeedManager;
        this.currentUnitId = null; // 현재 표시 중인 유닛 ID
        this.skillIcons = [];      // 스킬 아이콘 요소들을 저장할 배열

        // UI 구조를 미리 생성합니다.
        this._createBaseLayout();
        this._setupInstantResultButton();
        this.container.style.display = 'none'; // 초기에는 숨김
    }

    /**
     * UI의 기본 구조를 최초 한 번만 생성합니다.
     * @private
     */
    _createBaseLayout() {
        this.container.innerHTML = ''; // 혹시 모를 이전 내용 초기화

        // 1. 왼쪽 정보 패널
        const infoPanel = document.createElement('div');
        infoPanel.className = 'combat-info-panel';

        const topRow = document.createElement('div');
        topRow.className = 'combat-top-row';

        this.nameElem = document.createElement('div');
        this.nameElem.className = 'unit-name-level';
        
        this.healthBarContainer = document.createElement('div');
        this.healthBarContainer.className = 'combat-health-bar-container';

        // ✨ 배리어 바 추가
        this.barrierBar = document.createElement('div');
        this.barrierBar.className = 'combat-barrier-bar';

        this.healthBar = document.createElement('div');
        this.healthBar.className = 'combat-health-bar';
        this.hpLabel = document.createElement('span');
        this.hpLabel.className = 'unit-stats';
        this.healthBarContainer.appendChild(this.barrierBar); // 배리어 바를 먼저 추가
        this.healthBarContainer.appendChild(this.healthBar);
        this.healthBarContainer.appendChild(this.hpLabel);

        this.effectsContainer = document.createElement('div');
        this.effectsContainer.className = 'unit-effects';

        topRow.appendChild(this.nameElem);
        topRow.appendChild(this.healthBarContainer);
        topRow.appendChild(this.effectsContainer);

        const bottomRow = document.createElement('div');
        bottomRow.className = 'combat-bottom-row';

        this.tokenContainer = document.createElement('div');
        this.tokenContainer.className = 'combat-token-container';
        
        this.skillContainer = document.createElement('div');
        this.skillContainer.className = 'combat-skill-container';

        bottomRow.appendChild(this.tokenContainer);
        bottomRow.appendChild(this.skillContainer);

        infoPanel.appendChild(topRow);
        infoPanel.appendChild(bottomRow);

        // 2. 오른쪽 패널 (초상화 + 속도 버튼)
        this.portraitPanel = document.createElement('div');
        this.portraitPanel.className = 'combat-portrait-panel';

        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'battle-controls';

        this.speedButton = document.createElement('button');
        this.speedButton.id = 'battle-speed-button';
        this.speedButton.className = 'battle-control-button';
        this.speedButton.innerText = '1x';
        this.speedButton.onclick = () => {
            const newSpeed = this.battleSpeedManager.cycleSpeed();
            this.speedButton.innerText = `${newSpeed}x`;
        };

        this.instantResultButton = document.createElement('button');
        this.instantResultButton.id = 'instant-result-btn';
        this.instantResultButton.textContent = '전투 종료 결과';
        this.instantResultButton.className = 'battle-control-button';
        controlsContainer.appendChild(this.speedButton);
        controlsContainer.appendChild(this.instantResultButton);

        const rightPanel = document.createElement('div');
        rightPanel.className = 'combat-right-panel';
        rightPanel.appendChild(this.portraitPanel);
        rightPanel.appendChild(controlsContainer);

        this.container.appendChild(infoPanel);
        this.container.appendChild(rightPanel);
    }

    _setupInstantResultButton() {
        if (!this.instantResultButton) return;
        this.instantResultButton.addEventListener('click', async () => {
            console.log('전투 시뮬레이션을 시작합니다...');
            debugLogEngine.log('UI', '전투 시뮬레이션 시작');
            this.instantResultButton.disabled = true;
            this.instantResultButton.textContent = '시뮬레이션 중...';

            try {
                const allies = partyEngine.getDeployedMercenaries();
                const enemies = monsterEngine.getAllMonsters('enemy');

                const battleLog = await battleSimulatorEngine.runFullSimulation(allies, enemies);

                logDownloader.download(battleLog, 'battle-simulation-log.json');

                console.log('전투 시뮬레이션이 완료되었습니다. 로그 파일을 확인하세요.');
            } catch (error) {
                console.error('전투 시뮬레이션 중 오류 발생:', error);
                debugLogEngine.error('UI', '전투 시뮬레이션 중 오류 발생', error);
            } finally {
                this.instantResultButton.disabled = false;
                this.instantResultButton.textContent = '전투 종료 결과';
            }
        });
    }

    /**
     * 특정 유닛의 정보로 UI를 표시하거나 업데이트합니다.
     * 매 호출마다 체력, 토큰, 버프 상태를 갱신하고, 턴이 변경된 경우에만
     * 이름 및 스킬 아이콘 등을 새로 설정합니다.
     * @param {object} unit - 표시할 유닛 데이터
     */
    show(unit) {
        if (!unit) {
            this.hide();
            return;
        }

        // 턴이 바뀌었을 때만 고정 정보(이름, 초상화, 스킬 아이콘)를 업데이트합니다.
        if (this.currentUnitId !== unit.uniqueId) {
            this.currentUnitId = unit.uniqueId;

            this.nameElem.innerText = `${unit.instanceName} - Lv. ${unit.level}`;
            if (unit.uiImage) {
                this.portraitPanel.style.backgroundImage = `url(${unit.uiImage})`;
                this.portraitPanel.innerText = '';
            } else {
                this.portraitPanel.style.backgroundImage = 'none';
                this.portraitPanel.innerText = '?';
            }
            this._createSkillIcons(unit); // 스킬 아이콘 틀 생성
        }
        
        // 매번 업데이트가 필요한 정보들
        this.updateHealthAndBarrier(unit);
        this.updateTokens(unit);
        this.updateEffects(unit);
        this.updateSkills(unit); // 쿨타임 등 업데이트

        this.container.style.display = 'flex';
    }

    /**
     * UI를 숨깁니다.
     * 컨테이너를 비활성화하며 현재 표시 중이던 유닛 정보를 초기화합니다.
     */
    hide() {
        this.container.style.display = 'none';
        this.currentUnitId = null; // 숨겨질 때 현재 유닛 ID 초기화
    }

    /**
     * 유닛의 체력 정보를 업데이트합니다.
     * 라벨과 체력바 너비를 새로 계산하여 반영합니다.
     * @param {object} unit
     */
    updateHealthAndBarrier(unit) {
        this.hpLabel.innerText = `${Math.max(0, unit.currentHp)} / ${unit.finalStats.hp}`;
        const healthPercentage = (unit.currentHp / unit.finalStats.hp) * 100;
        this.healthBar.style.width = `${Math.max(0, healthPercentage)}%`;
        
        const barrierPercentage = (unit.currentBarrier / unit.maxBarrier) * 100;
        this.barrierBar.style.width = `${Math.max(0, barrierPercentage)}%`;
    }

    /**
     * 유닛의 토큰 아이콘을 업데이트합니다.
     * 실제 토큰 수와 현재 DOM 상태를 비교하여 필요할 때만 노드를 재생성합니다.
     * @param {object} unit
     */
    updateTokens(unit) {
        const currentTokens = tokenEngine.getTokens(unit.uniqueId);
        // DOM 조작을 최소화하기 위해 현재 아이콘 수와 비교합니다.
        if (this.tokenContainer.children.length !== currentTokens) {
            this.tokenContainer.innerHTML = ''; // 간단하게 비우고 다시 채웁니다.
            for (let i = 0; i < currentTokens; i++) {
                const tokenImg = document.createElement('img');
                tokenImg.src = 'assets/images/battle/token.png';
                tokenImg.className = 'combat-token-icon';
                this.tokenContainer.appendChild(tokenImg);
            }
        }
    }


    /**
     * 유닛의 버프/디버프/패시브 효과 아이콘을 업데이트합니다.
     * 상태효과 목록과 장착 패시브를 조회하여 아이콘을 다시 렌더링합니다.
     * @param {object} unit
     */
    updateEffects(unit) {
        this.effectsContainer.innerHTML = ''; // 매번 새로 그리는 것이 간단하고 효율적입니다.

        const activeEffects = statusEffectManager.activeEffects.get(unit.uniqueId) || [];
        activeEffects.forEach(effect => {
            const effectDef = statusEffects[effect.id];
            if (effectDef) {
                const icon = this.createEffectIcon(
                    effectDef.iconPath, 
                    `${effectDef.name} (${effect.duration}턴 남음)`,
                    effect.duration
                );
                this.effectsContainer.appendChild(icon);
            }
        });
        
        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        equipped.forEach(instId => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            const skillData = skillInventoryManager.getSkillData(inst.skillId, inst.grade);
            if (skillData && skillData.type === 'PASSIVE') {
                const icon = this.createEffectIcon(skillData.illustrationPath, `${skillData.name} (패시브)`);
                this.effectsContainer.appendChild(icon);
            }
        });
    }

    /**
     * 유닛의 스킬 아이콘 틀을 생성합니다. (턴 변경 시 1회 호출)
     * 해당 턴의 장착 스킬을 순회하며 아이콘과 쿨타임 오버레이 노드를 준비합니다.
     * @param {object} unit
     * @private
     */
    _createSkillIcons(unit) {
        this.skillContainer.innerHTML = '';
        this.skillIcons = []; // 아이콘 참조 배열 초기화

        const equipped = ownedSkillsManager.getEquippedSkills(unit.uniqueId);
        equipped.forEach(instId => {
            if (!instId) return;
            const inst = skillInventoryManager.getInstanceData(instId);
            const skillData = skillInventoryManager.getSkillData(inst.skillId, inst.grade);
            if (!skillData) return;

            const icon = document.createElement('div');
            icon.className = 'combat-skill-icon';
            icon.style.backgroundImage = `url(${skillData.illustrationPath})`;
            
            const overlay = document.createElement('div');
            overlay.className = 'skill-cooldown-overlay';
            icon.appendChild(overlay);

            this.skillContainer.appendChild(icon);
            this.skillIcons.push({ 
                skillId: skillData.id, 
                overlayElem: overlay 
            });
        });
    }

    /**
     * 유닛의 스킬 쿨타임을 업데이트합니다. (매번 호출)
     * 캐싱된 아이콘 정보와 쿨다운 매니저를 사용해 오버레이 텍스트를 조정합니다.
     * @param {object} unit
     */
    updateSkills(unit) {
        this.skillIcons.forEach(iconInfo => {
            const remaining = cooldownManager.getRemaining(unit.uniqueId, iconInfo.skillId);
            if (remaining > 0) {
                iconInfo.overlayElem.innerText = remaining;
                iconInfo.overlayElem.style.display = 'flex';
            } else {
                iconInfo.overlayElem.style.display = 'none';
            }
        });
    }

    /**
     * 효과 아이콘 생성 유틸리티.
     * 경로와 툴팁, 남은 지속 턴 정보를 받아 DOM 요소를 구성합니다.
     */
    createEffectIcon(path, tooltipText, duration = null) {
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'effect-icon-wrapper';
        iconWrapper.title = tooltipText; 

        const icon = document.createElement('img');
        icon.className = 'effect-icon';
        icon.src = path;
        iconWrapper.appendChild(icon);

        if (duration !== null) {
            const durationText = document.createElement('span');
            durationText.className = 'effect-duration';
            durationText.innerText = duration;
            iconWrapper.appendChild(durationText);
        }
        return iconWrapper;
    }

    /**
     * UI와 관련된 모든 리소스를 정리합니다.
     * 외부에서 매니저를 파기할 때 호출하여 DOM 노드를 깔끔하게 제거합니다.
     */
    destroy() {
        this.hide();
        this.container.innerHTML = '';
    }
}
