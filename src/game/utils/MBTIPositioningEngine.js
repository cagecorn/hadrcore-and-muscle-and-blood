/**
 * 용병의 MBTI 성향에 따라 전투 진형의 위치를 결정하는 엔진
 */
class MBTIPositioningEngine {
    constructor() {
        this.name = 'MBTIPositioningEngine';
        // 아군 진영의 크기 (0~7열, 0~8행)
        this.ALLY_COLS = 8;
        this.TOTAL_COLS = 16;
        this.ALLY_ROWS = 9;
        this.ROW_CENTER = Math.floor(this.ALLY_ROWS / 2); // 중앙 행
    }

    /**
     * 주어진 용병에게 가장 적합한 셀을 찾아서 반환합니다.
     * @param {object} mercenary - 위치를 결정할 용병
     * @param {Array<object>} availableCells - 배치 가능한 모든 빈 셀의 목록
     * @param {Array<object>} placedAllies - 이미 배치된 다른 아군 용병 목록
     * @returns {object|null} - 선택된 최적의 셀 또는 null
     */
    determinePosition(mercenary, availableCells, placedAllies, team = 'ally') {
        if (!availableCells || availableCells.length === 0) {
            return null;
        }

        const mbti = mercenary.mbti;

        // 1. 각 후보 셀에 대해 MBTI 기반 종합 점수 계산
        const scoredCells = availableCells.map(cell => {
            let totalScore = 1.0; // 기본 점수

            // E vs I: 전방 선호 vs 후방 선호
            // \u2728 팀에 따라 전/후방 기준을 다르게 적용
            let frontPreference;
            if (team === 'ally') {
                // 아군: 0열(후방) ~ 7열(전방)
                frontPreference = cell.col / (this.ALLY_COLS - 1);
            } else {
                // 적군: 15열(후방) ~ 8열(전방)
                frontPreference = ((this.TOTAL_COLS - 1) - cell.col) / (this.ALLY_COLS - 1);
            }
            totalScore *= (frontPreference * mbti.E) + ((1 - frontPreference) * mbti.I);

            // S vs N: 중앙 선호 vs 측면 선호
            const centerPreference = 1 - (Math.abs(cell.row - this.ROW_CENTER) / this.ROW_CENTER); // 0 (측면) ~ 1 (중앙)
            totalScore *= (centerPreference * mbti.S) + ((1 - centerPreference) * mbti.N);

            // T vs F: 독립 선호 vs 밀집 선호
            if (placedAllies.length > 0) {
                const minDistance = Math.min(...placedAllies.map(ally =>
                    Math.abs(cell.col - ally.gridX) + Math.abs(cell.row - ally.gridY)
                ));
                const isolationPreference = Math.min(minDistance / 5, 1); // 거리가 5 이상이면 최대 점수
                const cohesionPreference = 1 - isolationPreference;
                totalScore *= (isolationPreference * mbti.T) + (cohesionPreference * mbti.F);
            }

            return { cell, score: totalScore };
        });

        // 2. J vs P: 결정적 선택 vs 유연한(무작위) 선택
        let finalChoice;
        if (Math.random() * 100 < mbti.P && scoredCells.length > 1) {
            // 가중치 기반 랜덤 선택
            const totalWeight = scoredCells.reduce((sum, item) => sum + item.score, 0);
            let random = Math.random() * totalWeight;
            for (const item of scoredCells) {
                if (random < item.score) {
                    finalChoice = item.cell;
                    break;
                }
                random -= item.score;
            }
            if (!finalChoice) finalChoice = scoredCells[scoredCells.length - 1].cell; // Fallback
        } else {
            // 최고점수 선택 (J 성향)
            scoredCells.sort((a, b) => b.score - a.score);
            finalChoice = scoredCells[0].cell;
        }

        return finalChoice;
    }
}

export const mbtiPositioningEngine = new MBTIPositioningEngine();
