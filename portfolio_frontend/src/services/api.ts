const BASE_URL = 'http://localhost:8080/api/stocks';

export interface StockResponse {
    symbol: string;
    name: string;
    currency: string;
    price: string;
    change: string;
    percent_change: string;
    close: string;
}

export const fetchStockData = async (symbol: string): Promise<StockResponse | null> => {
    if (!symbol) return null;

    try {
        const response = await fetch(`${BASE_URL}/${symbol.toUpperCase()}`);
        if (!response.ok) throw new Error('Stock nicht gefunden oder Backend nicht erreichbar');
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
};