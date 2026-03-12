const BASE_URL = 'http://localhost:8080/api/stocks';

export interface StockResponse {
    symbol: string;
    name: string;
    currency: string;
    change: string;
    percent_change: string;
    close: string;
    fifty_two_week?: {
        low: string;
        high: string;
    };
}

export const fetchStockData = async (symbol: string): Promise<StockResponse | null> => {
    if (!symbol) return null;

    try {
        const response = await fetch(`${BASE_URL}/${symbol.toUpperCase()}`);
        if (!response.ok) throw new Error('Stock API Error');
        const text = await response.text();
        if (!text) return null;
        return JSON.parse(text);
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
};