import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';

// 1. 테스트를 위한 마이티 쉴드 기본 데이터 정의
const mightyShieldBase = {
    NORMAL: { id: 'mightyShield', cooldown: 10, resourceCost: { type: 'LIGHT', amount: 5 }, effect: { stack: { amount: 2 } } },
    RARE: { id: 'mightyShield', cooldown: 9, resourceCost: { type: 'LIGHT', amount: 5 }, effect: { stack: { amount: 3 } } },
    EPIC: { id: 'mightyShield', cooldown: 8, resourceCost: { type: 'LIGHT', amount: 4 }, effect: { stack: { amount: 4 } } },
    LEGENDARY: { id: 'mightyShield', cooldown: 7, resourceCost: { type: 'LIGHT', amount: 4 }, removesDebuff: { chance: 1.0 }, effect: { stack: { amount: 5 } } }
};

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

// 2. 모든 등급에 대해 테스트 실행
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(mightyShieldBase[grade], grade);

    // 3. 각 등급별 속성 값이 예상과 일치하는지 확인
    assert.strictEqual(skill.cooldown, mightyShieldBase[grade].cooldown, `Cooldown failed for ${grade}`);
    assert.deepStrictEqual(skill.resourceCost, mightyShieldBase[grade].resourceCost, `Resource cost failed for ${grade}`);
    assert.strictEqual(skill.effect.stack.amount, mightyShieldBase[grade].effect.stack.amount, `Stack amount failed for ${grade}`);
    
    if (grade === 'LEGENDARY') {
        assert(skill.removesDebuff && skill.removesDebuff.chance === 1.0, 'Removes debuff effect failed for LEGENDARY');
    }
}

// 4. 모든 테스트 통과 시 메시지 출력
console.log('Mighty Shield skill integration test passed.');
