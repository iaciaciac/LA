import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoFlashOutline, IoSparklesOutline, IoColorPaletteOutline } from 'react-icons/io5';

const AIVibeHub = () => {
    return (
        <section className="px-4 md:px-12 py-12">
            <Link href="/cai_power">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="vibe-glass-card p-1 relative overflow-hidden group cursor-pointer"
                >
                    <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex flex-col gap-4 text-center md:text-left z-10">
                            <div className="vibe-ai-island w-fit mx-auto md:mx-0">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                POWER LAB ENABLED
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                                Agent <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Lightning ⚡</span>
                            </h2>
                            <p className="text-zinc-500 text-sm md:text-base font-medium max-w-md">
                                Experience professional-grade film simulation and AI-powered image intelligence in the new Power Lab.
                            </p>
                        </div>

                        <div className="flex gap-4 z-10">
                            <div className="vibe-glass-card p-6 flex flex-col items-center gap-3 border-white/5 bg-white/5 backdrop-blur-md">
                                <IoColorPaletteOutline size={24} className="text-indigo-400" />
                                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">FILM SIM</span>
                            </div>
                            <div className="vibe-glass-card p-6 flex flex-col items-center gap-3 border-white/5 bg-white/5 backdrop-blur-md">
                                <IoSparklesOutline size={24} className="text-purple-400" />
                                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">AI ENHANCE</span>
                            </div>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-20 group-hover:opacity-30 transition-opacity">
                            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
                            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[120%] bg-purple-500/20 blur-[120px] rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </Link>
        </section>
    );
};

export default AIVibeHub;
