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
            level,
            source,
            message: args.map(arg => {
                try {
                    JSON.stringify(arg);
                    return arg;
                } catch (e) {
                    return arg.toString();
                }
            })
        };

        const last = this.logHistory[this.logHistory.length - 1];
        const isDuplicate =
            last &&
            last.level === logEntry.level &&
            last.source === logEntry.source &&
            JSON.stringify(last.message) === JSON.stringify(logEntry.message);
        if (!isDuplicate) {
            this.logHistory.push(logEntry);
        }

        const color = this._getSourceColor(source);
        const consoleMethod = console[level] || console.log;
        if (!isDuplicate) {
            consoleMethod(`%c[${source}]`, `color: ${color}; font-weight: bold;`, ...args);
        }
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

    reset() {
        this.logHistory = [];
    }

    startRecording() {
        this.reset();
    }

    getHistory() {
        return [...this.logHistory];
    }

    /**
     * 기록된 로그를 JSON 파일로 저장합니다.
     * 브라우저 환경에서만 동작하며, 로그가 비어 있으면 아무 작업도 하지 않습니다.
     * @param {string} [filename] 저장할 파일 이름
     */
    saveLog(filename = `debug-log-${Date.now()}.json`) {
        if (!this.enabled || this.logHistory.length === 0) {
            return;
        }

        if (typeof document === 'undefined') {
            this.warn('Engine', 'saveLog는 브라우저 환경에서만 사용할 수 있습니다.');
            return;
        }

        const blob = new Blob(
            [JSON.stringify(this.logHistory, null, 2)],
            { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
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
