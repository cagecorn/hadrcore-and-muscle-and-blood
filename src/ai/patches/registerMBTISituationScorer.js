import { skillScoreEngine } from '../../game/utils/SkillScoreEngine.js';
import { mbtiSituationScore } from '../situation/mbtiSituationScorer.js';

if(!skillScoreEngine.__hasMBTISituationScorer){
  skillScoreEngine.scorers.push({
    name: 'MBTISituationScorer',
    weight: 1.0,
    logic: (unit, skill, target, allies, enemies) => {
      try { return mbtiSituationScore(unit, skill, target, allies, enemies); }
      catch(e){ return 0; }
    }
  });
  skillScoreEngine.__hasMBTISituationScorer = true;
}
