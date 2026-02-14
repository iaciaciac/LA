import React from 'react';
import Image from 'next/image';
import { urlFor } from '../sanity/lib/image';

const StoryTray = ({ photos, onClick }) => {
    if (!photos || photos.length === 0) return null;

    // Use top 100 photos or reasonable amount
    const stories = photos.slice(0, 100);

    return (
        <div className="w-full overflow-x-auto no-scrollbar pb-6 pt-2">
            <div className="flex space-x-4 px-4 md:px-0">
                {stories.map((photo, index) => (
                    <div
                        key={photo._id || index}
                        className="flex flex-col items-center space-y-1 min-w-[72px] cursor-pointer group"
                        onClick={() => {
                            if (onClick) {
                                onClick(photo);
                            }
                        }}
                    >
                        {/* Gradient Ring Wrapper */}
                        {/* Gradient Ring Wrapper - SVG Implementation for Dotted Effect */}
                        <div className="relative w-[84px] h-[84px] flex items-center justify-center">
                            {/* SVG Ring */}
                            <svg
                                viewBox="0 0 100 100"
                                className="absolute inset-0 w-full h-full animate-spin-slow group-hover:[animation-play-state:paused]"
                            >
                                <defs>
                                    <linearGradient id={`story-gradient-${photo._id || index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0072FF" />
                                        <stop offset="100%" stopColor="#FF0080" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="46"
                                    fill="none"
                                    stroke={`url(#story-gradient-${photo._id || index})`}
                                    strokeWidth="5"
                                    strokeDasharray="0 8.02851456"
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Image Container */}
                            <div className="w-[76px] h-[76px] rounded-full overflow-hidden relative z-10 border-[3px] border-white dark:border-black">
                                {photo.image ? (
                                    <Image
                                        src={urlFor(photo.image).width(200).height(200).url()}
                                        alt={photo.title || 'Story'}
                                        width={150}
                                        height={150}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                                        <span className="text-[10px]">VIDEO</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Caption/Name */}
                        <span className="text-xs text-gray-900 dark:text-white truncate max-w-[80px] text-center font-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {photo.title || 'Untitled'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoryTray;
