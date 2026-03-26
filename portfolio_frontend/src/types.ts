export interface GlobalConfig {
    simulationStart: string;
    simulationEnd: string;
    annualInflationRate: number;
    baseCurrency: string;
}

export interface AccountConfig {
    initialCapital: number;
    annualGrowthRate: number;
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
    targetAssetId?: string; // NEU: Kauf/Verkauf von spezifischen Assets
}

export interface TransferStream extends TransactionStream {
    toAccountId: string;
    toAssetId?: string; // NEU: Direkt in ein Asset des Zielkontos buchen
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
    nominalValue: number;
    realValue: number;
    cashValue: number;
    [key: string]: any;
}

export interface Account {
    id: string;
    name: string;
    config: AccountConfig;
}