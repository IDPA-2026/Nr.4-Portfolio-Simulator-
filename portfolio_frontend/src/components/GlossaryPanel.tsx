import { X } from 'lucide-react';
import { GLOSSARY } from '../constants/glossary';

interface Props {
    onClose: () => void;
}

export default function GlossaryPanel({ onClose }: Props) {
    return (
        <div className="merge-panel">
            <div className="glossary-header">
                <h3 className="merge-title glossary-title-margin">Finanz-Glossar</h3>
                <button onClick={onClose} className="btn-cancel text-xs glossary-close-btn">
                    <X size={16} />
                </button>
            </div>

            <div className="glossary-list">
                {Object.entries(GLOSSARY).map(([key, text]) => (
                    <div key={key} className="glossary-item">
                        <strong className="glossary-item-title-cap">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </strong>
                        <span className="glossary-item-text">{text}</span>
                    </div>
                ))}

                <div className="glossary-item">
                    <strong className="glossary-item-title">Asset Allocation</strong>
                    <span className="glossary-item-text">Die Aufteilung deines Vermögens auf verschiedene Anlageklassen (z.B. Cash, Aktien).</span>
                </div>

                <div className="glossary-item">
                    <strong className="glossary-item-title">52W Low / High</strong>
                    <span className="glossary-item-text">Der tiefste und höchste Preis einer Aktie in den letzten 52 Wochen (1 Jahr). Hilft bei der Einschätzung von Rabatten.</span>
                </div>
            </div>
        </div>
    );
}