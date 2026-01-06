/**
 * A/B Testing Content Context
 * 
 * Provides A/B testing overlay on top of regular content.
 * - Fetches active experiments from backend
 * - Falls back to default JSON content if no experiment
 * - Allows any text element to be A/B tested by its key path
 * 
 * Usage:
 *   const { content, getText, getABContent, variant } = useABContent();
 *   getText('home.heroSub')  // Returns A/B variant if exists, else default
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// API Configuration
const API_BASE = 'https://admin-panel-319165681780.europe-west10.run.app/api/ab';

const ABContentContext = createContext();

export const ABContentProvider = ({ children, defaultContent, pageUrl = '/' }) => {
    const [abOverrides, setAbOverrides] = useState({});
    const [experiments, setExperiments] = useState([]);
    const [uid, setUid] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch experiments for the current page on mount
    useEffect(() => {
        const fetchExperiments = async () => {
            try {
                const currentUrl = typeof window !== 'undefined' ? window.location.pathname : pageUrl;
                const res = await fetch(`${API_BASE}/page?url=${encodeURIComponent(currentUrl)}`, {
                    credentials: 'include'
                });

                if (!res.ok) throw new Error('Failed to fetch experiments');

                const data = await res.json();
                setUid(data.uid);
                setExperiments(data.experiments || []);

                // Build overrides map: { "home.heroSub": { content, variant, experiment } }
                const overrides = {};
                for (const exp of data.experiments || []) {
                    // Use element_selector as the content key path
                    if (exp.element_selector && exp.content) {
                        overrides[exp.element_selector] = {
                            content: exp.content,
                            content_type: exp.content_type,
                            image_url: exp.image_url,
                            variant: exp.variant,
                            experiment_key: exp.experiment_key
                        };
                    }
                }
                setAbOverrides(overrides);

                // Track exposures for all experiments
                for (const exp of data.experiments || []) {
                    trackEvent(exp.experiment_key, exp.variant, 'exposed', currentUrl);
                }

            } catch (err) {
                console.warn('A/B Content: Failed to fetch experiments, using defaults', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchExperiments();
    }, [pageUrl]);

    /**
     * Get text content with A/B override support.
     * @param {string} keyPath - Dot-notation path like "home.heroSub"
     * @param {object} fallbackContent - The default content object (from JSON)
     * @returns {string} - A/B variant content or default
     */
    const getText = useCallback((keyPath, fallbackContent = defaultContent) => {
        // Check if we have an A/B override for this key
        if (abOverrides[keyPath]) {
            return abOverrides[keyPath].content;
        }

        // Fall back to default content
        return getNestedValue(fallbackContent, keyPath);
    }, [abOverrides, defaultContent]);

    /**
     * Get image URL with A/B override support.
     * @param {string} keyPath - Key path for the image
     * @param {string} defaultUrl - Default image URL
     * @returns {string} - A/B variant image URL or default
     */
    const getImage = useCallback((keyPath, defaultUrl) => {
        if (abOverrides[keyPath]?.image_url) {
            return abOverrides[keyPath].image_url;
        }
        return defaultUrl;
    }, [abOverrides]);

    /**
     * Get full A/B content info for a key.
     * Returns null if no A/B test, otherwise returns experiment info.
     */
    const getABInfo = useCallback((keyPath) => {
        return abOverrides[keyPath] || null;
    }, [abOverrides]);

    /**
     * Track an A/B event (click, convert, etc.)
     */
    const trackClick = useCallback((keyPath) => {
        const override = abOverrides[keyPath];
        if (override) {
            const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
            trackEvent(override.experiment_key, override.variant, 'click', currentUrl);
        }
    }, [abOverrides]);

    return (
        <ABContentContext.Provider value={{
            getText,
            getImage,
            getABInfo,
            trackClick,
            experiments,
            abOverrides,
            uid,
            loading,
            error
        }}>
            {children}
        </ABContentContext.Provider>
    );
};

// Hook to use A/B content
export const useABContent = () => useContext(ABContentContext);

// Helper: Get nested value from object using dot notation
function getNestedValue(obj, path) {
    if (!obj || !path) return '';
    return path.split('.').reduce((acc, part) => acc?.[part], obj) || '';
}

// Helper: Track event to backend
async function trackEvent(experiment, variant, event, pageUrl = '') {
    try {
        await fetch(`${API_BASE}/event`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ experiment, variant, event, page_url: pageUrl })
        });
    } catch (err) {
        console.warn('Failed to track A/B event:', err);
    }
}

export default ABContentProvider;
