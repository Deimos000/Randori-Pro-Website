import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

// Import Layout
import Layout from './components/Layout/Layout';

// Import Pages
import Home from './pages/Home';
import Classes from './pages/Classes';
import Contact from './pages/Contact';
import TrialPage from './pages/TrialPage'; // The Booking Form
import SchoolSportConnect from './pages/SchoolSportConnect'; // <--- NEW: The 20/80 Overview Page
import AboutUs from './pages/AboutUs';

// A/B Testing Dev Panel (only shows in dev mode or with ?ab_debug=1)
import ABDevPanel from './utils/ABDevPanel';

// Import Global CSS
import './styles/variables.css';
import './styles/global.css';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/contact" element={<Contact />} />

            {/* 
               1. The New Overview Page 
               Matches the 'TARGET_ROUTE' in SportsSelector.jsx 
            */}
            <Route path="/sports-overview" element={<SchoolSportConnect />} />

            {/* 
               2. The Booking Page 
               Matches the navigate('/trial-booking') in SchoolSportConnect.js
            */}
            <Route path="/trial-booking" element={<TrialPage />} />

            {/* About Us Page */}
            <Route path="/about" element={<AboutUs />} />

          </Routes>
        </Layout>
        {/* A/B Testing Dev Panel - appears in bottom-right on localhost or with ?ab_debug=1 */}
        <ABDevPanel />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;