import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useText } from '../context/LanguageContext';
import './TrialPage.css';

// --- CONFIGURATION ---
const API_BASE = 'https://admin-panel-319165681780.europe-west10.run.app/api';
// In a real app, do not store keys in frontend code (use env variables)
const API_KEY = 'my-super-secret-key-that-is-hard-to-guess';

export default function TrialPage() {
  const { content } = useText();
  const location = useLocation();

  // --- State Management ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data Lists
  const [schools, setSchools] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [sports, setSports] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Selections
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Pending Pre-selection (passed from Overview page)
  const [pendingSport, setPendingSport] = useState(null);

  // Logic Flag
  const [showBookingOption, setShowBookingOption] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: ''
  });

  // --- Helper: Extract Age Numbers ---
  const parseMinAge = (str) => {
    if (!str) return 0;
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // --- API Effects ---

  // 1. Fetch Schools & Handle Incoming State
  useEffect(() => {
    fetch(`${API_BASE}/public/schools`)
      .then(res => res.json())
      .then(data => {
        setSchools(data);

        // --- CHECK FOR INCOMING STATE (From SchoolSportConnect) ---
        if (location.state?.preSelectedSchool) {
          // UPDATED: Check against s.id (backend alias) instead of s.school_id
          const incomingId = location.state.preSelectedSchool.school_id || location.state.preSelectedSchool.id;
          const targetSchool = data.find(s => s.id === incomingId);

          if (targetSchool) {
            handleSchoolSelect(targetSchool);
          }
        }

        if (location.state?.preSelectedSport) {
          setPendingSport(location.state.preSelectedSport);
        }
      })
      .catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Fetch Age Groups
  useEffect(() => {
    if (!selectedSchool) return;

    setLoading(true);
    // UPDATED: Use selectedSchool.id (matches backend alias)
    fetch(`${API_BASE}/public/schools/${selectedSchool.id}/age-groups`)
      .then(res => res.json())
      .then(data => {
        setAgeGroups(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedSchool]);

  // 3. Fetch Sports (Modified to return Promise for chaining)
  const fetchSports = (ageOverride = null) => {
    const age = ageOverride || selectedAge;
    if (!selectedSchool || !age) return Promise.resolve([]);

    setLoading(true);

    // UPDATED: Use selectedSchool.id
    return fetch(`${API_BASE}/public/schools/${selectedSchool.id}/age-groups/${age.age_group_id}/sports`)
      .then(res => res.json())
      .then(allSports => {
        const userMinAge = parseMinAge(age.name);
        const filtered = allSports.filter(sport => {
          const label = sport.target_age_group || "";
          const min = parseMinAge(label);
          if (label.toLowerCase().includes("ab")) return userMinAge >= min;
          return userMinAge === min;
        });
        setSports(filtered);
        setLoading(false);
        return filtered; // Return for chaining
      })
      .catch(() => {
        setLoading(false);
        return [];
      });
  };

  // 4. Fetch Availability
  const fetchAvailability = (sportId) => {
    setLoading(true);
    // UPDATED: Use selectedSchool.id
    fetch(`${API_BASE}/availability/?school_id=${selectedSchool.id}&sport_id=${sportId}`)
      .then(res => res.json())
      .then(data => {
        setAvailableSlots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // --- Handlers ---

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setSelectedAge(null);
    setSelectedSport(null);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleAgeSelect = (age) => {
    if (age.status === 'AUFNAHMESTOPP') {
      alert(content.trialPage.groupFull);
      return;
    }
    setShowBookingOption(age.status === 'ONLINE_BOOKING');
    setSelectedAge(age);
    setSelectedSport(null);
    setSelectedSlot(null);
    setStep(3);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Submit: Lead Only ---
  const handleSubmitLeadOnly = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await sendDataToBackend({});
  };

  // --- Transition: To Booking ---
  const handleProceedToBooking = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Fetch sports for this age group
    fetchSports().then((loadedSports) => {
      // SMART LOGIC:
      // If we have a pendingSport (from overview page) AND it exists for this age group:
      // Auto-select it and skip to Step 5.
      if (pendingSport) {
        const match = loadedSports.find(s => s.sport_id === pendingSport.sport_id);
        if (match) {
          handleSportSelect(match);
          return; // Done, handleSportSelect sets Step 5
        }
      }
      // Otherwise, show list (Step 4)
      setStep(4);
    });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError(content.trialPage.fillAllFields);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    setSelectedSlot(null); // Reset slot when changing sport
    fetchAvailability(sport.sport_id);
    setStep(5);
  };

  // --- Submit: Final Booking (Triggered by Right Button) ---
  const handleFinalBooking = async () => {
    if (!selectedSlot) return;

    await sendDataToBackend({
      sport_id: selectedSport.sport_id,
      schedule_id: selectedSlot.schedule_id,
      booking_date: selectedSlot.booking_date
    });
  };

  const sendDataToBackend = async (bookingData) => {
    setLoading(true);
    setError(null);

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phone,
      // UPDATED: Use selectedSchool.name (matches backend alias)
      school_name: selectedSchool.name,
      age_group: selectedAge.name,
      age_group_2: "",
      ...bookingData
    };

    try {
      const res = await fetch(`${API_BASE}/public/trial-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStep('SUCCESS');
      } else {
        const errData = await res.json();
        if (res.status === 401) {
          setError(content.trialPage.authError);
        } else {
          setError(errData.error || errData.message || content.trialPage.transferError);
        }
      }
    } catch (err) {
      setError(content.trialPage.networkError);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderCalendarGrid = () => {
    if (availableSlots.length === 0) return <div className="info-box">{content.trialPage.noSlots}</div>;

    return (
      <div
        className="booking-grid-flat"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}
      >
        {availableSlots.map((slot, index) => {
          const isSelected = selectedSlot && selectedSlot.schedule_id === slot.schedule_id && selectedSlot.booking_date === slot.booking_date;
          return (
            <button
              key={index}
              className="time-slot-card fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                border: isSelected ? '2px solid #1a2c38' : '1px solid #eee',
                borderRadius: '8px',
                background: isSelected ? '#e0f2fe' : '#f4f1ea',
                cursor: 'pointer',
                animationDelay: `${index * 0.05}s`,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }}
              onClick={() => setSelectedSlot(slot)}
            >
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                {slot.week_day_name}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                {slot.booking_date_formatted}
              </span>
              <span style={{
                background: isSelected ? '#1a2c38' : '#e0f2fe',
                color: isSelected ? 'white' : '#0284c7',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}>
                {slot.start_time_formatted}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="trial-page-container">

      <div className="trial-card">

        {/* Left Side: Interaction */}
        <div className={`trial-form-section ${step === 3 ? 'centered-layout' : ''}`}>

          {/* STEP 1: School */}
          {step === 1 && (
            <div className="fade-in">
              <h2 className="step-title">{content.trialPage.step1Title}</h2>
              <div className="selection-grid">
                {schools.map(s => (
                  // UPDATED: Use s.id as key
                  <button key={s.id} className="selection-btn" onClick={() => handleSchoolSelect(s)}>
                    <span className="btn-icon">📍</span>
                    <div className="btn-details">
                      {/* UPDATED: Use s.name instead of s.school_name */}
                      <span className="btn-text">{s.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Age */}
          {step === 2 && (
            <div className="fade-in">
              <button className="back-link" onClick={() => setStep(1)}>← {content.trialPage.back}</button>
              <h2 className="step-title">{content.trialPage.step2Title}</h2>
              {loading ? <div className="loader"></div> : (
                <div className="selection-grid">
                  {ageGroups.map(ag => (
                    <button
                      key={ag.age_group_id}
                      className={`selection-btn ${ag.status === 'AUFNAHMESTOPP' ? 'disabled' : ''}`}
                      onClick={() => handleAgeSelect(ag)}
                    >
                      <span className="btn-icon">🎂</span>
                      <div className="btn-details">
                        <span className="btn-text">{ag.name}</span>
                        <span className="sport-sub">{content.trialPage.showYears}</span>
                      </div>
                      {ag.status === 'AUFNAHMESTOPP' && <span className="status-badge full">{content.trialPage.full}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Personal Data Form */}
          {step === 3 && (
            <div className="fade-in form-container-center">
              <button className="back-link center-self" onClick={() => setStep(2)}>← {content.trialPage.backStep}</button>
              <div className="text-center">
                <h2 className="step-title">{content.trialPage.step3Title}</h2>
                <p className="step-subtitle">{content.trialPage.contactSubtitle}</p>
              </div>
              <form className="personal-data-form enhanced">
                <div className="form-row">
                  <div className="input-group">
                    <label>{content.form.labels.firstName}</label>
                    <input required name="firstName" placeholder="Max" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label>{content.form.labels.lastName}</label>
                    <input required name="lastName" placeholder="Mustermann" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="input-group">
                  <label>{content.form.labels.email}</label>
                  <input required type="email" name="email" placeholder="max@beispiel.de" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>{content.form.labels.phone}</label>
                  <input required type="tel" name="phone" placeholder="0176..." value={formData.phone} onChange={handleInputChange} />
                </div>
                {error && <div className="error-banner">{error}</div>}
                <div className="action-area">
                  <button onClick={handleSubmitLeadOnly} className="submit-btn secondary" disabled={loading}>
                    {loading ? content.trialPage.sending : content.trialPage.requestInfoOnly}
                  </button>
                  <div className="or-divider"><span>{content.trialPage.or}</span></div>
                  {showBookingOption ? (
                    <button onClick={handleProceedToBooking} className="submit-btn primary" disabled={loading}>
                      {content.trialPage.bookTrialDirectly}
                    </button>
                  ) : (
                    <div className="info-box">{content.trialPage.bookingNotAvailable}</div>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Choose Sport (Visible if no auto-select or fallback) */}
          {step === 4 && (
            <div className="fade-in">
              <button className="back-link" onClick={() => setStep(3)}>← {content.trialPage.back}</button>
              <h2 className="step-title">{content.trialPage.step4Title}</h2>
              {loading ? <div className="loader"></div> : (
                <div className="selection-grid cozy-grid">
                  {sports.map(sp => (
                    <button key={sp.sport_id} className="selection-btn sport-btn" onClick={() => handleSportSelect(sp)}>
                      <span className="btn-icon">🥋</span>
                      <div className="btn-details">
                        <span className="sport-name">{sp.sport_name}</span>
                        <span className="sport-sub">{content.trialPage.clickForSlots}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Booking Grid */}
          {step === 5 && (
            <div className="fade-in full-width-content">
              <div className="header-row">
                {/* Back button logic: If we auto-skipped step 4, back should go to 3, else 4 */}
                <button className="back-link" onClick={() => setStep(pendingSport ? 3 : 4)}>← {content.trialPage.back}</button>
                <h2 className="step-title">{content.trialPage.step5Title}</h2>
                <p className="step-subtitle" style={{ marginBottom: '20px' }}>{content.trialPage.selectTimePrompt}</p>
              </div>
              {loading ? <div className="loader"></div> : renderCalendarGrid()}
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {step === 'SUCCESS' && (
            <div className="fade-in success-view">
              <div className="success-icon">🎉</div>
              <h2>{content.trialPage.successTitle}</h2>
              <p>{content.trialPage.successMsg}</p>
              <button className="submit-btn primary" onClick={() => window.location.reload()}>
                {content.trialPage.backToHome}
              </button>
            </div>
          )}
        </div>

        {/* 
            ------------------------------------------
            RIGHT SIDE PANEL (Context) 
            ------------------------------------------
        */}
        <div className="trial-context-section fade-in">
          <div className="context-content">

            {/* Dynamic Image */}
            <div className={`summary-wrapper ${selectedSport ? 'mode-hidden' :
                selectedAge ? 'mode-small' :
                  'mode-large'
              }`}>
              <img
                src={selectedAge
                  ? "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=800"
                  : "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800"
                }
                alt="Context"
                className="summary-img"
              />
            </div>

            <div className="context-header">
              <h3>{content.trialPage.yourSelection}</h3>
              <div className="divider"></div>
            </div>

            <div className="summary-list">
              {/* Item 1: School */}
              {selectedSchool && (
                <div className="summary-item-animated" style={{ animationDelay: '0s' }}>
                  <span className="icon">📍</span>
                  <div className="info">
                    <span className="label">{content.trialPage.locationLabel}</span>
                    {/* UPDATED: Use selectedSchool.name */}
                    <span className="value">{selectedSchool.name}</span>
                  </div>
                </div>
              )}

              {/* Item 2: Age */}
              {selectedAge && (
                <div className="summary-item-animated" style={{ animationDelay: '0.1s' }}>
                  <span className="icon">🎂</span>
                  <div className="info">
                    <span className="label">{content.trialPage.ageGroupLabel}</span>
                    <span className="value">{selectedAge.name}</span>
                  </div>
                </div>
              )}

              {/* Item 3: Sport */}
              {selectedSport && (
                <div className="summary-item-animated" style={{ animationDelay: '0.2s' }}>
                  <span className="icon">🥋</span>
                  <div className="info">
                    <span className="label">{content.trialPage.sportLabel}</span>
                    <span className="value">{selectedSport.sport_name}</span>
                  </div>
                </div>
              )}

              {!selectedSchool && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                  {content.trialPage.startPrompt}
                </p>
              )}
            </div>

            {/* NEW: Context Footer with CONFIRM BUTTON */}
            <div className="context-footer" style={{ marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>

              {step === 5 ? (
                /* Only show this in Step 5 */
                <div className="fade-in">
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '15px' }}>
                    {selectedSlot
                      ? content.trialPage.slotSelectedMsg
                      : content.trialPage.selectSlotMsg}
                  </p>
                  <button
                    onClick={handleFinalBooking}
                    disabled={!selectedSlot || loading}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: selectedSlot ? '#ffffff' : 'rgba(255,255,255,0.2)',
                      color: selectedSlot ? '#1a2c38' : 'rgba(255,255,255,0.4)',
                      fontWeight: '800',
                      fontSize: '1rem',
                      cursor: selectedSlot ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedSlot ? '0 10px 25px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    {loading ? content.trialPage.booking : content.trialPage.confirmDate}
                  </button>
                </div>
              ) : (
                /* Default Footer Text for Steps 1-4 */
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                  {content.trialPage.importantNote}
                </p>
              )}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}