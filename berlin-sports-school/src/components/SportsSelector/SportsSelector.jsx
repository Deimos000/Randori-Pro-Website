import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useText } from '../../context/LanguageContext';
import './SportsSelector.css';

// --- CONFIGURATION ---
const API_BASE = 'https://admin-panel-319165681780.europe-west10.run.app/api';
const TARGET_ROUTE = '/sports-overview';
const PLACEHOLDER_IMG = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ6LNd0KGE0KmTwpAuQE4T3Ft5-hdxhkVaew&s';

const FEATURED_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQsveMdyyruX3tCL7d6ebez7W6Mt1mfXPxPQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn72R46_uZVnkPs9SkJF6f7BJpJOSHQfh5Pw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAm7cLnuF4ietDN9B0i88jGBCWhOQLUBqKZA&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwB_XeCIg1JAAx7uir0RnjEyPLoGePXS5gdQ&s',
  'https://img.freepik.com/premium-photo/swirling-colors-creating-dynamic-background-filled-with-vibrant-hues-textured-patterns_1252980-62193.jpg'
];

const CARD_HEIGHT = 460;
const CARD_WIDTH = 280;
const GAP = 12;

// --- HELPERS ---

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

// --- SUB-COMPONENT: SplitCard ---
const SplitCard = ({ blob, onNavigate, viewAllText }) => {
  const [isHovered, setIsHovered] = useState(false);

  const totalSubs = blob.subcategories?.length || 0;
  const shouldSplit = totalSubs > 1 && !blob.isMore;

  const bubbleHeight = shouldSplit
    ? (CARD_HEIGHT - (GAP * (totalSubs - 1))) / totalSubs
    : CARD_HEIGHT;

  const bgStyle = {
    backgroundImage: `url(${blob.image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  // Handler for clicking the main card
  const handleCardClick = () => {
    // If it's the "More" card, go to overview with no specific selection
    if (blob.isMore) {
      onNavigate(null);
      return;
    }
    // If it's a single item card (not split), select that item
    if (!shouldSplit && totalSubs === 1) {
      onNavigate(blob.subcategories[0].sport_id);
    }
  };

  return (
    <div
      className={`card-column ${blob.isMore ? 'more-card' : ''}`}
      style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px`, cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick} // Handle click on container
    >
      {/* Cover Image */}
      <div className={`main-blob-wrapper ${isHovered && shouldSplit ? 'hidden' : ''}`}>
        <div className="blob-bg" style={bgStyle}></div>
        <div className="blob-overlay">
          <h2 className="card-title">{blob.title}</h2>
          {blob.isMore && <span className="more-indicator">{viewAllText}</span>}
          {!shouldSplit && !blob.isMore && totalSubs === 1 && (
            <span className="single-label">{blob.subcategories[0].label}</span>
          )}
        </div>
      </div>

      {/* Bubbles */}
      <div className="bubbles-container">
        {shouldSplit && blob.subcategories.map((sub, idx) => {
          const topPos = idx * (bubbleHeight + GAP);
          const centerOfBubble = topPos + (bubbleHeight / 2);
          const centerOfContainer = CARD_HEIGHT / 2;
          const translateY = centerOfBubble - centerOfContainer;

          return (
            <div
              key={sub.sport_id || idx}
              className={`liquid-bubble ${isHovered ? 'visible' : ''}`}
              style={{
                height: `${bubbleHeight}px`,
                '--trans-y': `${translateY}px`,
                '--delay': `${idx * 0.05}s`,
                zIndex: totalSubs - idx,
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent card click
                onNavigate(sub.sport_id);
              }}
            >
              <div
                className="bubble-inner-img"
                style={{
                  ...bgStyle,
                  height: `${CARD_HEIGHT}px`,
                  width: `${CARD_WIDTH}px`,
                  transform: isHovered
                    ? `translate(-50%, calc(-50% - var(--trans-y)))`
                    : `translate(-50%, -50%)`
                }}
              />
              <span className="bubble-label">{sub.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SportsSelector() {
  const { content } = useText();
  const navigate = useNavigate();

  const [blobs, setBlobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/sports/all-with-schools`);
        const allSports = await res.json();

        if (!allSports) {
          setLoading(false);
          return;
        }

        // 1. Process and Group
        const result = allSports.map(s => ({
          ...s,
          label: s.sport_name // Map backend name to 'label' for UI
        }));

        const grouped = result.reduce((acc, sport) => {
          const category = getCategory(sport.sport_name);
          if (!acc[category]) acc[category] = [];
          acc[category].push(sport);
          return acc;
        }, {});

        // 2. Sort Keys (Size descending, then Alphabetical)
        const sortedKeys = Object.keys(grouped)
          .sort((a, b) => {
            const diff = grouped[b].length - grouped[a].length;
            if (diff !== 0) return diff;
            return a.localeCompare(b);
          });

        // 3. Take Top 4 Categories for the display
        const topCategories = sortedKeys.slice(0, 4);

        // 4. Construct Blobs with custom images
        const finalGroups = topCategories.map((key, index) => {
          // Sort subcategories alphabetically
          const subcategories = grouped[key].sort((a, b) => a.label.localeCompare(b.label));

          return {
            key: key,
            title: key, // Use category name as title
            image: FEATURED_IMAGES[index] || PLACEHOLDER_IMG, // Use specific image or fallback
            subcategories: subcategories,
            isMore: false
          };
        });

        setBlobs(finalGroups);

      } catch (err) {
        console.error("Error fetching sports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- NAVIGATION HANDLER ---
  const handleNavigate = (sportId) => {
    navigate(TARGET_ROUTE, { state: { initialSportId: sportId } });
  };

  const moreBlob = {
    title: content.sportsSelector.more,
    image: FEATURED_IMAGES[4], // The 5th image for the 'More' card
    subcategories: [],
    isMore: true
  };

  return (
    <div className="sports-row">
      {!loading && blobs.map((blob, i) => (
        <SplitCard
          key={blob.key || i}
          blob={blob}
          onNavigate={handleNavigate}
          viewAllText={content.sportsSelector.viewAll}
        />
      ))}
      <SplitCard
        blob={moreBlob}
        onNavigate={handleNavigate}
        viewAllText={content.sportsSelector.viewAll}
      />
    </div>
  );
}