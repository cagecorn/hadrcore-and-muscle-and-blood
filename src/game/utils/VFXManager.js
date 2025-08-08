import { debugLogEngine } from './DebugLogEngine.js';
// tokenEngine을 import하여 현재 토큰 개수를 가져옵니다.
import { tokenEngine } from './TokenEngine.js';
import { comboManager } from './ComboManager.js';
// ✨ 열망 엔진을 import하여 열망 수치를 가져옵니다.
import { aspirationEngine, ASPIRATION_STATE } from './AspirationEngine.js';
import { IconManager } from './IconManager.js';

/**
 * 체력바, 데미지 텍스트 등 전투 시각 효과(VFX)를 생성하고 관리하는 엔진
 */
export class VFXManager {
    constructor(scene, textEngine, bindingManager) {
        this.scene = scene;
        this.textEngine = textEngine;
        this.bindingManager = bindingManager;

        // 시각 효과들을 담을 레이어를 생성하여 깊이(depth)를 관리합니다.
        this.vfxLayer = this.scene.add.layer().setDepth(100);
        this.iconManager = new IconManager(scene, this.vfxLayer); // IconManager 인스턴스 생성

        // key: unitId, value: { container, tokens: [] }
        this.activeTokenDisplays = new Map();
        // ✨ 체력/배리어/열망 바 객체를 저장합니다.
        this.unitBars = new Map();

        debugLogEngine.log('VFXManager', 'VFX 매니저가 초기화되었습니다.');
    }

    // ▼▼▼ [신규] 마법 공격 파티클 효과 메서드 추가 ▼▼▼
    /**
     * 마법 공격의 임팩트 효과를 파티클로 생성합니다.
     * @param {number} x - 효과가 나타날 x 좌표
     * @param {number} y - 효과가 나타날 y 좌표
     * @param {string} textureKey - 사용할 파티클 텍스처 키 (예: 'placeholder')
     */
    createMagicImpact(x, y, textureKey = 'placeholder') {
        const particles = this.scene.add.particles(x, y, textureKey, {
            speed: 0, // 파티클이 날아가지 않고 제자리에서 효과를 냅니다.
            scale: { start: 0, end: 0.5, ease: 'Quad.easeOut' }, // 0에서 시작해 0.5배 크기로 커집니다.
            alpha: { start: 1, end: 0, ease: 'Quad.easeIn' },   // 100% 불투명도에서 시작해 투명해집니다.
            lifespan: 600, // 0.6초 동안 지속됩니다.
            blendMode: 'ADD', // 빛나는 효과를 위해 ADD 블렌드 모드를 사용합니다.
            emitting: false
        });
        particles.explode(1); // 파티클 1개를 즉시 터뜨립니다.
        this.vfxLayer.add(particles);

        // 파티클 객체가 자동으로 소멸되도록 타이머를 설정합니다.
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }
    // ▲▲▲ [신규] 마법 공격 파티클 효과 메서드 추가 ▲▲▲

    // ✨ createBloodSplatter 함수 추가
    createBloodSplatter(x, y) {
        const particles = this.scene.add.particles(x, y, 'red-particle', {
            speed: { min: 100, max: 300 },
            angle: { min: 180, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 600,
            gravityY: 800,
            blendMode: 'ADD',
            emitting: false
        });
        particles.explode(16);
        this.vfxLayer.add(particles);
    }

    setBattleSimulator(simulator) {
        this.battleSimulator = simulator;
    }

    /**
     * 유닛의 모든 UI 요소를 생성하고 위치를 설정한 뒤 바인딩합니다.
     * @param {object} unit - 대상 유닛
     * @param {Phaser.GameObjects.Text} nameTag - 유닛의 이름표 객체
     */
    setupUnitVFX(unit, nameTag) {
        const unitId = unit.uniqueId;
        // ✨ 2. 체력/열망바 너비를 절반으로 줄입니다.
        const barWidth = 4;
        const barHeight = 80;
        // 기존에는 바가 스프라이트 바깥쪽에 위치했으나, 보다 밀착된 UI를 위해
        // 스프라이트 내부로 10px 들여보냅니다.
        const xOffset = unit.sprite.displayWidth / 2 - 10;
        const healthYOffset = 25;
        const aspirationYOffset = 15;

        // 1. 체력 및 배리어 바 생성 (유닛 왼쪽)
        // ✨ 2. 투명도를 50%로 설정합니다.
        const healthBar = this.createVerticalBar(unit.sprite, -xOffset, barHeight, barWidth, 0x282c34, 0x22c55e, 0.5, healthYOffset);
        const barrierBar = this.createVerticalBar(unit.sprite, -xOffset, barHeight, barWidth, 0x282c34, 0xffd700, 0.5, healthYOffset);

        // 2. 열망 게이지 생성 (유닛 오른쪽)
        // ✨ 2. 투명도를 50%로 설정합니다.
        const aspirationBar = this.createVerticalBar(unit.sprite, xOffset, barHeight, barWidth, 0x282c34, 0x8b5cf6, 0.5, aspirationYOffset);

        this.unitBars.set(unitId, { healthBar, barrierBar, aspirationBar });

        // 3. 토큰 디스플레이 초기화
        this.updateTokenDisplay(unit, nameTag);
        const tokenDisplay = this.activeTokenDisplays.get(unitId);

        // 4. 아이콘 디스플레이 생성 및 바인딩
        const iconContainers = this.iconManager.createIconDisplay(unit.sprite);

        // 5. 생성된 모든 UI 요소를 유닛 스프라이트에 바인딩
        this.bindingManager.bind(unit.sprite, [
            nameTag,
            healthBar.container,
            barrierBar.container,
            aspirationBar.container,
            tokenDisplay.container,
            iconContainers.buffsContainer,
            iconContainers.debuffsContainer,
        ]);
    }

    /**
     * [✨ 신규 추가]
     * 특정 유닛의 토큰 개수에 맞춰 화면에 토큰 아이콘을 업데이트합니다.
     * @param {object} unit - 대상 유닛
     */
    updateTokenDisplay(unit, nameTag) {
        if (!unit || !unit.sprite || !unit.sprite.active) return;

        const unitId = unit.uniqueId;
        let display = this.activeTokenDisplays.get(unitId);

        // 유닛의 토큰 UI가 없다면 새로 생성합니다.
        if (!display) {
            const nameTagWidth = nameTag.width * nameTag.scaleX;
            const offsetX = nameTagWidth / 2 + 5;
            const offsetY = nameTag.y - unit.sprite.y;

            const container = this.scene.add.container(unit.sprite.x + offsetX, unit.sprite.y + offsetY);
            this.vfxLayer.add(container);
            this.bindingManager.bind(unit.sprite, [container]);

            display = { container, tokens: [] };
            this.activeTokenDisplays.set(unitId, display);
        } else {
            const nameTagWidth = nameTag.width * nameTag.scaleX;
            const offsetX = nameTagWidth / 2 + 5;
            const offsetY = nameTag.y - unit.sprite.y;
            display.container.setData('offsetX', offsetX);
            display.container.setData('offsetY', offsetY);
        }

        const tokenCount = tokenEngine.getTokens(unitId);

        // 토큰 개수에 변화가 없으면 업데이트하지 않습니다.
        if (display.tokens.length === tokenCount) return;

        // 기존 토큰 아이콘들을 모두 제거합니다.
        display.tokens.forEach(token => token.destroy());
        display.tokens = [];

        const tokenOverlap = 10;
        for (let i = 0; i < tokenCount; i++) {
            const tokenImage = this.scene.add.image(i * tokenOverlap, 0, 'token').setScale(0.04);
            display.container.add(tokenImage);
            display.tokens.push(tokenImage);
        }
    }

    /**
     * 얇은 세로 바 UI를 생성합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite - 위치 기준 스프라이트
     * @param {number} xOffset - parentSprite 중심으로부터의 x축 거리
     * @param {number} height - 바의 최대 높이
     * @param {number} width - 바의 너비
     * @param {number} bgColor - 배경색
     * @param {number} barColor - 전경색
     * @param {number} bgAlpha - 배경 투명도 (기본값 0.7)
     * @returns {{container: Phaser.GameObjects.Container, bar: Phaser.GameObjects.Graphics}}
     */
    createVerticalBar(parentSprite, xOffset, height, width, bgColor, barColor, bgAlpha = 0.7, yOffset = 0) {
        const container = this.scene.add.container(parentSprite.x + xOffset, parentSprite.y - yOffset);
        this.vfxLayer.add(container);

        const bg = this.scene.add.graphics().fillStyle(bgColor, bgAlpha).fillRect(-width / 2, -height / 2, width, height);
        // ✨ 2. 게이지 자체도 반투명하게 설정합니다.
        const bar = this.scene.add.graphics().fillStyle(barColor, 0.5).fillRect(-width / 2, -height / 2, width, height);

        container.add([bg, bar]);
        bar.setData('fullHeight', height); // 최대 높이 저장

        return { container, bar };
    }

    /**
     * 유닛의 체력바 표시를 갱신합니다.
     * healthBar는 DOM 요소 또는 Phaser 객체 모음일 수 있습니다.
     * @param {object} healthBar - 업데이트할 체력바 객체
     * @param {number} currentHp - 현재 체력
     * @param {number} maxHp - 최대 체력
     */
    updateHealthBar(unitId, currentHp, maxHp) {
        const bars = this.unitBars.get(unitId);
        if (!bars || !bars.healthBar) return;

        const ratio = (maxHp > 0) ? Math.max(0, Math.min(1, currentHp / maxHp)) : 0;
        const fullHeight = bars.healthBar.bar.getData('fullHeight');

        // ✨ 2. 게이지 너비를 얇게 고정합니다.
        bars.healthBar.bar.clear().fillStyle(0x22c55e, 0.5).fillRect(-2, -fullHeight / 2, 4, fullHeight * ratio);

        // 배리어 업데이트
        const unit = this.battleSimulator.turnQueue.find(u => u.uniqueId === unitId);
        if (unit) {
            const barrierRatio = (unit.maxBarrier > 0) ? Math.max(0, Math.min(1, unit.currentBarrier / unit.maxBarrier)) : 0;
            // ✨ 2. 게이지 너비를 얇게 고정합니다.
            bars.barrierBar.bar.clear().fillStyle(0xffd700, 0.5).fillRect(-2, -fullHeight / 2, 4, fullHeight * barrierRatio);
        }
    }

    updateAspirationBar(unitId) {
        const bars = this.unitBars.get(unitId);
        if (!bars || !bars.aspirationBar) return;

        const data = aspirationEngine.getAspirationData(unitId);
        const ratio = data.aspiration / 100;
        const fullHeight = bars.aspirationBar.bar.getData('fullHeight');
        const aspirationBarPhaser = bars.aspirationBar.bar;

        // Clear previous tween
        if (aspirationBarPhaser.currentTween) {
            aspirationBarPhaser.currentTween.stop();
            aspirationBarPhaser.currentTween = null;
        }

        aspirationBarPhaser
            .clear()
            .fillStyle(0x8b5cf6, 0.5)
            .fillRect(-2, -fullHeight / 2, 4, fullHeight * ratio); // Reset to default

        if (data.state === ASPIRATION_STATE.EXALTED) {
            // Full aspiration: bright purple glow
            aspirationBarPhaser.currentTween = this.scene.tweens.add({
                targets: aspirationBarPhaser,
                duration: 800,
                ease: 'Sine.easeInOut',
                repeat: -1, // Loop indefinitely
                yoyo: true, // Go back and forth
                onUpdate: tween => {
                    const alpha = tween.getValue();
                    aspirationBarPhaser
                        .clear()
                        .fillStyle(0xc084fc, 0.5 + alpha * 0.5)
                        .fillRect(-2, -fullHeight / 2, 4, fullHeight * ratio);
                },
            });
        } else if (data.state === ASPIRATION_STATE.COLLAPSED) {
            // Zero aspiration: red glow
            aspirationBarPhaser.currentTween = this.scene.tweens.add({
                targets: aspirationBarPhaser,
                duration: 800,
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true,
                onUpdate: tween => {
                    const alpha = tween.getValue();
                    aspirationBarPhaser
                        .clear()
                        .fillStyle(0xfb7171, 0.5 + alpha * 0.5)
                        .fillRect(-2, -fullHeight / 2, 4, fullHeight * ratio);
                },
            });
        }
    }

    /**
     * 화면 오른쪽에 콤보 카운트 텍스트를 표시합니다.
     * @param {number} count - 현재 콤보 수
     */
    showComboCount(count) {
        if (count < 2) return; // 2콤보 이상일 때만 표시

        if (comboManager.comboVFX) {
            comboManager.comboVFX.destroy();
        }

        const style = {
            fontFamily: 'Cinzel', // ✨ 1. Dom UI와 동일한 폰트 적용
            fontSize: '48px',
            color: '#ffc107',
            stroke: '#000000',
            strokeThickness: 6,
        };

        const { width, height } = this.scene.scale.gameSize;
        const comboText = this.scene.add
            .text(width - 150, height / 2, `${count} COMBO!`, style)
            .setOrigin(0.5, 0.5);

        this.vfxLayer.add(comboText);
        comboManager.comboVFX = comboText;

        this.scene.tweens.add({
            targets: comboText,
            scale: { from: 1.2, to: 1 },
            alpha: { from: 1, to: 0 },
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (comboManager.comboVFX === comboText) {
                    comboText.destroy();
                    comboManager.comboVFX = null;
                }
            }
        });
    }

    /**
     * 물리 효과가 적용된 데미지 숫자를 생성합니다.
     * @param {number} x - 생성 위치 x
     * @param {number} y - 생성 위치 y
     * @param {number|string} value - 표시할 데미지 값
     * @param {string} color - 기본 색상
     * @param {string|null} label - 데미지 옆에 표시할 추가 라벨(예: '치명타')
     */
    createDamageNumber(x, y, value, color = '#ff4d4d', label = null) {
        const style = {
            fontFamily: 'Cinzel', // ✨ 1. Dom UI와 동일한 폰트 적용
            fontSize: '32px',
            color: color,
            stroke: '#000000',
            strokeThickness: 4,
        };

        const numberText = this.scene.add
            .text(x, y, value.toString(), style)
            .setOrigin(0.5, 0.5);
        this.scene.physics.add.existing(numberText);

        // value가 '+'로 시작하면 회복 텍스트로 간주합니다.
        const isHealing = value.toString().startsWith('+');

        // 회복이면 왼쪽, 데미지면 오른쪽으로 날아가도록 속도를 설정합니다.
        const randomX = isHealing
            ? -(Math.random() * 100 + 50)  // 왼쪽 방향 (-150 ~ -50)
            : (Math.random() * 100 + 50);  // 오른쪽 방향 (50 ~ 150)

        const randomY = -(Math.random() * 150 + 150); // 위로 솟구치는 Y축 속도

        numberText.body.setVelocity(randomX, randomY);
        numberText.body.setGravityY(400); // 중력 적용
        numberText.body.setAngularVelocity(Math.random() * 200 - 100); // 회전

        this.scene.tweens.add({
            targets: numberText,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                numberText.destroy();
            },
        });

        // ✨ 라벨이 있으면 데미지 숫자 옆에 함께 표시합니다.
        if (label) {
            const labelStyle = { ...style, fontSize: '28px', color: '#ffc107' };
            const labelText = this.scene.add.text(x - 40, y - 20, label, labelStyle).setOrigin(1, 0.5);
            this.scene.physics.add.existing(labelText);
            labelText.body.setVelocity(randomX, randomY);
            labelText.body.setGravityY(400);
            labelText.body.setAngularVelocity(Math.random() * 200 - 100);
            this.scene.tweens.add({
                targets: labelText,
                alpha: 0,
                duration: 800,
                ease: 'Cubic.easeIn',
                onComplete: () => labelText.destroy(),
            });
        }

        const logMessage = isHealing
            ? `${value} 회복 숫자를 생성했습니다.`
            : `${value} 데미지 숫자를 생성했습니다.`;
        debugLogEngine.log('VFXManager', logMessage);
    }

    /**
     * MBTI 성향 문자를 머리 위에 표시합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite
     * @param {string} trait
     */
    showMBTITrait(parentSprite, trait) {
        const style = {
            fontFamily: 'Cinzel', // ✨ 1. Dom UI와 동일한 폰트 적용
            fontSize: '12px', // ✨ 3. 크기를 절반으로 줄입니다. (원래 32px) -> 12px로 변경
            color: '#ea580c',
            stroke: '#000000',
            strokeThickness: 5,
        };

        const traitText = this.scene.add
            .text(parentSprite.x, parentSprite.y - 90, trait, style) // ✨ y 위치 조정 (60 -> 90)
            .setOrigin(0.5, 0.5);
        this.vfxLayer.add(traitText);
        this.scene.physics.add.existing(traitText); // ✨ 3. 물리 효과 적용

        // ✨ 3. 데미지 숫자처럼 중력의 영향을 받으며 떨어지게 합니다.
        const randomX = (Math.random() - 0.5) * 50; // 좌우로 약간의 랜덤성 추가
        const randomY = -(Math.random() * 50 + 50); // 위로 솟구치는 Y축 속도

        traitText.body.setVelocity(randomX, randomY);
        traitText.body.setGravityY(200); // 중력 적용 (데미지보다 약간 약하게)
        traitText.body.setAngularVelocity(Math.random() * 100 - 50); // 회전

        this.scene.tweens.add({
            targets: traitText,
            alpha: 0,
            duration: 1200, // 지속 시간 조정
            ease: 'Cubic.easeOut',
            onComplete: () => traitText.destroy(),
        });
    }

    // 스킬 이름을 머리 위에 표시하는 효과를 보여줍니다.
    showSkillName(parentSprite, skillName, color = '#ffffff') {
        const style = {
            fontFamily: 'Cinzel', // ✨ 1. Dom UI와 동일한 폰트 적용
            fontSize: '24px',
            color: color,
            stroke: '#000000',
            strokeThickness: 4,
        };

        const skillText = this.scene.add.text(parentSprite.x, parentSprite.y - 40, skillName, style)
            .setOrigin(0.5, 0.5);
        this.vfxLayer.add(skillText);

        this.scene.tweens.add({
            targets: skillText,
            y: skillText.y - 30,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                skillText.destroy();
            }
        });
    }

    /**
     * 상태 효과 이름을 머리 위에 표시합니다.
     * @param {Phaser.GameObjects.Sprite} parentSprite
     * @param {string} effectName
     * @param {string} color
     */
    showEffectName(parentSprite, effectName, color = '#ff4d4d') {
        const style = {
            fontFamily: 'Cinzel', // ✨ 1. Dom UI와 동일한 폰트 적용
            fontSize: '22px',
            color: color,
            stroke: '#000000',
            strokeThickness: 4,
        };

        const effectText = this.scene.add.text(parentSprite.x, parentSprite.y - 70, effectName, style)
            .setOrigin(0.5, 0.5);
        this.vfxLayer.add(effectText);

        this.scene.tweens.add({
            targets: effectText,
            y: effectText.y - 30,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                effectText.destroy();
            }
        });
    }
    /**
     * 매니저와 관련된 모든 리소스를 정리합니다.
     */
    shutdown() {
        this.vfxLayer.destroy();
        this.activeTokenDisplays.forEach(display => {
            display.container.destroy();
        });
        this.activeTokenDisplays.clear();
        this.unitBars.forEach(bars => {
            if (bars.healthBar.bar.currentTween) {
                bars.healthBar.bar.currentTween.stop();
            }
            if (bars.barrierBar.bar.currentTween) {
                bars.barrierBar.bar.currentTween.stop();
            }
            if (bars.aspirationBar.bar.currentTween) {
                bars.aspirationBar.bar.currentTween.stop();
            }
            bars.healthBar.container.destroy();
            bars.barrierBar.container.destroy();
            bars.aspirationBar.container.destroy();
        });
        this.unitBars.clear();
        this.iconManager.shutdown(); // IconManager도 종료 시 정리
        debugLogEngine.log("VFXManager", "VFX 매니저를 종료합니다.");
    }
}

