export const LUT_GROUPS = [
    {
        name: 'F-Log2 Film Simulations',
        description: 'Precision GFXETERNA55 stock mappings for F-Log2',
        luts: [
            { id: 'flog2_cc', name: 'Classic Chrome', color: '#2D5A27', path: '/luts/fujifilm/FLog2_to_CLASSIC-CHROME_65gird_V.1.00.cube' },
            { id: 'flog2_cneg', name: 'Classic Neg.', color: '#1A3A32', path: '/luts/fujifilm/FLog2_to_CLASSIC-Neg._65gird_V.1.00.cube' },
            { id: 'flog2_reala', name: 'Reala Ace', color: '#D4AF37', path: '/luts/fujifilm/FLog2_to_REALA-ACE_65gird_V.1.00.cube' },
            { id: 'flog2_eterna', name: 'Eterna', color: '#8B4513', path: '/luts/fujifilm/FLog2_to_ETERNA_65gird_V.1.00.cube' },
            { id: 'flog2_eterna_bb', name: 'Eterna BB', color: '#5D4037', path: '/luts/fujifilm/FLog2_to_ETERNA-BB_65gird_V.1.00.cube' },
            { id: 'flog2_velvia', name: 'Velvia', color: '#800080', path: '/luts/fujifilm/FLog2_to_Velvia_65gird_V.1.00.cube' },
            { id: 'flog2_provia', name: 'Provia (Std)', color: '#4682B4', path: '/luts/fujifilm/FLog2_to_PROVIA_65gird_V.1.00.cube' },
            { id: 'flog2_astia', name: 'Astia (Soft)', color: '#DB7093', path: '/luts/fujifilm/FLog2_to_ASTIA_65gird_V.1.00.cube' },
            { id: 'flog2_acros', name: 'Acros (B&W)', color: '#000000', path: '/luts/fujifilm/FLog2_to_ACROS_65gird_V.1.00.cube' },
            { id: 'flog2_pneg_std', name: 'Pro Neg. Std', color: '#A52A2A', path: '/luts/fujifilm/FLog2_to_PRO-Neg.Std_65gird_V.1.00.cube' },
        ]
    },
    {
        name: 'F-Log2C & F-Log Stocks',
        description: 'Cinema and Log-Correction profiles',
        luts: [
            { id: 'flog2c_reala', name: 'Reala Ace (2C)', color: '#B8860B', path: '/luts/fujifilm/FLog2C_to_REALA-ACE_65gird_V.1.00.cube' },
            { id: 'flog2c_velvia', name: 'Velvia (2C)', color: '#A020F0', path: '/luts/fujifilm/FLog2C_to_Velvia_65gird_V.1.00.cube' },
            { id: 'flog2c_acros', name: 'Acros (2C)', color: '#000000', path: '/luts/fujifilm/FLog2C_to_ACROS_65gird_V.1.00.cube' },
            { id: 'flog_eterna', name: 'F-Log Eterna', color: '#A0522D', path: '/luts/fujifilm/FLog_to_ETERNA_65gird_V.1.00.cube' },
            { id: 'flog_eterna_bb', name: 'F-Log Eterna BB', color: '#6B4226', path: '/luts/fujifilm/FLog_to_ETERNA-BB_65gird_V.1.00.cube' },
        ]
    },
    {
        name: 'Classic Film (Simulated)',
        description: 'High-fidelity presets based on GFX response',
        luts: [
            { id: 'kodak_gold', name: 'Kodak Gold', color: '#FFD700', filter: 'sepia(0.3) saturate(1.3) contrast(1.1) hue-rotate(5deg) brightness(1.05)' },
            { id: 'portra_400', name: 'Portra 400', color: '#F4A460', filter: 'saturate(0.9) contrast(1.05) brightness(1.05) sepia(0.1) hue-rotate(-2deg)' },
            { id: 'mono', name: 'Mono Chrome', color: '#333333', filter: 'grayscale(1) contrast(1.1) brightness(1.0)' },
        ]
    }
];

export const getLutById = (id) => {
    for (const group of LUT_GROUPS) {
        const lut = group.luts.find(l => l.id === id);
        if (lut) return lut;
    }
    return { id: 'original', name: 'Original', filter: '' };
};
