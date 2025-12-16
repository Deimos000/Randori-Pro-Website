import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, ArrowRight, Info, ChevronRight } from 'lucide-react';
import { schools, generalContact } from '../data/schools';
import { useText } from '../context/LanguageContext';
import './Contact.css';

export default function Contact() {
  const { content } = useText();
  const [selectedSchool, setSelectedSchool] = useState(schools[0]);

  // Scroll to details on mobile when selection changes
  useEffect(() => {
    if (window.innerWidth < 900 && selectedSchool) {
      const detailParams = document.getElementById('school-detail-view');
      if (detailParams) {
        detailParams.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedSchool]);

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>{content.contactPage.heroTitle}</h1>
          <p>{content.contactPage.heroSubtitle}</p>
        </motion.div>
      </div>

      <div className="contact-container">

        {/* Full Width Header */}
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '2rem' }}>
          <motion.h2
            className="all-schools-header"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {content.contactPage.allSchools}
          </motion.h2>
        </div>

        {/* LEFT: School List */}
        <div className="school-list">
          {schools.map((school, index) => (
            <SchoolCard
              key={school.id}
              school={school}
              isSelected={selectedSchool?.id === school.id}
              onClick={() => setSelectedSchool(school)}
              index={index}
            />
          ))}
        </div>

        {/* RIGHT: Detail View */}
        <div id="school-detail-view" className="school-details-wrapper">
          <AnimatePresence mode="wait">
            {selectedSchool ? (
              <motion.div
                key={selectedSchool.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="detail-panel"
              >
                <img
                  src={selectedSchool.image}
                  alt={selectedSchool.name}
                  className="detail-image"
                />

                <div className="detail-content">
                  <h2>{content.contactPage.locationPrefix} {selectedSchool.name}</h2>

                  <div className="detail-info-row">
                    <MapPin className="info-icon" size={24} />
                    <span>{selectedSchool.address}</span>
                  </div>

                  <div className="detail-info-row">
                    <Phone className="info-icon" size={24} />
                    <a href={selectedSchool.telLink} className="detail-link">{selectedSchool.phone}</a>
                  </div>

                  <div className="detail-info-row">
                    <Mail className="info-icon" size={24} />
                    <a href={`mailto:${selectedSchool.email}`} className="detail-link">{selectedSchool.email}</a>
                  </div>

                  <div className="detail-info-row">
                    <Globe className="info-icon" size={24} />
                    <a href={selectedSchool.url} target="_blank" rel="noopener noreferrer" className="detail-link">
                      {content.contactPage.visitWebsite}
                    </a>
                  </div>

                  <Link
                    to="/trial-booking"
                    className="cta-button"
                  >
                    {content.contactPage.freeTrialBtn}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="empty-state">
                <Info size={48} style={{ marginBottom: '1rem' }} />
                <p>{content.contactPage.selectSchoolPrompt}</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* General Info Footer */}
      <section className="general-info-section">
        <h3>{generalContact.title}</h3>
        <p style={{ margin: '1rem 0' }}>{generalContact.description}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div><strong>{content.contactPage.telLabel}</strong> {generalContact.phone}</div>
          <div><strong>{content.contactPage.emailLabel}</strong> {generalContact.email}</div>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-brand-darkest)', opacity: 0.7 }}>{generalContact.hours}</p>
      </section>
    </div>
  );
}

function SchoolCard({ school, isSelected, onClick, index }) {
  return (
    <motion.div
      className={`school-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div>
        <h3>{school.name}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-brand-darkest)', opacity: 0.7, marginTop: '4px' }}>{school.address.split(',')[0]}</p>
      </div>
      <ChevronRight className="arrow-icon" />
    </motion.div>
  );
}
