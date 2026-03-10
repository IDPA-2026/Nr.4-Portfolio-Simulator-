import { PortfolioConfig, ChartDataPoint } from '../types';

export function calculatePortfolio(config: PortfolioConfig): ChartDataPoint[] {
    const result: ChartDataPoint[] = [];

    const monthlyGrowthMultiplier = Math.pow(1 + (config.annualGrowthRate / 100), 1 / 12);
    const monthlyInflationMultiplier = Math.pow(1 + (config.annualInflationRate / 100), 1 / 12);

    let currentNominalCapital = config.initialCapital;
    let currentTotalDeposited = config.initialCapital;
    let cumulativeInflation = 1;

    const startDate = new Date(config.simulationStart + "-01");
    const endDate = new Date(config.simulationEnd + "-01");
    let currentDate = new Date(startDate.getTime());

    while (currentDate <= endDate) {
        const currentMonthStr = currentDate.toISOString().slice(0, 7);

        let monthlyDeposit = 0;
        config.depositStreams.forEach(stream => {
            if (currentMonthStr >= stream.startMonth && currentMonthStr <= stream.endMonth) {
                monthlyDeposit += stream.monthlyAmount;
            }
        });

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

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return result;
}