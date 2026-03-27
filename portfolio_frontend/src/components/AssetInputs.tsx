import { useState } from 'react';
import { AssetPosition } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    assets: AssetPosition[];
    baseCurrency: string;
    onAdd: (asset: AssetPosition) => void;
    onRemove: (id: string) => void;
    onUpdateValue: (id: string, value: number) => void;
}

export default function AssetInputs({ assets, baseCurrency, onAdd, onRemove, onUpdateValue }: Props) {
    const [nameToAdd, setNameToAdd] = useState('');
    const [valueToAdd, setValueToAdd] = useState<number | string>(10000);
    const [growthToAdd, setGrowthToAdd] = useState<number | string>(5);

    const handleAdd = () => {
        if (!nameToAdd.trim() || Number(valueToAdd) < 0) return;

        const newAsset: AssetPosition = {
            id: crypto.randomUUID(),
            name: nameToAdd.trim(),
            value: Number(valueToAdd),
            expectedGrowth: Number(growthToAdd)
        };

        onAdd(newAsset);
        setNameToAdd('');
        setValueToAdd(10000);
        setGrowthToAdd(5);
    };

    return (
        <div className="config-card">
            <div className="config-card-header">
                <h2 className="config-card-title">Assets</h2>
            </div>

            <div className="search-section stock-search-section">
                <div className="stock-add-inputs" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                    <div className="input-group">
                        <label className="input-label stock-add-label">Name (z.B. ETF Portfolio)</label>
                        <input type="text" value={nameToAdd} onChange={e => setNameToAdd(e.target.value)} className="input-field" placeholder="Bezeichnung" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="input-group stock-input-group">
                            <label className="input-label stock-add-label">Startwert ({baseCurrency})</label>
                            <input type="number" min="0" step="100" value={valueToAdd} onChange={e => setValueToAdd(e.target.value === '' ? '' : Number(e.target.value))} className="input-field" />
                        </div>
                        <div className="input-group stock-input-group">
                            <label className="input-label stock-add-label">Wachstum % p.a.</label>
                            <input type="number" step="0.1" value={growthToAdd} onChange={e => setGrowthToAdd(e.target.value === '' ? '' : Number(e.target.value))} className="input-field" />
                        </div>
                    </div>
                    <button onClick={handleAdd} className="btn-confirm stock-add-btn" style={{ alignSelf: 'flex-start' }}>
                        <Plus size={16} /> Asset Hinzufügen
                    </button>
                </div>
            </div>

            <div className="stocks-list stock-list">
                {assets.map(asset => (
                    <div key={asset.id} className="stream-item stock-item-wrapper">
                        <div>
                            <div className="stock-item-header">
                                {asset.name}
                                <span className="stock-item-tag">
                                    {asset.expectedGrowth}% p.a.
                                </span>
                            </div>
                        </div>
                        <div className="stock-item-controls">
                            <div className="stock-item-input-wrapper">
                                <input
                                    type="number"
                                    value={asset.value}
                                    onChange={e => onUpdateValue(asset.id, e.target.value === '' ? 0 : Number(e.target.value))}
                                    className="input-field stock-item-input"
                                />
                                <span className="stock-item-span">{baseCurrency}</span>
                            </div>
                            <button onClick={() => onRemove(asset.id)} className="stock-item-delete-btn">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {assets.length === 0 && <p className="stream-empty">Noch keine Assets hinzugefügt.</p>}
            </div>
        </div>
    );
}