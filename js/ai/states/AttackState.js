import { IAiState } from './IAiState.js';
import { FleeState } from './FleeState.js';

export class AttackState extends IAiState {
    execute(unit, allUnits) {
        console.log(`${unit.name}이(가) 맹렬히 공격합니다!`);
        // 기존 BasicAIManager 등을 활용한 간단한 로직
        if (unit.currentHp < unit.baseStats.hp * 0.3) {
            return new FleeState();
        }
        return null;
    }
}
