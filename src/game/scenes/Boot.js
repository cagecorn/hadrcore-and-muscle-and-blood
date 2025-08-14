// Vite 없이 실행할 수 있도록 phaser ESM을 직접 참조합니다.
// Phaser 모듈을 CDN에서 가져옵니다.
import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { Preloader } from './Preloader.js';
import { TerritoryScene } from './TerritoryScene.js';
import { MainMenu } from './MainMenu.js';
// Game 씬을 불러와 'MainGame'이라는 이름으로 등록합니다.
import { Game as MainGame } from './Game.js';
import { GameOver } from './GameOver.js';
// --- PartyScene import 추가 ---
import { PartyScene } from './PartyScene.js';
import { DungeonScene } from './DungeonScene.js';
import { FormationScene } from './FormationScene.js';
import { CursedForestBattleScene } from './CursedForestBattleScene.js';
import { SkillManagementScene } from './SkillManagementScene.js';
// ✨ SummonManagementScene을 import 합니다.
import { SummonManagementScene } from './SummonManagementScene.js';
// ✨ EquipmentManagementScene을 import합니다.
import { EquipmentManagementScene } from './EquipmentManagementScene.js';
import { ArenaScene } from './ArenaScene.js';
import { ArenaBattleScene } from './ArenaBattleScene.js';
import { WorldMapScene } from './WorldMapScene.js'; // 월드맵 씬 import 추가
import { CityScene } from './CityScene.js';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
    }

    create ()
    {
        this.scene.add('Preloader', Preloader);
        this.scene.add('TerritoryScene', TerritoryScene);
        this.scene.add('MainMenu', MainMenu);
        this.scene.add('MainGame', MainGame);
        this.scene.add('GameOver', GameOver);
        // --- PartyScene 추가 ---
        this.scene.add('PartyScene', PartyScene);
        this.scene.add('DungeonScene', DungeonScene);
        this.scene.add('FormationScene', FormationScene);
        this.scene.add('CursedForestBattle', CursedForestBattleScene);
        this.scene.add('SkillManagementScene', SkillManagementScene);
        // ✨ 새로 만든 씬을 추가합니다.
        this.scene.add('SummonManagementScene', SummonManagementScene);
        // ✨ 장비 관리 씬을 추가합니다.
        this.scene.add('EquipmentManagementScene', EquipmentManagementScene);
        this.scene.add('ArenaScene', ArenaScene);
        this.scene.add('ArenaBattleScene', ArenaBattleScene);
        this.scene.add('WorldMapScene', WorldMapScene); // 월드맵 씬 추가
        this.scene.add('CityScene', CityScene);

        this.scene.start('Preloader');
    }
}
