import { ChartDataPoint, Account, TransferStream, GlobalConfig } from '../types';

export interface AssetAllocation {
    name: string;
    value: number;
    color: string;
}

export function calculateAccount(accountId: string, allAccounts: Account[], global: GlobalConfig): { timeSeries: ChartDataPoint[], allocation: AssetAllocation[] } {
    const account = allAccounts.find(p => p.id === accountId);
    if (!account) return { timeSeries: [], allocation: [] };

    const config = account.config;
    const result: ChartDataPoint[] = [];
    const allocation: AssetAllocation[] = [];

    const monthlyGrowthMultiplier = Math.pow(1 + (config.annualGrowthRate / 100), 1 / 12);
    const monthlyInflationMultiplier = Math.pow(1 + (global.annualInflationRate / 100), 1 / 12);

    const assetTrackers = (config.assets || []).map(asset => ({
        id: asset.id,
        name: asset.name,
        currentValue: asset.value,
        monthlyMultiplier: Math.pow(1 + (asset.expectedGrowth / 100), 1 / 12)
    }));

    const incomingTransfers: {stream: TransferStream, fromAccountName: string}[] = [];
    allAccounts.forEach(p => {
        if (p.id !== accountId) {
            (p.config.transfers || []).forEach(t => {
                if (t.toAccountId === accountId) incomingTransfers.push({stream: t, fromAccountName: p.name});
            });
        }
    });

    let currentCash = config.initialCapital;

    // Allocation Chart (Ist-Zustand heute)
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
    if (currentCash > 0.01) allocation.push({ name: 'Cash (Konto)', value: Number(currentCash.toFixed(2)), color: '#3b82f6' });
    assetTrackers.forEach((tracker, index) => {
        if (tracker.currentValue > 0.01) {
            allocation.push({ name: tracker.name, value: Number(tracker.currentValue.toFixed(2)), color: colors[index % colors.length] });
        }
    });

    let currentTotalDeposited = config.initialCapital + assetTrackers.reduce((sum, a) => sum + a.currentValue, 0);
    let cumulativeInflation = 1;

    let [currentYear, currentMonth] = global.simulationStart.split('-').map(Number);
    const [endYear, endMonth] = global.simulationEnd.split('-').map(Number);

    const isStreamActive = (stream: any, currentMonthStr: string) => {
        if (stream.isOneOff) return currentMonthStr === stream.startMonth;
        return currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth;
    };

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
        let monthCashIn = 0;
        let monthCashOut = 0;

        // 1. Einzahlungen
        for (const stream of (config.depositStreams || [])) {
            if (isStreamActive(stream, currentMonthStr)) {
                currentTotalDeposited += stream.amount;
                if (stream.targetAssetId) {
                    const t = assetTrackers.find(a => a.id === stream.targetAssetId);
                    if (t) t.currentValue += stream.amount; else monthCashIn += stream.amount;
                } else { monthCashIn += stream.amount; }
            }
        }

        // 2. Eingehende Umbuchungen (Zählt als Deposit für dieses Konto)
        for (const {stream} of incomingTransfers) {
            if (isStreamActive(stream, currentMonthStr)) {
                const amountAfterTax = stream.amount * (1 - (stream.taxRate || 0) / 100);
                currentTotalDeposited += amountAfterTax;
                if (stream.toAssetId) {
                    const t = assetTrackers.find(a => a.id === stream.toAssetId);
                    if (t) t.currentValue += amountAfterTax; else monthCashIn += amountAfterTax;
                } else { monthCashIn += amountAfterTax; }
            }
        }

        // 3. Auszahlungen
        for (const stream of (config.withdrawalStreams || [])) {
            if (isStreamActive(stream, currentMonthStr)) {
                currentTotalDeposited -= stream.amount;
                if (stream.targetAssetId) {
                    const t = assetTrackers.find(a => a.id === stream.targetAssetId);
                    if (t) t.currentValue = Math.max(0, t.currentValue - stream.amount); else monthCashOut += stream.amount;
                } else { monthCashOut += stream.amount; }
            }
        }

        // 4. Ausgehende Umbuchungen
        for (const stream of (config.transfers || [])) {
            if (isStreamActive(stream, currentMonthStr)) {
                currentTotalDeposited -= stream.amount;
                if (stream.targetAssetId) {
                    const t = assetTrackers.find(a => a.id === stream.targetAssetId);
                    if (t) t.currentValue = Math.max(0, t.currentValue - stream.amount); else monthCashOut += stream.amount;
                } else { monthCashOut += stream.amount; }
            }
        }

        // Cash-Logik anwenden
        currentCash = currentCash * monthlyGrowthMultiplier;
        let availableCash = currentCash + monthCashIn;
        if (availableCash < monthCashOut) monthCashOut = Math.max(0, availableCash);
        currentCash = availableCash - monthCashOut;

        // Assets wachsen lassen
        let totalAssetValue = 0;
        const assetDataPoints: { [key: string]: number } = {};
        assetTrackers.forEach(tracker => {
            tracker.currentValue *= tracker.monthlyMultiplier;
            totalAssetValue += tracker.currentValue;
            assetDataPoints[tracker.name] = Number(tracker.currentValue.toFixed(2));
        });

        const currentNominalCapital = currentCash + totalAssetValue;
        cumulativeInflation *= monthlyInflationMultiplier;
        const currentRealCapital = currentNominalCapital / cumulativeInflation;

        result.push({
            date: currentMonthStr,
            totalDeposited: Number(currentTotalDeposited.toFixed(2)),
            nominalValue: Number(currentNominalCapital.toFixed(2)),
            realValue: Number(currentRealCapital.toFixed(2)),
            cashValue: Number(currentCash.toFixed(2)),
            ...assetDataPoints
        });

        currentMonth++;
        if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    }

    return { timeSeries: result, allocation };
}

// TOTAL WEALTH FIX: Zählt nun alle Assets für das Net-Worth Chart zusammen!
export function calculateTotalWealth(accounts: Account[], global: GlobalConfig): ChartDataPoint[] {
    if (accounts.length === 0) return [];

    const allResults = accounts.map(acc => calculateAccount(acc.id, accounts, global).timeSeries);
    if (allResults.length === 0 || allResults[0].length === 0) return [];

    const totalSeries: ChartDataPoint[] = [];

    for (let i = 0; i < allResults[0].length; i++) {
        let totalNominal = 0, totalReal = 0, totalDep = 0, totalCash = 0;
        const aggregatedPoint: any = { date: allResults[0][i].date };

        accounts.forEach((_, accIndex) => {
            const point = allResults[accIndex][i];
            if (point) {
                totalNominal += point.nominalValue;
                totalReal += point.realValue;
                totalDep += point.totalDeposited;
                totalCash += point.cashValue;

                // Alle individuellen Assets aufsummieren
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