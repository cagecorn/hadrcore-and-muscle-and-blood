# 신규 아키타입 생성 가이드라인 (NEW_ARCHETYPE_GUIDELINES.md)

이 문서는 새로운 아키타입과 관련 스킬을 생성할 때 일관성을 유지하고 필수 정보를 누락하지 않기 위한 체크리스트입니다.

## 1. 아키타입 정의 파일

새로운 아키타입의 정체성과 AI의 행동 패턴에 영향을 주는 핵심 정보를 정의합니다.

-   **파일 위치**: `src/game/data/archetypes/`
-   **파일명**: `[archetype_name].js` (예: `arcane_blade.js`)
-   **구조**:

```javascript
export const arcane_blade = {
  // (필수) 아키타입의 공식 명칭 (PascalCase)
  name: 'Arcane Blade',

  // (필수) 아키타입에 대한 간략한 설명
  description: 'A mage who imbues their weapon with arcane power...',

  // (필수) AI가 스킬을 선택할 때 우선순위를 결정하는 태그와 가중치 목록
  preferredTags: [
    { tag: 'MELEE', weight: 200 },
    { tag: 'CHARGE', weight: 150 },
    { tag: 'MAGIC', weight: 120 },
    // ...
  ],

  // (필수) 해당 아키타입을 부여받았을 때 얻는 초기 스탯 보너스
  startingBonus: {
    strength: 5,
    intelligence: 0,
    // ...
  }
};
```

## 2. 전용 스킬 카드 파일

아키타입의 컨셉을 구체화하는 고유 스킬들을 정의합니다.

-   **파일 위치**: `src/game/data/skills/`
-   **파일명**: `[skill_name].js` (예: `mana_strike.js`)
-   **구조**:

```javascript
export const mana_strike = {
  // (필수) 스킬의 공식 명칭
  name: 'Mana Strike',

  // (필수) 스킬 사용에 필요한 토큰 비용
  cost: 2,

  // (필수) 스킬을 사용할 수 있는 클래스 (배열)
  requiredClass: ['NANOMANCER'],

  // (필수) 스킬의 속성을 나타내는 태그 목록
  tags: ['MELEE', 'MAGIC', 'ATTACK'],

  // (필수) 음양 시스템에 영향을 주는 값 (양: +, 음: -)
  yinYangValue: -1,

  // (필수) 스킬 재사용에 필요한 턴 수
  cooldown: 0,

  // (필수) 스킬 카드의 이미지 경로. 없을 경우 null
  illustrationPath: null,

  // (필수) 게임 내에 표시될 스킬 설명
  description: 'Strike a nearby enemy with a mana-infused blade...',

  // (필수) 실제 게임 로직에 사용될 효과 설명
  effect: 'Deal 8 hybrid damage to an adjacent enemy.',
};
```

## 3. 아키타입 트리거 설정

생성된 아키타입이 어떤 MBTI를 가진 용병에게 부여될지 설정합니다.

-   **파일 위치**: `src/game/data/archetypeTriggers.js`
-   **수정 대상**: `archetypeTriggers` 객체 내의 해당 클래스 배열
-   **구조**:

```javascript
export const archetypeTriggers = {
  NANOMANCER: [
    // 기존 아키타입들...
    { archetype: 'FROSTWEAVER', mbti: ['I', 'T'] },

    // (필수) 새로 추가할 아키타입과 트리거 MBTI
    { archetype: 'ARCANE_BLADE', mbti: ['E', 'S'] },
    { archetype: 'FORCE_MAJOR', mbti: ['N', 'J'] },
  ],
  WARRIOR: [
    // ...
  ],
  // ...
};
```

---
