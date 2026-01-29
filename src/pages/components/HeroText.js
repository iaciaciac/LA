import React from 'react';
import ScrambleText from './ScrambleText';

const HeroText = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-[650px] absolute top-0 left-0 pointer-events-none z-10 select-none pb-32">
            <div style={{
                fontFamily: 'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
                letterSpacing: '-0.02em'
            }} className="flex flex-col items-center text-center px-6 md:px-0 max-w-full">

                {/* Main Title - Terminal Style */}
                <h1 className="text-[10px] md:text-sm font-normal tracking-widest text-black dark:text-white uppercase leading-relaxed">
                    <ScrambleText text="CAPTURING LIGHT AND SHADOW ACROSS THE GLOBE" />
                </h1>

                {/* Secondary line */}
                <div className="flex items-center gap-3 mt-4 md:mt-7 text-[10px] md:text-sm font-normal tracking-widest uppercase text-black dark:text-white">
                    <ScrambleText text="VISUAL ARCHIVE" delay={2200} duration={1500} />
                </div>
            </div>
        </div>
    );
};

export default HeroText;
