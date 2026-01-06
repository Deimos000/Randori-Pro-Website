import React from 'react';
import Hero from '../components/Hero/Hero';
import SchoolFinder from '../components/SchoolFinder/SchoolFinder';
import SportsSelector from '../components/SportsSelector/SportsSelector';
import Trainers from '../components/Trainers/Trainers';
import { useText } from '../context/LanguageContext';
import './Home.css';

export default function Home() {
  const { getText, trackClick } = useText();

  return (
    <div>
      <Hero />

      <div className="home-dark-wrapper">
        <div className="page-container">

          {/* 1. SCHOOL FINDER (Top) */}
          <SchoolFinder />

          {/* Spacer */}
          <div className="home-spacer"></div>

          {/* Section Title - A/B testable */}
          <h1 className="disciplines-header">
            {getText('home.disciplinesTitle')}
          </h1>

          {/* 2. SPORTS SELECTOR */}
          <SportsSelector />

        </div>

        {/* 3. TRAINERS (Horizontal Scroll Section) */}
        <Trainers />

        <div className="page-container">
          {/* Footer content */}
        </div>

      </div>
    </div>
  );
}