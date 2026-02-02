import { useState, useEffect, useRef } from 'react';
import { Trip } from '../types';
import Modal from './Modal';
import L from 'leaflet';

interface RouteMapModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

interface Coordinates {
  lat: number;
  lon: number;
}

export default function RouteMapModal({ trip, isOpen, onClose }: RouteMapModalProps) {
  const [routeUrl, setRouteUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [routeData, setRouteData] = useState<{ distance: number; duration: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (isOpen && trip) {
      generateRoute();
    }

    // Cleanup map on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, trip]);

  const generateRoute = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Geocode origin and destination
      const originCoords = await geocodeAddress(trip.origin);
      const destCoords = await geocodeAddress(trip.destination);

      if (!originCoords || !destCoords) {
        setError('Unable to geocode addresses. Please check origin and destination.');
        setIsLoading(false);
        return;
      }

      // Generate map URL for opening in new tab
      const centerLat = (originCoords.lat + destCoords.lat) / 2;
      const centerLon = (originCoords.lon + destCoords.lon) / 2;
      const latDiff = Math.abs(originCoords.lat - destCoords.lat);
      const lonDiff = Math.abs(originCoords.lon - destCoords.lon);
      const maxDiff = Math.max(latDiff, lonDiff);
      let zoom = 13;
      if (maxDiff > 1) zoom = 8;
      else if (maxDiff > 0.5) zoom = 10;
      else if (maxDiff > 0.1) zoom = 12;

      const mapUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originCoords.lat}%2C${originCoords.lon}%3B${destCoords.lat}%2C${destCoords.lon}#map=${zoom}/${centerLat}/${centerLon}`;
      setRouteUrl(mapUrl);

      // Get OSRM route
      const routeGeometry = await getOSRMRoute(originCoords, destCoords);
      
      if (!routeGeometry) {
        setError('Unable to calculate route. Please try again.');
        setIsLoading(false);
        return;
      }

      // Initialize Leaflet map
      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([centerLat, centerLon], zoom);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Add markers
        const originMarker = L.marker([originCoords.lat, originCoords.lon]).addTo(map);
        originMarker.bindPopup(`<b>Origin:</b><br>${trip.origin}`);

        const destMarker = L.marker([destCoords.lat, destCoords.lon]).addTo(map);
        destMarker.bindPopup(`<b>Destination:</b><br>${trip.destination}`);

        // Add route line
        if (routeGeometry.coordinates) {
          const routeLine = L.polyline(routeGeometry.coordinates, {
            color: '#EF4444',
            weight: 4,
            opacity: 0.7,
          }).addTo(map);

          // Fit map to route bounds
          map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        }

        // Store route data
        if (routeGeometry.distance && routeGeometry.duration) {
          setRouteData({
            distance: routeGeometry.distance / 1000, // Convert to km
            duration: routeGeometry.duration / 60, // Convert to minutes
          });
        }

        mapInstanceRef.current = map;
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error generating route:', err);
      setError('Failed to generate route. Please try again.');
      setIsLoading(false);
    }
  };

  const getOSRMRoute = async (origin: Coordinates, dest: Coordinates) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          coordinates: route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]), // Swap lon,lat to lat,lon
          distance: route.distance,
          duration: route.duration,
        };
      }
      return null;
    } catch (error) {
      console.error('OSRM routing error:', error);
      return null;
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Route: ${trip.origin} → ${trip.destination}`}
      size="large"
    >
      <div className="space-y-4">
        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-bg-elevated rounded-lg">
          <div>
            <p className="text-sm text-text-secondary">Origin</p>
            <p className="text-base font-medium text-text-primary">{trip.origin}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Destination</p>
            <p className="text-base font-medium text-text-primary">{trip.destination}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Distance</p>
            <p className="text-base font-medium text-text-primary">
              {routeData ? `${routeData.distance.toFixed(1)} km` : `${trip.distance_km.toFixed(1)} km`}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">
              {routeData ? 'Est. Duration' : 'Status'}
            </p>
            <p className="text-base font-medium text-text-primary">
              {routeData 
                ? `${Math.round(routeData.duration)} min` 
                : trip.status.replace('_', ' ').charAt(0).toUpperCase() + trip.status.replace('_', ' ').slice(1)
              }
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative" style={{ height: '500px' }}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-secondary rounded-lg z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p className="text-text-secondary">Loading route...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-secondary rounded-lg z-10">
              <div className="text-center p-6">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-medium mb-2">Unable to Load Route</p>
                <p className="text-text-secondary text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Leaflet Map */}
          <div 
            ref={mapRef} 
            className="w-full h-full rounded-lg"
            style={{ zIndex: 1 }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-border-muted">
          <a
            href={routeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover text-sm font-medium inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in New Tab
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg-elevated text-text-primary rounded-md hover:bg-border-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
