import { debugLogEngine } from './DebugLogEngine.js';

/**
 * DebugLogEngine에 기록된 로그를 파일로 다운로드하는 유틸리티 클래스
 */
class LogDownloader {
    /**
     * 주어진 로그를 JSON 파일로 다운로드합니다.
     * @param {any} logs 다운로드할 로그 데이터
     * @param {string} [filename] 저장할 파일 이름
     */
    static download(logs = debugLogEngine.logHistory, filename) {
        if (!logs || (Array.isArray(logs) && logs.length === 0)) {
            alert('다운로드할 로그가 없습니다.');
            return;
        }

        try {
            const replacer = (key, value) => {
                // Phaser 게임 오브젝트나 순환 참조를 일으킬 수 있는 속성 필터링
                if (key === 'sprite' || key === 'scene' || key === 'parent' || key === 'game' || key === 'sys') {
                    return '[Circular Reference]';
                }
                // 배열 내에서 'this'와 같은 자체 참조가 있다면 필터링 (일반적이지 않지만 방어 코딩)
                if (value === window || value === document) {
                    return '[Window/Document Object]';
                }
                return value;
            };

            const jsonData = JSON.stringify(logs, replacer, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = filename || `muscle-and-blood-log-${timestamp}.json`;

            document.body.appendChild(a);
            a.click();

            // ✨ [수정] 다운로드 트리거 후 지연 시간을 두어 브라우저가 다운로드를 시작할 충분한 시간을 줍니다.
            // 이후 객체 URL을 해제하고 요소를 제거합니다.
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100); // 100ms 지연

            debugLogEngine.log('LogDownloader', '로그 파일 다운로드를 성공적으로 시작했습니다.');
        } catch (error) {
            console.error('로그 다운로드 중 오류 발생:', error);
            debugLogEngine.error('LogDownloader', '로그 파일 생성에 실패했습니다. 개발자 콘솔을 확인해주세요.', error);
            alert('로그 파일을 생성하는 데 실패했습니다. 개발자 콘솔을 확인해주세요.');
        }
    }
}

export const logDownloader = LogDownloader;
