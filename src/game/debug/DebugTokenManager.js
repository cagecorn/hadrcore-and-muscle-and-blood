import { debugLogEngine } from '../utils/DebugLogEngine.js';

/**
 * \ud1a0\ud06c\ub4e0(\uc790\uc6d0)\uc758 \uc0dd\uc131, \uc18c\ubaa8, \ubcc0\ud654\ub97c \ucd94\ucd9c\ud558\uace0 \ub85c\uadf8\ub97c \ub0a8\uae30\ub294 \ub514\ubc84\uae08 \ub9e4\ub2c8\uc800
 */
class DebugTokenManager {
    constructor() {
        this.name = 'DebugToken';
        debugLogEngine.register(this);
    }

    /**
     * \ud2b9\uc815 \uc720\ub2c8\ud2b8\uc758 \ud1a0\ud06c \ubcc0\ud654 \uc0ac\ud56d\uc744 \ub85c\uadf8\ub85c \ub0a8\uae30\uace0 \ud45c\uc2dc\ud569\ub2c8\ub2e4.
     * @param {number} unitId - \uc720\ub2c8\ud2b8\uc758 \uace0\uc720 ID
     * @param {string} unitName - \uc720\ub2c8\ud2b8\uc758 \uc774\ub984
     * @param {string} reason - \ubcc0\uacbd \uc0ac\uc720 (\uc608: '\ud130\ub110 \uc2dc\uc791', '\uc2a4\ud0a4 \uc0ac\uc6a9')
     * @param {number} amount - \ubcc0\uacbd\ub41c \ud1a0\ud06c \uc758 \ub7a9 (+1 \ub610\ub294 -2 \ub4f1)
     * @param {number} newTotal - \ubcc0\uacbd \ud6c4 \ucd5c\uc885 \ud1a0\ud06c \ub7a9
     */
    logTokenChange(unitId, unitName, reason, amount, newTotal) {
        const sign = amount > 0 ? '+' : '';
        console.groupCollapsed(
            `%c[${this.name}]`,
            `color: #f59e0b; font-weight: bold;`,
            `${unitName}(ID:${unitId}) \ud1a0\ud06c \ubcc0\uacbd: ${reason}`
        );
        debugLogEngine.log(this.name, `\ubcc0\uacbd\ub7c9: ${sign}${amount}`);
        debugLogEngine.log(this.name, `\ud604\uc7ac \ud1a0\ud06c: ${newTotal}`);
        console.groupEnd();
    }

    /**
     * \uc804\ud22c \uc2dc\uc791 \uc2dc \ud1a0\ud06c \ub370\uc774\ud130 \ucd08\uae30\ud654 \ub85c\uadf8\ub97c \ub0a8\uae30\uace0\uac8c \ud569\ub2c8\ub2e4.
     * @param {number} unitCount - \ucd08\uae30\ud654\ub41c \uc720\ub2c8\ud2b8\uc758 \uc218
     */
    logInitialization(unitCount) {
        debugLogEngine.log(this.name, `${unitCount}\uac1c \uc720\ub2c8\ud2b8\uc758 \ud1a0\ud06c \ub370\uc774\ud130\ub97c \ucd08\uae30\ud654\ud588\uc2b5\ub2c8\ub2e4.`);
    }
}

export const debugTokenManager = new DebugTokenManager();
