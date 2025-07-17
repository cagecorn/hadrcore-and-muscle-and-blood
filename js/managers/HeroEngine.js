// js/managers/HeroEngine.js

export class HeroEngine {
    /**
     * HeroEngine을 초기화합니다.
     * @param {IdManager} idManager - ID 관리 및 데이터 조회를 위한 IdManager 인스턴스
     * @param {AssetLoaderManager} assetLoaderManager - 이미지 에셋 로드를 위한 AssetLoaderManager 인스턴스
     * @param {DiceBotManager} diceBotManager - 무작위 값 생성을 위한 DiceBotManager 인스턴스
     */
    constructor(idManager, assetLoaderManager, diceEngine, diceBotManager) {
        console.log("\u2728 HeroEngine initialized. The foundation for all heroes begins here! \u2728");
        this.idManager = idManager;
        this.assetLoaderManager = assetLoaderManager;
        this.diceEngine = diceEngine;
        this.diceBotManager = diceBotManager;

        this.heroes = new Map(); // key: heroId, value: heroData (생성된 영웅 인스턴스 저장)
        this._loadBasicHeroData(); // 예시 영웅 데이터 로드 (실제는 가챠 등으로 생성)
    }

    /**
     * 게임 시작 시 기본 영웅 데이터를 로드하거나 생성합니다.
     * 실제 가챠 시스템이 구현되기 전까지 임시로 사용됩니다.
     * @private
     */
    async _loadBasicHeroData() {
        console.log("[HeroEngine] Loading basic hero data...");
        // 예시로 warrior.png 이미지를 기본 영웅 이미지로 사용
        await this.assetLoaderManager.loadImage('hero_default_warrior_image', 'assets/images/warrior.png');
        await this.assetLoaderManager.loadImage('hero_default_archer_image', 'assets/images/archer.png');
        await this.assetLoaderManager.loadImage('hero_default_wizard_image', 'assets/images/wizard.png');
        await this.assetLoaderManager.loadImage('hero_default_healer_image', 'assets/images/healer.png');

        // 예시로 영웅 몇 명을 미리 생성 (실제는 가챠 시스템이 호출)
        const warriorHero = await this.generateHero({
            heroId: 'hero_warrior_001',
            name: '강철 주먹 라이언',
            classId: 'class_warrior',
            spriteId: 'hero_default_warrior_image',
            rarity: 'rare'
        });

        const archerHero = await this.generateHero({
            heroId: 'hero_archer_001',
            name: '매의 눈 레오나',
            classId: 'class_archer',
            spriteId: 'hero_default_archer_image',
            rarity: 'uncommon'
        });

        if (warriorHero) this.heroes.set(warriorHero.id, warriorHero);
        if (archerHero) this.heroes.set(archerHero.id, archerHero);

        console.log(`[HeroEngine] Loaded ${this.heroes.size} basic heroes.`);
    }


    /**
     * 새로운 영웅을 생성하고 무작위 스탯, 스킬 등을 부여합니다.
     * 이것이 가챠 시스템의 핵심 부분이 될 것입니다.
     * @param {object} options - 영웅 생성 옵션 (예: heroId, name, classId, spriteId, rarity 등)
     * @returns {Promise<object>} 생성된 영웅 객체
     */
    async generateHero(options) {
        const heroId = options.heroId || `hero_${Date.now()}_${this.diceEngine.getRandomInt(1000, 9999)}`;
        const heroName = options.name || '미지의 영웅';
        const classId = options.classId || 'class_warrior'; // 기본 전사 클래스

        // 1. 일러스트 로드 (AssetLoaderManager 활용)
        const illustrationImage = options.spriteId ?
            this.assetLoaderManager.getImage(options.spriteId) || await this.assetLoaderManager.loadImage(options.spriteId, `assets/images/${options.spriteId.replace('hero_default_', '')}.png`) :
            null;

        // 2. 랜덤 스탯 생성 (DiceBotManager 활용)
        // 각 스탯에 대해 대략적인 범위 설정
        const baseStats = {
            hp: this.diceEngine.getRandomInt(70, 120),
            valor: this.diceEngine.getRandomInt(10, 60),
            strength: this.diceEngine.getRandomInt(5, 30),
            endurance: this.diceEngine.getRandomInt(5, 30),
            agility: this.diceEngine.getRandomInt(5, 30),
            intelligence: this.diceEngine.getRandomInt(5, 30),
            wisdom: this.diceEngine.getRandomInt(5, 30),
            luck: this.diceEngine.getRandomInt(5, 30),
            weight: this.diceEngine.getRandomInt(10, 40),
            speed: this.diceEngine.getRandomInt(30, 90)
        };

        // 3. 랜덤한 세 가지 스킬 부여 (임시 스킬 ID 사용)
        const skills = [
            `skill_${this.diceEngine.getRandomInt(1, 3)}`, // 첫 번째 스킬
            `skill_${this.diceEngine.getRandomInt(4, 6)}`, // 두 번째 스킬
            `skill_passive_${this.diceEngine.getRandomInt(1, 2)}` // 세 번째 스킬 (패시브)
        ];

        // 4. 랜덤한 특성 부여 (임시 특성 ID 사용)
        const traits = [`trait_${this.diceEngine.getRandomInt(1, 3)}`];

        // ✨ 5. 랜덤한 2~3개의 시너지 부여
        const allPossibleSynergies = ['synergy_warrior', 'synergy_mage', 'synergy_healer', 'synergy_archer'];
        const numSynergies = this.diceEngine.getRandomInt(2, 3);
        const assignedSynergies = [];
        while (assignedSynergies.length < numSynergies) {
            const randomIndex = this.diceEngine.getRandomInt(0, allPossibleSynergies.length - 1);
            const selectedSynergy = allPossibleSynergies[randomIndex];
            if (!assignedSynergies.includes(selectedSynergy)) {
                assignedSynergies.push(selectedSynergy);
            }
        }
        const synergies = assignedSynergies;

        // 6. 장비 아이템 및 퍽 (초기에는 비어있음)
        const equippedItems = [];
        const perks = [];

        const newHero = {
            id: heroId,
            name: heroName,
            classId: classId,
            rarity: options.rarity || 'common',
            illustration: illustrationImage,
            baseStats: baseStats,
            skills: skills,
            traits: traits,
            synergies: synergies, // ✨ 영웅 시너지 추가
            equippedItems: equippedItems,
            perks: perks,
            currentHp: baseStats.hp,
            currentBarrier: 0,
            maxBarrier: 0
        };

        this.heroes.set(heroId, newHero);
        console.log(`[HeroEngine] Generated new hero: ${newHero.name} (${newHero.id}), Rarity: ${newHero.rarity}, Skills: ${newHero.skills.join(', ')}`);
        return newHero;
    }

    /**
     * 특정 ID를 가진 영웅 데이터를 가져옵니다.
     * @param {string} heroId - 영웅의 ID
     * @returns {object | undefined} 영웅 데이터 또는 찾을 수 없는 경우 undefined
     */
    getHero(heroId) {
        const hero = this.heroes.get(heroId);
        if (!hero) {
            console.warn(`[HeroEngine] Hero with ID '${heroId}' not found.`);
        }
        return hero;
    }

    /**
     * 현재 관리 중인 모든 영웅 목록을 반환합니다.
     * @returns {object[]} 모든 영웅의 배열
     */
    getAllHeroes() {
        return Array.from(this.heroes.values());
    }
}

