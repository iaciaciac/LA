import React, { useMemo, useEffect, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import polyline from '@mapbox/polyline';
import 'maplibre-gl/dist/maplibre-gl.css';

const GlobalHeatmap = ({ runs, className }) => {
    // 1. Process Data: Decode all polylines and merge into a single MultiLineString
    const { geoJSON, bounds } = useMemo(() => {
        if (!runs || runs.length === 0) return { geoJSON: null, bounds: null };

        const allCoords = [];
        let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;

        runs.forEach(run => {
            const summaryPolyline = run.map?.summary_polyline;

            if (summaryPolyline) {
                try {
                    const decoded = polyline.decode(summaryPolyline);
                    const coords = decoded.map(([lat, lng]) => {
                        if (lng < minLon) minLon = lng;
                        if (lng > maxLon) maxLon = lng;
                        if (lat < minLat) minLat = lat;
                        if (lat > maxLat) maxLat = lat;
                        return [lng, lat];
                    });

                    if (coords.length > 0) {
                        allCoords.push(coords);
                    }
                } catch (e) {
                    // console.warn("Failed to decode polyline for run", run.id);
                }
            }
        });

        if (allCoords.length === 0) return { geoJSON: null, bounds: null };

        const geoJSONData = {
            type: 'Feature',
            geometry: {
                type: 'MultiLineString',
                coordinates: allCoords
            }
        };

        const calculatedBounds = [minLon, minLat, maxLon, maxLat];
        return { geoJSON: geoJSONData, bounds: calculatedBounds };
    }, [runs]);

    if (!geoJSON || !bounds) {
        return <div className={`bg-black ${className}`} />;
    }

    return (
        <Map
            initialViewState={{
                bounds: bounds,
                fitBoundsOptions: { padding: 0 } // Full bleed
            }}
            style={{ width: '100%', height: '100%' }}
            // Dark Matter Style
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            attributionControl={false}
            interactive={false}
            reuseMaps
        >
            <Source id="all-runs" type="geojson" data={geoJSON}>

                {/* Layer 1: The Glow / Atmosphere 
                    Subtle shadow to lift the route off the map.
                */}
                <Layer
                    id="heatmap-glow"
                    type="line"
                    paint={{
                        'line-color': '#AAFB00', // Fluorescent Green from Navbar
                        'line-width': 5,
                        'line-opacity': 0.2,     // Slightly higher for neon glow effect
                        'line-blur': 2
                    }}
                    layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                />

                {/* Layer 2: The Core Route 
                    Solid neon line.
                */}
                <Layer
                    id="heatmap-core"
                    type="line"
                    paint={{
                        'line-color': '#AAFB00',
                        'line-width': 2,
                        'line-opacity': 0.8,     // High opacity for visibility on light map
                        'line-blur': 0.5
                    }}
                    layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                />

                {/* Layer 3: High Density detail */}
                <Layer
                    id="heatmap-hot"
                    type="line"
                    paint={{
                        'line-color': '#AAFB00',
                        'line-width': 0.8,
                        'line-opacity': 0.4
                    }}
                    layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                />
            </Source>
        </Map>
    );
};

export default GlobalHeatmap;
