import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IoOptionsOutline, IoVideocamOutline, IoFilmOutline, IoCameraOutline, IoRefreshOutline, IoSearchOutline, IoPersonCircleOutline, IoClose, IoSaveOutline, IoAddOutline, IoImageOutline } from 'react-icons/io5';
import { getLutById, LUT_GROUPS } from './lutRegistry';
import { parseCubeLUT } from './utils/lutParser';
import LutCanvas from './LutCanvas';
import { lightning } from '../../lib/ai/lightningLogger';

const PhotoEditor = ({ photo, onPhotoSelect }) => {
    const [adjustments, setAdjustments] = useState({
        exposure: 100,
        highlights: 0,
        shadows: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blackPoint: 0,
        clarity: 0,
        sepia: 0,
        hueRotate: 0,
        blur: 0,
        lutIntensity: 100,
        autoTransform: true,
        grain: 0,
    });

    const [activeLut, setActiveLut] = useState({ id: 'original', name: 'Original', filter: '' });
    const [lutData, setLutData] = useState(null);
    const [activeCategory, setActiveCategory] = useState('adjust'); // adjust, flog2, stocks, classic
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mediaType, setMediaType] = useState('image'); // image or video
    const [intelligenceMode, setIntelligenceMode] = useState(false);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);

    // Sync mediaType with photo prop
    useEffect(() => {
        if (photo?.mediaType) {
            setMediaType(photo.mediaType);
        } else if (photo?.url) {
            // Fallback detection for existing photo objects
            const isVideo = photo.url.includes('video') ||
                photo.title?.toLowerCase().endsWith('.mov') ||
                photo.title?.toLowerCase().endsWith('.mp4');
            setMediaType(isVideo ? 'video' : 'image');
        }
    }, [photo]);

    // Lock body scroll
    useEffect(() => {
        if (photo) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, [photo]);

    // Handle LUT Data Fetching
    useEffect(() => {
        const fetchLut = async () => {
            if (activeLut.path) {
                setIsProcessing(true);
                const data = await parseCubeLUT(activeLut.path);
                setLutData(data);
                setIsProcessing(false);
            } else {
                setLutData(null);
            }
        };
        fetchLut();
    }, [activeLut]);

    // ⚡ Agent Lightning: 同步进化模式状态
    useEffect(() => {
        lightning.setEnable(intelligenceMode);
        if (intelligenceMode && photo) {
            lightning.startNewTrajectory({
                photoTitle: photo.title,
                mediaType: mediaType,
                initialState: adjustments
            });
        }
    }, [intelligenceMode, photo]);

    // ⚡ Agent Lightning: 捕获滑块调整轨迹 (Debounced)
    useEffect(() => {
        if (!intelligenceMode) return;
        const timer = setTimeout(() => {
            lightning.logAction('BATCH_ADJUST', adjustments, adjustments);
        }, 500); // 稍微防抖，避免高频操作撑爆日志
        return () => clearTimeout(timer);
    }, [adjustments, intelligenceMode]);

    // ⚡ Agent Lightning: 捕获 LUT 切换轨迹
    useEffect(() => {
        if (!intelligenceMode) return;
        lightning.logAction('SWITCH_LUT', { id: activeLut.id, name: activeLut.name }, adjustments);
    }, [activeLut, intelligenceMode]);

    const handleReset = () => {
        setAdjustments({
            exposure: 100,
            highlights: 0,
            shadows: 0,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blackPoint: 0,
            clarity: 0,
            sepia: 0,
            hueRotate: 0,
            blur: 0,
            lutIntensity: 100,
            autoTransform: true,
            grain: 0,
        });
        setActiveLut({ id: 'original', name: 'Original', filter: '' });
    };

    const AdjustmentSlider = ({ label, name, min = 0, max = 200, value, step = 1 }) => (
        <div className="vibe-glass-card p-5 group flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                <span className="group-hover:text-indigo-400 transition-colors">{label}</span>
                <span className="text-zinc-400 font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                    {value > 100 ? `+${value - 100}` : value === 100 ? '0' : value - 100}
                </span>
            </div>
            <div className="relative flex items-center h-4">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => setAdjustments(prev => ({ ...prev, [name]: parseFloat(e.target.value) }))}
                    className="w-full h-[4px] bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 relative z-10"
                />
            </div>
        </div>
    );

    const SidebarItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveCategory(id)}
            className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest
                ${activeCategory === id
                    ? 'bg-white/10 text-white shadow-lg border border-white/10'
                    : 'text-zinc-500 hover:bg-white/5 border border-transparent'}
            `}
        >
            <div className={`vibe-icon-wrapper ${activeCategory === id ? 'vibe-icon-active' : ''}`}>
                <Icon size={18} />
            </div>
            <span>{label}</span>
        </button>
    );

    const handleLocalUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();

        // HEIC Warning
        if (fileName.endsWith('.heic')) {
            alert('⚠️ 当前编辑器暂不支持 HEIC 格式。请先在 macOS [预览] 中导出为 JPG 再上传。');
            return;
        }

        // Robust video detection
        const isVideoFile = file.type.startsWith('video/') || fileName.endsWith('.mov') || fileName.endsWith('.mp4');
        const type = isVideoFile ? 'video' : 'image';

        setMediaType(type);

        const url = URL.createObjectURL(file);
        onPhotoSelect({
            url,
            title: file.name,
            isLocal: true,
            mediaType: type
        });
    };

    const isLogLut = activeCategory === 'flog2';

    const filteredLuts = useMemo(() => {
        let luts = [];
        if (activeCategory === 'flog2' && LUT_GROUPS[0]) luts = LUT_GROUPS[0].luts;
        else if (activeCategory === 'stocks' && LUT_GROUPS[1]) luts = LUT_GROUPS[1].luts;
        else if (activeCategory === 'classic' && LUT_GROUPS[2]) luts = LUT_GROUPS[2].luts;

        if (searchQuery) {
            return luts.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return luts;
    }, [activeCategory, searchQuery]);

    const categoryTitle = {
        adjust: '探索：光影实验室',
        flog2: 'F-Log2 电影胶片',
        stocks: '电影胶片库存',
        classic: '经典复古胶片'
    }[activeCategory];

    return (
        <div className="w-full h-full flex items-center justify-center bg-[#0A0A0B] p-4 md:p-8 font-sans selection:bg-purple-500/30">
            <div className="w-full max-w-[1400px] h-full max-h-[900px] vibe-bento-grid animate-in fade-in zoom-in duration-1000">

                {/* AI Status Island ⚡ */}
                <div className="col-span-12 flex justify-center mb-2">
                    <div className="vibe-ai-island animate-in slide-in-from-top-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        AGENT LIGHTNING ⚡ {intelligenceMode ? 'ACTIVE & LEARNING' : 'STANDBY'}
                    </div>
                </div>

                {/* Bento Sidebar (Left 3 units) */}
                <div className="col-span-12 md:col-span-3 vibe-glass-card p-6 flex flex-col gap-6 overflow-hidden">
                    <div className="relative">
                        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="搜索滤镜..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white border border-white/5"
                        />
                    </div>

                    <div className="space-y-2 flex-1 scrollbar-hide overflow-y-auto">
                        <SidebarItem id="adjust" label="探索：光影" icon={IoOptionsOutline} />
                        <div className="h-4" />
                        <h4 className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 opacity-50">电影实验室</h4>
                        <SidebarItem id="flog2" label="F-Log2" icon={IoVideocamOutline} />
                        <SidebarItem id="stocks" label="胶片库存" icon={IoFilmOutline} />
                        <SidebarItem id="classic" label="经典复古" icon={IoCameraOutline} />

                        <div className="h-4" />
                        <h4 className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 opacity-50">AI 进化 ⚡</h4>
                        <button
                            onClick={() => setIntelligenceMode(!intelligenceMode)}
                            className={`
                                w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-[11px] font-black uppercase
                                ${intelligenceMode
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                    : 'text-zinc-500 hover:bg-white/5'}
                            `}
                        >
                            <span className={intelligenceMode ? 'animate-pulse' : ''}>Evolution</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${intelligenceMode ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${intelligenceMode ? 'left-4.5' : 'left-0.5'}`} />
                            </div>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                        <button onClick={handleReset} className="w-full py-3 rounded-xl bg-white/5 text-[10px] font-bold text-zinc-500 hover:text-purple-400 transition-all flex items-center justify-center gap-2 border border-white/5">
                            <IoRefreshOutline /> RESET ALL
                        </button>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    <IoPersonCircleOutline size={24} className="text-white/80" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-white tracking-widest uppercase italic">CAICAI</span>
                                <span className="text-[9px] text-zinc-500 font-mono tracking-tighter">AI LAB PRO</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Bento Content Area (Right 9 units) */}
                <div className="col-span-12 md:col-span-9 flex flex-col overflow-hidden gap-6">
                    <div className="flex-1 vibe-glass-card overflow-hidden flex flex-col relative">
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            {/* Header Section */}
                            <div className="flex justify-between items-center bg-white/5 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 sticky top-0 z-20">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">{categoryTitle}</h2>
                                    {isLogLut && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]" />
                                            <p className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase">GFX ETERNA CST ENGINE ACTIVE</p>
                                        </div>
                                    )}
                                </div>
                                {photo && (
                                    <button
                                        onClick={() => setAdjustments(prev => ({ ...prev, autoTransform: !prev.autoTransform }))}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${adjustments.autoTransform ? 'bg-indigo-500 text-white border-indigo-400 shadow-xl' : 'bg-white/5 text-zinc-500 border-white/10'}`}
                                    >
                                        {adjustments.autoTransform ? 'Rec.709 MAP' : 'NATIVE LOG'}
                                    </button>
                                )}
                            </div>

                            {/* Main Preview */}
                            <div className="relative min-h-[500px] flex-1 flex items-center justify-center bg-black/60 rounded-[40px] group border border-white/5 p-4 transition-all hover:border-indigo-500/20 shadow-2xl overflow-hidden">
                                {photo ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <LutCanvas
                                            key={photo.url}
                                            videoRef={videoRef}
                                            imageSrc={mediaType === 'image' ? photo.url : null}
                                            videoSrc={mediaType === 'video' ? photo.url : null}
                                            lutData={lutData}
                                            adjustments={adjustments}
                                            isVideo={mediaType === 'video'}
                                            className="max-w-full max-h-[55vh] rounded-2xl shadow-[0_64px_128px_rgba(0,0,0,0.9)]"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-8">
                                        <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-700">
                                            <IoImageOutline size={36} className="text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Drop to Lab</h3>
                                            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-2 px-8">Supports RAW / LOG / MP4 / MOV formats</p>
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleLocalUpload} />
                                        <button onClick={() => fileInputRef.current.click()} className="px-12 py-4 bg-white text-black rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase shadow-[0_24px_48px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all">
                                            Import Media
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sliders / LUTs Bento Grid */}
                            {photo && (
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    {activeCategory === 'adjust' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <AdjustmentSlider label="Exposure" name="exposure" value={adjustments.exposure} />
                                            <AdjustmentSlider label="Contrast" name="contrast" value={adjustments.contrast} />
                                            <AdjustmentSlider label="Highlights" name="highlights" value={adjustments.highlights} min={-100} max={100} />
                                            <AdjustmentSlider label="Shadows" name="shadows" value={adjustments.shadows} min={-100} max={100} />
                                            <AdjustmentSlider label="Grain" name="grain" value={adjustments.grain} min={0} max={100} />
                                            <AdjustmentSlider label="Saturation" name="saturation" value={adjustments.saturation} />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {filteredLuts.map((lut) => (
                                                <div
                                                    key={lut.id}
                                                    onClick={() => setActiveLut(lut)}
                                                    className={`p-5 rounded-3xl cursor-pointer border transition-all duration-500 group relative overflow-hidden ${activeLut.id === lut.id ? 'bg-indigo-500 border-indigo-400 shadow-[0_20px_40px_rgba(99,102,241,0.3)] scale-[1.02]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                                >
                                                    <div
                                                        className="w-10 h-10 rounded-2xl mb-4 shadow-xl transition-transform duration-500 group-hover:scale-110"
                                                        style={{ background: `radial-gradient(circle at 30% 30%, ${lut.color} 0%, #000 100%)` }}
                                                    />
                                                    <span className={`text-[10px] font-black tracking-widest uppercase ${activeLut.id === lut.id ? 'text-white' : 'text-zinc-500'}`}>
                                                        {lut.name.split(' (')[0]}
                                                    </span>
                                                    {activeLut.id === lut.id && <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Status Bar */}
                        {photo && (
                            <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-black/60 backdrop-blur-3xl">
                                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-6">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> ENGINE ONLINE</span>
                                    <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 text-zinc-400">{photo.title?.toUpperCase()}</span>
                                    <span className="text-zinc-600">{mediaType.toUpperCase()} @ {videoRef.current?.videoWidth || 1920}X{videoRef.current?.videoHeight || 1080}</span>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => onPhotoSelect(null)} className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">REMOVE</button>
                                    {intelligenceMode && (
                                        <button
                                            onClick={() => {
                                                lightning.logReward(1.0);
                                                alert('⚡ AI 已吸收此风格轨迹');
                                            }}
                                            className="px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase bg-amber-500 text-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                        >
                                            ENDORSE ⚡
                                        </button>
                                    )}
                                    <button className="px-10 py-2.5 rounded-2xl text-[10px] font-black uppercase bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl">
                                        EXPORT 4K
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoEditor;
