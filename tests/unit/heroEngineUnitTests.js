// tests/unit/heroEngineUnitTests.js

import { HeroEngine } from '../../js/managers/HeroEngine.js';

export function runHeroEngineUnitTests(idManager, assetLoaderManager, diceEngine, diceBotManager) {
    console.log("--- HeroEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    // Mock IdManager
    const mockIdManager = idManager || {
        addOrUpdateId: async (id, data) => { console.log(`[MockIdManager] Added/Updated ID: ${id}`); },
        get: async (id) => { return { id, name: id }; }
    };

    // Mock AssetLoaderManager
    const mockAssetLoaderManager = assetLoaderManager || {
        loadImage: async (assetId, url) => {
            console.log(`[MockAssetLoaderManager] Loading image: ${assetId} from ${url}`);
            return { src: url, width: 100, height: 100 };
        },
        getImage: (assetId) => {
            if (assetId === 'hero_default_warrior_image') return { src: 'assets/images/warrior.png' };
            if (assetId === 'hero_default_archer_image') return { src: 'assets/images/archer.png' };
            return undefined;
        }
    };

    // Mock DiceBotManager
    const mockDiceBotManager = diceBotManager || {
        getRandomIntResults: [],
        getRandomIntIndex: 0,
        getRandomInt: function(min, max) {
            const result = this.getRandomIntResults[this.getRandomIntIndex % this.getRandomIntResults.length];
            this.getRandomIntIndex++;
            if (result !== undefined) return result;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getRandomFloat: () => Math.random()
    };

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const heroEngine = new HeroEngine(mockIdManager, mockAssetLoaderManager, diceEngine, mockDiceBotManager);
        if (heroEngine.idManager === mockIdManager && heroEngine.heroes instanceof Map) {
            console.log("HeroEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("HeroEngine: Initialization failed. [FAIL]");
        }
    } catch (e) {
        console.error("HeroEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: generateHero - 기본 영웅 생성 및 데이터 확인
    testCount++;
    mockDiceBotManager.getRandomIntResults = [100, 50, 20, 10, 15, 5, 10, 20, 30, 60, 1, 4, 1];
    mockDiceBotManager.getRandomIntIndex = 0;
    try {
        const heroEngine = new HeroEngine(mockIdManager, mockAssetLoaderManager, diceEngine, mockDiceBotManager);
        const hero = await heroEngine.generateHero({
            name: '테스트 영웅',
            classId: 'class_test',
            spriteId: 'hero_default_warrior_image',
            rarity: 'epic'
        });

        if (hero && hero.id && hero.name === '테스트 영웅' && hero.rarity === 'epic' &&
            hero.illustration && hero.baseStats && hero.skills.length === 3 && hero.traits.length === 1) {
            console.log("HeroEngine: generateHero created hero with expected properties. [PASS]");
            passCount++;
        } else {
            console.error("HeroEngine: generateHero failed to create hero correctly. [FAIL]", hero);
        }
    } catch (e) {
        console.error("HeroEngine: Error during generateHero test. [FAIL]", e);
    }

    // 테스트 3: getHero - 존재하는 영웅 가져오기
    testCount++;
    try {
        const heroEngine = new HeroEngine(mockIdManager, mockAssetLoaderManager, diceEngine, mockDiceBotManager);
        const generatedHero = await heroEngine.generateHero({ heroId: 'test_hero_get', name: '가져올 영웅' });
        heroEngine.heroes.set(generatedHero.id, generatedHero);

        const retrievedHero = heroEngine.getHero('test_hero_get');
        if (retrievedHero && retrievedHero.name === '가져올 영웅') {
            console.log("HeroEngine: getHero retrieved existing hero. [PASS]");
            passCount++;
        } else {
            console.error("HeroEngine: getHero failed to retrieve existing hero. [FAIL]", retrievedHero);
        }
    } catch (e) {
        console.error("HeroEngine: Error during getHero (existing) test. [FAIL]", e);
    }

    // 테스트 4: getHero - 존재하지 않는 영웅 가져오기
    testCount++;
    try {
        const heroEngine = new HeroEngine(mockIdManager, mockAssetLoaderManager, diceEngine, mockDiceBotManager);
        const nonExistentHero = heroEngine.getHero('non_existent_hero');
        if (nonExistentHero === undefined) {
            console.log("HeroEngine: getHero returned undefined for non-existent hero. [PASS]");
            passCount++;
        } else {
            console.error("HeroEngine: getHero failed for non-existent hero. [FAIL]", nonExistentHero);
        }
    } catch (e) {
        console.error("HeroEngine: Error during getHero (non-existent) test. [FAIL]", e);
    }

    // 테스트 5: getAllHeroes - 모든 영웅 목록 반환
    testCount++;
    try {
        const heroEngine = new HeroEngine(mockIdManager, mockAssetLoaderManager, diceEngine, mockDiceBotManager);
        await heroEngine.generateHero({ heroId: 'hero_1', name: 'Hero One' });
        await heroEngine.generateHero({ heroId: 'hero_2', name: 'Hero Two' });
        const allHeroes = heroEngine.getAllHeroes();
        if (allHeroes.length >= 2 && allHeroes.some(h => h.id === 'hero_1') && allHeroes.some(h => h.id === 'hero_2')) {
            console.log("HeroEngine: getAllHeroes returned all registered heroes. [PASS]");
            passCount++;
        } else {
            console.error("HeroEngine: getAllHeroes failed to return all heroes. [FAIL]", allHeroes);
        }
    } catch (e) {
        console.error("HeroEngine: Error during getAllHeroes test. [FAIL]", e);
    }

    console.log(`--- HeroEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}


