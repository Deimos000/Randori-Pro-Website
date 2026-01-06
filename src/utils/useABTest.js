/**
 * A/B Testing Utilities
 * 
 * Provides hooks and functions for A/B testing with flicker-free rendering.
 * Uses the backend at /api/ab for variant assignment.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// API Base URL - same as the rest of the app
const API_BASE = 'https://admin-panel-319165681780.europe-west10.run.app/api/ab';

/**
 * Custom hook for A/B testing.
 * Returns the variant ONLY after it's been fetched - prevents flicker.
 * 
 * @param {string} experimentKey - The experiment identifier (e.g., 'hero_copy')
 * @returns {string|null} - The variant ('A' or 'B') or null while loading
 * 
 * @example
 * const variant = useABTest('hero_copy');
 * if (!variant) return <Skeleton />;
 * return variant === 'A' ? <HeroA /> : <HeroB />;
 */
export function useABTest(experimentKey) {
    const [variant, setVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const exposureTracked = useRef(false);

    useEffect(() => {
        if (!experimentKey) return;

        fetch(`${API_BASE}/${experimentKey}`, {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch variant');
                return res.json();
            })
            .then(data => {
                setVariant(data.variant);
                setLoading(false);

                // Track exposure once per mount
                if (!exposureTracked.current) {
                    exposureTracked.current = true;
                    trackABEvent(experimentKey, data.variant, 'exposed');
                }
            })
            .catch(err => {
                console.error('A/B Testing error:', err);
                // Fallback to variant A on error
                setVariant('A');
                setLoading(false);
            });
    }, [experimentKey]);

    return variant;
}

/**
 * Track an A/B testing event.
 * 
 * @param {string} experiment - The experiment key
 * @param {string} variant - The variant ('A' or 'B')
 * @param {string} event - Event type: 'exposed', 'click', or 'convert'
 */
export async function trackABEvent(experiment, variant, event) {
    try {
        await fetch(`${API_BASE}/event`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                experiment,
                variant,
                event
            })
        });
    } catch (err) {
        // Silent fail - don't break the app for analytics
        console.warn('Failed to track A/B event:', err);
    }
}

/**
 * Track a click event for the current experiment.
 * Use this on CTA buttons or interactive elements.
 * 
 * @param {string} experiment - The experiment key
 * @param {string} variant - The current variant
 * 
 * @example
 * <button onClick={() => { trackABClick('hero_copy', variant); navigate('/trial'); }}>
 *   Book Trial
 * </button>
 */
export function trackABClick(experiment, variant) {
    trackABEvent(experiment, variant, 'click');
}

/**
 * Get the ab_uid cookie value (for debugging/admin purposes)
 */
export function getABUid() {
    const match = document.cookie.match(/ab_uid=([^;]+)/);
    return match ? match[1] : null;
}

// =============================================================================
// DEV MODE UTILITIES
// =============================================================================

/**
 * Reset the A/B testing UID to get a new random assignment.
 * @returns {Promise<object>} - New UID and variant assignments
 */
export async function resetABTest() {
    const res = await fetch(`${API_BASE}/debug/reset`, {
        method: 'POST',
        credentials: 'include'
    });
    return res.json();
}

/**
 * Force a specific variant for testing.
 * @param {string} experiment - The experiment key
 * @param {string} variant - The variant to force ('A' or 'B')
 * @returns {Promise<object>} - New UID and variant assignments
 */
export async function forceVariant(experiment, variant) {
    const res = await fetch(`${API_BASE}/debug/force/${experiment}/${variant}`, {
        method: 'POST',
        credentials: 'include'
    });
    return res.json();
}

/**
 * Get current A/B testing status.
 * @returns {Promise<object>} - Current UID and all experiment assignments
 */
export async function getABStatus() {
    const res = await fetch(`${API_BASE}/debug/status`, {
        credentials: 'include'
    });
    return res.json();
}

export default useABTest;
