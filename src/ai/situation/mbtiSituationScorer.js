import { SKILL_TAGS } from '../../game/utils/SkillTagManager.js';
import { deriveSituation } from './deriveSituation.js';
import { MBTI_TRAITS, getMBTIString } from '../mbtiProfiles.js';

const DEBUG_MBTI_SITUATION = false;

export function mbtiSituationScore(unit, skillData, target, allies=[], enemies=[]){
  const mbti = getMBTIString(unit);
  if(!mbti) return 0;
  const traits = MBTI_TRAITS[mbti] || MBTI_TRAITS['ISTJ'];

  const S = deriveSituation(unit, allies, enemies);
  const tags = skillData?.tags || [];
  let bonus = 0;

  const is = t => tags.includes(t);
  const preferIf  = (cond,w)=>{ if(cond) bonus+=w; };
  const penalizeIf=(cond,w)=>{ if(cond) bonus-=w; };

  // 1) 팀플레이/서포트
  if(is(SKILL_TAGS.HEAL)||is(SKILL_TAGS.AID)||is(SKILL_TAGS.BUFF)){
    const need = S.lowHealthAllyCount;
    bonus += traits.support * (need*12 + (S.hpPct<0.5?6:0));
    bonus += traits.teamwork * (S.allyClose>=2 ? 8 : 0);
  }

  // 2) 공격/딜
  if(skillData.type==='ATTACK'||is(SKILL_TAGS.DAMAGE)){
    const cluster = Math.max(0, S.enemyClose-1);
    bonus += traits.aggression * (10 + cluster*6);
    bonus += (traits.risk - 0.5) * (S.allyAdvantage<0 ? 12 : 4);
  }

  // 3) 처형각
  if(is(SKILL_TAGS.EXECUTE) && target){
    const tmh = target?.finalStats?.hp || target?.maxHp || 1;
    const thp = Math.max(0,Math.min(1,target.currentHp/tmh));
    preferIf(thp<=0.35, traits.risk*25 + traits.burst*10);
    penalizeIf(thp>0.6, 6*(1-traits.risk));
  }

  // 4) 제어/디버프
  if(is(SKILL_TAGS.CROWD_CONTROL)||is(SKILL_TAGS.DEBUFF)||is(SKILL_TAGS.BIND)||is(SKILL_TAGS.STUN)){
    bonus += traits.objective * (S.enemyClose>=2 ? 14 : 8);
    bonus += traits.focus * (S.threatened ? 10 : 0);
  }

  // 5) 재배치/카이팅
  if(is(SKILL_TAGS.REPOSITION)||is(SKILL_TAGS.DASH)||is(SKILL_TAGS.KITE)||is(SKILL_TAGS.MOBILITY)){
    bonus += traits.kite * (S.threatened ? 14 : 4);
    bonus += traits.teamwork * (S.isolated ? 8 : 0);
  }

  // 6) 수비/생존
  if(is(SKILL_TAGS.GUARD)||is(SKILL_TAGS.WILL_GUARD)||is(SKILL_TAGS.SHIELD)){
    bonus += traits.sustain * (S.threatened ? 16 : 6);
    bonus += (1 - traits.risk) * (S.allyAdvantage<0 ? 10 : 0);
  }

  // 7) 보정: 원거리/근접 성향
  if(is(SKILL_TAGS.RANGED)) bonus += traits.kite * (S.allyAdvantage<=0?6:2);
  if(is(SKILL_TAGS.MELEE))  bonus += traits.aggression * (S.allyAdvantage>0?8:-6);

  // 8) 저체력 무리수 방지
  if(S.hpPct < 0.3){
    bonus += (traits.risk - 0.5) * -18;
    bonus += (1 - traits.risk) * 6;
  }

  if(bonus>60) bonus=60;
  if(bonus<-40) bonus=-40;

  if(DEBUG_MBTI_SITUATION){
    console.debug('[MBTI×SIT]', unit?.instanceName, { mbti, S, tags, bonus });
  }

  return bonus;
}
