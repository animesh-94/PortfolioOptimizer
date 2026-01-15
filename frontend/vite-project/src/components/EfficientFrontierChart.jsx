import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";

export default function EfficientFrontierChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("/efficient_frontier.json")
            .then(res => res.json())
            .then(json => {
                const formatted = json.efficient_frontier.map(p => ({
                    risk: Number(p.risk ?? Math.sqrt(p.variance)),
                    return: Number(p.return)
                }));
                setData(formatted);
            });
    }, []);

    return (
        <LineChart width={800} height={500} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="risk" />
            <YAxis type="number" dataKey="return" />
            <Tooltip />
            <Line type="monotone" dataKey="return" stroke="#2563eb" dot />
        </LineChart>
    );
}
