import React from 'react';
import Image from 'next/image';
import { urlFor } from '../../sanity/lib/image';

const PhotoGallery = ({ photos }) => {
    if (!photos || photos.length === 0) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400">
                No photos found in Sanity. Time to upload some!
            </div>
        );
    }

    return (
        <div className="px-6 md:px-16 lg:px-40 2xl:px-48 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {photos.map((photo, index) => (
                    <div key={photo._id || index} className="group relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 transition-all duration-500 hover:shadow-xl">
                        <div className="aspect-[4/5] relative">
                            <Image
                                src={urlFor(photo.image).width(800).url()}
                                alt={photo.title || 'Gallery image'}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                {photo.title && <h3 className="text-white font-bold text-lg">{photo.title}</h3>}
                                {photo.caption && <p className="text-white/80 text-sm mt-1">{photo.caption}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhotoGallery;
