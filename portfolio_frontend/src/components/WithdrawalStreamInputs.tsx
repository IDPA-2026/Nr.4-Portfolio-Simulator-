import { TransactionStream, AssetPosition } from '../types';
import { Calendar, X } from 'lucide-react';
import { openPicker } from './BaseDataInputs';

interface Props {
    streams: TransactionStream[];
    assets: AssetPosition[];
    baseCurrency: string;
    onAdd: () => void;
    onUpdate: (id: string, field: keyof TransactionStream, value: any) => void;
    onRemove: (id: string) => void;
}

export default function WithdrawalStreamInputs({ streams, assets, baseCurrency, onAdd, onUpdate, onRemove }: Props) {
    return (
        <div className="config-card">
            <div className="config-card-header">
                <h2 className="config-card-title">Auszahlungen & Verkäufe</h2>
                <button onClick={onAdd} className="btn-add-stream" style={{backgroundColor: '#ef4444'}}>+ Hinzufügen</button>
            </div>

            <div className="stream-list">
                {streams.map((stream, index) => (
                    <div key={stream.id} className="stream-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderLeft: '4px solid #ef4444'}}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                {stream.isOneOff ? 'Einmalige Auszahlung' : 'Monatliche Auszahlung'} {index + 1}
                            </span>
                            <button onClick={() => onRemove(stream.id)} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                        </div>

                        <div className="stream-row" style={{ margin: 0 }}>
                            <input type="text" value={stream.name} onChange={e => onUpdate(stream.id, 'name', e.target.value)} className="input-field" placeholder="Name" />
                            <div className="stream-amount-wrapper">
                                <input type="number" value={stream.amount} onChange={e => onUpdate(stream.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))} className="input-field" placeholder="Betrag" />
                                <span className="stream-unit">{baseCurrency}{stream.isOneOff ? '' : '/Mt.'}</span>
                            </div>
                        </div>

                        <div className="stream-row" style={{ margin: 0 }}>
                            <select value={stream.targetAssetId || ''} onChange={e => onUpdate(stream.id, 'targetAssetId', e.target.value)} className="input-field" style={{ gridColumn: 'span 2' }}>
                                <option value="">Quelle: Cash in diesem Konto</option>
                                {assets.map(a => (<option key={a.id} value={a.id}>Quelle: Asset ({a.name})</option>))}
                            </select>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={stream.isOneOff} onChange={e => onUpdate(stream.id, 'isOneOff', e.target.checked)} />
                            Ist eine Einmalentnahme
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
                ))}
                {streams.length === 0 && <p className="stream-empty">Keine Entnahmepläne hinterlegt.</p>}
            </div>
        </div>
    );
}