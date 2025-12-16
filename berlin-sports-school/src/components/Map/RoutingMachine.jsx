import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const RoutingMachine = ({ userLocation, targetSchool }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !targetSchool) return;

    // Create the routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(targetSchool.lat, targetSchool.lng)
      ],
      // Use the OSRM public demo server (free for small projects)
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      // Visual Customization (Blue line like Google Maps)
      lineOptions: {
        styles: [{ color: '#0066ff', opacity: 0.7, weight: 6 }]
      },
      // UI Settings: Hide the turn-by-turn text box, we just want the line
      show: false, 
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true, // Automatically zoom to fit the path
      showAlternatives: false,
      createMarker: () => null // We already have our own markers, don't create new ones
    }).addTo(map);

    // Cleanup: Remove the route when the component unmounts or props change
    return () => map.removeControl(routingControl);
  }, [map, userLocation, targetSchool]);

  return null;
};

export default RoutingMachine;