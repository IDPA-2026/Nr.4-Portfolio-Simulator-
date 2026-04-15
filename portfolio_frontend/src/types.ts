export interface GlobalConfig {
    simulationStart: string;
    simulationEnd: string;
    annualInflationRate: number;
    baseCurrency: string;
}

export interface LiquidationSplit {
    id: string;
    toAccountId: string;
    percentage: number;
}

export interface LiquidationEvent {
    active: boolean;
    date: string;
    splits: LiquidationSplit[];
}

export interface AccountConfig {
    initialCapital: number;
    annualGrowthRate: number;
    isDetailedMode: boolean;
    liquidation: LiquidationEvent;
    depositStreams: TransactionStream[];
    withdrawalStreams: TransactionStream[];
    transfers: TransferStream[];
    assets: AssetPosition[];
}

export interface TransactionStream {
    id: string;
    name: string;
    isOneOff: boolean;
    startMonth: string;
    endMonth: string;
    amount: number;
    targetAssetId?: string;
}

export interface TransferStream extends TransactionStream {
    toAccountId: string;
    toAssetId?: string;
    taxRate: number;
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
    realValue: number;
    cashValue: number;
    [key: string]: any;
}

export interface Account {
    id: string;
    name: string;
    config: AccountConfig;
}