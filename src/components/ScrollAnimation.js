import React, { useState, useEffect, useRef } from 'react';

// Apple-style scroll animation component
// "New look. Even more magic."
const ScrollAnimation = ({ children, index = 0, className = '', threshold = 0.1 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target); // Trigger once
                }
            },
            {
                rootMargin: '50px', // Trigger slightly before
                threshold: threshold,
            }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div
            ref={cardRef}
            className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${isVisible
                ? 'opacity-100 translate-y-0 scale-100 blur-0'
                : 'opacity-0 translate-y-24 scale-95 blur-sm'
                } ${className}`}
            style={{ transitionDelay: `${(index % 3) * 100}ms` }} // Stagger effect based on index
        >
            {children}
        </div>
    );
};

export default ScrollAnimation;
