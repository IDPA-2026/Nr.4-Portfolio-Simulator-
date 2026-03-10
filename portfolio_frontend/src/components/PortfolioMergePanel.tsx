import { Portfolio } from '../types';

interface Props {
    activePortfolio: Portfolio;
    availablePortfolios: Portfolio[];
    selectedForMerge: string[];
    setSelectedForMerge: (ids: string[]) => void;
    deleteOriginals: boolean;
    setDeleteOriginals: (val: boolean) => void;
    onCancel: () => void;
    onConfirm: () => void;
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
    return (
        <div className="merge-panel">
            <h3 className="merge-title">
                Mit welchen Portfolios soll "{activePortfolio.name}" zusammengeführt werden?
            </h3>

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

            <div className="merge-actions">
                <label className="merge-delete-label">
                    <input
                        type="checkbox"
                        className="merge-checkbox"
                        checked={deleteOriginals}
                        onChange={(e) => setDeleteOriginals(e.target.checked)}
                    />
                    <span className="merge-delete-text">Ausgewählte Original-Portfolios nach dem Merge löschen</span>
                </label>

                <button onClick={onCancel} className="btn-cancel">
                    Abbrechen
                </button>
                <button
                    onClick={onConfirm}
                    disabled={selectedForMerge.length === 0}
                    className="btn-confirm"
                >
                    Bestätigen
                </button>
            </div>
        </div>
    );
}