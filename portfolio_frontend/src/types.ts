export interface DepositStream {
    id: string;
    name: string;
    startMonth: string;
    endMonth: string;
    monthlyAmount: number;
}

export interface StockPosition {
    id: string;
    symbol: string;
    name: string;
    shares: number;
    price: number;
    currency: string;
    expectedGrowth: number;
}

export interface PortfolioConfig {
    initialCapital: number;
    annualGrowthRate: number;
    annualInflationRate: number;
    simulationStart: string;
    simulationEnd: string;
    depositStreams: DepositStream[];
    stocks: StockPosition[];
}

export interface Portfolio {
    id: string;
    name: string;
    config: PortfolioConfig;
}

export interface ChartDataPoint {
    date: string;
    totalDeposited: number;
    nominalValue: number;
    realValue: number;
}