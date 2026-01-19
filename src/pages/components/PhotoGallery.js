import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '../../sanity/lib/image';

import PhotoModal from './PhotoModal';
import ScrollAnimation from './ScrollAnimation';

const PhotoGallery = ({ photos, targetColumns, selectedPhoto, setSelectedPhoto }) => {
    // Initialize with 3 columns for SSR/Desktop default to prevent layout shift on large screens
    const [columns, setColumns] = useState(() => {
        const initial = [[], [], []];
        if (photos) {
            photos.forEach((photo, i) => initial[i % 3].push(photo));
        }
        return initial;
    });

    useEffect(() => {
        const updateLayout = () => {
            const width = window.innerWidth;
            let numCols = targetColumns || 3;
            if (width < 768) numCols = targetColumns ? Math.min(targetColumns, 2) : 1; // On mobile, cap zoom at 2 cols
            else if (width < 1024) numCols = targetColumns ? Math.min(targetColumns, 2) : 2;

            const newCols = Array.from({ length: numCols }, () => []);
            if (photos) {
                photos.forEach((photo, i) => newCols[i % numCols].push(photo));
            }
            setColumns(newCols);
        };

        // Initial check and event listener
        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, [photos, targetColumns]);

    if (!photos || photos.length === 0) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400">
                No photos found in Sanity. Time to upload some!
            </div>
        );
    }

    return (
        <div className="px-6 md:px-16 lg:px-40 2xl:px-48 pb-20">
            {/* Grid wrapper for the 3 columns */}
            <div
                className="grid gap-8 items-start transition-all duration-500 ease-in-out"
                style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >

                {/* Map through the columns */}
                {columns.map((columnPhotos, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-8">
                        {columnPhotos.map((photo, index) => {
                            const dimensions = photo.image?.asset?.metadata?.dimensions;
                            // Default to 0.75 (3:4 Portrait) if missing, closer to mobile phone photos
                            const aspectRatio = (dimensions && dimensions.aspectRatio) ? dimensions.aspectRatio : 0.75;

                            // Simple in-view hook logic inline or wrapper
                            // Since we are mapping, let's use a wrapper component for cleaner state
                            return (
                                <ScrollAnimation key={photo._id || index} index={index}>
                                    <div
                                        id={`photo-${photo._id || index}`}
                                        onClick={() => setSelectedPhoto(photo)}
                                        className="group relative rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] bg-gray-100 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 will-change-transform cursor-pointer"
                                        onMouseEnter={(e) => {
                                            const video = e.currentTarget.querySelector('video');
                                            if (video) video.play();
                                        }}
                                        onMouseLeave={(e) => {
                                            const video = e.currentTarget.querySelector('video');
                                            if (video) {
                                                video.pause();
                                                video.currentTime = 0;
                                            }
                                        }}
                                    >
                                        <div className="relative overflow-hidden rounded-2xl isolate w-full">
                                            {photo.video?.asset?.url ? (
                                                <>
                                                    <video
                                                        src={photo.video.asset.url}
                                                        poster={photo.image ? urlFor(photo.image).auto('format').width(800).url() : undefined}
                                                        muted
                                                        loop
                                                        playsInline
                                                        className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                                    />
                                                    {/* Badge: Live Photo or Video? Default to Live if undefined (backward compatibility) */}
                                                    {(photo.isLivePhoto !== false) ? (
                                                        /* Apple-style Live Photo Badge */
                                                        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-full bg-white/30 backdrop-blur-md border border-white/20">
                                                            <div className="flex items-center gap-1.5 text-white">
                                                                {/* Concentric Circles Icon */}
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <circle cx="12" cy="12" r="10" strokeDasharray="4 4" opacity="0.8" />
                                                                    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                                                                </svg>
                                                                <span className="text-[10px] font-medium tracking-wide leading-none select-none uppercase font-sans opacity-90">LIVE</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* Video Badge for regular videos */
                                                        <div className="absolute top-3 left-3 z-20 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                                            <div className="flex items-center gap-1.5 text-white">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
                                                                    <path d="M5.25 21a3.25 3.25 0 01-3.25-3.25V6.25A3.25 3.25 0 015.25 3h13.5A3.25 3.25 0 0122 6.25v11.5a3.25 3.25 0 01-3.25 3.25H5.25zm.75-9.72l6.86 3.13a1 1 0 001.39-.91V10.5a1 1 0 00-1.39-.91L6 12.72a1 1 0 000 1.82z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : null}

                                            {photo.image ? (
                                                <Image
                                                    src={urlFor(photo.image).auto('format').width(800).url()}
                                                    alt={photo.title || 'Gallery image'}
                                                    width={800}
                                                    height={800 / aspectRatio}
                                                    className={`w-full h-auto transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.03] ${dimensions?.aspectRatio ? 'object-cover' : 'object-contain bg-black/5'
                                                        }`}
                                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            ) : (
                                                /* Fallback for video-only items */
                                                <div
                                                    className="w-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-400"
                                                    style={{ aspectRatio: '3/4' }}
                                                >
                                                    {photo.video ? (
                                                        <video
                                                            src={photo.video.asset.url}
                                                            muted
                                                            loop
                                                            playsInline
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs">No media</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 z-30 pointer-events-none">
                                                {photo.title && <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">{photo.title}</h3>}
                                                {photo.caption && <p className="text-white/90 text-sm mt-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-75 line-clamp-2">{photo.caption}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollAnimation>
                            );
                        })}
                    </div>
                ))}

            </div>

            {/* Detail Modal */}
            <PhotoModal
                photo={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
            />
        </div>
    );
};

export default PhotoGallery;
