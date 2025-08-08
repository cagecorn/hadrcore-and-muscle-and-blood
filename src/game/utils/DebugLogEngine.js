/**
 * 브라우저 개발자 도구 콘솔에 구조화된 로그를 출력하고, 파일로 저장할 수 있도록 기록하는 엔진
 */
class DebugLogEngine {
    constructor() {
        if (DebugLogEngine.instance) {
            return DebugLogEngine.instance;
        }

        // 이 값을 false로 바꾸면 모든 디버그 로그가 출력되지 않습니다.
        this.enabled = true;

        this.logHistory = [];
        this.managers = {};
        this._welcomeMessage();

        DebugLogEngine.instance = this;
    }

    _welcomeMessage() {
        if (!this.enabled) return;
        const message = 'DebugLogEngine이 활성화되었습니다. 이제 매니저를 등록할 수 있습니다.';
        this.log('Engine', message);
    }

    register(manager) {
        if (manager && manager.name) {
            this.managers[manager.name] = manager;
        } else {
            this.error('Engine', '매니저 등록 실패: 매니저는 반드시 name 속성을 가져야 합니다.');
        }
    }

    _recordLog(level, source, args) {
        if (!this.enabled) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            source: source,
            message: args.map(arg => {
                try {
                    JSON.stringify(arg);
                    return arg;
                } catch (e) {
                    return arg.toString();
                }
            })
        };
        this.logHistory.push(logEntry);

        const color = this._getSourceColor(source);
        const consoleMethod = console[level] || console.log;
        consoleMethod(`%c[${source}]`, `color: ${color}; font-weight: bold;`, ...args);
    }

    log(source, ...args) {
        this._recordLog('log', source, args);
    }

    warn(source, ...args) {
        this._recordLog('warn', source, args);
    }

    error(source, ...args) {
        this._recordLog('error', source, args);
    }

    _getSourceColor(source) {
        let hash = 0;
        for (let i = 0; i < source.length; i++) {
            hash = source.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
}

export const debugLogEngine = new DebugLogEngine();
