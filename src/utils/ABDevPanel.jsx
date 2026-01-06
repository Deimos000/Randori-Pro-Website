/**
 * A/B Testing Dev Panel
 * 
 * A floating dev panel for testing A/B variants.
 * Only shown in development or when URL has ?ab_debug=1
 */

import React, { useState, useEffect } from 'react';
import { resetABTest, forceVariant, getABStatus } from './useABTest';

const styles = {
    panel: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 99999,
        minWidth: '280px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid #444',
        paddingBottom: '8px'
    },
    title: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#00ff88'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        cursor: 'pointer',
        fontSize: '16px'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    label: {
        color: '#aaa'
    },
    value: {
        color: '#00ff88',
        fontWeight: 'bold'
    },
    buttons: {
        display: 'flex',
        gap: '8px',
        marginTop: '12px'
    },
    btn: {
        flex: 1,
        padding: '8px 12px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '11px'
    },
    btnA: {
        background: '#2563eb',
        color: '#fff'
    },
    btnB: {
        background: '#dc2626',
        color: '#fff'
    },
    btnReset: {
        background: '#444',
        color: '#fff'
    },
    toggle: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#000',
        color: '#00ff88',
        border: '2px solid #00ff88',
        padding: '8px 16px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 99998
    }
};

export default function ABDevPanel() {
    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check if dev mode is enabled via URL param
    const isDevMode = typeof window !== 'undefined' && (
        window.location.search.includes('ab_debug=1') ||
        window.location.hostname === 'localhost'
    );

    const refreshStatus = async () => {
        try {
            const data = await getABStatus();
            setStatus(data);
        } catch (err) {
            console.error('Failed to get AB status:', err);
        }
    };

    useEffect(() => {
        if (visible) {
            refreshStatus();
        }
    }, [visible]);

    const handleForceA = async () => {
        setLoading(true);
        await forceVariant('hero_copy', 'A');
        window.location.reload();
    };

    const handleForceB = async () => {
        setLoading(true);
        await forceVariant('hero_copy', 'B');
        window.location.reload();
    };

    const handleReset = async () => {
        setLoading(true);
        await resetABTest();
        window.location.reload();
    };

    if (!isDevMode) return null;

    if (!visible) {
        return (
            <button style={styles.toggle} onClick={() => setVisible(true)}>
                🧪 A/B
            </button>
        );
    }

    return (
        <div style={styles.panel}>
            <div style={styles.header}>
                <span style={styles.title}>🧪 A/B Testing Dev Panel</span>
                <button style={styles.closeBtn} onClick={() => setVisible(false)}>×</button>
            </div>

            {status?.has_uid ? (
                <>
                    <div style={styles.row}>
                        <span style={styles.label}>UID:</span>
                        <span style={styles.value}>{status.uid_short}</span>
                    </div>
                    {Object.entries(status.experiments || {}).map(([exp, data]) => (
                        <div key={exp} style={styles.row}>
                            <span style={styles.label}>{exp}:</span>
                            <span style={{
                                ...styles.value,
                                color: data.variant === 'A' ? '#2563eb' : '#dc2626'
                            }}>
                                Variant {data.variant}
                            </span>
                        </div>
                    ))}
                </>
            ) : (
                <div style={styles.row}>
                    <span style={styles.label}>No UID set yet</span>
                </div>
            )}

            <div style={styles.buttons}>
                <button
                    style={{ ...styles.btn, ...styles.btnA }}
                    onClick={handleForceA}
                    disabled={loading}
                >
                    Force A
                </button>
                <button
                    style={{ ...styles.btn, ...styles.btnB }}
                    onClick={handleForceB}
                    disabled={loading}
                >
                    Force B
                </button>
                <button
                    style={{ ...styles.btn, ...styles.btnReset }}
                    onClick={handleReset}
                    disabled={loading}
                >
                    🔄 Reset
                </button>
            </div>
        </div>
    );
}
