import React, { useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '../../sanity/lib/image';
import { IoClose } from 'react-icons/io5';
import { FaInstagram } from 'react-icons/fa';

// Custom Icons defined manually to avoid version issues and ensure exact rendering
const WeChatIcon = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
    </svg>
);

const XiaohongshuIcon = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22.405 9.879c.002.016.01.02.07.019h.725a.797.797 0 0 0 .78-.972.794.794 0 0 0-.884-.618.795.795 0 0 0-.692.794c0 .101-.002.666.001.777zm-11.509 4.808c-.203.001-1.353.004-1.685.003a2.528 2.528 0 0 1-.766-.126.025.025 0 0 0-.03.014L7.7 16.127a.025.025 0 0 0 .01.032c.111.06.336.124.495.124.66.01 1.32.002 1.981 0 .01 0 .02-.006.023-.015l.712-1.545a.025.025 0 0 0-.024-.036zM.477 9.91c-.071 0-.076.002-.076.01a.834.834 0 0 0-.01.08c-.027.397-.038.495-.234 3.06-.012.24-.034.389-.135.607-.026.057-.033.042.003.112.046.092.681 1.523.787 1.74.008.015.011.02.017.02.008 0 .033-.026.047-.044.147-.187.268-.391.371-.606.306-.635.44-1.325.486-1.706.014-.11.021-.22.03-.33l.204-2.616.022-.293c.003-.029 0-.033-.03-.034zm7.203 3.757a1.427 1.427 0 0 1-.135-.607c-.004-.084-.031-.39-.235-3.06a.443.443 0 0 0-.01-.082c-.004-.011-.052-.008-.076-.008h-1.48c-.03.001-.034.005-.03.034l.021.293c.076.982.153 1.964.233 2.946.05.4.186 1.085.487 1.706.103.215.223.419.37.606.015.018.037.051.048.049.02-.003.742-1.642.804-1.765.036-.07.03-.055.003-.112zm3.861-.913h-.872a.126.126 0 0 1-.116-.178l1.178-2.625a.025.025 0 0 0-.023-.035l-1.318-.003a.148.148 0 0 1-.135-.21l.876-1.954a.025.025 0 0 0-.023-.035h-1.56c-.01 0-.02.006-.024.015l-.926 2.068c-.085.169-.314.634-.399.938a.534.534 0 0 0-.02.191.46.46 0 0 0 .23.378.981.981 0 0 0 .46.119h.59c.041 0-.688 1.482-.834 1.972a.53.53 0 0 0-.023.172.465.465 0 0 0 .23.398c.15.092.342.12.475.12l1.66-.001c.01 0 .02-.006.023-.015l.575-1.28a.025.025 0 0 0-.024-.035zm-6.93-4.937H3.1a.032.032 0 0 0-.034.033c0 1.048-.01 2.795-.01 6.829 0 .288-.269.262-.28.262h-.74c-.04.001-.044.004-.04.047.001.037.465 1.064.555 1.263.01.02.03.033.051.033.157.003.767.009.938-.014.153-.02.3-.06.438-.132.3-.156.49-.419.595-.765.052-.172.075-.353.075-.533.002-2.33 0-4.66-.007-6.991a.032.032 0 0 0-.032-.032zm11.784 6.896c0-.014-.01-.021-.024-.022h-1.465c-.048-.001-.049-.002-.05-.049v-4.66c0-.072-.005-.07.07-.07h.863c.08 0 .075.004.075-.074V8.393c0-.082.006-.076-.08-.076h-3.5c-.064 0-.075-.006-.075.073v1.445c0 .083-.006.077.08.077h.854c.075 0 .07-.004.07.07v4.624c0 .095.008.084-.085.084-.37 0-1.11-.002-1.304 0-.048.001-.06.03-.06.03l-.697 1.519s-.014.025-.008.036c.006.01.013.008.058.008 1.748.003 3.495.002 5.243.002.03-.001.034-.006.035-.033v-1.539zm4.177-3.43c0 .013-.007.023-.02.024-.346.006-.692.004-1.037.004-.014-.002-.022-.01-.022-.024-.005-.434-.007-.869-.01-1.303 0-.072-.006-.071.07-.07l.733-.003c.041 0 .081.002.12.015.093.025.16.107.165.204.006.431.002 1.153.001 1.153zm2.67.244a1.953 1.953 0 0 0-.883-.222h-.18c-.04-.001-.04-.003-.042-.04V10.21c0-.132-.007-.263-.025-.394a1.823 1.823 0 0 0-.153-.53 1.533 1.533 0 0 0-.677-.71 2.167 2.167 0 0 0-1-.258c-.153-.003-.567 0-.72 0-.07 0-.068.004-.068-.065V7.76c0-.031-.01-.041-.046-.039H17.93s-.016 0-.023.007c-.006.006-.008.012-.008.023v.546c-.008.036-.057.015-.082.022h-.95c-.022.002-.028.008-.03.032v1.481c0 .09-.004.082.082.082h.913c.082 0 .072.128.072.128V11.19s.003.117-.06.117h-1.482c-.068 0-.06.082-.06.082v1.445s-.01.068.064.068h1.457c.082 0 .076-.006.076.079v3.225c0 .088-.007.081.082.081h1.43c.09 0 .082.007.082-.08v-3.27c0-.029.006-.035.033-.035l2.323-.003c.098 0 .191.02.28.061a.46.46 0 0 1 .274.407c.008.395.003.79.003 1.185 0 .259-.107.367-.33.367h-1.218c-.023.002-.029.008-.028.033.184.437.374.871.57 1.303a.045.045 0 0 0 .04.026c.17.005.34.002.51.003.15-.002.517.004.666-.01a2.03 2.03 0 0 0 .408-.075c.59-.18.975-.698.976-1.313v-1.981c0-.128-.01-.254-.034-.38 0 .078-.029-.641-.724-.998z" />
    </svg>
);

const PhotoModal = ({ photo, onClose }) => {
    // State for WeChat QR Code Modal
    const [showWeChat, setShowWeChat] = React.useState(false);
    // State for carousel index
    const [currentIndex, setCurrentIndex] = React.useState(0);
    // State for enter/exit animation
    const [isVisible, setIsVisible] = React.useState(false);

    // Animation constants
    const ANIMATION_DURATION = 370; // milliseconds
    const CARD_BORDER_RADIUS = 20; // pixels

    // Normalize items: use gallery if exists, otherwise fallback to root photo items
    const items = React.useMemo(() => {
        if (!photo) return [];
        if (photo.gallery && photo.gallery.length > 0) {
            return photo.gallery.map(item => ({
                ...item,
                // Ensure helper flags exist if not explicitly set in gallery item
                isLivePhoto: item.mediaType === 'live' || (item.mediaType === 'video' && item.isLivePhoto),
                isVideo: item.mediaType === 'video' || item.mediaType === 'live' || !!item.video,
            }));
        }
        // Fallback to legacy single-item structure
        return [{
            title: photo.title,
            caption: photo.caption,
            image: photo.image,
            video: photo.video,
            isLivePhoto: photo.isLivePhoto,
            isVideo: !!photo.video
        }];
    }, [photo]);

    // Current item to display
    const currentItem = items[currentIndex] || items[0];
    const hasMultiple = items.length > 1;

    // DEBUG: Check data integrity
    React.useEffect(() => {
        if (photo) {
            console.log('PhotoModal received photo:', photo);
            console.log('Calculated items:', items);
            console.log('Current Item:', currentItem);

            if (currentItem?.image) {
                try {
                    const url = urlFor(currentItem.image).format('jpg').width(1200).url();
                    console.log('Generated Image URL:', url);
                } catch (e) {
                    console.error('Error generating image URL:', e);
                }
            }
        }
    }, [photo, currentItem, items]);

    // Reset index when modal opens with a new photo object
    useEffect(() => {
        setCurrentIndex(0);
    }, [photo?._id]); // Use ID dependency if available, otherwise photo object

    // Trigger animation on mount
    useEffect(() => {
        if (photo) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        }
        return () => setIsVisible(false);
    }, [photo]);

    // Navigation handlers
    const nextSlide = React.useCallback(() => {
        if (items.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }
    }, [items.length]);

    const prevSlide = React.useCallback(() => {
        if (items.length > 1) {
            setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        }
    }, [items.length]);

    // Handle close with animation
    const handleClose = React.useCallback(() => {
        setIsVisible(false);
        // Wait for animation to complete before calling onClose
        setTimeout(() => {
            onClose();
        }, ANIMATION_DURATION);
    }, [onClose]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showWeChat) setShowWeChat(false);
                else handleClose();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showWeChat, handleClose, nextSlide, prevSlide]);

    // Lock body scroll
    useEffect(() => {
        if (photo) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [photo]);

    // Calculate dynamic size - removed for Apple-style card layout
    // const dimensions = currentItem?.image?.asset?.metadata?.dimensions;
    // const aspectRatio = dimensions ? dimensions.aspectRatio : 1;

    if (!photo || !currentItem) return null;

    // Get current URL for sharing
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    // Animation styles
    const overlayStyle = {
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(.42,0,.58,1)'
    };

    const cardStyle = {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(20px)',
        transition: `all ${ANIMATION_DURATION / 1000}s cubic-bezier(.6,0,.4,1)`
    };

    return (
        <React.Fragment>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                    style={overlayStyle}
                />

                {/* Modal Card */}
                <div
                    className="relative bg-white dark:bg-zinc-900 overflow-hidden w-full max-w-[900px] max-h-[95vh] md:max-h-[85vh] flex flex-col"
                    style={{
                        ...cardStyle,
                        borderRadius: `${CARD_BORDER_RADIUS}px`,
                        boxShadow: '0 24px 64px 0 rgba(0,0,0,0.26), 0 1.5px 6px 0 rgba(0,0,0,0.04)'
                    }}
                >
                    {/* Close Button - Inside card, top-right */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/30 transition-colors"
                    >
                        <IoClose size={24} />
                    </button>

                    {/* Image Area - Top of card */}
                    <div 
                        className="relative bg-black flex items-center justify-center max-h-[60vh] min-h-[40vh] overflow-hidden select-none group/video"
                        style={{ borderRadius: `${CARD_BORDER_RADIUS}px ${CARD_BORDER_RADIUS}px 0 0` }}
                    >

                        {/* Navigation Buttons (Desktop Hover) */}
                        {hasMultiple && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                    className="absolute left-4 z-40 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                                >
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                    className="absolute right-4 z-40 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                                >
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>

                                {/* Dots indicator */}
                                <div className="absolute bottom-4 left-0 right-0 z-40 flex justify-center gap-2 pointer-events-none">
                                    {items.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/30'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {currentItem.video?.asset?.url ? (
                            /* Video / Live Photo Logic */
                            (currentItem.isLivePhoto !== false) ? (
                                /* LIVE PHOTO MODE */
                                <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => {
                                    e.stopPropagation();
                                    const video = e.currentTarget.querySelector('video');
                                    if (video) video.paused ? video.play() : video.pause();
                                }}>
                                    <video
                                        key={currentItem.video.asset.url} // Force re-render on change
                                        src={currentItem.video.asset.url}
                                        poster={currentItem.image ? urlFor(currentItem.image).format('jpg').width(1200).url() : undefined}
                                        autoPlay
                                        loop
                                        muted={true}
                                        playsInline
                                        className="w-full h-full object-contain cursor-pointer"
                                        ref={(el) => { if (el && el.paused && el.muted) el.play().catch(() => { }); }}
                                    />
                                    {/* Mute Toggle */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const video = e.currentTarget.parentElement.querySelector('video');
                                            if (video) {
                                                video.muted = !video.muted;
                                                // Force re-render of icon opacity via direct DOM class manipulation for simplicity
                                                e.currentTarget.classList.toggle('opacity-50', video.muted);
                                            }
                                        }}
                                        className="absolute bottom-4 right-4 z-40 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all opacity-0 group-hover/video:opacity-100"
                                    >
                                        <span className="text-xs font-medium px-1">Sound</span>
                                    </button>
                                </div>
                            ) : (
                                /* REGULAR VIDEO MODE */
                                <div className="relative w-full h-full flex items-center justify-center bg-black" onClick={(e) => e.stopPropagation()}>
                                    <video
                                        key={currentItem.video.asset.url}
                                        src={currentItem.video.asset.url}
                                        poster={currentItem.image ? urlFor(currentItem.image).format('jpg').width(1200).url() : undefined}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain"
                                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                                    />
                                </div>
                            )
                        ) : (
                            currentItem.image && (
                                <Image
                                    src={urlFor(currentItem.image).format('jpg').width(1200).url()}
                                    alt={currentItem.title || 'Detail view'}
                                    className="object-contain w-full h-full"
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, 900px"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )
                        )}
                    </div>

                    {/* Info Area - Below image */}
                    <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">C</div>
                                </div>
                                <span className="font-bold text-sm text-gray-900 dark:text-white">caicaicai</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Pagination Counter */}
                            {hasMultiple && (
                                <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                    {currentIndex + 1} / {items.length}
                                </div>
                            )}

                            {(currentItem.title || photo.title) && (
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {currentItem.title || photo.title}
                                </h2>
                            )}

                            {(photo.caption) && (
                                <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {photo.caption}
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400">
                                <p>{new Date(photo._createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-400">Share to</span>
                            <div className="flex items-center gap-4">
                                <button className="text-gray-400 hover:text-[#E1306C] transition-colors"><FaInstagram size={20} /></button>
                                <button onClick={(e) => { e.stopPropagation(); setShowWeChat(true); }} className="text-gray-400 hover:text-[#07C160] transition-colors"><WeChatIcon size={20} /></button>
                                <button className="text-gray-400 hover:text-[#FF2442] transition-colors"><XiaohongshuIcon size={20} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* WeChat QR Code Modal */}
            {showWeChat && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWeChat(false)} />
                    <div 
                        className="relative bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center"
                        style={{
                            animation: 'fadeInScale 0.2s ease-out'
                        }}
                    >
                        <button onClick={() => setShowWeChat(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <IoClose size={24} />
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Share to WeChat</h3>
                        <div className="p-2 bg-white rounded-lg">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`} alt="WeChat QR Code" className="w-48 h-48" />
                        </div>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Scan with WeChat to share</p>
                    </div>
                    <style jsx>{`
                        @keyframes fadeInScale {
                            from {
                                opacity: 0;
                                transform: scale(0.95);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                    `}</style>
                </div>
            )}
        </React.Fragment>
    );
};

export default PhotoModal;
