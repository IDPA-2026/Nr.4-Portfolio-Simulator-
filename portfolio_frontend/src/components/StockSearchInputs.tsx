import { useState } from 'react';
import { StockPosition } from '../types';
import { fetchStockData, StockResponse } from '../services/api';
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface Props {
    stocks: StockPosition[];
    onAdd: (stock: StockPosition) => void;
    onRemove: (id: string) => void;
    onUpdateShares: (id: string, shares: number) => void;
}

export default function StockSearchInputs({ stocks, onAdd, onRemove, onUpdateShares }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<StockResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [sharesToAdd, setSharesToAdd] = useState<number>(1);
    const [growthToAdd, setGrowthToAdd] = useState<number>(8);

    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setError(null);

        const data = await fetchStockData(searchQuery.trim());
        if (data && data.close) {
            setSearchResult(data);
            setSharesToAdd(1);
            setGrowthToAdd(8);
        } else {
            setSearchResult(null);
            setError('Aktie nicht gefunden. Bitte Symbol überprüfen.');
        }
        setIsLoading(false);
    };

    const handleAdd = () => {
        if (!searchResult || !searchResult.close || sharesToAdd <= 0) return;

        const newStock: StockPosition = {
            id: crypto.randomUUID(),
            symbol: searchResult.symbol,
            name: searchResult.name,
            shares: sharesToAdd,
            price: parseFloat(searchResult.close),
            currency: searchResult.currency,
            expectedGrowth: growthToAdd
        };

        onAdd(newStock);
        setSearchResult(null);
        setSearchQuery('');
    };

    const calculateDrawdown = () => {
        if (!searchResult?.fifty_two_week?.high || !searchResult.close) return null;
        const current = parseFloat(searchResult.close);
        const high = parseFloat(searchResult.fifty_two_week.high);
        const diff = ((current - high) / high) * 100;
        return diff.toFixed(1);
    };

    const drawdown = calculateDrawdown();

    return (
        <div className="config-card">
            <div className="config-card-header">
                <h2 className="config-card-title">Aktien Portfolio</h2>
            </div>

            <div className="search-section stock-search-section">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="input-group stock-input-group">
                        <div className="input-wrapper stock-input-wrapper">
                            <Search size={18} className="stock-search-icon" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="input-field stock-search-input"
                                placeholder="Symbol (z.B. AAPL)"
                            />
                        </div>
                    </div>
                    <button onClick={handleSearch} disabled={isLoading} className="btn-confirm stock-btn-search">
                        {isLoading ? '...' : 'Suchen'}
                    </button>
                </div>

                <div className="stock-hint">
                    <strong>Beliebte Aktien:</strong> AAPL (Apple), MSFT (Microsoft), NVDA (Nvidia), TSLA (Tesla), AMZN (Amazon)
                </div>

                {error && <p className="stock-error">{error}</p>}
            </div>

            {searchResult && searchResult.close && (
                <div className="search-result-card stock-result-card">
                    <div className="stock-result-header">
                        <div>
                            <h4 className="stock-result-title">{searchResult.name} ({searchResult.symbol})</h4>

                            <div className="stock-result-price-wrapper">
                                <span className="stock-result-price">
                                    {parseFloat(searchResult.close).toFixed(2)} {searchResult.currency}
                                </span>
                                {parseFloat(searchResult.percent_change) >= 0 ? (
                                    <span className="stock-result-change-pos"><TrendingUp size={14} /> +{parseFloat(searchResult.percent_change).toFixed(2)}%</span>
                                ) : (
                                    <span className="stock-result-change-neg"><TrendingDown size={14} /> {parseFloat(searchResult.percent_change).toFixed(2)}%</span>
                                )}
                            </div>

                            {searchResult.fifty_two_week && (
                                <div className="stock-result-stats">
                                    <div><strong>52W Low:</strong> {parseFloat(searchResult.fifty_two_week.low).toFixed(2)} | <strong>52W High:</strong> {parseFloat(searchResult.fifty_two_week.high).toFixed(2)}</div>
                                    {drawdown && (
                                        <div className="stock-result-drawdown" style={{ color: parseFloat(drawdown) < -15 ? '#10b981' : '#f59e0b' }}>
                                            <Info size={14} />
                                            Abstand zum Jahreshoch: {drawdown}%
                                            <span className="stock-result-drawdown-hint">
                                                ({parseFloat(drawdown) < -15 ? "Möglicher Rabatt" : "Nahe am Höchststand"})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="stock-add-inputs">
                        <div className="input-group stock-input-group">
                            <label className="input-label stock-add-label">Anzahl</label>
                            <input type="number" min="0.1" step="0.1" value={sharesToAdd} onChange={e => setSharesToAdd(Number(e.target.value))} className="input-field" />
                        </div>
                        <div className="input-group stock-input-group">
                            <label className="input-label stock-add-label">Wachstum %</label>
                            <input type="number" step="0.1" value={growthToAdd} onChange={e => setGrowthToAdd(Number(e.target.value))} className="input-field" />
                        </div>
                        <button onClick={handleAdd} className="btn-confirm stock-add-btn">
                            <Plus size={16} /> Hinzufügen
                        </button>
                    </div>
                </div>
            )}

            <div className="stocks-list stock-list">
                {stocks.map(stock => (
                    <div key={stock.id} className="stream-item stock-item-wrapper">
                        <div>
                            <div className="stock-item-header">
                                {stock.symbol}
                                <span className="stock-item-tag">
                                    {stock.expectedGrowth}% p.a.
                                </span>
                            </div>
                            <div className="stock-item-text">{stock.price} {stock.currency} / Stück</div>
                        </div>
                        <div className="stock-item-controls">
                            <div className="stock-item-input-wrapper">
                                <input
                                    type="number"
                                    value={stock.shares}
                                    onChange={e => onUpdateShares(stock.id, Number(e.target.value))}
                                    className="input-field stock-item-input"
                                />
                                <span className="stock-item-span">Stück</span>
                            </div>
                            <button onClick={() => onRemove(stock.id)} className="stock-item-delete-btn">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {stocks.length === 0 && <p className="stream-empty">Noch keine Aktien hinzugefügt.</p>}
            </div>
        </div>
    );
}