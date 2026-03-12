import { PortfolioConfig, ChartDataPoint } from '../types';

export interface AssetAllocation {
    name: string;
    value: number;
    color: string;
}

export function calculatePortfolio(config: PortfolioConfig): { timeSeries: ChartDataPoint[], allocation: AssetAllocation[] } {
    const result: ChartDataPoint[] = [];
    const allocation: AssetAllocation[] = [];

    const monthlyGrowthMultiplier = Math.pow(1 + (config.annualGrowthRate / 100), 1 / 12);
    const monthlyInflationMultiplier = Math.pow(1 + (config.annualInflationRate / 100), 1 / 12);

    const stockTrackers = (config.stocks || []).map(stock => {
        let priceInBaseCurrency = stock.price;
        if (stock.currency === 'USD') {
            priceInBaseCurrency = stock.price * config.usdToChfRate;
        }

        const initialValue = priceInBaseCurrency * stock.shares;

        return {
            name: stock.symbol,
            originalCurrency: stock.currency,
            currentValue: initialValue,
            monthlyMultiplier: Math.pow(1 + (stock.expectedGrowth / 100), 1 / 12)
        };
    });

    let currentCash = config.initialCapital;
    let currentTotalDeposited = config.initialCapital + stockTrackers.reduce((sum, s) => sum + s.currentValue, 0);
    let cumulativeInflation = 1;

    let [currentYear, currentMonth] = config.simulationStart.split('-').map(Number);
    const [endYear, endMonth] = config.simulationEnd.split('-').map(Number);

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

        let monthlyDeposit = 0;
        for (let i = 0; i < config.depositStreams.length; i++) {
            const stream = config.depositStreams[i];
            if (currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth) {
                monthlyDeposit += stream.monthlyAmount;
            }
        }

        currentCash = (currentCash * monthlyGrowthMultiplier) + monthlyDeposit;
        currentTotalDeposited += monthlyDeposit;

        let totalStockValue = 0;
        stockTrackers.forEach(tracker => {
            tracker.currentValue *= tracker.monthlyMultiplier;
            totalStockValue += tracker.currentValue;
        });

        const currentNominalCapital = currentCash + totalStockValue;
        cumulativeInflation = cumulativeInflation * monthlyInflationMultiplier;
        const currentRealCapital = currentNominalCapital / cumulativeInflation;

        result.push({
            date: currentMonthStr,
            totalDeposited: Number(currentTotalDeposited.toFixed(2)),
            nominalValue: Number(currentNominalCapital.toFixed(2)),
            realValue: Number(currentRealCapital.toFixed(2))
        });

        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

    if (config.initialCapital > 0) {
        allocation.push({
            name: 'Cash (Startkapital)',
            value: Number(config.initialCapital.toFixed(2)),
            color: '#3b82f6'
        });
    }

    stockTrackers.forEach((tracker, index) => {
        if (tracker.currentValue > 0) {
            allocation.push({
                name: tracker.name,
                value: Number(tracker.currentValue.toFixed(2)),
                color: colors[index % colors.length]
            });
        }
    });

    return { timeSeries: result, allocation };
}