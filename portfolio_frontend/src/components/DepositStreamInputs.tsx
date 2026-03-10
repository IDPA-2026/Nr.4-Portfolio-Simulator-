import { DepositStream } from '../types';

interface Props {
    streams: DepositStream[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof DepositStream, value: string | number) => void;
    onRemove: (id: string) => void;
}

export default function DepositStreamInputs({ streams, onAdd, onUpdate, onRemove }: Props) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Einzahlungen</h2>
                <button onClick={onAdd} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                    + Hinzufügen
                </button>
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {streams.map(stream => (
                    <div key={stream.id} className="p-4 border border-gray-100 bg-gray-50 rounded-lg relative">
                        <button onClick={() => onRemove(stream.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold">X</button>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <input type="text" value={stream.name} onChange={e => onUpdate(stream.id, 'name', e.target.value)} className="rounded-md border-gray-300 shadow-sm p-1 border text-sm" placeholder="Name" />
                            <div className="flex items-center gap-2">
                                <input type="number" value={stream.monthlyAmount} onChange={e => onUpdate(stream.id, 'monthlyAmount', Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" placeholder="Betrag" />
                                <span className="text-sm text-gray-600">€/Mt.</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="month" value={stream.startMonth} onChange={e => onUpdate(stream.id, 'startMonth', e.target.value)} className="rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
                            <input type="month" value={stream.endMonth} onChange={e => onUpdate(stream.id, 'endMonth', e.target.value)} className="rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
                        </div>
                    </div>
                ))}
                {streams.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Keine Sparpläne hinterlegt.</p>
                )}
            </div>
        </div>
    );
}