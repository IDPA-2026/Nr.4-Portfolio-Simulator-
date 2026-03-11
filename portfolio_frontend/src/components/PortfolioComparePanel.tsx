import { Portfolio } from '../types';

interface Props {
    portfolios: Portfolio[];
    compareIds: string[];
    setCompareIds: (ids: string[]) => void;
    onClose: () => void;
}

export default function PortfolioComparePanel({ portfolios, compareIds, setCompareIds, onClose }: Props) {
    const toggleId = (id: string) => {
        if (compareIds.includes(id)) {
            // Verhindern, dass man das letzte abwählt
            if (compareIds.length > 1) {
                setCompareIds(compareIds.filter(cid => cid !== id));
            }
        } else {
            setCompareIds([...compareIds, id]);
        }
    };

    return (
        <div className="merge-panel" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 className="merge-title" style={{ color: '#8b5cf6' }}>
                    Welche Portfolios möchtest du nebeneinander vergleichen?
                </h3>
                <button onClick={onClose} className="btn-cancel text-xs">
                    Schließen
                </button>
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