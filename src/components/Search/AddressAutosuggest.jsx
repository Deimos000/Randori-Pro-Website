import React, { useState, useEffect, useRef } from 'react';
import './AddressAutosuggest.css';

const AddressAutosuggest = ({ onAddressSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const isSelecting = useRef(false);

  useEffect(() => {
    // 1. Create a flag to track if component is mounted/active
    let isActive = true;

    if (isSelecting.current) {
      isSelecting.current = false; 
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      // Only search if query has content
      if (query.length > 2) {
        try {
          // 2. FIXED: Added encodeURIComponent
          // 3. Added addressdetails=1 for better data
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=13.088,52.675,13.761,52.338&bounded=1&addressdetails=1`;
          
          const response = await fetch(url);
          
          if (!response.ok) throw new Error("Network response was not ok");
          
          const data = await response.json();
          
          // 4. FIXED: Only update state if this effect is still active (prevents race conditions)
          if (isActive) {
            setSuggestions(data);
          }
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    // Cleanup function
    return () => {
      isActive = false; // Mark this effect as cancelled
      clearTimeout(delayDebounceFn);
    };
  }, [query]);

  const handleSelect = (item) => {
    isSelecting.current = true;
    setQuery(item.display_name);
    setSuggestions([]);
    
    onAddressSelect({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name
    });
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onAddressSelect(null); 
  };

  return (
    <div className="address-search-container">
      <div className="input-wrapper" style={{ position: 'relative', display: 'flex' }}>
        <input
          type="text"
          className="address-input" // Make sure this has width: 100% in CSS
          placeholder="Enter street address in Berlin..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', paddingRight: '30px', padding: '8px' }} 
        />
        
        {query && (
          <button 
            onClick={handleClear}
            className="clear-btn"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666'
            }}
          >
            &#10005;
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((item) => (
            <li key={item.place_id} onClick={() => handleSelect(item)}>
              {/* Show a cleaner name if available, otherwise display_name */}
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutosuggest;