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

            <div className="search-section" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="input-group" style={{ flex: 1, margin: 0 }}>
                        <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} style={{ position: 'absolute', left: '10px', color: '#6b7280' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="input-field"
                                placeholder="Symbol (z.B. AAPL)"
                                style={{ paddingLeft: '35px' }}
                            />
                        </div>
                    </div>
                    <button onClick={handleSearch} disabled={isLoading} className="btn-confirm" style={{ padding: '0 1rem' }}>
                        {isLoading ? '...' : 'Suchen'}
                    </button>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    <strong>Beliebte Aktien:</strong> AAPL (Apple), MSFT (Microsoft), NVDA (Nvidia), TSLA (Tesla), AMZN (Amazon)
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
            </div>

            {searchResult && searchResult.close && (
                <div className="search-result-card" style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h4 style={{ fontWeight: 'bold', margin: 0 }}>{searchResult.name} ({searchResult.symbol})</h4>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    {parseFloat(searchResult.close).toFixed(2)} {searchResult.currency}
                                </span>
                                {parseFloat(searchResult.percent_change) >= 0 ? (
                                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}><TrendingUp size={14} /> +{parseFloat(searchResult.percent_change).toFixed(2)}%</span>
                                ) : (
                                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}><TrendingDown size={14} /> {parseFloat(searchResult.percent_change).toFixed(2)}%</span>
                                )}
                            </div>

                            {searchResult.fifty_two_week && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div><strong>52W Low:</strong> {parseFloat(searchResult.fifty_two_week.low).toFixed(2)} | <strong>52W High:</strong> {parseFloat(searchResult.fifty_two_week.high).toFixed(2)}</div>
                                    {drawdown && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: parseFloat(drawdown) < -15 ? '#10b981' : '#f59e0b' }}>
                                            <Info size={14} />
                                            Abstand zum Jahreshoch: {drawdown}%
                                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                                ({parseFloat(drawdown) < -15 ? "Möglicher Rabatt" : "Nahe am Höchststand"})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div className="input-group" style={{ flex: 1, margin: 0 }}>
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>Anzahl</label>
                            <input type="number" min="0.1" step="0.1" value={sharesToAdd} onChange={e => setSharesToAdd(Number(e.target.value))} className="input-field" />
                        </div>
                        <div className="input-group" style={{ flex: 1, margin: 0 }}>
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>Wachstum %</label>
                            <input type="number" step="0.1" value={growthToAdd} onChange={e => setGrowthToAdd(Number(e.target.value))} className="input-field" />
                        </div>
                        <button onClick={handleAdd} className="btn-confirm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Plus size={16} /> Hinzufügen
                        </button>
                    </div>
                </div>
            )}

            <div className="stocks-list" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {stocks.map(stock => (
                    <div key={stock.id} className="stream-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                        <div>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {stock.symbol}
                                <span style={{ fontSize: '0.75rem', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {stock.expectedGrowth}% p.a.
                                </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>{stock.price} {stock.currency} / Stück</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <input
                                    type="number"
                                    value={stock.shares}
                                    onChange={e => onUpdateShares(stock.id, Number(e.target.value))}
                                    className="input-field"
                                    style={{ width: '70px', padding: '0.25rem', textAlign: 'right' }}
                                />
                                <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem' }}>Stück</span>
                            </div>
                            <button onClick={() => onRemove(stock.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
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