import React, { useRef, useEffect, useState } from 'react';

const SimulationEngine = ({ imageSrc, lutData, adjustments = {}, className = "" }) => {
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const stateRef = useRef({
        program: null,
        imageTexture: null,
        lutTexture: null,
        dummyLut: null,
        posBuffer: null,
        texBuffer: null,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, alpha: true });
        if (!gl) {
            console.error('WebGL2 not supported');
            return;
        }
        glRef.current = gl;

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
            uniform float u_exposure;
            uniform float u_contrast;
            uniform float u_saturation;
            uniform float u_brightness;

            in vec2 v_texCoord;
            out vec4 outColor;

            void main() {
                vec4 color = texture(u_image, vec2(v_texCoord.x, 1.0 - v_texCoord.y));
                vec3 rgb = clamp(color.rgb, 0.0, 1.0);

                // Adjustments
                rgb *= u_exposure;
                rgb = (rgb - 0.5) * u_contrast + 0.5;
                rgb *= u_brightness;
                
                float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
                rgb = mix(vec3(luma), rgb, u_saturation);
                rgb = clamp(rgb, 0.0, 1.0);

                if (u_useLut && u_lutSize > 0.1) {
                    float scale = (u_lutSize - 1.0) / u_lutSize;
                    float offset = 1.0 / (2.0 * u_lutSize);
                    vec3 lutCoords = rgb * scale + offset;
                    rgb = texture(u_lut, lutCoords).rgb;
                }

                outColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
            }
        `.trim();

        const createShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader Error:", gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };

        const program = gl.createProgram();
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        stateRef.current.program = program;

        gl.useProgram(program);
        const imgLoc = gl.getUniformLocation(program, "u_image");
        const lutLoc = gl.getUniformLocation(program, "u_lut");
        if (imgLoc) gl.uniform1i(imgLoc, 0);
        if (lutLoc) gl.uniform1i(lutLoc, 1);

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

        return () => {
            const s = stateRef.current;
            if (s.imageTexture) gl.deleteTexture(s.imageTexture);
            if (s.lutTexture) gl.deleteTexture(s.lutTexture);
            if (s.dummyLut) gl.deleteTexture(s.dummyLut);
            if (s.posBuffer) gl.deleteBuffer(s.posBuffer);
            if (s.texBuffer) gl.deleteBuffer(s.texBuffer);
            if (s.program) gl.deleteProgram(s.program);
        };
    }, []);

    const render = () => {
        const gl = glRef.current;
        const s = stateRef.current;
        if (!gl || !s.program || !s.imageTexture) return;

        gl.useProgram(s.program);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1i(gl.getUniformLocation(s.program, "u_image"), 0);
        gl.uniform1i(gl.getUniformLocation(s.program, "u_lut"), 1);

        const posLoc = gl.getAttribLocation(s.program, "a_position");
        const texLoc = gl.getAttribLocation(s.program, "a_texCoord");
        gl.enableVertexAttribArray(posLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, s.posBuffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, s.texBuffer);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, s.imageTexture);

        gl.activeTexture(gl.TEXTURE1);
        if (s.lutTexture) {
            gl.bindTexture(gl.TEXTURE_3D, s.lutTexture);
            gl.uniform1i(gl.getUniformLocation(s.program, "u_useLut"), 1);
            gl.uniform1f(gl.getUniformLocation(s.program, "u_lutSize"), lutData?.size || 0);
        } else {
            gl.bindTexture(gl.TEXTURE_3D, s.dummyLut);
            gl.uniform1i(gl.getUniformLocation(s.program, "u_useLut"), 0);
        }

        gl.uniform1f(gl.getUniformLocation(s.program, "u_exposure"), (adjustments.exposure || 100) / 100);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_contrast"), (adjustments.contrast || 100) / 100);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_saturation"), (adjustments.saturation || 100) / 100);
        gl.uniform1f(gl.getUniformLocation(s.program, "u_brightness"), (adjustments.brightness || 100) / 100);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    useEffect(() => {
        const gl = glRef.current;
        if (!gl || !imageSrc) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            if (stateRef.current.imageTexture) gl.deleteTexture(stateRef.current.imageTexture);
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
    }, [imageSrc]);

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
            stateRef.current.lutTexture = texture;
        } else {
            stateRef.current.lutTexture = null;
        }
        render();
    }, [lutData]);

    useEffect(() => {
        render();
    }, [adjustments]);

    return (
        <canvas ref={canvasRef} className={`max-w-full max-h-[80vh] object-contain ${className}`} />
    );
};

export default SimulationEngine;
