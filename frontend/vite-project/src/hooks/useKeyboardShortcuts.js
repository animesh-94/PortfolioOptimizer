import { useEffect } from 'react';

export default function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignore if typing in an input field
            if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;

            const action = shortcuts[event.key.toLowerCase()];
            if (action) {
                event.preventDefault(); // Prevent default browser scrolling/behavior
                action();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}