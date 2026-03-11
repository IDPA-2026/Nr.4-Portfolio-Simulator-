import { PortfolioConfig, ChartDataPoint } from '../types';

export function calculatePortfolio(config: PortfolioConfig): ChartDataPoint[] {
    const result: ChartDataPoint[] = [];

    const monthlyGrowthMultiplier = Math.pow(1 + (config.annualGrowthRate / 100), 1 / 12);
    const monthlyInflationMultiplier = Math.pow(1 + (config.annualInflationRate / 100), 1 / 12);

    // Aktienwert berechnen und zum Startkapital addieren
    const stockValue = (config.stocks || []).reduce((sum, stock) => {
        return sum + (stock.price * stock.shares);
    }, 0);

    let currentNominalCapital = config.initialCapital + stockValue;
    let currentTotalDeposited = config.initialCapital + stockValue;
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

        currentNominalCapital = currentNominalCapital * monthlyGrowthMultiplier;
        currentNominalCapital += monthlyDeposit;
        currentTotalDeposited += monthlyDeposit;

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