import { X } from 'lucide-react';
import { GLOSSARY } from '../constants/glossary';

interface Props {
    onClose: () => void;
}

export default function GlossaryPanel({ onClose }: Props) {
    return (
        <div className="merge-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="merge-title" style={{ margin: 0 }}>Finanz-Glossar</h3>
                <button onClick={onClose} className="btn-cancel text-xs" style={{ padding: '0.2rem 0.5rem' }}>
                    <X size={16} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {Object.entries(GLOSSARY).map(([key, text]) => (
                    <div key={key} style={{ padding: '0.75rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#3b82f6', textTransform: 'capitalize' }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{text}</span>
                    </div>
                ))}

                <div style={{ padding: '0.75rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#3b82f6' }}>Asset Allocation</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Die Aufteilung deines Vermögens auf verschiedene Anlageklassen (z.B. Cash, Aktien).</span>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#3b82f6' }}>52W Low / High</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Der tiefste und höchste Preis einer Aktie in den letzten 52 Wochen (1 Jahr). Hilft bei der Einschätzung von Rabatten.</span>
                </div>
            </div>
        </div>
    );
}