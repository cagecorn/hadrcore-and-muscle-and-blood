import { SoundEngine } from '../../js/managers/SoundEngine.js';
import { GAME_DEBUG_MODE } from '../../js/constants.js';

export function runSoundEngineUnitTests() {
    if (!GAME_DEBUG_MODE) return;
    console.log("--- SoundEngine Unit Test Start ---");

    // Test 1: Initialization
    try {
        const soundEngine = new SoundEngine();
        if (soundEngine.audioContext) {
            console.log("SoundEngine: Initialized correctly with AudioContext. [PASS]");
        } else {
            console.warn("SoundEngine: AudioContext not supported, skipping tests. [SKIP]");
            return;
        }
    } catch (e) {
        console.error("SoundEngine: Error during initialization. [FAIL]", e);
        return;
    }

    // A silent 1-second WAV file represented as a data URL for testing
    const mockAudioURL = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

    // Test 2: loadSound
    (async () => {
        const soundEngine = new SoundEngine();
        if (!soundEngine.audioContext) return;

        try {
            await soundEngine.loadSound('test_sfx', mockAudioURL);
            if (soundEngine.audioCache.has('test_sfx')) {
                console.log("SoundEngine: loadSound successfully loaded and cached audio. [PASS]");
            } else {
                console.error("SoundEngine: loadSound failed to cache audio. [FAIL]");
            }
        } catch (e) {
            console.error("SoundEngine: Error during loadSound test. [FAIL]", e);
        }
    })();
}
