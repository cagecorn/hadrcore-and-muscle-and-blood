export function StatsComponent(stats) {
    return {
        ...stats,
        currentHp: stats.hp,
        currentBarrier: 0,
        maxBarrier: 0,
    };
}
