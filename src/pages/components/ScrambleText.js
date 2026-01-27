import React, { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\-+=_~';

const ScrambleText = ({ text, className = '', duration = 2000, delay = 0 }) => {
    const [displayText, setDisplayText] = useState('');
    const [started, setStarted] = useState(false);

    useEffect(() => {
        let startTime;
        let animationFrameId;
        let timeoutId;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Determine how many characters are "resolved" based on progress
            const resolvedCount = Math.floor(progress * text.length);

            let newText = '';
            for (let i = 0; i < text.length; i++) {
                if (i < resolvedCount) {
                    // Resolved character
                    newText += text[i];
                } else {
                    // Scrambled character (only randomize occasionally or every frame?)
                    // Doing it every frame gives a very active "static" look
                    newText += CHARS[Math.floor(Math.random() * CHARS.length)];
                }
            }

            setDisplayText(newText);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                // Ensure final state is exact
                setDisplayText(text);
            }
        };

        // Start with fully scrambled text immediately if desired, 
        // or wait for start. Let's initialize with scrambled for correct length.
        const initialScramble = Array(text.length).fill(0).map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
        setDisplayText(initialScramble);

        timeoutId = setTimeout(() => {
            setStarted(true);
            animationFrameId = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeoutId);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [text, duration, delay]);

    return <span className={className}>{displayText}</span>;
};

export default ScrambleText;
