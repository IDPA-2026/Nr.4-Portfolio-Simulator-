// components/GlossaryPanel.tsx
import { X } from 'lucide-react';
import { GLOSSARY } from '../constants/glossary';

interface Props {
    onClose: () => void;
}

export default function GlossaryPanel({ onClose }: Props) {
    // Sicherheits-Check, falls GLOSSARY undefined ist
    const glossaryEntries = GLOSSARY ? Object.entries(GLOSSARY) : [];

    return (
        <div className="merge-panel">
            <div className="glossary-header">
                <h3 className="merge-title glossary-title-margin">Finanz-Glossar</h3>
                <button onClick={onClose} className="btn-cancel text-xs glossary-close-btn">
                    <X size={16} />
                </button>
            </div>

            <div className="glossary-list">
                {glossaryEntries.length > 0 ? (
                    glossaryEntries.map(([key, text]) => (
                        <div key={key} className="glossary-item">
                            <strong className="glossary-item-title-cap">
                                {/* Macht aus "initialCapital" -> "Initial Capital" */}
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </strong>
                            <span className="glossary-item-text">{text}</span>
                        </div>
                    ))
                ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Glossar-Daten konnten nicht geladen werden. Bitte prüfe die constants/glossary.ts Datei.
                    </div>
                )}
            </div>
        </div>
    );
}