export interface DepositStream {
    id: string;
    name: string;
    startMonth: string;
    endMonth: string;
    monthlyAmount: number;
}

export interface PortfolioConfig {
    initialCapital: number;
    annualGrowthRate: number;
    annualInflationRate: number;
    depositStreams: DepositStream[];
    simulationStart: string;
    simulationEnd: string;
}

export interface ChartDataPoint {
    date: string;
    totalDeposited: number;
    nominalValue: number;
    realValue: number;
}