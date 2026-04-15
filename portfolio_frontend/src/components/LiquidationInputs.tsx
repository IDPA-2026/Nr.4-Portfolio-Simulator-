import { AccountConfig, Account } from '../types';
import { Calendar, X, ArrowRight } from 'lucide-react';
import { openPicker } from './BaseDataInputs';

interface Props {
    config: AccountConfig;
    availableAccounts: Account[];
    onChange: (config: AccountConfig) => void;
}

export default function LiquidationInputs({ config, availableAccounts, onChange }: Props) {
    const liquidation = config.liquidation;

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...config, liquidation: { ...liquidation, active: e.target.checked } });
    };

    const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...config, liquidation: { ...liquidation, date: e.target.value } });
    };

    const addSplit = () => {
        onChange({
            ...config,
            liquidation: {
                ...liquidation,
                splits: [...liquidation.splits, { id: crypto.randomUUID(), toAccountId: '', percentage: 100 }]
            }
        });
    };

    const updateSplit = (id: string, field: string, value: any) => {
        onChange({
            ...config,
            liquidation: {
                ...liquidation,
                splits: liquidation.splits.map(s => s.id === id ? { ...s, [field]: value } : s)
            }
        });
    };

    const removeSplit = (id: string) => {
        onChange({
            ...config,
            liquidation: {
                ...liquidation,
                splits: liquidation.splits.filter(s => s.id !== id)
            }
        });
    };

    return (
        <div className="config-card" style={{ borderColor: liquidation.active ? '#8b5cf6' : 'var(--border-color)' }}>
            <div className="config-card-header">
                <h2 className="config-card-title" style={{ color: liquidation.active ? '#8b5cf6' : 'inherit' }}>Kontoauflösung</h2>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: liquidation.active ? '1.5rem' : '0', cursor: 'pointer', padding: '0.75rem', backgroundColor: liquidation.active ? 'rgba(139, 92, 246, 0.1)' : 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid', borderColor: liquidation.active ? 'rgba(139, 92, 246, 0.3)' : 'var(--input-border)' }}>
                <input type="checkbox" checked={liquidation.active} onChange={handleToggle} style={{ transform: 'scale(1.2)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: liquidation.active ? '#8b5cf6' : 'var(--text-main)' }}>Konto an einem bestimmten Datum vollständig auflösen</span>
            </label>

            {liquidation.active && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="input-group">
                        <label className="input-label" style={{ color: '#8b5cf6' }}>Auflösungsdatum</label>
                        <div className="date-input-wrapper">
                            <input type="month" value={liquidation.date} onChange={handleDate} onClick={openPicker} className="input-field" style={{ borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.05)' }} />
                            <Calendar size={18} className="date-icon" style={{ color: '#8b5cf6' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Aufteilung des Restkapitals</span>
                        <button onClick={addSplit} style={{ background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>+ Ziel hinzufügen</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {liquidation.splits.map(split => (
                            <div key={split.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--input-bg)', padding: '0.5rem 0.5rem 0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--input-border)' }}>
                                <ArrowRight size={16} color="#8b5cf6" />
                                <select value={split.toAccountId} onChange={e => updateSplit(split.id, 'toAccountId', e.target.value)} className="input-field" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0.25rem 0' }}>
                                    <option value="">Bitte Zielkonto wählen...</option>
                                    {availableAccounts.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
                                </select>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--card-bg)', borderRadius: '0.25rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                    <input type="number" value={split.percentage} onChange={e => updateSplit(split.id, 'percentage', e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" style={{ border: 'none', backgroundColor: 'transparent', width: '60px', textAlign: 'right', padding: '0.4rem' }} />
                                    <span style={{ padding: '0 0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.02)' }}>%</span>
                                </div>
                                <button onClick={() => removeSplit(split.id)} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem' }}><X size={16} /></button>
                            </div>
                        ))}
                        {liquidation.splits.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontStyle: 'italic' }}>Bitte füge mindestens ein Zielkonto hinzu, um das Geld zu verteilen.</span>}
                    </div>
                </div>
            )}
        </div>
    );
}