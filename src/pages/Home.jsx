import React from 'react';
import Hero from '../components/Hero/Hero';
import SchoolFinder from '../components/SchoolFinder/SchoolFinder';
import SportsSelector from '../components/SportsSelector/SportsSelector';
import Trainers from '../components/Trainers/Trainers'; // 1. Import the new component
import { useText } from '../context/LanguageContext';
import './Home.css';

export default function Home() {
  const { content } = useText();

  return (
    <div>
      <Hero />

      <div className="home-dark-wrapper">
        <div className="page-container">

          {/* 1. SCHOOL FINDER (Top) */}
          <SchoolFinder />

          {/* Spacer */}
          <div className="home-spacer"></div>

          {/* Section Title */}
          <h1 className="disciplines-header">
            {content.home.disciplinesTitle}
          </h1>

          {/* 2. SPORTS SELECTOR */}
          <SportsSelector />

        </div> {/* End of page-container width constraint */}

        {/* 3. TRAINERS (Horizontal Scroll Section) */}
        {/* We place this OUTSIDE page-container if page-container constrains width, 
            because horizontal scroll usually looks best full-width. 
            If you want it contained, move it inside the div above. */}
        <Trainers />

        <div className="page-container">
          {/* You can add a footer or more content here if needed */}
        </div>

      </div>
    </div>
  );
}