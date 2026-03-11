import { PortfolioConfig, ChartDataPoint } from '../types';

export function calculatePortfolio(config: PortfolioConfig): ChartDataPoint[] {
    const result: ChartDataPoint[] = [];

    const monthlyGrowthMultiplier = Math.pow(1 + (config.annualGrowthRate / 100), 1 / 12);
    const monthlyInflationMultiplier = Math.pow(1 + (config.annualInflationRate / 100), 1 / 12);

    let currentNominalCapital = config.initialCapital;
    let currentTotalDeposited = config.initialCapital;
    let cumulativeInflation = 1;

    // Start- und Enddatum in schnelle Integer zerlegen statt langsame Date-Objekte zu nutzen
    let [currentYear, currentMonth] = config.simulationStart.split('-').map(Number);
    const [endYear, endMonth] = config.simulationEnd.split('-').map(Number);

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        // String im Format YYYY-MM bauen (z.B. 2024-05)
        const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

        let monthlyDeposit = 0;
        // Normale for-Schleife ist minimal schneller als .forEach
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

        // Monat manuell hochzählen
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    return result;
}