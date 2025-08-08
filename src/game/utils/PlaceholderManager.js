import { debugLogEngine } from './DebugLogEngine.js';

const DEFAULT_PLACEHOLDER = 'assets/images/placeholder.png';

/**
 * 이미지 경로가 유효하지 않을 때 기본 플레이스홀더 경로를 제공하고,
 * 누락된 애셋을 추적하여 리포트하는 유틸리티
 */
class PlaceholderManager {
    constructor() {
        this.name = 'PlaceholderManager';
        // [신규] 누락된 애셋 경로를 중복 없이 기록하기 위한 Set
        this.missingAssets = new Set();
        debugLogEngine.log(this.name, '플레이스홀더 매니저가 초기화되었습니다.');
    }

    /**
     * 이미지 경로를 받아 유효하면 그대로 반환하고,
     * 유효하지 않으면 기본 플레이스홀더 경로를 반환하며 누락 사실을 기록합니다.
     * @param {string | null | undefined} originalPath - 확인할 원본 이미지 경로
     * @param {string} [expectedPath=null] - 원래 있어야 할 기대 경로 (리포트용)
     * @returns {string} - 최종적으로 사용될 이미지 경로
     */
    getPath(originalPath, expectedPath = null) {
        if (originalPath && typeof originalPath === 'string' && originalPath.trim() !== '') {
            return originalPath;
        }

        // 경로가 유효하지 않으면 플레이스홀더를 반환하고 로그를 남깁니다.
        if (expectedPath) {
            this.missingAssets.add(expectedPath);
        }
        
        return DEFAULT_PLACEHOLDER;
    }

    /**
     * [신규] 게임 로딩 완료 후, 누락된 모든 애셋 목록을 콘솔에 출력합니다.
     */
    reportMissingAssets() {
        if (this.missingAssets.size === 0) {
            debugLogEngine.log(this.name, '✅ 모든 스킬 이미지가 정상적으로 로드되었습니다.');
            return;
        }

        console.groupCollapsed(
            `%c[${this.name}] 🎨 누락된 스킬 이미지 리포트 (${this.missingAssets.size}개)`,
            'color: #f59e0b; font-weight: bold;'
        );
        console.log('아래 경로에 이미지를 추가해야 합니다:');
        this.missingAssets.forEach(path => {
            console.log(`- ${path}`);
        });
        console.groupEnd();

        // 다음 실행을 위해 기록을 초기화합니다.
        this.missingAssets.clear();
    }
}

export const placeholderManager = new PlaceholderManager();
