import { AccountConfig, ChartDataPoint, Account, TransferStream, GlobalConfig } from '../types';

export interface AssetAllocation {
    name: string;
    value: number;
    color: string;
}

function runSimulation(accounts: Account[], global: GlobalConfig) {
    const state = accounts.map(acc => {
        const safeGrowth = Math.max(-99.99, Number(acc.config.annualGrowthRate) || 0);
        return {
            id: acc.id,
            cash: Math.max(0, Number(acc.config.initialCapital) || 0),
            totalDeposited: Math.max(0, Number(acc.config.initialCapital) || 0),
            assets: (acc.config.assets || []).map(a => {
                const safeAssetGrowth = Math.max(-99.99, Number(a.expectedGrowth) || 0);
                return {
                    id: a.id, name: a.name, value: Math.max(0, Number(a.value) || 0),
                    growthMultiplier: Math.pow(1 + (safeAssetGrowth / 100), 1 / 12)
                };
            }),
            growthMultiplier: Math.pow(1 + (safeGrowth / 100), 1 / 12),
            history: [] as ChartDataPoint[],
            config: acc.config
        };
    });

    state.forEach(s => {
        s.totalDeposited += s.assets.reduce((sum, a) => sum + a.value, 0);
    });

    const allocations: Record<string, AssetAllocation[]> = {};
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

    state.forEach(s => {
        allocations[s.id] = [];
        if (s.cash > 0.01) allocations[s.id].push({ name: 'Cash (Konto)', value: Number(s.cash.toFixed(2)), color: '#3b82f6' });
        if (s.config.isDetailedMode) {
            s.assets.forEach((a, i) => {
                if (a.value > 0.01) allocations[s.id].push({ name: a.name, value: Number(a.value.toFixed(2)), color: colors[i % colors.length] });
            });
        }
    });

    let [currentYear, currentMonth] = (global.simulationStart || '2026-01').split('-').map(Number);
    const [endYear, endMonth] = (global.simulationEnd || '2056-01').split('-').map(Number);

    let cumulativeInflation = 1;
    const safeInflation = Math.max(-99.99, Number(global.annualInflationRate) || 0);
    const monthlyInflationMultiplier = Math.pow(1 + (safeInflation / 100), 1 / 12);

    const isStreamActive = (stream: any, currentMonthStr: string) => {
        if (stream.isOneOff) return currentMonthStr === stream.startMonth;
        return currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth;
    };

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

        state.forEach(s => {
            s.cash *= s.growthMultiplier;
            if (s.config.isDetailedMode) {
                s.assets.forEach(a => a.value *= a.growthMultiplier);
            }
        });

        state.forEach(s => {
            for (const stream of (s.config.depositStreams || [])) {
                if (isStreamActive(stream, currentMonthStr)) {
                    const amount = Math.max(0, Number(stream.amount) || 0);
                    s.totalDeposited += amount;
                    if (stream.targetAssetId && s.config.isDetailedMode) {
                        const t = s.assets.find(a => a.id === stream.targetAssetId);
                        if (t) t.value += amount; else s.cash += amount;
                    } else { s.cash += amount; }
                }
            }
        });

        state.forEach(sourceState => {
            for (const stream of (sourceState.config.transfers || [])) {
                if (isStreamActive(stream, currentMonthStr)) {
                    const targetState = state.find(s => s.id === stream.toAccountId);
                    if (!targetState) continue;

                    const requested = Math.max(0, Number(stream.amount) || 0);
                    let actualSend = 0;

                    if (stream.targetAssetId && sourceState.config.isDetailedMode) {
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

                    const safeTaxRate = Math.max(0, Math.min(100, Number(stream.taxRate) || 0));
                    const actualReceive = actualSend * (1 - safeTaxRate / 100);

                    if(sourceState.id !== targetState.id) {
                        targetState.totalDeposited += actualReceive;
                    } else {
                        sourceState.totalDeposited -= (actualSend - actualReceive);
                    }

                    if (stream.toAssetId && targetState.config.isDetailedMode) {
                        const t = targetState.assets.find(a => a.id === stream.toAssetId);
                        if (t) t.value += actualReceive; else targetState.cash += actualReceive;
                    } else {
                        targetState.cash += actualReceive;
                    }
                }
            }
        });

        state.forEach(s => {
            for (const stream of (s.config.withdrawalStreams || [])) {
                if (isStreamActive(stream, currentMonthStr)) {
                    const amount = Math.max(0, Number(stream.amount) || 0);
                    if (stream.targetAssetId && s.config.isDetailedMode) {
                        const t = s.assets.find(a => a.id === stream.targetAssetId);
                        if (t) {
                            const actualSell = Math.min(t.value, amount);
                            t.value -= actualSell;
                            s.totalDeposited -= actualSell;
                        } else {
                            const actualWithdraw = Math.min(s.cash, amount);
                            s.cash -= actualWithdraw;
                            s.totalDeposited -= actualWithdraw;
                        }
                    } else {
                        const actualWithdraw = Math.min(s.cash, amount);
                        s.cash -= actualWithdraw;
                        s.totalDeposited -= actualWithdraw;
                    }
                }
            }
        });

        state.forEach(sourceState => {
            if (sourceState.config.liquidation?.active && currentMonthStr === sourceState.config.liquidation.date) {
                let totalAvailable = sourceState.cash;
                if (sourceState.config.isDetailedMode) {
                    sourceState.assets.forEach(a => {
                        totalAvailable += a.value;
                        a.value = 0;
                    });
                }

                let remainingCash = totalAvailable;

                sourceState.config.liquidation.splits.forEach(split => {
                    const targetState = state.find(s => s.id === split.toAccountId);
                    if (targetState && targetState.id !== sourceState.id) {
                        const safePct = Math.max(0, Math.min(100, Number(split.percentage) || 0));
                        const requestedAmount = totalAvailable * (safePct / 100);

                        const actualTransfer = Math.min(remainingCash, requestedAmount);

                        if (actualTransfer > 0) {
                            targetState.cash += actualTransfer;
                            targetState.totalDeposited += actualTransfer;
                            sourceState.totalDeposited -= actualTransfer;
                            remainingCash -= actualTransfer;
                        }
                    }
                });

                sourceState.cash = remainingCash;
            }
        });

        cumulativeInflation *= monthlyInflationMultiplier;

        state.forEach(s => {
            let totalAssetValue = 0;
            const assetDataPoints: any = {};

            if (s.config.isDetailedMode) {
                s.assets.forEach(a => {
                    totalAssetValue += a.value;
                    assetDataPoints[a.name] = Number((a.value / cumulativeInflation).toFixed(2)) || 0;
                });
            }

            const currentNominalCapital = s.cash + totalAssetValue;

            s.history.push({
                date: currentMonthStr,
                totalDeposited: Number(s.totalDeposited.toFixed(2)) || 0,
                realValue: Number((currentNominalCapital / cumulativeInflation).toFixed(2)) || 0,
                cashValue: Number(s.cash.toFixed(2)) || 0,
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
        let totalReal = 0, totalDep = 0, totalCash = 0;
        const aggregatedPoint: any = { date: sim.state[0].history[i].date };

        sim.state.forEach(s => {
            const point = s.history[i];
            if (point) {
                totalReal += point.realValue || 0;
                totalDep += point.totalDeposited || 0;
                totalCash += point.cashValue || 0;

                Object.keys(point).forEach(key => {
                    if (!['date', 'totalDeposited', 'realValue', 'cashValue'].includes(key)) {
                        aggregatedPoint[key] = (aggregatedPoint[key] || 0) + (Number(point[key]) || 0);
                    }
                });
            }
        });

        totalSeries.push({
            ...aggregatedPoint,
            totalDeposited: Number(totalDep.toFixed(2)) || 0,
            realValue: Number(totalReal.toFixed(2)) || 0,
            cashValue: Number(totalCash.toFixed(2)) || 0
        });
    }

    return totalSeries;
}