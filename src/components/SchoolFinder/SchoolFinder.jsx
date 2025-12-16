import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useText } from '../../context/LanguageContext';
import BerlinMap from '../Map/BerlinMap';
import AddressAutosuggest from '../Search/AddressAutosuggest';
import './SchoolFinder.css';

const API_BASE = 'https://admin-panel-319165681780.europe-west10.run.app/api';

// --- HELPER: SLEEP FUNCTION ---
// This creates a pause in the code execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const SchoolFinder = () => {
  const navigate = useNavigate();
  const { content } = useText();
  const [schoolsData, setSchoolsData] = useState([]);
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closestSchool, setClosestSchool] = useState(null);
  const [hoveredSchoolId, setHoveredSchoolId] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [searchKey, setSearchKey] = useState(0);

  // --- 1. FETCH SCHOOLS ---
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch(`${API_BASE}/public/schools`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const validSchools = data.filter(s => s.lat && s.lng);
        setSchoolsData(validSchools);
      } catch (error) {
        console.error("Error loading schools:", error);
      } finally {
        setIsLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  // --- 2. "POLITE" ROUTING ALGORITHM ---
  const findBestSchool = async (userLoc) => {
    if (schoolsData.length === 0) return;

    setIsCalculating(true);
    const userPoint = L.latLng(userLoc.lat, userLoc.lng);

    // STEP A: Use Math to find Top 3 candidates (Instant, no API calls)
    // We don't want to check 100 schools, just the 3 physically closest ones.
    const topCandidates = schoolsData
      .map(school => ({
        ...school,
        rawDist: userPoint.distanceTo([school.lat, school.lng])
      }))
      .sort((a, b) => a.rawDist - b.rawDist)
      .slice(0, 3); // ONLY CHECK TOP 3

    let bestCandidate = null;
    let shortestDuration = Infinity;

    // STEP B: Check the Top 3 one by one with a pause
    for (const school of topCandidates) {
      try {
        // 1. Construct simple 1-to-1 URL (User -> School)
        // using 'walking' profile
        const url = `https://router.project-osrm.org/route/v1/walking/${userLoc.lng},${userLoc.lat};${school.lng},${school.lat}?overview=false`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const durationSeconds = data.routes[0].duration;

          if (durationSeconds < shortestDuration) {
            shortestDuration = durationSeconds;
            bestCandidate = {
              ...school,
              realDuration: (durationSeconds / 60).toFixed(0), // Convert to minutes
              realDistance: data.routes[0].distance
            };
          }
        }

        // 2. THE PAUSE (Wait 800ms before next call to avoid blocking)
        await sleep(800);

      } catch (err) {
        console.warn(`Skipping school ${school.name} due to error`, err);
      }
    }

    // Fallback: If API failed for all, use the math-closest one
    if (!bestCandidate) {
      const mathWinner = topCandidates[0];
      bestCandidate = {
        ...mathWinner,
        realDuration: Math.ceil((mathWinner.rawDist * 1.3) / 83), // Estimate
        realDistance: mathWinner.rawDist
      };
    }

    setClosestSchool(bestCandidate);
    setIsCalculating(false);
  };

  // --- HANDLERS ---
  const handleAddressFound = (location) => {
    if (!location) {
      handleGlobalClear();
      return;
    }
    setUserLocation(location);
    setActiveDistrict(null);
    setClosestSchool(null);
    findBestSchool(location);
  };

  const handleGlobalClear = (e) => {
    if (e) e.preventDefault();
    setClosestSchool(null);
    setUserLocation(null);
    setIsCalculating(false);
    setActiveDistrict(null);
    setSearchKey(prev => prev + 1);
  };

  const filteredSchools = activeDistrict
    ? schoolsData.filter(s => s.district === activeDistrict)
    : schoolsData;

  const handleSchoolClick = (school) => {
    navigate('/trial-booking', {
      state: { preSelectedSchool: school }
    });
  };

  // --- RENDER ---
  return (
    <div className="finder-card">
      <div className="list-section">
        <div className="search-header">
          <h3>{content.finder.title}</h3>
          <div className="search-container">
            <AddressAutosuggest
              key={searchKey}
              onAddressSelect={handleAddressFound}
            />
          </div>
        </div>

        <div className="scroll-container">
          {isLoadingSchools && <div className="loading-message">{content.finder.loading}</div>}

          {/* RESULTS AREA */}
          {!isLoadingSchools && closestSchool && (
            <div
              className="closest-result"
              onClick={() => handleSchoolClick(closestSchool)}
              style={{ cursor: 'pointer' }}
            >
              <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>🎯 {content.finder.bestRoute}</h4>
                <button
                  type="button"
                  className="btn-clear"
                  onClick={(e) => { e.stopPropagation(); handleGlobalClear(e); }}
                >
                  ✕ {content.finder.clear}
                </button>
              </div>

              <div className="school-item highlight">
                <h3>{closestSchool.name}</h3>
                <p>{closestSchool.address}</p>
                <div className="stats-badge">
                  {/* Show calculation status or result */}
                  <span>🚶 {closestSchool.realDuration} {content.finder.minWalk}</span>
                </div>
              </div>
            </div>
          )}

          <h4 className="list-title">
            {activeDistrict ? `${content.finder.schoolsIn} ${activeDistrict}` : content.finder.allSchools}
          </h4>

          <div className="school-grid">
            {filteredSchools.map(school => (
              <div
                key={school.id}
                className="school-card-mini"
                onMouseEnter={() => setHoveredSchoolId(school.id)}
                onMouseLeave={() => setHoveredSchoolId(null)}
                onClick={() => handleSchoolClick(school)}
              >
                <h5>{school.name}</h5>
                <p className="school-dist">{school.district || 'Berlin'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="map-section">
        <BerlinMap
          schools={filteredSchools}
          onSelect={setActiveDistrict}
          onSchoolSelect={handleSchoolClick}
          userLocation={userLocation}
          closestSchool={closestSchool}
          hoveredSchoolId={hoveredSchoolId}
        />

        {isCalculating && (
          <div className="map-loading-overlay">
            {content.finder.calculating} <br />
            <small>{content.finder.checkingCandidates}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolFinder;