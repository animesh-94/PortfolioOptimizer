import { useState, useEffect, useRef } from 'react';

export function useCryptoSocket(symbol = 'btcusdt') {
    const [data, setData] = useState({ price: null, trend: 'neutral' });
    const ws = useRef(null);
    const lastPrice = useRef(null);

    useEffect(() => {
        const endpoint = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;
        ws.current = new WebSocket(endpoint);

        ws.current.onmessage = (event) => {
            const raw = JSON.parse(event.data);
            if (raw.p) {
                const newPrice = parseFloat(raw.p);
                let trend = 'neutral';

                if (lastPrice.current) {
                    if (newPrice > lastPrice.current) trend = 'up';
                    else if (newPrice < lastPrice.current) trend = 'down';
                }

                lastPrice.current = newPrice;
                setData({ price: newPrice, trend });
            }
        };

        return () => ws.current?.close();
    }, [symbol]);

    return data;
}