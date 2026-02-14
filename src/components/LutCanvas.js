import React, { useRef, useEffect, useState } from 'react';

const LutCanvas = ({ imageSrc, videoSrc, lutData, adjustments = {}, className = "", isVideo = false, onVideoReady, videoRef: videoRefProp }) => {
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const internalVideoRef = useRef(null);
    const videoRef = videoRefProp || internalVideoRef;
    const requestRef = useRef(null);

    // 使用 Ref 追踪最新状态，防止 requestAnimationFrame 闭包过期导致采样不到最新的 LUT
    const latestPropsRef = useRef({ lutData, adjustments, isVideo });
    useEffect(() => {
        latestPropsRef.current = { lutData, adjustments, isVideo };
    }, [lutData, adjustments, isVideo]);

    const stateRef = useRef({
        program: null,
        imageTexture: null,
        lutTexture: null,
        dummyLut: null,
        posBuffer: null,
        texBuffer: null,
    });

    // 初始化 WebGL 环境
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2', {
            preserveDrawingBuffer: true,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        if (!gl) {
            console.error('WebGL2 not supported');
            return;
        }

        gl.getExtension('OES_texture_float_linear');
        gl.getExtension('EXT_color_buffer_float');

        glRef.current = gl;
        gl.clearColor(0.0, 0.0, 0.0, 0.0);

        const cleanup = () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            const s = stateRef.current;
            if (s.imageTexture) gl.deleteTexture(s.imageTexture);
            if (s.lutTexture) gl.deleteTexture(s.lutTexture);
            if (s.dummyLut) gl.deleteTexture(s.dummyLut);
            if (s.posBuffer) gl.deleteBuffer(s.posBuffer);
            if (s.texBuffer) gl.deleteBuffer(s.texBuffer);
            if (s.program) gl.deleteProgram(s.program);
        };

        const vsSource = `#version 300 es
            in vec2 a_position;
            in vec2 a_texCoord;
            out vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position, 0, 1);
                v_texCoord = a_texCoord;
            }
        `;

        const fsSource = `#version 300 es
            precision highp float;
            precision highp sampler2D;
            precision highp sampler3D;

            uniform sampler2D u_image;
            uniform sampler3D u_lut;
            
            uniform float u_lutSize;
            uniform bool u_useLut;
            uniform float u_lutMix;
            uniform bool u_autoTransform;
            uniform float u_grain;
            uniform float u_time;
            uniform float u_exposure;
            uniform float u_contrast;
            uniform float u_saturation;
            uniform float u_brightness;

            in vec2 v_texCoord;
            out vec4 outColor;

            float log10(float x) { return log(x) / 2.302585092994046; }
            vec3 log10(vec3 x) { return log(x) / 2.302585092994046; }

            // 专业级色彩科学辅助函数
            vec3 applyPivotContrast(vec3 rgb, float contrast, float pivot) {
                return pow(max(rgb / pivot, 0.0), vec3(contrast)) * pivot;
            }

            vec3 applyHighlightRollOff(vec3 rgb, float threshold) {
                // Filmic Shoulder: 处理 0.8 以上的高光，使其柔顺过渡
                float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
                if (luma > threshold) {
                    float overflow = luma - threshold;
                    float soft = overflow / (1.0 + overflow);
                    rgb *= (threshold + soft) / luma;
                }
                return rgb;
            }

            void main() {
                // 采样并处理 Y 轴翻转
                vec4 color = texture(u_image, vec2(v_texCoord.x, 1.0 - v_texCoord.y));
                vec3 rgb = color.rgb;
                
                // 1. 全局曝光调整 (Linear Domain)
                rgb *= u_exposure;
                
                // 2. 环境色彩空间转换 (CST) - 仅在自动模拟开启时执行
                if (u_useLut && u_autoTransform) {
                    // sRGB to Linear
                    rgb = mix(rgb / 12.92, pow((rgb + vec3(0.055)) / vec3(1.055), vec3(2.4)), step(vec3(0.04045), rgb));
                    
                    // Linear to F-Log2 (Fujifilm Official Formula)
                    const float a = 5.555556, b = 0.064829, c = 0.245281, d = 0.384316;
                    const float e = 8.799461, f = 0.092864, cut1 = 0.000889;
                    rgb = mix(vec3(e) * rgb + vec3(f), vec3(c) * log10(vec3(a) * rgb + vec3(b)) + vec3(d), step(vec3(cut1), rgb));

                    // 分色调温 (Split Toning Simulation)
                    float lumaLog = dot(rgb, vec3(0.299, 0.587, 0.114));
                    rgb = mix(rgb * vec3(0.96, 0.98, 1.04), rgb * vec3(1.04, 1.01, 0.97), smoothstep(0.2, 0.8, lumaLog));
                }

                // 3. 专业级对比度（Pivot Model）
                // 默认中性灰 Pivot = 0.18 (Log Domain)
                rgb = applyPivotContrast(rgb, u_contrast, 0.38); 
                
                // 4. 高光软滚降（Highlight Roll-off）
                rgb = applyHighlightRollOff(rgb, 0.85);

                // 5. 亮度饱和度保护 (Luma-Weighted Saturation)
                float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
                // 降低极暗和极亮处的饱和度增益，防止偏色
                float satProtection = smoothstep(0.0, 0.1, luma) * (1.0 - smoothstep(0.8, 1.0, luma));
                float finalSat = mix(1.0, u_saturation, satProtection);
                rgb = mix(vec3(luma), rgb, finalSat);

                // 6. 应用 LUT (3D Texture Sampling)
                if (u_useLut && u_lutSize > 0.0) {
                    float scale = (u_lutSize - 1.0) / u_lutSize;
                    float offset = 1.0 / (2.0 * u_lutSize);
                    vec3 lutCoords = clamp(rgb, 0.0, 1.0) * scale + offset;
                    rgb = mix(rgb, texture(u_lut, lutCoords).rgb, u_lutMix);
                }

                // 7. 高质量胶片颗粒 & 抖动 (Triangle PDF Dithering)
                // 采用双随机样本生成三角形分布噪波，这是消除 8-bit 量化色带 (Banding) 的行业标准
                vec2 noiseCoord = v_texCoord.xy + vec2(u_time * 0.05);
                float n1 = fract(sin(dot(noiseCoord, vec2(12.9898, 78.233))) * 43758.5453);
                float n2 = fract(sin(dot(noiseCoord * 1.5, vec2(12.9898, 78.233))) * 43758.5453);
                float triangleNoise = (n1 + n2 - 1.0); // [-1.0, 1.0]

                if (u_grain > 0.0) {
                    rgb += triangleNoise * u_grain * 0.12 * (1.0 - luma * 0.5);
                }
                
                // 最终抖动补偿：在 8bit 输出前注入极微小扰动
                rgb += triangleNoise * (1.1 / 255.0);

                outColor = vec4(clamp(rgb, 0.0, 1.0), 1.0);
            }
        `;

        const createShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source.trim());
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader Compile Error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const program = gl.createProgram();
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        if (vs && fs) {
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Program Link Error:', gl.getProgramInfoLog(program));
            }
            stateRef.current.program = program;
        }

        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        stateRef.current.posBuffer = posBuffer;

        const texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
        stateRef.current.texBuffer = texBuffer;

        const dummyLut = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, dummyLut);
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        stateRef.current.dummyLut = dummyLut;

        return cleanup;
    }, []);

    // 核心渲染机：始终读取 latestPropsRef 以确保实时性
    const render = () => {
        const gl = glRef.current;
        const s = stateRef.current;
        if (!gl || !gl.isProgram(s.program)) {
            return;
        }

        const { lutData: currentLut, adjustments: currentAdj, isVideo: currentIsVideo } = latestPropsRef.current;

        if (!s.imageTexture || !gl.isTexture(s.imageTexture)) return;

        // 如果是视频，每一帧都需要重新上传纹理
        if (currentIsVideo && videoRef.current && videoRef.current.readyState >= 2) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, s.imageTexture);
            // 优化：仅在视频真正播放时更新纹理
            if (!videoRef.current.paused || videoRef.current.currentTime > 0) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoRef.current);
            }
        }

        gl.useProgram(s.program);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const posLoc = gl.getAttribLocation(s.program, "a_position");
        const texLoc = gl.getAttribLocation(s.program, "a_texCoord");

        if (posLoc !== -1) {
            gl.enableVertexAttribArray(posLoc);
            gl.bindBuffer(gl.ARRAY_BUFFER, s.posBuffer);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        }

        if (texLoc !== -1) {
            gl.enableVertexAttribArray(texLoc);
            gl.bindBuffer(gl.ARRAY_BUFFER, s.texBuffer);
            gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, s.imageTexture);

        gl.activeTexture(gl.TEXTURE1);
        if (s.lutTexture && gl.isTexture(s.lutTexture) && currentLut) {
            gl.bindTexture(gl.TEXTURE_3D, s.lutTexture);
            gl.uniform1i(gl.getUniformLocation(s.program, "u_useLut"), 1);
            gl.uniform1f(gl.getUniformLocation(s.program, "u_lutSize"), currentLut.size || 0);
        } else if (s.dummyLut && gl.isTexture(s.dummyLut)) {
            gl.bindTexture(gl.TEXTURE_3D, s.dummyLut);
            gl.uniform1i(gl.getUniformLocation(s.program, "u_useLut"), 0);
        }

        gl.uniform1i(gl.getUniformLocation(s.program, "u_image"), 0);
        gl.uniform1i(gl.getUniformLocation(s.program, "u_lut"), 1);
        gl.uniform1i(gl.getUniformLocation(s.program, "u_autoTransform"), currentAdj.autoTransform ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_lutMix"), (currentAdj.lutIntensity ?? 100) / 100);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_grain"), (currentAdj.grain || 0) / 100);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_time"), performance.now() / 1000);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_exposure"), (currentAdj.exposure || 100) / 100);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_contrast"), (currentAdj.contrast || 100) / 100);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_saturation"), (currentAdj.saturation || 100) / 100);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_brightness"), (currentAdj.brightness || 100) / 100);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        if (currentIsVideo && requestRef.current !== null) {
            // 设置 ID 前先清理旧的，防止双重循环
            cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(render);
        }
    };

    // 处理媒体资源渲染
    useEffect(() => {
        const gl = glRef.current;
        if (!gl || (!imageSrc && !videoSrc)) return;

        if (isVideo) {
            const video = document.createElement('video');
            video.src = videoSrc;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.crossOrigin = "anonymous";
            videoRef.current = video;

            video.onloadedmetadata = () => {
                const texture = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                stateRef.current.imageTexture = texture;

                canvasRef.current.width = video.videoWidth;
                canvasRef.current.height = video.videoHeight;

                // 立即填充第一帧纹理
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

                video.play();
                if (onVideoReady) onVideoReady(video);

                // 启动渲染循环
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
                requestRef.current = requestAnimationFrame(render);
            };
            video.load(); // Ensure video metadata is loaded
        } else {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const texture = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                stateRef.current.imageTexture = texture;
                canvasRef.current.width = img.width;
                canvasRef.current.height = img.height;
                render();
            };
            img.src = imageSrc;
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.src = "";
                videoRef.current.load();
            }
        };
    }, [imageSrc, videoSrc, isVideo]);

    // 加载 LUT (始终执行一次以更新 Texture)
    useEffect(() => {
        const gl = glRef.current;
        if (!gl) return;
        if (lutData && lutData.data) {
            if (stateRef.current.lutTexture) gl.deleteTexture(stateRef.current.lutTexture);
            const texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_3D, texture);
            gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGB32F, lutData.size, lutData.size, lutData.size, 0, gl.RGB, gl.FLOAT, lutData.data);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
            stateRef.current.lutTexture = texture;
        } else {
            stateRef.current.lutTexture = null;
        }
        render();
    }, [lutData]);

    useEffect(() => {
        if (!isVideo) render();
    }, [adjustments]);

    return (
        <canvas
            ref={canvasRef}
            className={`max-w-full object-contain ${className}`}
            style={{
                imageRendering: 'high-quality', // 防止浏览器缩放产生干扰纹
                WebkitImageRendering: 'optimize-contrast'
            }}
        />
    );
};

export default LutCanvas;
