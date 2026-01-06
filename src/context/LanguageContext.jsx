/**
 * Language Context with A/B Testing Integration
 * 
 * Provides:
 * - Language switching (en/de)
 * - A/B testing overlay on any content key
 * - Falls back to JSON content when no A/B test exists
 * 
 * Usage:
 *   const { content, getText, trackClick, lang } = useText();
 *   
 *   // Simple (uses A/B override if exists, else default):
 *   getText('home.heroSub')
 *   
 *   // Or access content directly (no A/B):
 *   content.home.heroSub
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import en from '../content/en.json';
import de from '../content/de.json';

// API Configuration
const API_BASE = 'https://admin-panel-319165681780.europe-west10.run.app/api/ab';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('de'); // Default to German
  const [abOverrides, setAbOverrides] = useState({});
  const [experiments, setExperiments] = useState([]);
  const [abUid, setAbUid] = useState(null);
  const [abLoading, setAbLoading] = useState(true);

  // Get base content for current language
  const baseContent = lang === 'en' ? en : de;

  // Fetch A/B experiments on mount and when URL changes
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
        const res = await fetch(`${API_BASE}/page?url=${encodeURIComponent(currentUrl)}`, {
          credentials: 'include'
        });

        if (!res.ok) {
          console.warn('A/B fetch failed, using defaults');
          setAbLoading(false);
          return;
        }

        const data = await res.json();
        setAbUid(data.uid);
        setExperiments(data.experiments || []);

        // Build overrides map using element_selector as content key paths
        // element_selector should be like "home.heroSub" or "aboutUs.heroTitle"
        const overrides = {};
        for (const exp of data.experiments || []) {
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

        // Track exposures
        for (const exp of data.experiments || []) {
          trackEventInternal(exp.experiment_key, exp.variant, 'exposed', currentUrl);
        }

      } catch (err) {
        console.warn('A/B Content fetch error:', err);
      } finally {
        setAbLoading(false);
      }
    };

    fetchExperiments();

    // Re-fetch when URL changes (for SPAs)
    if (typeof window !== 'undefined') {
      const handlePopState = () => fetchExperiments();
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  /**
   * Get text content with A/B override support.
   * @param {string} keyPath - Dot-notation path like "home.heroSub"
   * @returns {string} - A/B variant content or default from JSON
   */
  const getText = useCallback((keyPath) => {
    // Check for A/B override
    if (abOverrides[keyPath]) {
      return abOverrides[keyPath].content;
    }
    // Fall back to default content
    return getNestedValue(baseContent, keyPath) || keyPath;
  }, [abOverrides, baseContent]);

  /**
   * Get image URL with A/B override support.
   */
  const getImage = useCallback((keyPath, defaultUrl) => {
    if (abOverrides[keyPath]?.image_url) {
      return abOverrides[keyPath].image_url;
    }
    // Check if keyPath points to an image in content
    const fromContent = getNestedValue(baseContent, keyPath);
    return fromContent || defaultUrl;
  }, [abOverrides, baseContent]);

  /**
   * Track a click event for A/B testing.
   * Call this when user clicks a CTA or interacts with tested element.
   */
  const trackClick = useCallback((keyPath) => {
    const override = abOverrides[keyPath];
    if (override) {
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
      trackEventInternal(override.experiment_key, override.variant, 'click', currentUrl);
    }
  }, [abOverrides]);

  /**
   * Toggle between English and German.
   */
  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'de' : 'en');
  };

  /**
   * Check if a key has an active A/B test.
   */
  const hasABTest = useCallback((keyPath) => {
    return !!abOverrides[keyPath];
  }, [abOverrides]);

  /**
   * Get A/B test info for a key (variant, experiment name, etc.)
   */
  const getABInfo = useCallback((keyPath) => {
    return abOverrides[keyPath] || null;
  }, [abOverrides]);

  return (
    <LanguageContext.Provider value={{
      // Core content
      content: baseContent,
      lang,
      toggleLanguage,

      // A/B Testing
      getText,
      getImage,
      trackClick,
      hasABTest,
      getABInfo,
      experiments,
      abUid,
      abLoading
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useText = () => useContext(LanguageContext);

// Helper: Get nested value from object using dot notation
function getNestedValue(obj, path) {
  if (!obj || !path) return '';
  const parts = path.split('.');
  let result = obj;
  for (const part of parts) {
    if (result === undefined || result === null) return '';
    result = result[part];
  }
  return result;
}

// Helper: Track event to backend (internal)
async function trackEventInternal(experiment, variant, event, pageUrl = '') {
  try {
    await fetch(`${API_BASE}/event`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experiment, variant, event, page_url: pageUrl })
    });
  } catch (err) {
    // Silent fail for analytics
  }
}

export default LanguageProvider;