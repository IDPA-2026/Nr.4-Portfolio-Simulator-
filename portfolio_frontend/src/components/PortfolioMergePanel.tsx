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
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-blue-900">
                Mit welchen Portfolios soll "{activePortfolio.name}" zusammengeführt werden?
            </h3>

            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto bg-white p-3 rounded border border-blue-200">
                {availablePortfolios.map(p => (
                    <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600"
                            checked={selectedForMerge.includes(p.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedForMerge([...selectedForMerge, p.id]);
                                } else {
                                    setSelectedForMerge(selectedForMerge.filter(id => id !== p.id));
                                }
                            }}
                        />
                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    </label>
                ))}
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-blue-200">
                <label className="flex items-center gap-2 cursor-pointer mr-auto">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600"
                        checked={deleteOriginals}
                        onChange={(e) => setDeleteOriginals(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-red-600">Ausgewählte Original-Portfolios nach dem Merge löschen</span>
                </label>

                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                    Abbrechen
                </button>
                <button
                    onClick={onConfirm}
                    disabled={selectedForMerge.length === 0}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium disabled:bg-blue-300 hover:bg-blue-700 transition-colors"
                >
                    Bestätigen
                </button>
            </div>
        </div>
    );
}