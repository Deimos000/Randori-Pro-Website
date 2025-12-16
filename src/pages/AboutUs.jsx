import React, { useState, useEffect, useRef } from 'react';
import { useText } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import ParticleVisualizer from '../components/ParticleHero/ParticleHero';
import './AboutUs.css';

const AboutUs = () => {
    const navigate = useNavigate();
    const { content } = useText();
    // Use first keyword as default
    const [currentHeader, setCurrentHeader] = useState(content.aboutUs.heroKeywords[0]);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const sectionsRef = useRef([]);

    // Update currentHeader if language changes
    useEffect(() => {
        setCurrentHeader(content.aboutUs.heroKeywords[0]);
    }, [content.aboutUs.heroKeywords]);

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
            rootMargin: '-40% 0px -40% 0px', // Trigger when section is in the middle 20%
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
    }, [content.aboutUs.heroKeywords]); // Re-run if keywords change

    const addToRefs = (el) => {
        if (el && !sectionsRef.current.includes(el)) {
            sectionsRef.current.push(el);
        }
    };

    const [isExploded, setIsExploded] = useState(false);
    const particleHeaderRef = useRef(null);

    // Scroll Logic to detect if particles are behind a card
    useEffect(() => {
        const handleScroll = () => {
            if (!particleHeaderRef.current) return;

            // Define the "Particle Zone" - roughly where the text is.
            // Based on properties passed to ParticleHero: textPosition is { x: 50, y: 30 }
            // So it's at 30% of the viewport height.
            const particleZoneY = window.innerHeight * 0.3;
            const particleZoneHeight = 100; // Approx height of text

            let covered = false;

            sectionsRef.current.forEach(section => {
                if (!section) return;
                const card = section.querySelector('.glass-card');
                if (card) {
                    const rect = card.getBoundingClientRect();
                    // Check if the card overlaps with the particle zone
                    // Card top is above the bottom of zone AND Card bottom is below the top of zone
                    if (rect.top < (particleZoneY + particleZoneHeight) && rect.bottom > particleZoneY) {
                        covered = true;
                    }
                }
            });

            setIsExploded(covered);
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [windowSize]); // Re-calc on resize

    return (
        <div className="about-us-page">
            {/* Fixed Particle Header Background */}
            <div className="particle-header-fixed" ref={particleHeaderRef}>
                <ParticleVisualizer
                    text={currentHeader}
                    width={windowSize.width}
                    height={windowSize.height}
                    textPosition={{ x: 50, y: 30 }} // Position text in the upper third
                    precomputeTexts={content.aboutUs.heroKeywords}
                    isExploded={isExploded}
                />
            </div>

            {/* Scrollable Content */}
            <div className="content-scroll-container">

                {/* Intro Section */}
                <section ref={addToRefs} className="content-section" data-title={content.aboutUs.heroKeywords[0]}>
                    <div className="spacer-top"></div>
                    <div className="glass-card">
                        <h2>{content.aboutUs.subHeading}</h2>
                        <p>
                            {content.aboutUs.intro}
                        </p>
                        <div className="grid-features">
                            <div className="feature-item">
                                <h3>{content.aboutUs.missionTitle}</h3>
                                <p>{content.aboutUs.missionText}</p>
                            </div>
                            <div className="feature-item">
                                <h3>{content.aboutUs.promiseTitle}</h3>
                                <p>{content.aboutUs.promiseText}</p>
                            </div>
                        </div>
                        <p className="history-text">
                            {content.aboutUs.history}
                        </p>
                    </div>
                </section>

                {/* Principles Section */}
                <section ref={addToRefs} className="content-section" data-title={content.aboutUs.heroKeywords[1]}>
                    <div className="spacer-top"></div>
                    <div className="glass-card principles-grid">
                        {content.aboutUs.principles.map((principle, idx) => (
                            <div key={idx} className="principle-card">
                                <h3>{principle.title}</h3>
                                <p>{principle.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section ref={addToRefs} className="content-section" data-title={content.aboutUs.heroKeywords[2]}>
                    <div className="spacer-top"></div>
                    <div className="glass-card team-container">
                        <h2>{content.aboutUs.teamTitle}</h2>
                        <div className="team-grid">
                            {content.aboutUs.team.map((member, idx) => (
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
                <section ref={addToRefs} className="content-section" data-title={content.aboutUs.heroKeywords[3]}>
                    <div className="spacer-top"></div>
                    <div className="glass-card advantages-layout">
                        <ul className="advantages-list">
                            {content.aboutUs.advantagesList.map((adv, idx) => (
                                <li key={idx}>
                                    <strong>{adv.bold}</strong>{adv.text}
                                </li>
                            ))}
                        </ul>
                        <div className="cta-box">
                            <h3>{content.aboutUs.cta.title}</h3>
                            <p>{content.aboutUs.cta.text}</p>
                            <button className="cta-button" onClick={() => navigate('/trial-booking')}>
                                {content.aboutUs.cta.button}
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
