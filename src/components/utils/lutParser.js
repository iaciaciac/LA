/**
 * Simple .cube LUT parser for processing Fujifilm film simulations.
 * Parses 3D LUTs into a Float32Array suitable for WebGL 3D textures.
 */
export const parseCubeLUT = async (url) => {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const lines = text.split('\n');

        let size = 0;
        const data = [];

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            if (line.startsWith('LUT_3D_SIZE')) {
                size = parseInt(line.split(' ')[1]);
                continue;
            }

            if (line.startsWith('LUT_1D_SIZE')) {
                throw new Error('1D LUTs are not supported yet');
            }

            // Check if it's a data line (usually 3 numbers)
            const parts = line.split(/\s+/).map(parseFloat);
            if (parts.length === 3 && !isNaN(parts[0])) {
                data.push(...parts);
            }
        }

        if (size === 0) throw new Error('Could not find LUT_3D_SIZE');

        return {
            size,
            data: new Float32Array(data)
        };
    } catch (err) {
        console.error('Failed to parse LUT:', err);
        return null;
    }
};
