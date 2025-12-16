import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useText } from '../context/LanguageContext';
import './SchoolSportConnect.css';

const API_BASE = 'https://admin-panel-319165681780.europe-west10.run.app/api';

const PLACEHOLDER_IMG = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ6LNd0KGE0KmTwpAuQE4T3Ft5-hdxhkVaew&s';

export default function SchoolSportConnect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { content } = useText();

  const [schools, setSchools] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection States
  const [selectedSportId, setSelectedSportId] = useState(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const [schoolsRes, sportsRes] = await Promise.all([
          fetch(`${API_BASE}/public/schools`),
          fetch(`${API_BASE}/public/sports/all-with-schools`)
        ]);

        const schoolsData = await schoolsRes.json();
        const sportsData = await sportsRes.json();

        setSchools(schoolsData);
        setSports(sportsData);

        // Handle navigation state (if coming back or deep linked)
        const passedSportId = location.state?.initialSportId;
        if (passedSportId) {
          setSelectedSportId(passedSportId);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [location.state]);

  // --- LOGIC: HELPER FUNCTIONS ---

  const getCategory = (sportName) => {
    const lower = sportName.toLowerCase();

    // Explicit mappings based on user list
    if (lower.includes('boxen') || lower.includes('fitnessboxen')) return 'Boxen';
    if (lower.includes('budo')) return 'Budo';
    if (lower.includes('fit kids')) return 'Fitness';
    if (lower.includes('grappling')) return 'Grappling';
    if (lower.includes('hapkido')) return 'Hapkido';
    if (lower.includes('jiu')) return 'Jiu Jitsu';
    if (lower.includes('judo')) return 'Judo';
    if (lower.includes('karate')) return 'Karate';
    if (lower.includes('kbf')) return 'Kickbox-Fitness';
    if (lower.includes('kettlebell')) return 'Kettlebell';
    if (lower.includes('kickbox')) return 'Kickboxen';
    if (lower.includes('krav maga')) return 'Krav Maga';
    if (lower.includes('kung fu')) return 'Kung Fu';
    if (lower.includes('mma')) return 'MMA';
    if (lower.includes('tae kwon do')) return 'Tae Kwon Do';

    return 'Other';
  };

  // --- LOGIC: FILTERING ---

  // 1. displayedSports: If a school is selected, only show sports available there.
  const displayedSports = useMemo(() => {
    let result = [...sports];
    if (selectedSchoolId) {
      result = result.filter(sport => sport.school_ids.includes(selectedSchoolId));
    }

    // Grouping
    const grouped = result.reduce((acc, sport) => {
      const category = getCategory(sport.sport_name);
      if (!acc[category]) acc[category] = [];
      acc[category].push(sport);
      return acc;
    }, {});

    // Sort keys by amount of sports (descending), then alphabetically
    return Object.keys(grouped)
      .sort((a, b) => {
        const diff = grouped[b].length - grouped[a].length;
        if (diff !== 0) return diff;
        return a.localeCompare(b);
      })
      .reduce((acc, key) => {
        acc[key] = grouped[key].sort((a, b) => a.sport_name.localeCompare(b.sport_name));
        return acc;
      }, {});
  }, [sports, selectedSchoolId]);

  // 2. displayedSchools: We show ALL schools, but we change their visual state 
  // based on whether they support the selected sport.
  const processedSchools = useMemo(() => {
    return schools.map(school => {
      // Is this school compatible with the selected sport?
      // If NO sport is selected, all schools are "compatible" in a general sense,
      // but we can't book yet.
      let isCompatible = true;
      if (selectedSportId) {
        const sportObj = sports.find(s => s.sport_id === selectedSportId);
        if (sportObj && !sportObj.school_ids.includes(school.id)) {
          isCompatible = false;
        }
      }
      return { ...school, isCompatible };
    }).sort((a, b) => {
      // Sort compatible schools to the top if a sport is selected
      return b.isCompatible - a.isCompatible;
    });
  }, [schools, sports, selectedSportId]);


  // --- HANDLERS ---

  const handleSportClick = (sportId) => {
    // Toggle sport selection
    setSelectedSportId(prev => (prev === sportId ? null : sportId));

    // If we select a sport that isn't available at the currently selected school,
    // we should probably deselect the school to avoid confusion, 
    // OR keep the school and let the user see the conflict. 
    // Let's deselect school to reset the flow for the new sport.
    if (selectedSchoolId) {
      const sport = sports.find(s => s.sport_id === sportId);
      if (sport && !sport.school_ids.includes(selectedSchoolId)) {
        setSelectedSchoolId(null);
      }
    }
  };

  const handleSchoolBodyClick = (schoolId) => {
    // Toggle school selection (for filtering sports)
    setSelectedSchoolId(prev => (prev === schoolId ? null : schoolId));
  };

  const handleBookClick = (e, school) => {
    e.stopPropagation(); // Prevent triggering the body click

    if (!selectedSportId) return; // Should be disabled, but safety check

    const selectedSportObj = sports.find(s => s.sport_id === selectedSportId);

    navigate('/trial-booking', {
      state: {
        preSelectedSchool: school,
        preSelectedSport: selectedSportObj
      }
    });
  };

  return (
    <div className="ssc-backdrop">
      <div className="ssc-main-card">
        {loading ? (
          <div className="ssc-loader">{content.schoolSportConnect.loading}</div>
        ) : (
          <div className="ssc-split-view">

            {/* --- LEFT PANEL: SPORTS --- */}
            <div className="ssc-panel left-panel">
              <div className="panel-header">
                <h2>{content.schoolSportConnect.step1Title}</h2>
                <span className="panel-subtitle">
                  {selectedSchoolId
                    ? content.schoolSportConnect.showingSportsAtSchool
                    : content.schoolSportConnect.viewingAllSports}
                </span>
                {selectedSchoolId && (
                  <button className="clear-filter-btn" onClick={() => setSelectedSchoolId(null)}>
                    {content.schoolSportConnect.showAll}
                  </button>
                )}
              </div>

              <div className="ssc-scroll-container">
                {Object.keys(displayedSports).length === 0 ? (
                  <div className="empty-state">{content.schoolSportConnect.noSportsFound}</div>
                ) : (
                  Object.entries(displayedSports).map(([category, categorySports]) => (
                    <div key={category} className="sport-category-section">
                      <h3 className="category-title">{category}</h3>
                      <div className="ssc-grid-sports">
                        {categorySports.map(sport => {
                          const isSelected = selectedSportId === sport.sport_id;
                          return (
                            <div
                              key={sport.sport_id}
                              className={`sport-card-square ${isSelected ? 'active' : ''}`}
                              onClick={() => handleSportClick(sport.sport_id)}
                              style={{
                                // '--card-hue': ... unused now
                              }}
                            >
                              {/* Background Layer */}
                              <div
                                className="sport-card-bg"
                                style={{
                                  backgroundImage: `url(${PLACEHOLDER_IMG})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                              ></div>

                              {/* Content Layer */}
                              <div className="sport-card-content glass-panel">
                                <h3>{sport.sport_name}</h3>
                                <span className="age-tag">{sport.target_age_group || content.schoolSportConnect.allAges}</span>
                              </div>

                              {isSelected && <div className="selected-overlay"><i className="check-icon">✓</i></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* --- DIVIDER --- */}
            <div className="ssc-divider"></div>

            {/* --- RIGHT PANEL: SCHOOLS --- */}
            <div className="ssc-panel right-panel">
              <div className="panel-header">
                <h2>{content.schoolSportConnect.step2Title}</h2>
                <span className="panel-subtitle">
                  {selectedSportId
                    ? content.schoolSportConnect.bookTrialPrompt
                    : content.schoolSportConnect.selectSchoolPrompt}
                </span>
              </div>

              <div className="ssc-list-schools">
                {processedSchools.map((school, index) => {
                  const isSelected = selectedSchoolId === school.id;
                  const isCompatible = school.isCompatible; // Based on selected sport

                  return (
                    <div
                      key={school.id}
                      className={`school-row ${isSelected ? 'active' : ''} ${!isCompatible ? 'dimmed' : ''}`}
                      onClick={() => handleSchoolBodyClick(school.id)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="school-info-col">
                        <div className="school-icon">🏫</div>
                        <div className="school-details">
                          <h4>{school.name}</h4>
                          <span className="school-meta">{content.schoolSportConnect.tapToFilter}</span>
                        </div>
                      </div>

                      <div className="school-action-col">
                        <button
                          className="book-btn"
                          disabled={!selectedSportId || !isCompatible}
                          onClick={(e) => handleBookClick(e, school)}
                        >
                          {selectedSportId && isCompatible ? content.schoolSportConnect.bookNow : content.schoolSportConnect.selectSport}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}