import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 새로운 영웅의 탄생 정보를 콘솔에 상세히 보고하는 매니저입니다.
 * 영웅의 모든 스탯, 스킬, 그리고 그를 구성하는 로직을 투명하게 보여줍니다.
 */
export class BirthReportManager {
    constructor() {
        if (GAME_DEBUG_MODE) console.log("\ud83d\udcda BirthReportManager initialized. Ready to document new heroes.");
    }

    /**
     * 새로운 영웅의 출생 신고를 콘솔에 출력합니다.
     * @param {object} heroData - 생성된 영웅의 전체 데이터
     */
    report(heroData) {
        if (!heroData) return;

        console.group(`%c\ud83d\udcdc \uCD9C\uC0DD \uC2E0\uACE0: ${heroData.name} (ID: ${heroData.id})`, "color: #4CAF50; font-size: 1.2em; font-weight: bold;");

        console.log("\uc774 \uc601\uc6b4\uc740 [\ubbf8\uc2dc\uc138\uacc4 \uc601\uc6b4 \uc5d4\uc9c4]\uc5d0 \uc758\ud574 \ub3d9\ub9f9\ub41c \uac1d\uccb4\ub85c \uc0dd\uc131\ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
        console.log("\uace0\uc720\ud55c AI Worker\uc640 \uc601\uad6c\uc801\uc778 \ub370\uc774\ud130 \uc800\uc7a5\uc18c\ub97c \uac00\uc9c0\uace0 \uc788\uc2b5\ub2c8\ub2e4.");

        console.group("\uae30\ubcf8 \uc815\ubcf4");
        console.log(`\ud074\ub798\uc2a4: ${heroData.classId}`);
        console.log(`\ud76c\uadc0\ub3c4: ${heroData.rarity || 'common'}`);
        console.groupEnd();

        console.group("\uae30\ubcf8 \uc2a4\ud0dc\ud2b8 (Base Stats)");
        console.table(heroData.baseStats);
        console.groupEnd();

        console.group("\uc2a4\ud0ac \uc2ac\ub86f (Skill Slots)");
        if (heroData.skillSlots && heroData.skillSlots.length > 0) {
            heroData.skillSlots.forEach((skillId, index) => {
                console.log(`\uc2ac\ub86f ${index + 1}: ${skillId}`);
            });
        } else {
            console.log("\ud560\ub2dd\ub41c \uc2a4\ud0ac \uc5c6\uc74c");
        }
        console.groupEnd();

        console.group("\uace0\uc720 \ud2b9\uc131 (Traits) \ubc0f \uc2dc\ub0b4\uc9c0 (Synergies)");
        console.log("\ud2b9\uc131:", heroData.traits?.join(', ') || "\uc5c6\uc74c");
        console.log("\uc2dc\ub0b4\uc9c0:", heroData.synergies?.join(', ') || "\uc5c6\uc74c");
        console.groupEnd();

        console.groupEnd();
    }
}
