import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import berlinData from '../../data/berlin_districts.json';
import './BerlinMap.css';

// --- ICONS ---
const schoolIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/167/167707.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const pulseIcon = L.divIcon({
  className: 'pulsing-marker-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, 0]
});

// --- HELPER 1: ROUTING MACHINE ---
const RoutingMachine = ({ userLocation, targetSchool }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !targetSchool || !map) return;
    if (!L.Routing) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(targetSchool.lat, targetSchool.lng)
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        styles: [{ color: '#0066ff', opacity: 0.8, weight: 6 }]
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      // FIX 1: STOP AUTO ZOOMING
      fitSelectedRoutes: false,
      createMarker: () => null
    }).addTo(map);

    return () => {
      try {
        map.removeControl(routingControl);
      } catch (e) {
        console.warn("Error cleaning up routing", e);
      }
    };
  }, [map, userLocation, targetSchool]);

  return null;
};

// --- HELPER 2: FREEZE CONTROLLER ---
const MapInteractionController = ({ isLocked }) => {
  const map = useMap();
  useEffect(() => {
    if (isLocked) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) map.tap.disable();
      map.getContainer().style.cursor = 'default';
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
      map.getContainer().style.cursor = 'grab';
    }
  }, [map, isLocked]);
  return null;
};

// --- HELPER 3: BACKGROUND CLICK (Unselect) ---
const MapBackgroundClick = ({ onSelect }) => {
  useMapEvents({
    click: () => {
      // If we clicked the empty map, unselect the district
      onSelect(null);
    },
  });
  return null;
};

// --- MAIN COMPONENT ---
const BerlinMap = ({
  onSelect,
  onSchoolSelect,
  schools = [],
  userLocation,
  closestSchool,
  hoveredSchoolId
}) => {
  const defaultCenter = [52.5200, 13.4050];
  const [hoveredName, setHoveredName] = useState(null);
  const [isMapLocked, setIsMapLocked] = useState(true);

  const hoveredSchool = schools.find(s => s.id === hoveredSchoolId);

  const districtStyle = (feature) => {
    const districtName = feature.properties.name;
    const isHovered = districtName === hoveredName;
    return {
      fillColor: isHovered ? '#ff0000' : '#2a4878',
      weight: isHovered ? 3 : 1,
      opacity: 1,
      color: 'white',
      dashArray: isHovered ? '' : '3',
      fillOpacity: isHovered ? 0.6 : 0.4
    };
  };

  const onEachDistrict = (feature, layer) => {
    const name = feature.properties.name;
    layer.bindTooltip(name, { sticky: true, className: 'custom-tooltip' });
    layer.on({
      mouseover: (e) => {
        setHoveredName(name);
        e.target.bringToFront();
      },
      mouseout: () => setHoveredName(null),
      click: (e) => {
        // Stop click from hitting the background and immediately unselecting
        L.DomEvent.stopPropagation(e);
        onSelect && onSelect(name);
      }
    });
  };

  return (
    <div className="map-wrapper">
      <button
        className={`map-toggle-btn ${!isMapLocked ? 'active' : ''}`}
        onClick={() => setIsMapLocked(!isMapLocked)}
      >
        {isMapLocked ? '🔓 Enable Map' : '🔒 Freeze Map'}
      </button>

      <MapContainer
        center={defaultCenter}
        zoom={10.4}
        zoomSnap={0.1}
        className="leaflet-container"
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapInteractionController isLocked={isMapLocked} />
        <MapBackgroundClick onSelect={onSelect} />

        {userLocation && closestSchool && (
          <RoutingMachine
            userLocation={userLocation}
            targetSchool={closestSchool}
          />
        )}

        <GeoJSON
          data={berlinData}
          style={districtStyle}
          onEachFeature={onEachDistrict}
        />

        {schools.map((school) => {
          const isTarget = closestSchool && closestSchool.id === school.id;
          const opacity = closestSchool ? (isTarget ? 1 : 0.3) : 1;

          return (
            <Marker
              key={school.id}
              position={[school.lat, school.lng]}
              icon={schoolIcon}
              opacity={opacity}
              zIndexOffset={isTarget ? 1000 : 0}
              eventHandlers={{
                click: () => onSchoolSelect && onSchoolSelect(school)
              }}
            >
              <Popup>
                <strong>{school.name}</strong><br />
                {school.address}
              </Popup>
            </Marker>
          );
        })}

        {hoveredSchool && (
          <Marker
            position={[hoveredSchool.lat, hoveredSchool.lng]}
            icon={pulseIcon}
            zIndexOffset={2000}
            interactive={false}
          />
        )}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="info-overlay">
        <h3>Berlin Schools</h3>
        <p>{hoveredName ? `District: ${hoveredName}` : 'Hover over a district'}</p>
      </div>
    </div>
  );
};

export default BerlinMap;