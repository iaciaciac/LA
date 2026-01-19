import React, { useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import polyline from '@mapbox/polyline';
import 'maplibre-gl/dist/maplibre-gl.css';

const RunMap = ({ summaryPolyline, className, isStatic = false }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const containerRef = React.useRef(null);

    const geoJSON = useMemo(() => {
        if (!summaryPolyline) return null;
        try {
            const decoded = polyline.decode(summaryPolyline);
            const coordinates = decoded.map(([lat, lng]) => [lng, lat]);

            return {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            };
        } catch (e) {
            console.error("Failed to decode polyline", e);
            return null;
        }
    }, [summaryPolyline]);

    // Lazy load logic (keep for both modes to save resources)
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            },
            {
                root: null,
                rootMargin: '100px',
                threshold: 0.1
            }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
            observer.disconnect();
        };
    }, []);

    if (!geoJSON) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-2xl ${className}`}>
                <span className="text-xs text-gray-400">No Map Data</span>
            </div>
        );
    }

    const coords = geoJSON.geometry.coordinates;
    // Calculate bounds [minLon, minLat, maxLon, maxLat]
    const bounds = coords.reduce((acc, coord) => {
        return [
            Math.min(acc[0], coord[0]),
            Math.min(acc[1], coord[1]),
            Math.max(acc[2], coord[0]),
            Math.max(acc[3], coord[1])
        ];
    }, [180, 90, -180, -90]);

    // Static SVG Render Logic
    if (isStatic) {
        if (!isVisible) {
            return (
                <div ref={containerRef} className={`relative overflow-hidden rounded-2xl ${className} bg-gray-100 dark:bg-zinc-800`}></div>
            );
        }

        const minLon = bounds[0];
        const minLat = bounds[1];
        const maxLon = bounds[2];
        const maxLat = bounds[3];

        // Add small padding (10%)
        const lonSpan = maxLon - minLon;
        const latSpan = maxLat - minLat;
        const paddingX = lonSpan * 0.1;
        const paddingY = latSpan * 0.1;

        // Viewbox
        const viewBox = `${minLon - paddingX} ${minLat - paddingY} ${lonSpan + paddingX * 2} ${latSpan + paddingY * 2}`;

        // Generate Path Data
        const pathData = coords.map((c, i) => {
            return `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`;
        }).join(' ');

        return (
            <div ref={containerRef} className={`relative overflow-hidden rounded-2xl ${className} bg-gray-100 dark:bg-zinc-800 p-2`}>
                <svg
                    viewBox={viewBox}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ transform: 'scale(1, -1)' }} // Flip vertically to correct N-S orientation
                >
                    <path
                        d={pathData}
                        fill="none"
                        stroke="#AAFB00"
                        strokeWidth={Math.max(lonSpan, latSpan) * 0.03} // Dynamic stroke width
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        );
    }

    // Interactive WebGL Render Logic
    return (
        <div ref={containerRef} className={`relative overflow-hidden rounded-2xl ${className} bg-gray-100 dark:bg-zinc-800`}>
            {isVisible ? (
                <Map
                    initialViewState={{
                        bounds: [bounds[0], bounds[1], bounds[2], bounds[3]],
                        fitBoundsOptions: { padding: 20 }
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                    attributionControl={false}
                    interactive={false}
                    reuseMaps
                >
                    <Source id="route" type="geojson" data={geoJSON}>
                        <Layer
                            id="route-layer"
                            type="line"
                            paint={{
                                'line-color': '#AAFB00',
                                'line-width': 3,
                                'line-opacity': 0.8
                            }}
                        />
                    </Source>
                </Map>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-[#AAFB00] rounded-full animate-spin"></div>
                </div>
            )}
            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
        </div>
    );
};

export default RunMap;
