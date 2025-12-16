
export class Particle {
    constructor(x, y, canvasWidth, canvasHeight, colorOverride = null) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Physics properties
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.ax = 0;
        this.ay = 0;

        this.speedFactor = Math.random() + 0.5;

        // Aesthetics
        this.size = Math.random() * 0.5 + 2.5; // Larger minimum size (2.5 to 5.5)

        if (colorOverride) {
            this.color = colorOverride;
        } else {
            // Default to brand cream/gold if no override
            const hue = 40 + Math.random() * 5; // ~45 deg is Gold/Cream
            const lightness = 80 + Math.random() * 20;
            this.color = `hsl(${hue}, 100%, ${lightness}%)`;
        }

        this.targetX = null;
        this.targetY = null;
    }

    update(mouse, mode, config, projectiles = [], planets = []) {
        const { speedMultiplier, distortionRadius } = config;
        const maxSpeed = this.speedFactor * speedMultiplier;

        if (mode === 'WANDER') {
            // WANDER LOGIC - EXPLOSION PHYSICS

            // 1. Friction / Drag: Particles lose speed over time
            this.vx *= 0.92;
            this.vy *= 0.92;

            // 2. Subtle Drift (keep them alive after stopping)
            this.vx += (Math.random() - 0.5) * 0.02;
            this.vy += (Math.random() - 0.5) * 0.02;

            // Soft wall bounce
            if (this.x < 0) this.vx += 0.5;
            if (this.x > this.canvasWidth) this.vx -= 0.5;
            if (this.y < 0) this.vy += 0.5;
            if (this.y > this.canvasHeight) this.vy -= 0.5;

            this.x += this.vx;
            this.y += this.vy;

        } else if (mode === 'FORMING' && this.targetX !== null) {
            // SEEK LOGIC
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Arrive behavior with DISTANCE BOOST
            // If far away, move faster to catch up with the wave
            let baseSpeed = maxSpeed;

            // Boost speed if distance is large.
            // distance / 40 means it tries to arrive in ~40 frames (~0.7s at 60fps)
            let limitSpeed = Math.max(baseSpeed, distance / 40);

            // Allow very high speeds
            let finalMaxSpeed = Math.min(limitSpeed, 100);

            let targetSpeed = finalMaxSpeed;
            // Sharper slowdown for snapping effect
            const slowDownRadius = 30;
            if (distance < slowDownRadius) {
                targetSpeed = (distance / slowDownRadius) * finalMaxSpeed;
            }

            // Optimization: Normalize vector instead of using atan2/sin/cos
            let targetVx = 0;
            let targetVy = 0;

            if (distance > 0.001) {
                targetVx = (dx / distance) * targetSpeed;
                targetVy = (dy / distance) * targetSpeed;
            }

            const steerX = targetVx - this.vx;
            const steerY = targetVy - this.vy;

            // FORCE INCREASE: Set to 1.5 as requested
            const maxForce = 1.5;

            // Apply steering
            this.ax += Math.max(-maxForce, Math.min(maxForce, steerX));
            this.ay += Math.max(-maxForce, Math.min(maxForce, steerY));

            // Mouse Repulsion
            const mdx = mouse.x - this.x;
            const mdy = mouse.y - this.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mDist < distortionRadius && mDist > 0) {
                const force = (distortionRadius - mDist) / distortionRadius;
                const repulsionStr = 5 * force;

                // Normalize repulsion vector
                // cos(mAngle) = mdx / mDist
                this.ax -= (mdx / mDist) * repulsionStr;
                this.ay -= (mdy / mDist) * repulsionStr;
            }

            this.vx += this.ax;
            this.vy += this.ay;

            // Damping to stop jitter
            this.vx *= 0.92;
            this.vy *= 0.92;

            this.x += this.vx;
            this.y += this.vy;

            this.ax = 0;
            this.ay = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
