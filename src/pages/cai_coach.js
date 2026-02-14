import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { client } from '../sanity/lib/client';
import Image from 'next/image';

// Simple client-side protection for the hidden dashboard / 简单的客户端隐藏仪表盘保护
export default function CaiCoach() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch photos only after auth
    useEffect(() => {
        if (isAuthenticated) {
            fetchPhotos();
        }
    }, [isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (pin === '8888') {
            setIsAuthenticated(true);
        } else {
            alert('Wrong PIN');
        }
    };

    const handleAnalysisComplete = (id, analysis) => {
        setPhotos(prev => prev.map(p => p._id === id ? { ...p, aiCoach: analysis } : p));
    };

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const result = await client.fetch(`
        *[_type == "photo"] | order(_createdAt desc) {
          _id,
          title,
          image { asset-> { _id, url } },
          aiCoach
        }
      `);
            setPhotos(result);
        } catch (error) {
            console.error("Failed to fetch photos:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔒 Locked State
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex flex-col items-center justify-center p-4 transition-colors duration-500 font-sans">
                <div className="max-w-sm w-full text-center space-y-8">
                    <div className="text-6xl mb-6 transform hover:scale-105 transition-transform duration-500"></div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mb-2">Restricted Area.</h1>
                        <p className="text-lg text-gray-500 font-medium">AI Director Access Only.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter PIN"
                            className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-xl text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-[#0071E3] text-white font-bold py-4 rounded-2xl hover:bg-[#0077ED] transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 🔓 Unlocked Dashboard
    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-500 font-sans">
            <Navbar />

            {/* Apple Store Style Header */}
            <div className="pt-24 pb-8 sticky top-0 z-10 bg-[#F5F5F7]/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50 transition-colors duration-500">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex justify-between items-end">
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                        <h1 className="text-4xl md:text-[48px] font-bold text-gray-500 dark:text-gray-400 tracking-tight">
                            Strategy.
                        </h1>
                        <h1 className="text-4xl md:text-[48px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                            Content Intelligence.
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-sm font-bold text-[#0071E3] hover:underline"
                    >
                        Lock 🔒
                    </button>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pb-40">
                {loading ? (
                    <div className="text-center text-gray-500 py-40 animate-pulse text-xl font-bold">Loading assets...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-12">
                        {photos.map(photo => (
                            <AnalysisCard
                                key={photo._id}
                                photo={photo}
                                refreshPhotos={fetchPhotos}
                                onAnalysisComplete={handleAnalysisComplete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function AnalysisCard({ photo, refreshPhotos, onAnalysisComplete }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState('xhs'); // 'xhs' or 'douyin'

    const handleAnalyze = async () => {
        if (!photo.image?.asset?.url) return;
        setAnalyzing(true);
        try {
            const response = await fetch('/api/analyze-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: photo.image.asset.url,
                    documentId: photo._id
                }),
            });
            const data = await response.json();
            if (data.success) {
                if (data.analysis && onAnalysisComplete) {
                    onAnalysisComplete(photo._id, data.analysis);
                } else {
                    refreshPhotos();
                }
            } else {
                alert('Analysis failed: ' + data.message);
            }
        } catch (error) {
            console.error("Error analyzing:", error);
            alert('Error analyzing photo');
        } finally {
            setAnalyzing(false);
        }
    };

    const hasAnalysis = photo.aiCoach && (photo.aiCoach.xhs || photo.aiCoach.douyin);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 ease-out flex flex-col md:flex-row gap-8">
            {/* Image Section */}
            <div className="w-full md:w-1/3 space-y-4">
                <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 shadow-inner">
                    {photo.image && (
                        <Image
                            src={photo.image.asset.url}
                            alt={photo.title || 'Untitled'}
                            fill
                            className="object-cover"
                        />
                    )}
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                    {analyzing ? 'Generating Strategy...' : hasAnalysis ? 'Regenerate Strategy ↻' : '✨ Generate Strategy'}
                </button>
            </div>

            {/* Strategy Section */}
            <div className="flex-1 min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate pr-4">
                        {photo.title || 'Untitled Photo'}
                    </h3>
                    {hasAnalysis && (
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('xhs')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'xhs' ? 'bg-white dark:bg-zinc-700 text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Xiaohongshu 📕
                            </button>
                            <button
                                onClick={() => setActiveTab('douyin')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'douyin' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Douyin 🎵
                            </button>
                        </div>
                    )}
                </div>

                {hasAnalysis ? (
                    <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === 'xhs' && photo.aiCoach.xhs && (
                            <XHSView strategy={photo.aiCoach.xhs} />
                        )}
                        {activeTab === 'douyin' && photo.aiCoach.douyin && (
                            <DouyinView strategy={photo.aiCoach.douyin} />
                        )}
                        {((activeTab === 'xhs' && !photo.aiCoach.xhs) || (activeTab === 'douyin' && !photo.aiCoach.douyin)) && (
                            <div className="h-full flex items-center justify-center text-gray-400 italic">
                                Data missing for this platform. Try regenerating.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50 dark:bg-zinc-900/50">
                        <div className="text-6xl mb-4 opacity-20">🧠</div>
                        <p className="text-gray-400 font-medium">Ready to analyze</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function XHSView({ strategy }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                    <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Viral Score</span>
                    <span className="text-3xl font-black text-red-500">{strategy.viralScore}<span className="text-sm opacity-50">/10</span></span>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Visual Critique</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">{strategy.critique}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/50 rounded-xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-zinc-800/80 px-4 py-2 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">PREVIEW</span>
                    <span className="text-xs text-red-500 font-bold">Xiaohongshu</span>
                </div>
                <div className="p-4 space-y-3">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-snug">
                        {strategy.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-light leading-relaxed">
                        {strategy.copy}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {strategy.hashtags?.map((tag, i) => (
                            <span key={i} className="text-blue-600 dark:text-blue-400 text-xs">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DouyinView({ strategy }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Hook Score</span>
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{strategy.viralScore}<span className="text-sm opacity-50">/10</span></span>
                </div>
                <div className="flex-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 rounded-xl border border-purple-500/10">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest mb-1">Recommended BGM</p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🎵</span>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{strategy.bgm}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                    <p className="text-xs text-yellow-700 dark:text-yellow-500 font-bold uppercase mb-2">Visual Hook</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{strategy.hook}</p>
                </div>

                <div className="bg-zinc-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                        <span className="text-4xl">🎬</span>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Script / Voiceover</p>
                        <p className="font-mono text-sm leading-relaxed text-zinc-300 pb-4 border-b border-zinc-700/50">
                            {strategy.script}
                        </p>
                    </div>
                    <div className="mt-4">
                        <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Caption</p>
                        <p className="text-sm">{strategy.copy}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
