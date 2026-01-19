import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useScrollRestoration = (loading = false) => {
    const router = useRouter();

    useEffect(() => {
        // Disable browser's default scroll restoration to avoid conflicts
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const saveScrollPos = () => {
            const scrollPos = { x: window.scrollX, y: window.scrollY };
            sessionStorage.setItem(`scrollPos:${router.asPath}`, JSON.stringify(scrollPos));
        };

        const restoreScrollPos = () => {
            const scrollPos = JSON.parse(sessionStorage.getItem(`scrollPos:${router.asPath}`));
            if (scrollPos) {
                // Small timeout to ensure DOM is fully ready / painted
                setTimeout(() => {
                    window.scrollTo(scrollPos.x, scrollPos.y);
                }, 100);
            }
        };

        // Attach scroll listener to save position
        // Using a simple throttle essentially by not debouncing too heavily, 
        // relying on the fact that modern browsers handle scroll listeners relatively well
        // or we could add a debounce if needed. For now simple valid event listener.
        const onScroll = () => {
            requestAnimationFrame(saveScrollPos);
        }

        window.addEventListener('scroll', onScroll);

        // Try to restore immediately on mount
        restoreScrollPos();

        // Also try to restore when loading finishes, as height might have changed
        if (!loading) {
            restoreScrollPos();
        }

        // Cleanup
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, [router.asPath, loading]); // Re-run if path or loading state changes
};

export default useScrollRestoration;
