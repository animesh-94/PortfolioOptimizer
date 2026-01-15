import React, { useEffect, useState } from 'react';

export default function AnimatedNumber({ value, format = (v) => v.toFixed(2), duration = 800 }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = displayValue;
        // Parse float to handle string inputs like "12.50"
        let end = parseFloat(value);
        if (isNaN(end)) return;

        let startTime = null;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Ease-out expo formula for that "snappy" feel
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const current = start + (end - start) * easeOut;
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayValue(end); // Ensure exact final value
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{format(displayValue)}</span>;
}