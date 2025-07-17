import { GAME_DEBUG_MODE } from '../constants.js';

/**
 * 게임의 모든 사운드(BGM, 효과음)를 로드하고 재생하며 제어하는 엔진입니다.
 * Web Audio API를 사용하여 정교한 사운드 컨트롤을 제공합니다.
 */
export class SoundEngine {
    constructor() {
        try {
            // 웹 오디오 컨텍스트를 생성합니다. 모든 오디오 작업의 시작점입니다.
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 전체 볼륨을 제어하는 마스터 게인 노드
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);

            // BGM 전용 볼륨 제어 노드
            this.bgmGainNode = this.audioContext.createGain();
            this.bgmGainNode.connect(this.masterGainNode);

            // 효과음(SFX) 전용 볼륨 제어 노드
            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.connect(this.masterGainNode);

            this.audioCache = new Map(); // 로드된 오디오 데이터를 캐시하는 맵
            this.playingSources = new Map(); // 현재 재생 중인 사운드 소스를 관리

            if (GAME_DEBUG_MODE) console.log("\ud83d\udd0a SoundEngine initialized successfully using Web Audio API.");
        } catch (e) {
            console.error("SoundEngine: Web Audio API is not supported in this browser.", e);
            // Web Audio API를 지원하지 않는 브라우저에서는 오디오 기능이 비활성화됩니다.
            this.audioContext = null;
        }
    }

    /**
     * 사운드 파일을 비동기적으로 로드하고 디코딩하여 캐시에 저장합니다.
     * @param {string} id - 사운드를 식별할 고유 ID (예: 'sfx_sword_swing')
     * @param {string} url - 사운드 파일의 경로
     * @returns {Promise<void>}
     */
    async loadSound(id, url) {
        if (!this.audioContext) return;
        if (this.audioCache.has(id)) {
            if (GAME_DEBUG_MODE) console.log(`[SoundEngine] Sound '${id}' is already cached.`);
            return;
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioCache.set(id, audioBuffer);
            if (GAME_DEBUG_MODE) console.log(`[SoundEngine] Sound '${id}' loaded and cached from ${url}.`);
        } catch (error) {
            console.error(`[SoundEngine] Error loading sound '${id}' from ${url}:`, error);
        }
    }

    /**
     * 캐시된 사운드를 재생합니다.
     * @param {string} id - 재생할 사운드의 ID
     * @param {object} options - 재생 옵션 { loop, volume, type }
     * @returns {string | null} 재생 중인 사운드를 제어하기 위한 고유 소스 ID 또는 null
     */
    playSound(id, { loop = false, volume = 1.0, type = 'sfx' } = {}) {
        if (!this.audioContext || !this.audioCache.has(id)) {
            if (GAME_DEBUG_MODE) console.warn(`[SoundEngine] Sound '${id}' not found or AudioContext not available.`);
            return null;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioCache.get(id);
        source.loop = loop;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        const destination = type === 'bgm' ? this.bgmGainNode : this.sfxGainNode;
        source.connect(gainNode).connect(destination);
        source.start(0);

        const sourceId = `source_${Date.now()}_${Math.random()}`;
        this.playingSources.set(sourceId, { source, gainNode });

        source.onended = () => {
            this.playingSources.delete(sourceId);
        };

        if (GAME_DEBUG_MODE) console.log(`[SoundEngine] Playing sound '${id}' (type: ${type}).`);
        return sourceId;
    }

    /**
     * 특정 사운드의 재생을 중지합니다.
     * @param {string} sourceId - playSound가 반환한 소스 ID
     */
    stopSound(sourceId) {
        if (this.playingSources.has(sourceId)) {
            const { source } = this.playingSources.get(sourceId);
            try {
                source.stop(0);
            } catch(e) {
                // 이미 재생이 끝난 경우 오류가 발생할 수 있으므로 무시합니다.
            }
            this.playingSources.delete(sourceId);
            if (GAME_DEBUG_MODE) console.log(`[SoundEngine] Stopped sound with sourceId '${sourceId}'.`);
        }
    }
    
    /**
     * 마스터 볼륨을 조절합니다 (0.0 ~ 1.0).
     * @param {number} volume 
     */
    setMasterVolume(volume) {
        if (this.masterGainNode) {
            this.masterGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            if (GAME_DEBUG_MODE) console.log(`[SoundEngine] Master volume set to ${volume}.`);
        }
    }
}
