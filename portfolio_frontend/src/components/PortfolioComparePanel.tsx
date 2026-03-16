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
        <div className="merge-panel compare-panel-wrapper">
            <div className="compare-header">
                <h3 className="merge-title compare-title">
                    Portfolios auswählen zum Vergleichen
                </h3>

                <div className="compare-controls">
                    <button
                        className={`btn-toggle-view compare-btn-toggle ${isCombinedView ? 'active' : ''}`}
                        onClick={() => setIsCombinedView(!isCombinedView)}
                    >
                        {isCombinedView ? <Zap size={14} /> : <Layers size={14} />}
                        {isCombinedView ? "Einzelansicht" : "Kombiniert"}
                    </button>
                    <button onClick={onClose} className="btn-cancel text-xs">
                        Schliessen
                    </button>
                </div>
            </div>

            <div className="merge-list">
                {portfolios.map(p => (
                    <label key={p.id} className="merge-item">
                        <input
                            type="checkbox"
                            className="merge-checkbox compare-checkbox"
                            checked={compareIds.includes(p.id)}
                            onChange={() => toggleId(p.id)}
                        />
                        <span className="merge-item-text">{p.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}