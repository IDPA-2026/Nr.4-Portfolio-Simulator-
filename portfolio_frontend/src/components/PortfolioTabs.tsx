import { Portfolio } from '../types';

interface Props {
    portfolios: Portfolio[];
    activePortfolioId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
}

export default function PortfolioTabs({ portfolios, activePortfolioId, onSelect, onAdd }: Props) {
    return (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {portfolios.map(p => (
                <button
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activePortfolioId === p.id
                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {p.name}
                </button>
            ))}
            <button
                onClick={onAdd}
                className="px-4 py-2 rounded-t-lg font-medium text-gray-500 hover:bg-gray-200 whitespace-nowrap"
            >
                + Neues Portfolio
            </button>
        </div>
    );
}