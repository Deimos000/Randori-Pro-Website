
import React, { useRef, useEffect, useState } from 'react';
import { Particle } from '../../utils/Particle';

const ParticleVisualizer = ({ text = "", width, height, textPosition = { x: 50, y: 50 }, precomputeTexts = [], isExploded = false }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const mouseRef = useRef({ x: 9999, y: 9999 });
    const isExplodedRef = useRef(isExploded);
    useEffect(() => { isExplodedRef.current = isExploded; }, [isExploded]);

    const [targetCoords, setTargetCoords] = useState([]);
    const [mode, setMode] = useState('FORMING');

    // Handle External Explosion Trigger (e.g. Scroll hiding)
    // Handle External Explosion Trigger (e.g. Scroll hiding)
    useEffect(() => {
        if (isExploded) {
            setMode('WANDER');
            if (particlesRef.current.length > 0) {
                particlesRef.current.forEach(p => {
                    const angle = Math.random() * Math.PI * 2;
                    // BIG EXPLOSION on Hide
                    const force = Math.random() * 40 + 10;
                    p.vx += Math.cos(angle) * force;
                    p.vy += Math.sin(angle) * force;
                });
            }
        } else {
            // Directly assemble when reappearing
            setMode('FORMING');
        }
    }, [isExploded]);

    // ... (config object omitted for brevity if not changing, but strict replace needs context) ... 
    // Actually I can just target the effects. I need to be careful with line numbers.
    // I will replace both hooks in one go if they are contiguous, or just target carefully.
    // They are separated by `const config = ...`. I'll do two replaces or one big one.
    // Let's do the isExploded effect first.


    const config = {
        speedMultiplier: 5,
        distortionRadius: 100,
        gravityStrength: 0,
        planetSize: 1
    };

    // --- SAMPLING ---
    const sampleTextCoordinates = (displayText, w, h, position) => {
        if (!displayText || w === 0 || h === 0) return [];
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const ctx = offCanvas.getContext('2d');

        // Draw Text
        ctx.fillStyle = 'white';
        // Adjust font size based on container width
        const fontSize = Math.min(w * 0.15, 100);
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate position based on percentages
        const xPos = (w * position.x) / 100;
        const yPos = (h * position.y) / 100;

        // Split text into lines if too long? For now, assume single words/short phrases
        ctx.fillText(displayText, xPos, yPos);

        const imageData = ctx.getImageData(0, 0, w, h).data;
        const coordinates = [];
        const gap = 5;

        for (let y = 0; y < h; y += gap) {
            for (let x = 0; x < w; x += gap) {
                const alpha = imageData[(y * w + x) * 4 + 3];
                if (alpha > 128) {
                    coordinates.push({ x, y });
                }
            }
        }

        // Shuffle for Random effect
        for (let i = coordinates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [coordinates[i], coordinates[j]] = [coordinates[j], coordinates[i]];
        }

        return coordinates;
    };

    const coordsCache = useRef({});
    const formingTimeRef = useRef(0);

    // --- PRE-CALCULATION OPTIMIZATION ---
    useEffect(() => {
        if (!width || !height || precomputeTexts.length === 0) return;

        // Run in idle time / timeout to avoid freezing the main thread on load
        const timer = setTimeout(() => {
            // console.log("Pre-calculating particle targets...");
            precomputeTexts.forEach(txt => {
                const key = `${txt}-${width}-${height}`;
                if (!coordsCache.current[key]) {
                    coordsCache.current[key] = sampleTextCoordinates(txt, width, height, textPosition);
                }
            });
            // console.log("Pre-calculation complete.");
        }, 1500);

        return () => clearTimeout(timer);
    }, [width, height, precomputeTexts, textPosition]);

    // --- TEXT CHANGE EFFECT ---
    useEffect(() => {
        if (!width || !height) return;

        // 1. Calculate New Targets (with Caching)
        const cacheKey = `${text}-${width}-${height}`;
        let newCoords;

        if (coordsCache.current[cacheKey]) {
            newCoords = coordsCache.current[cacheKey];
        } else {
            newCoords = sampleTextCoordinates(text, width, height, textPosition);
            coordsCache.current[cacheKey] = newCoords;
        }

        // 2. Handle Transition
        // Always update targets immediately.
        setTargetCoords(newCoords);
        formingTimeRef.current = Date.now();

        // If we are NOT exploded (visible), ensure we are forming the new text.
        // If we ARE exploded, we stay in WANDER mode (handled by the other effect),
        // but the particles will now seek these new targets once mode switches back to FORMING.
        if (!isExplodedRef.current) {
            setMode('FORMING');
        }
    }, [text, width, height, textPosition]);


    // --- ANIMATION ---
    useEffect(() => {
        if (!width || !height) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Init Particles
        const particleCount = 2100; // Increased density per user request
        if (particlesRef.current.length === 0) {
            for (let i = 0; i < particleCount; i++) {
                // Dark Red Shades: Hue around 0/360, Dark Lightness
                const hue = Math.random() < 0.5 ? 350 + Math.random() * 10 : Math.random() * 10;
                const lightness = 30 + Math.random() * 30; // 30-60% lightness

                particlesRef.current.push(new Particle(
                    Math.random() * width,
                    Math.random() * height,
                    width,
                    height,
                    `hsl(${hue}, 90%, ${lightness}%)`
                ));
            }
        } else {
            // Update Existing Particles on resize if needed, or just their bounds
            particlesRef.current.forEach(p => {
                p.canvasWidth = width;
                p.canvasHeight = height;
                // Update color for existing particles if this was a hot reload or re-init
                // Optional: strictly enforce red on existing ones if they were old colors
                // But for now, constructor only runs on empty array.
            });
        }

        const animate = () => {
            // Transparent Clear to let CSS background show
            ctx.clearRect(0, 0, width, height);

            const now = Date.now();
            const currentConfig = {
                ...config,
                now,
                startTime: formingTimeRef.current,
                textLength: text.length || 1 // Avoid divide by zero
            };

            particlesRef.current.forEach((p, i) => {
                if (mode === 'FORMING' && targetCoords.length > 0) {
                    const targetIndex = i % targetCoords.length;
                    p.targetX = targetCoords[targetIndex].x;
                    p.targetY = targetCoords[targetIndex].y;
                } else {
                    p.targetX = null;
                    p.targetY = null;
                }

                p.update(mouseRef.current, mode, currentConfig);
                p.draw(ctx);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [width, height, targetCoords, mode]);

    const handleMouseMove = (e) => {
        const bounds = canvasRef.current.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top
        };
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            style={{ display: 'block' }}
        />
    );
};

export default ParticleVisualizer;
