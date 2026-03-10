import { Portfolio } from '../types';

interface Props {
    portfolios: Portfolio[];
    activePortfolioId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
}

export default function PortfolioTabs({ portfolios, activePortfolioId, onSelect, onAdd }: Props) {
    return (
        <div className="tabs-container">
            {portfolios.map(p => (
                <button
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className={`tab-button ${activePortfolioId === p.id ? 'active' : ''}`}
                >
                    {p.name}
                </button>
            ))}
            <button
                onClick={onAdd}
                className="tab-button tab-button-add"
            >
                + Neues Portfolio
            </button>
        </div>
    );
}