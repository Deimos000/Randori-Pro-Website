import React, { useState, useEffect, useRef } from 'react';
import { useText } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import ParticleVisualizer from '../components/ParticleHero/ParticleHero';
import './AboutUs.css';

const AboutUs = () => {
    const navigate = useNavigate();
    const { content, getText, trackClick } = useText();

    // Use first keyword as default
    const [currentHeader, setCurrentHeader] = useState(content.aboutUs?.heroKeywords?.[0] || 'ABOUT US');
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    const sectionsRef = useRef([]);

    // Update currentHeader if language changes
    useEffect(() => {
        if (content.aboutUs?.heroKeywords?.[0]) {
            setCurrentHeader(content.aboutUs.heroKeywords[0]);
        }
    }, [content.aboutUs?.heroKeywords]);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0,
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const title = entry.target.getAttribute('data-title');
                    if (title) {
                        setCurrentHeader(title);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sectionsRef.current.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => {
            sectionsRef.current.forEach((section) => {
                if (section) observer.unobserve(section);
            });
        };
    }, [content.aboutUs?.heroKeywords]);

    const addToRefs = (el) => {
        if (el && !sectionsRef.current.includes(el)) {
            sectionsRef.current.push(el);
        }
    };

    const [isExploded, setIsExploded] = useState(false);
    const particleHeaderRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!particleHeaderRef.current) return;

            const particleZoneY = window.innerHeight * 0.3;
            const particleZoneHeight = 100;

            let covered = false;

            sectionsRef.current.forEach(section => {
                if (!section) return;
                const card = section.querySelector('.glass-card');
                if (card) {
                    const rect = card.getBoundingClientRect();
                    if (rect.top < (particleZoneY + particleZoneHeight) && rect.bottom > particleZoneY) {
                        covered = true;
                    }
                }
            });

            setIsExploded(covered);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [windowSize]);

    // Handle CTA click with A/B tracking
    const handleCTAClick = () => {
        trackClick('aboutUs.cta.button');
        navigate('/trial-booking');
    };

    const heroKeywords = content.aboutUs?.heroKeywords || ['ABOUT US', 'OUR PRINCIPLES', 'OUR TEAM', 'YOUR BENEFITS'];
    const principles = content.aboutUs?.principles || [];
    const team = content.aboutUs?.team || [];
    const advantagesList = content.aboutUs?.advantagesList || [];

    return (
        <div className="about-us-page">
            {/* Fixed Particle Header Background */}
            <div className="particle-header-fixed" ref={particleHeaderRef}>
                <ParticleVisualizer
                    text={currentHeader}
                    width={windowSize.width}
                    height={windowSize.height}
                    textPosition={{ x: 50, y: 30 }}
                    precomputeTexts={heroKeywords}
                    isExploded={isExploded}
                />
            </div>

            {/* Scrollable Content */}
            <div className="content-scroll-container">

                {/* Intro Section */}
                <section ref={addToRefs} className="content-section" data-title={heroKeywords[0]}>
                    <div className="spacer-top"></div>
                    <div className="glass-card">
                        <h2>{getText('aboutUs.subHeading')}</h2>
                        <p>{getText('aboutUs.intro')}</p>
                        <div className="grid-features">
                            <div className="feature-item">
                                <h3>{getText('aboutUs.missionTitle')}</h3>
                                <p>{getText('aboutUs.missionText')}</p>
                            </div>
                            <div className="feature-item">
                                <h3>{getText('aboutUs.promiseTitle')}</h3>
                                <p>{getText('aboutUs.promiseText')}</p>
                            </div>
                        </div>
                        <p className="history-text">{getText('aboutUs.history')}</p>
                    </div>
                </section>

                {/* Principles Section */}
                <section ref={addToRefs} className="content-section" data-title={heroKeywords[1]}>
                    <div className="spacer-top"></div>
                    <div className="glass-card principles-grid">
                        {principles.map((principle, idx) => (
                            <div key={idx} className="principle-card">
                                <h3>{principle.title}</h3>
                                <p>{principle.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section ref={addToRefs} className="content-section" data-title={heroKeywords[2]}>
                    <div className="spacer-top"></div>
                    <div className="glass-card team-container">
                        <h2>{getText('aboutUs.teamTitle')}</h2>
                        <div className="team-grid">
                            {team.map((member, idx) => (
                                <div key={idx} className="team-member-card">
                                    <div className="member-image-wrapper">
                                        <img src={member.image} alt={member.name} className="member-image" />
                                        <div className="voice-overlay">
                                            <span>{member.role}</span>
                                        </div>
                                    </div>
                                    <div className="member-info">
                                        <h4>{member.name}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Advantages Section */}
                <section ref={addToRefs} className="content-section" data-title={heroKeywords[3]}>
                    <div className="spacer-top"></div>
                    <div className="glass-card advantages-layout">
                        <ul className="advantages-list">
                            {advantagesList.map((adv, idx) => (
                                <li key={idx}>
                                    <strong>{adv.bold}</strong>{adv.text}
                                </li>
                            ))}
                        </ul>
                        <div className="cta-box">
                            {/* A/B testable CTA section */}
                            <h3>{getText('aboutUs.cta.title')}</h3>
                            <p>{getText('aboutUs.cta.text')}</p>
                            <button className="cta-button" onClick={handleCTAClick}>
                                {getText('aboutUs.cta.button')}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer/Bottom padding */}
                <div style={{ height: '20vh' }}></div>

            </div>
        </div>
    );
};

export default AboutUs;
