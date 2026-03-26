// utils/calculator.ts
import { PortfolioConfig, ChartDataPoint, Portfolio, TransferStream } from '../types';

export interface AssetAllocation {
    name: string;
    value: number;
    color: string;
}

export function calculatePortfolio(portfolioId: string, allPortfolios: Portfolio[]): { timeSeries: ChartDataPoint[], allocation: AssetAllocation[] } {
    const portfolio = allPortfolios.find(p => p.id === portfolioId);
    if (!portfolio) return { timeSeries: [], allocation: [] };

    const config = portfolio.config;
    const result: ChartDataPoint[] = [];
    const allocation: AssetAllocation[] = [];

    const monthlyGrowthMultiplier = Math.pow(1 + (config.annualGrowthRate / 100), 1 / 12);
    const monthlyInflationMultiplier = Math.pow(1 + (config.annualInflationRate / 100), 1 / 12);

    const assetTrackers = (config.assets || []).map(asset => {
        return {
            name: asset.name,
            currentValue: asset.value,
            monthlyMultiplier: Math.pow(1 + (asset.expectedGrowth / 100), 1 / 12)
        };
    });

    const incomingTransfers: TransferStream[] = [];
    allPortfolios.forEach(p => {
        if (p.id !== portfolioId) {
            (p.config.transfers || []).forEach(t => {
                if (t.toPortfolioId === portfolioId) {
                    incomingTransfers.push(t);
                }
            });
        }
    });

    let currentCash = config.initialCapital;

    // ==========================================
    // ALLOCATION BERECHNEN (AKTUELLER STAND)
    // Wir machen das VOR der Jahresschleife!
    // ==========================================
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

    if (currentCash > 0.01) {
        allocation.push({
            name: 'Cash (Konto)',
            value: Number(currentCash.toFixed(2)),
            color: '#3b82f6'
        });
    }

    assetTrackers.forEach((tracker, index) => {
        if (tracker.currentValue > 0.01) {
            allocation.push({
                name: tracker.name,
                value: Number(tracker.currentValue.toFixed(2)),
                color: colors[index % colors.length]
            });
        }
    });
    // ==========================================

    let currentTotalDeposited = config.initialCapital + assetTrackers.reduce((sum, a) => sum + a.currentValue, 0);
    let cumulativeInflation = 1;

    let [currentYear, currentMonth] = config.simulationStart.split('-').map(Number);
    const [endYear, endMonth] = config.simulationEnd.split('-').map(Number);

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

        let monthlyDeposit = 0;
        for (let i = 0; i < (config.depositStreams || []).length; i++) {
            const stream = config.depositStreams[i];
            if (currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth) {
                monthlyDeposit += stream.monthlyAmount;
            }
        }
        for (let i = 0; i < incomingTransfers.length; i++) {
            const stream = incomingTransfers[i];
            if (currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth) {
                monthlyDeposit += stream.monthlyAmount;
            }
        }

        let monthlyWithdrawal = 0;
        for (let i = 0; i < (config.withdrawalStreams || []).length; i++) {
            const stream = config.withdrawalStreams[i];
            if (currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth) {
                monthlyWithdrawal += stream.monthlyAmount;
            }
        }
        for (let i = 0; i < (config.transfers || []).length; i++) {
            const stream = config.transfers[i];
            if (currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth) {
                monthlyWithdrawal += stream.monthlyAmount;
            }
        }

        // 1. Wachstum auf bestehenden Cash-Bestand anwenden
        currentCash = currentCash * monthlyGrowthMultiplier;

        // 2. Verfügbaren Cash berechnen
        let availableCash = currentCash + monthlyDeposit;
        let actualWithdrawal = monthlyWithdrawal;

        // 3. Verhindern, dass das Konto ins Minus rutscht
        if (availableCash < actualWithdrawal) {
            actualWithdrawal = Math.max(0, availableCash); // Man kann nur entnehmen, was da ist
        }

        // 4. Neuen Cash-Bestand und Total Deposited setzen
        currentCash = availableCash - actualWithdrawal;
        currentTotalDeposited += (monthlyDeposit - actualWithdrawal);

        let totalAssetValue = 0;
        const assetDataPoints: { [key: string]: number } = {};

        assetTrackers.forEach(tracker => {
            tracker.currentValue *= tracker.monthlyMultiplier;
            totalAssetValue += tracker.currentValue;
            assetDataPoints[tracker.name] = Number(tracker.currentValue.toFixed(2));
        });

        const currentNominalCapital = currentCash + totalAssetValue;
        cumulativeInflation = cumulativeInflation * monthlyInflationMultiplier;
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
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    return { timeSeries: result, allocation };
}