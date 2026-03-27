import { ChartDataPoint, Account, GlobalConfig } from '../types';

export interface AssetAllocation {
    name: string;
    value: number;
    color: string;
}

function runSimulation(accounts: Account[], global: GlobalConfig) {
    const state = accounts.map(acc => ({
        id: acc.id,
        cash: Number(acc.config.initialCapital) || 0,
        totalDeposited: Number(acc.config.initialCapital) || 0,
        assets: (acc.config.assets || []).map(a => ({
            id: a.id, name: a.name, value: Number(a.value) || 0,
            growthMultiplier: Math.pow(1 + ((Number(a.expectedGrowth) || 0) / 100), 1 / 12)
        })),
        growthMultiplier: Math.pow(1 + ((Number(acc.config.annualGrowthRate) || 0) / 100), 1 / 12),
        history: [] as ChartDataPoint[],
        config: acc.config
    }));

    state.forEach(s => {
        s.totalDeposited += s.assets.reduce((sum, a) => sum + a.value, 0);
    });

    const allocations: Record<string, AssetAllocation[]> = {};
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

    state.forEach(s => {
        allocations[s.id] = [];
        if (s.cash > 0.01) allocations[s.id].push({ name: 'Cash (Konto)', value: Number(s.cash.toFixed(2)), color: '#3b82f6' });
        s.assets.forEach((a, i) => {
            if (a.value > 0.01) allocations[s.id].push({ name: a.name, value: Number(a.value.toFixed(2)), color: colors[i % colors.length] });
        });
    });

    let [currentYear, currentMonth] = global.simulationStart.split('-').map(Number);
    const [endYear, endMonth] = global.simulationEnd.split('-').map(Number);
    let cumulativeInflation = 1;
    const monthlyInflationMultiplier = Math.pow(1 + ((Number(global.annualInflationRate) || 0) / 100), 1 / 12);

    const isStreamActive = (stream: any, currentMonthStr: string) => {
        if (stream.isOneOff) return currentMonthStr === stream.startMonth;
        return currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth;
    };

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

        state.forEach(s => {
            s.cash *= s.growthMultiplier;
            s.assets.forEach(a => a.value *= a.growthMultiplier);
        });

        state.forEach(s => {
            let monthCashIn = 0;
            let monthCashOut = 0;

            for (const stream of (s.config.depositStreams || [])) {
                if (isStreamActive(stream, currentMonthStr)) {
                    const amount = Number(stream.amount) || 0;
                    s.totalDeposited += amount;
                    if (stream.targetAssetId) {
                        const t = s.assets.find(a => a.id === stream.targetAssetId);
                        if (t) t.value += amount; else monthCashIn += amount;
                    } else { monthCashIn += amount; }
                }
            }

            for (const stream of (s.config.withdrawalStreams || [])) {
                if (isStreamActive(stream, currentMonthStr)) {
                    const amount = Number(stream.amount) || 0;
                    if (stream.targetAssetId) {
                        const t = s.assets.find(a => a.id === stream.targetAssetId);
                        if (t) {
                            const actualSell = Math.min(t.value, amount);
                            t.value -= actualSell;
                            s.totalDeposited -= actualSell;
                        } else {
                            const actualWithdraw = Math.min(s.cash, amount);
                            monthCashOut += actualWithdraw;
                            s.totalDeposited -= actualWithdraw;
                        }
                    } else {
                        const actualWithdraw = Math.min(s.cash, amount);
                        monthCashOut += actualWithdraw;
                        s.totalDeposited -= actualWithdraw;
                    }
                }
            }

            s.cash += monthCashIn;
            s.cash -= monthCashOut;
        });

        state.forEach(sourceState => {
            for (const stream of (sourceState.config.transfers || [])) {
                if (isStreamActive(stream, currentMonthStr)) {
                    const targetState = state.find(s => s.id === stream.toAccountId);
                    if (!targetState) continue;

                    const requested = Number(stream.amount) || 0;
                    let actualSend = 0;

                    if (stream.targetAssetId) {
                        const t = sourceState.assets.find(a => a.id === stream.targetAssetId);
                        if (t) {
                            actualSend = Math.min(t.value, requested);
                            t.value -= actualSend;
                        } else {
                            actualSend = Math.min(sourceState.cash, requested);
                            sourceState.cash -= actualSend;
                        }
                    } else {
                        actualSend = Math.min(sourceState.cash, requested);
                        sourceState.cash -= actualSend;
                    }

                    if(sourceState.id !== targetState.id) {
                        sourceState.totalDeposited -= actualSend;
                    }

                    const tax = Number(stream.taxRate) || 0;
                    const actualReceive = actualSend * (1 - tax / 100);

                    if(sourceState.id !== targetState.id) {
                        targetState.totalDeposited += actualReceive;
                    } else {
                        sourceState.totalDeposited -= (actualSend - actualReceive);
                    }

                    if (stream.toAssetId) {
                        const t = targetState.assets.find(a => a.id === stream.toAssetId);
                        if (t) t.value += actualReceive; else targetState.cash += actualReceive;
                    } else {
                        targetState.cash += actualReceive;
                    }
                }
            }
        });

        cumulativeInflation *= monthlyInflationMultiplier;

        state.forEach(s => {
            let totalAssetValue = 0;
            const assetDataPoints: any = {};
            s.assets.forEach(a => {
                totalAssetValue += a.value;
                assetDataPoints[a.name] = Number(a.value.toFixed(2));
            });

            const currentNominalCapital = s.cash + totalAssetValue;
            const currentRealCapital = currentNominalCapital / cumulativeInflation;

            s.history.push({
                date: currentMonthStr,
                totalDeposited: Number(s.totalDeposited.toFixed(2)),
                nominalValue: Number(currentNominalCapital.toFixed(2)),
                realValue: Number(currentRealCapital.toFixed(2)),
                cashValue: Number(s.cash.toFixed(2)),
                ...assetDataPoints
            });
        });

        currentMonth++;
        if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    }

    return { state, allocations };
}

export function calculateAccount(accountId: string, allAccounts: Account[], global: GlobalConfig): { timeSeries: ChartDataPoint[], allocation: AssetAllocation[] } {
    const sim = runSimulation(allAccounts, global);
    const acc = sim.state.find(s => s.id === accountId);
    return { timeSeries: acc?.history || [], allocation: sim.allocations[accountId] || [] };
}

export function calculateTotalWealth(accounts: Account[], global: GlobalConfig): ChartDataPoint[] {
    if (accounts.length === 0) return [];

    const sim = runSimulation(accounts, global);
    if (sim.state.length === 0 || sim.state[0].history.length === 0) return [];

    const totalSeries: ChartDataPoint[] = [];

    for (let i = 0; i < sim.state[0].history.length; i++) {
        let totalNominal = 0, totalReal = 0, totalDep = 0, totalCash = 0;
        const aggregatedPoint: any = { date: sim.state[0].history[i].date };

        sim.state.forEach(s => {
            const point = s.history[i];
            if (point) {
                totalNominal += point.nominalValue;
                totalReal += point.realValue;
                totalDep += point.totalDeposited;
                totalCash += point.cashValue;

                Object.keys(point).forEach(key => {
                    if (!['date', 'totalDeposited', 'nominalValue', 'realValue', 'cashValue'].includes(key)) {
                        aggregatedPoint[key] = (aggregatedPoint[key] || 0) + point[key];
                    }
                });
            }
        });

        totalSeries.push({
            ...aggregatedPoint,
            totalDeposited: Number(totalDep.toFixed(2)),
            nominalValue: Number(totalNominal.toFixed(2)),
            realValue: Number(totalReal.toFixed(2)),
            cashValue: Number(totalCash.toFixed(2))
        });
    }

    return totalSeries;
}