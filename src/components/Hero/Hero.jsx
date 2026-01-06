// components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useText } from '../../context/LanguageContext';
import heroBg from '../../assets/image1.png';
import heroLogo from '../../assets/randori-logo.png';
import './Hero.css';

export default function Hero() {
  const { content, getText, getImage, trackClick, abLoading } = useText();

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight * 0.9,
      behavior: 'smooth'
    });
  };

  // Track CTA click for A/B analytics
  const handleCTAClick = () => {
    // Track clicks on any A/B tested elements in this component
    trackClick('home.heroSub');
    trackClick('home.ctaTrial');
  };

  // Show skeleton while A/B tests are loading (prevents flicker)
  if (abLoading) {
    return (
      <header className="hero-section">
        <div className="hero-background">
          <img src={heroBg} alt="Dojo Atmosphere" className="hero-bg-img" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-logo-container">
            <img src={heroLogo} alt="Randori-Pro" className="hero-logo-img" />
          </div>
          <div className="hero-divider"></div>
          <p className="hero-sub" style={{ opacity: 0.5 }}>Loading...</p>
        </div>
      </header>
    );
  }

  return (
    <header className="hero-section">
      {/* Background Layer - Can be A/B tested via getImage */}
      <div className="hero-background">
        <img
          src={getImage('home.heroBg', heroBg)}
          alt="Dojo Atmosphere"
          className="hero-bg-img"
        />
        <div className="hero-overlay"></div>
      </div>

      {/* Centered Content */}
      <div className="hero-content">

        {/* Logo */}
        <div className="hero-logo-container">
          <img
            src={getImage('home.heroLogo', heroLogo)}
            alt="Randori-Pro"
            className="hero-logo-img"
          />
        </div>

        <div className="hero-divider"></div>

        {/* Subtitle - A/B testable via getText */}
        <p className="hero-sub">{getText('home.heroSub')}</p>

        <div className="hero-actions">
          <Link
            to="/trial-booking"
            className="btn-hero primary"
            onClick={handleCTAClick}
          >
            {/* CTA Button - A/B testable */}
            {getText('home.ctaTrial')}
          </Link>
          <button onClick={handleScrollDown} className="btn-hero secondary">
            {getText('home.findLocation')}
          </button>
        </div>
      </div>
    </header>
  );
}
