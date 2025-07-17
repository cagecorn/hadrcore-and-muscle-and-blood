import { IAiState } from './IAiState.js';

export class FleeState extends IAiState {
    execute(unit) {
        console.log(`${unit.name}이(가) 후퇴합니다!`);
        return null;
    }
}
