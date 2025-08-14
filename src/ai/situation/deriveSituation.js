function dist(a,b){
  if(!a||!b) return 99;
  const rA = a.row ?? a.y ?? 0, cA = a.col ?? a.x ?? 0;
  const rB = b.row ?? b.y ?? 0, cB = b.col ?? b.x ?? 0;
  return Math.abs(rA-rB)+Math.abs(cA-cB);
}
function nearestDistanceTo(list,me){
  let best=Infinity;
  for(const u of list||[]){
    if(!u||u===me||u.currentHp<=0) continue;
    const d=dist(u,me); if(d<best) best=d;
  }
  return Number.isFinite(best)?best:99;
}
export function deriveSituation(unit,allies=[],enemies=[]){
  const maxHp = unit?.finalStats?.hp || unit?.maxHp || 1;
  const hpPct = Math.max(0,Math.min(1,(unit?.currentHp??maxHp)/maxHp));

  const alliesAlive = (allies||[]).filter(a=>a.currentHp>0).length;
  const enemiesAlive = (enemies||[]).filter(e=>e.currentHp>0).length;
  const total = Math.max(1, alliesAlive+enemiesAlive);
  const allyAdvantage = (alliesAlive - enemiesAlive)/total; // -1..+1

  const nearestEnemyDist = nearestDistanceTo(enemies,unit);
  const nearestAllyDist  = nearestDistanceTo(allies,unit);

  const threatRange = (unit?.finalStats?.range ?? 1)+1;
  const threatened = nearestEnemyDist <= threatRange;
  const isolated   = nearestAllyDist >= 4;

  const enemyClose = (enemies||[]).filter(e=>dist(e,unit)<=2 && e.currentHp>0).length;
  const allyClose  = (allies ||[]).filter(a=>dist(a,unit)<=2 && a.currentHp>0).length;

  const lowHealthAllyCount = (allies||[]).filter(a=>{
    const mh = a?.finalStats?.hp || a?.maxHp || 1;
    return a.currentHp>0 && (a.currentHp/mh)<=0.5;
  }).length;

  return { hpPct, alliesAlive, enemiesAlive, allyAdvantage,
           nearestEnemyDist, nearestAllyDist, threatened, isolated,
           enemyClose, allyClose, lowHealthAllyCount };
}
