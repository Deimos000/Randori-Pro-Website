// components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom'; 
import { useText } from '../../context/LanguageContext';
import heroBg from '../../assets/image1.png';      // Background Image
import heroLogo from '../../assets/randori-logo.png'; // Your Logo/Text Image
import './Hero.css';

export default function Hero() {
  const { content } = useText();

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight*0.9,
      behavior: 'smooth'
    });
  };

  return (
    <header className="hero-section">
      {/* Background Layer */}
      <div className="hero-background">
        <img 
          src={heroBg} 
          alt="Dojo Atmosphere" 
          className="hero-bg-img"
        />
        <div className="hero-overlay"></div>
      </div>

      {/* Centered Content */}
      <div className="hero-content">
        
        {/* LOGO IMAGE REPLACING TEXT */}
        <div className="hero-logo-container">
          <img 
            src={heroLogo} 
            alt="Randori-Pro" 
            className="hero-logo-img" 
          />
        </div>

        <div className="hero-divider"></div>
        <p className="hero-sub">{content.home.heroSub}</p>

        <div className="hero-actions">
          <Link to="/trial-booking" className="btn-hero primary">
            {content.home.ctaTrial}
          </Link>
          <button onClick={handleScrollDown} className="btn-hero secondary">
            {content.home.findLocation}
          </button>
        </div>
      </div>
    </header>
  );
}