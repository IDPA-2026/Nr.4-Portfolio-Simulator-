import { TransferStream, Account, AssetPosition } from '../types';
import { Calendar, X } from 'lucide-react';
import { openPicker } from './BaseDataInputs';

interface Props {
    streams: TransferStream[];
    currentAssets: AssetPosition[];
    availableAccounts: Account[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof TransferStream, value: any) => void;
    onRemove: (id: string) => void;
}

export default function TransferInputs({ streams, currentAssets, availableAccounts, onAdd, onUpdate, onRemove }: Props) {
    return (
        <div className="config-card">
            <div className="config-card-header">
                <h2 className="config-card-title">Umbuchungen</h2>
                <button onClick={onAdd} className="btn-add-stream" style={{backgroundColor: '#8b5cf6'}}>+ Umbuchung</button>
            </div>
            <div className="stream-list">
                {streams.map((stream, index) => {
                    const targetAccount = availableAccounts.find(a => a.id === stream.toAccountId);
                    const targetAssets = targetAccount?.config.assets || [];

                    return (
                        <div key={stream.id} className="stream-item" style={{borderLeft: '4px solid #8b5cf6', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem'}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Umbuchung {index + 1}</span>
                                <button onClick={() => onRemove(stream.id)} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                            </div>

                            <div className="stream-row" style={{ margin: 0 }}>
                                <input type="text" value={stream.name} onChange={e => onUpdate(stream.id, 'name', e.target.value)} className="input-field" placeholder="Name" />
                                <div className="stream-amount-wrapper">
                                    <input type="number" value={stream.amount} onChange={e => onUpdate(stream.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))} className="input-field" placeholder="Betrag" />
                                </div>
                            </div>

                            {/* SOURCE (Woher geht das Geld ab?) */}
                            <div className="stream-row" style={{ margin: 0 }}>
                                <select value={stream.targetAssetId || ''} onChange={e => onUpdate(stream.id, 'targetAssetId', e.target.value)} className="input-field" style={{ gridColumn: 'span 2' }}>
                                    <option value="">Quelle: Cash in diesem Konto</option>
                                    {currentAssets.map(a => (<option key={a.id} value={a.id}>Quelle: Asset ({a.name})</option>))}
                                </select>
                            </div>

                            {/* DESTINATION (Wohin geht das Geld?) */}
                            <div className="stream-row" style={{ margin: 0 }}>
                                <select value={stream.toAccountId} onChange={e => { onUpdate(stream.id, 'toAccountId', e.target.value); onUpdate(stream.id, 'toAssetId', ''); }} className="input-field">
                                    <option value="">Zielkonto wählen</option>
                                    {availableAccounts.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                </select>
                                <select value={stream.toAssetId || ''} onChange={e => onUpdate(stream.id, 'toAssetId', e.target.value)} className="input-field" disabled={!stream.toAccountId}>
                                    <option value="">Ziel: Cash</option>
                                    {targetAssets.map(a => (<option key={a.id} value={a.id}>Ziel: Asset ({a.name})</option>))}
                                </select>
                            </div>

                            <div className="stream-row" style={{ margin: 0 }}>
                                <div className="stream-amount-wrapper" title="Steuer oder Gebühr, die bei der Umbuchung (z.B. Verkauf) als Verlust anfällt" style={{ gridColumn: 'span 2' }}>
                                    <input type="number" step="0.1" value={stream.taxRate || ''} onChange={e => onUpdate(stream.id, 'taxRate', e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" placeholder="Steuer %" />
                                    <span className="stream-unit">% Abzug auf Betrag (Steuer/Gebühr)</span>
                                </div>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={stream.isOneOff} onChange={e => onUpdate(stream.id, 'isOneOff', e.target.checked)} />
                                Ist eine Einmalzahlung
                            </label>

                            <div className="stream-row" style={{ margin: 0 }}>
                                <div className="date-input-wrapper">
                                    <input type="month" value={stream.startMonth} onChange={e => onUpdate(stream.id, 'startMonth', e.target.value)} onClick={openPicker} className="input-field" />
                                    <Calendar size={18} className="date-icon" />
                                </div>
                                {!stream.isOneOff && (
                                    <div className="date-input-wrapper">
                                        <input type="month" value={stream.endMonth} onChange={e => onUpdate(stream.id, 'endMonth', e.target.value)} onClick={openPicker} className="input-field" />
                                        <Calendar size={18} className="date-icon" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {streams.length === 0 && <p className="stream-empty">Keine Umbuchungen hinterlegt.</p>}
            </div>
        </div>
    );
}