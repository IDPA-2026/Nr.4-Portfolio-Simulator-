import { Portfolio } from '../types';
import { Layers, Zap } from 'lucide-react';

interface Props {
    portfolios: Portfolio[];
    compareIds: string[];
    setCompareIds: (ids: string[]) => void;
    onClose: () => void;
    isCombinedView: boolean;
    setIsCombinedView: (val: boolean) => void;
}

export default function PortfolioComparePanel({
                                                  portfolios,
                                                  compareIds,
                                                  setCompareIds,
                                                  onClose,
                                                  isCombinedView,
                                                  setIsCombinedView
                                              }: Props) {
    const toggleId = (id: string) => {
        if (compareIds.includes(id)) {
            if (compareIds.length > 1) {
                setCompareIds(compareIds.filter(cid => cid !== id));
            }
        } else {
            setCompareIds([...compareIds, id]);
        }
    };

    return (
        <div className="merge-panel" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="merge-title" style={{ color: '#8b5cf6' }}>
                    Portfolios auswählen zum Vergleichen
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className={`btn-toggle-view ${isCombinedView ? 'active' : ''}`}
                        onClick={() => setIsCombinedView(!isCombinedView)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    >
                        {isCombinedView ? <Zap size={14} /> : <Layers size={14} />}
                        {isCombinedView ? "Einzelansicht" : "Kombiniert"}
                    </button>
                    <button onClick={onClose} className="btn-cancel text-xs">
                        Schließen
                    </button>
                </div>
            </div>

            <div className="merge-list">
                {portfolios.map(p => (
                    <label key={p.id} className="merge-item">
                        <input
                            type="checkbox"
                            className="merge-checkbox"
                            checked={compareIds.includes(p.id)}
                            onChange={() => toggleId(p.id)}
                            style={{ accentColor: '#8b5cf6' }}
                        />
                        <span className="merge-item-text">{p.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}