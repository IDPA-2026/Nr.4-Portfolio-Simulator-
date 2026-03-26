// components/PortfolioMergePanel.tsx
import { Portfolio } from '../types';
import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface Props {
    activePortfolio: Portfolio;
    availablePortfolios: Portfolio[];
    selectedForMerge: string[];
    setSelectedForMerge: (ids: string[]) => void;
    deleteOriginals: boolean;
    setDeleteOriginals: (val: boolean) => void;
    onCancel: () => void;
    onConfirm: (settings: MergeSettings) => void;
}

export interface MergeSettings {
    growthStrategy: 'avg' | string;
    inflationStrategy: 'avg' | string;
    fusionDate: string;
}

export default function PortfolioMergePanel({
                                                activePortfolio,
                                                availablePortfolios,
                                                selectedForMerge,
                                                setSelectedForMerge,
                                                deleteOriginals,
                                                setDeleteOriginals,
                                                onCancel,
                                                onConfirm
                                            }: Props) {
    const [settings, setSettings] = useState<MergeSettings>({
        growthStrategy: 'avg',
        inflationStrategy: 'avg',
        fusionDate: activePortfolio.config.simulationStart
    });

    const allPortfoliosInMerge = [activePortfolio, ...availablePortfolios.filter(p => selectedForMerge.includes(p.id))];

    return (
        <div className="merge-panel">
            <h3 className="merge-title">
                Portfolios zusammenführen
            </h3>

            <div className="input-grid-2 merge-grid-gap">
                <div className="input-group">
                    <label className="input-label">Inkludierte Portfolios</label>
                    <div className="merge-list">
                        {availablePortfolios.map(p => (
                            <label key={p.id} className="merge-item">
                                <input
                                    type="checkbox"
                                    className="merge-checkbox"
                                    checked={selectedForMerge.includes(p.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedForMerge([...selectedForMerge, p.id]);
                                        } else {
                                            setSelectedForMerge(selectedForMerge.filter(id => id !== p.id));
                                        }
                                    }}
                                />
                                <span className="merge-item-text">{p.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="input-group merge-group-gap">
                    <div>
                        <label className="input-label">Wachstumsrate (Zinsen)</label>
                        <select
                            className="input-field"
                            value={settings.growthStrategy}
                            onChange={(e) => setSettings({...settings, growthStrategy: e.target.value})}
                        >
                            <option value="avg">Durchschnitt (AVG)</option>
                            {allPortfoliosInMerge.map(p => (
                                <option key={p.id} value={p.id}>Wert von: {p.name} ({p.config.annualGrowthRate}%)</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Inflationsrate</label>
                        <select
                            className="input-field"
                            value={settings.inflationStrategy}
                            onChange={(e) => setSettings({...settings, inflationStrategy: e.target.value})}
                        >
                            <option value="avg">Durchschnitt (AVG)</option>
                            {allPortfoliosInMerge.map(p => (
                                <option key={p.id} value={p.id}>Wert von: {p.name} ({p.config.annualInflationRate}%)</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Fusions-Datum (Start)</label>
                        <div className="date-input-wrapper">
                            <input
                                type="month"
                                className="input-field"
                                value={settings.fusionDate}
                                onChange={(e) => setSettings({...settings, fusionDate: e.target.value})}
                            />
                            <Calendar size={18} className="date-icon" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="merge-actions">
                <label className="merge-delete-label">
                    <input
                        type="checkbox"
                        className="merge-checkbox"
                        checked={deleteOriginals}
                        onChange={(e) => setDeleteOriginals(e.target.checked)}
                    />
                    <span className="merge-delete-text">Originale nach Merge löschen</span>
                </label>

                <div className="merge-actions-wrapper">
                    <button onClick={onCancel} className="btn-cancel">Abbrechen</button>
                    <button
                        onClick={() => onConfirm(settings)}
                        disabled={selectedForMerge.length === 0}
                        className="btn-confirm"
                    >
                        Fusion Bestätigen
                    </button>
                </div>
            </div>
        </div>
    );
}