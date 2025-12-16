import React, { useState, useEffect, useRef } from 'react';
import ParticleVisualizer from '../components/ParticleHero/ParticleHero';
import './AboutUs.css';

const AboutUs = () => {
    const [currentHeader, setCurrentHeader] = useState("ÜBER UNS");
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const sectionsRef = useRef([]);

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
    }, []);

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
                    precomputeTexts={["ÜBER UNS", "UNSERE PRINZIPIEN", "UNSER TEAM", "DEINE VORTEILE"]}
                    isExploded={isExploded}
                />
            </div>

            {/* Scrollable Content */}
            <div className="content-scroll-container">

                {/* Intro Section */}
                <section ref={addToRefs} className="content-section" data-title="ÜBER UNS">
                    <div className="spacer-top"></div>
                    <div className="glass-card">
                        <h2>Mehr als ein Sport – eine Familie</h2>
                        <p>
                            RANDORI-PRO verfolgt die Vision, jedem in unserer Gemeinschaft dabei zu helfen, seine persönlichen Ziele zu erreichen.
                            Wir bieten dir eine familiäre Umgebung, in der wir uns gegenseitig unterstützen.
                        </p>
                        <div className="grid-features">
                            <div className="feature-item">
                                <h3>Unsere Mission</h3>
                                <p>Jedem Menschen dabei zu helfen, die beste Version seiner Selbst zu werden.</p>
                            </div>
                            <div className="feature-item">
                                <h3>Unser Versprechen</h3>
                                <p>Mit uns erreichst du deine Ziele, denn WIR LIEBEN WAS WIR TUN.</p>
                            </div>
                        </div>
                        <p className="history-text">
                            Seit 1994 bietet die Sportschule Randori-Pro Kampf- und Fitnesssport für alle Alters- und Leistungsstufen.
                            Mit mehr als 3000 Mitgliedern an fünf Berliner Standorten sind wir Deutschlands größter Anbieter.
                        </p>
                    </div>
                </section>

                {/* Principles Section */}
                <section ref={addToRefs} className="content-section" data-title="UNSERE PRINZIPIEN">
                    <div className="spacer-top"></div>
                    <div className="glass-card principles-grid">
                        <div className="principle-card">
                            <h3>Community, Team, Familie</h3>
                            <p>Sicherheit und Geborgenheit. Eine familiäre Atmosphäre, in der du dich entfalten kannst.</p>
                        </div>
                        <div className="principle-card">
                            <h3>Das große Ganze</h3>
                            <p>Technik, Physis und Theorie – drei stabile Säulen für deine Entwicklung.</p>
                        </div>
                        <div className="principle-card">
                            <h3>Stillstand ist das Ende</h3>
                            <p>Wir streben nach Perfektion und bleiben stets in Bewegung.</p>
                        </div>
                        <div className="principle-card">
                            <h3>Qualität</h3>
                            <p>Kompromisslose Qualität mit den besten Trainern und Experten.</p>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section ref={addToRefs} className="content-section" data-title="UNSER TEAM">
                    <div className="spacer-top"></div>
                    <div className="glass-card team-container">
                        <h2>Die Köpfe hinter Randori-Pro</h2>
                        <div className="team-grid">
                            {[
                                { name: "Lutz Heyden", role: "Geschäftsführer, Randori-Pro Holding", image: "https://randori-pro.de/wp-content/uploads/2019/07/Lutz-Heyden.jpg" },
                                { name: "Oliver Roszak", role: "Geschäftsführer, Spandau", image: "https://randori-pro.de/wp-content/uploads/2019/07/Olver-Roszak.jpg" },
                                { name: "Tanya Pieper", role: "Geschäftsführerin, Lübars", image: "https://randori-pro.de/wp-content/uploads/2019/07/Tanya-Pieper.jpg" },
                                { name: "Dominik Krüger", role: "Direktor für Wachstum", image: "https://randori-pro.de/wp-content/uploads/2019/07/Dominik-Kr%C3%BCger.jpg" },
                                { name: "Harry Werz", role: "Geschäftsführer, Wilmersdorf", image: "https://randori-pro.de/wp-content/uploads/2019/07/Harry-Werz.jpg" },
                                { name: "Felix Schwenzfeier", role: "Geschäftsführer, Tegel", image: "https://randori-pro.de/wp-content/uploads/2019/07/Felix-Schwenzfeier.jpg" },
                                { name: "Isabell Nagel", role: "Studioleiterin, Waltersdorf", image: "https://randori-pro.de/wp-content/uploads/2019/05/Isabell-Kampfsport-Selbstverteidigung-Fitness.jpg" },
                                { name: "Nicole Brakmann", role: "Geschäftsführerin, Steglitz", image: "https://randori-pro.de/wp-content/uploads/2019/05/Trainer-Nicole-Brakmann.jpg" },
                                { name: "Stephanie Meyer", role: "Direktorin für Verwaltung", image: "https://randori-pro.de/wp-content/uploads/2019/05/stephanie-meyer.jpeg" }
                            ].map((member, idx) => (
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
                <section ref={addToRefs} className="content-section" data-title="DEINE VORTEILE">
                    <div className="spacer-top"></div>
                    <div className="glass-card advantages-layout">
                        <ul className="advantages-list">
                            <li><strong>7x in Berlin & Brandenburg</strong>: Wilmersdorf, Spandau, Lübars, Steglitz, Tegel, Waltersdorf, Mariendorf.</li>
                            <li><strong>Über 4000 qm</strong>: 1800qm Trainingsfläche, Fitnessbereiche und mehr.</li>
                            <li><strong>Riesige Community</strong>: Werde Teil von über 6000 Fans und Mitgliedern.</li>
                            <li><strong>Vielfalt</strong>: Über 300 Kurse die Woche.</li>
                            <li><strong>Qualität</strong>: Zertifizierte Trainer & Pädagogen.</li>
                            <li><strong>Komfort</strong>: Getränkeflatrate inklusive.</li>
                        </ul>
                        <div className="cta-box">
                            <h3>Bereit für Veränderung?</h3>
                            <p>Du möchtest dich weiterentwickeln und dein Leben nach deinen Vorstellungen gestalten?</p>
                            <button className="cta-button" onClick={() => window.location.href = '/probetraining'}>
                                Kostenloses Probetraining
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
