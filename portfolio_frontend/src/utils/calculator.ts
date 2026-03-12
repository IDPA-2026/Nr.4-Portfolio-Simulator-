import { PortfolioConfig, ChartDataPoint } from '../types';

export function calculatePortfolio(config: PortfolioConfig): ChartDataPoint[] {
    const result: ChartDataPoint[] = [];

    const monthlyGrowthMultiplier = Math.pow(1 + (config.annualGrowthRate / 100), 1 / 12);
    const monthlyInflationMultiplier = Math.pow(1 + (config.annualInflationRate / 100), 1 / 12);

    const stockTrackers = (config.stocks || []).map(stock => ({
        currentValue: stock.price * stock.shares,
        monthlyMultiplier: Math.pow(1 + (stock.expectedGrowth / 100), 1 / 12)
    }));

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

    return result;
}