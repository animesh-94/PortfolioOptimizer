import { useState, useEffect, useRef } from 'react';

export default function usePortfolioSocket(url = 'wss://d1l8649jpdxmxv.cloudfront.net/realtime') {
    const [status, setStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected'
    const [metrics, setMetrics] = useState({
        value: 1000000, // $1M Start
        risk: 12.4,
        sharpe: 1.85,
        pnl: 0
    });

    const wsRef = useRef(null);
    const reconnectTimeout = useRef(null);
    const simulationInterval = useRef(null); // For demo purposes if backend offline

    const connect = () => {
        if (wsRef.current) return;

        setStatus('connecting');
        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log("WS: Connected to Quant Engine");
            setStatus('connected');
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'UPDATE') {
                    setMetrics(prev => ({ ...prev, ...data.payload }));
                }
            } catch (err) {
                console.warn("WS: Parse error", err);
            }
        };

        socket.onclose = () => {
            console.log("WS: Disconnected. switching to simulation mode...");
            setStatus('disconnected');
            wsRef.current = null;

            // START SIMULATION MODE (So UI looks alive for demo)
            if (!simulationInterval.current) {
                simulationInterval.current = setInterval(() => {
                    setMetrics(prev => {
                        const change = (Math.random() - 0.45) * 500; // Random walk
                        return {
                            ...prev,
                            value: prev.value + change,
                            risk: Math.max(5, prev.risk + (Math.random() - 0.5) * 0.1),
                            sharpe: Math.max(0, prev.sharpe + (Math.random() - 0.5) * 0.05),
                            pnl: prev.pnl + change
                        };
                    });
                }, 1000); // Update every second
            }

            // Retry connection every 5s
            reconnectTimeout.current = setTimeout(connect, 5000);
        };

        socket.onerror = () => {
            if (wsRef.current) wsRef.current.close();
        };

        wsRef.current = socket;
    };

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        };
    }, [url]);

    return { status, metrics };
}