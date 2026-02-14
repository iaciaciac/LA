import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    FaHome,
    FaRunning,
    FaCamera,
    FaUser,
    FaMapMarkerAlt
} from 'react-icons/fa';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', path: '/', icon: FaHome },
    { id: 'photos', label: 'Photos', path: '/cai_photos', icon: FaMapMarkerAlt },
    { id: 'run', label: 'Run', path: '/cai_run', icon: FaRunning },
    { id: 'damn', label: 'DAMN', path: '/cai_damn', icon: FaCamera },
    { id: 'about', label: 'About', path: '/cai_about', icon: FaUser },
];

const IslandNav = () => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [activeTab, setActiveTab] = useState(router.pathname);
    const containerRef = useRef(null);

    // Physics springs for that "Camera Control" heavy damping feel
    const widthSpring = useSpring(120, { stiffness: 300, damping: 30 });
    const heightSpring = useSpring(36, { stiffness: 300, damping: 30 });
    const scaleSpring = useSpring(1, { stiffness: 400, damping: 25 });

    // Update active tab when route changes
    useEffect(() => {
        setActiveTab(router.pathname);
    }, [router.pathname]);

    // Expand on hover
    useEffect(() => {
        if (isHovered) {
            widthSpring.set(380); // Expanded width
            heightSpring.set(60); // Expanded height
        } else {
            widthSpring.set(120); // Collapsed width
            heightSpring.set(36); // Collapsed height
        }
    }, [isHovered, widthSpring, heightSpring]);

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center items-start pointer-events-none">
            <motion.div
                ref={containerRef}
                style={{
                    width: widthSpring,
                    height: heightSpring,
                    scale: scaleSpring,
                }}
                className="pointer-events-auto bg-black rounded-full shadow-2xl flex items-center justify-between px-2 overflow-hidden relative cursor-grab active:cursor-grabbing backdrop-blur-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileTap={{ scale: 0.95 }}
            >
                {/* Dynamic Content */}
                <AnimatePresence mode="wait">
                    {!isHovered ? (
                        // Collapsed State: Show current page name or logo
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="h-1 w-12 bg-gray-500/50 rounded-full" /> {/* Apple-style grab indicator */}
                        </motion.div>
                    ) : (
                        // Expanded State: Navigation Items
                        <motion.div
                            key="expanded"
                            className="flex items-center justify-between w-full px-2 h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {NAV_ITEMS.map((item) => {
                                const isActive = activeTab === item.path || (item.path !== '/' && activeTab.startsWith(item.path));
                                return (
                                    <Link key={item.id} href={item.path} onClick={() => setActiveTab(item.path)}>
                                        <div className="relative group flex flex-col items-center justify-center p-2 rounded-xl transition-colors hover:bg-white/10">
                                            <item.icon
                                                className={`text-xl transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-gray-500 group-hover:text-gray-300'
                                                    }`}
                                            />
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-dot"
                                                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                                                />
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default IslandNav;
