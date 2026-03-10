import { useState } from 'react';

interface Props {
    text: string;
}

export default function InfoTooltip({ text }: Props) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative inline-block ml-1 group">
            <span
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                className="cursor-help inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-gray-400 border border-gray-400 rounded-full hover:bg-gray-100"
            >
                i
            </span>
            {visible && (
                <div className="absolute z-50 w-64 p-2 mt-2 text-xs text-white bg-gray-800 rounded shadow-lg -left-1/2 translate-x-1/2">
                    {text}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full border-8 border-transparent border-b-gray-800" />
                </div>
            )}
        </div>
    );
}