export interface PortfolioConfig {
    initialCapital: number;
    baseCurrency: string;
    usdToChfRate: number;
    annualGrowthRate: number;
    annualInflationRate: number;
    simulationStart: string;
    simulationEnd: string;
    depositStreams: DepositStream[];
    withdrawalStreams: DepositStream[];
    transfers: TransferStream[];
    assets: AssetPosition[];
}

export interface DepositStream {
    id: string;
    name: string;
    startMonth: string;
    endMonth: string;
    monthlyAmount: number;
}

export interface TransferStream {
    id: string;
    name: string;
    startMonth: string;
    endMonth: string;
    monthlyAmount: number;
    toPortfolioId: string;
}

export interface AssetPosition {
    id: string;
    name: string;
    value: number;
    expectedGrowth: number;
}

export interface ChartDataPoint {
    date: string;
    totalDeposited: number;
    nominalValue: number;
    realValue: number;
    cashValue: number;
    [key: string]: any;
}

export interface Portfolio {
    id: string;
    name: string;
    config: PortfolioConfig;
}