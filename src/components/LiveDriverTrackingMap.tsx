// Live Driver Tracking Map - Real-time driver location tracking with OSRM map
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Trip, Driver, Vehicle } from '../types';
import { TripLocation } from '../types/tracking';

interface DriverMarker {
  driver: Driver;
  trip: Trip;
  vehicle: Vehicle;
  location: TripLocation;
}

export default function LiveDriverTrackingMap() {
  const [driverMarkers, setDriverMarkers] = useState<DriverMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lon: 120.9842 }); // Default: Manila
  const [zoomLevel, setZoomLevel] = useState(12);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch active trips with latest locations
  const fetchDriverLocations = async () => {
    try {
      setError(null);

      // Get all active trips with tracking enabled
      const { data: activeTrips, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          drivers:driver_id (
            id,
            full_name,
            license_number,
            phone,
            email,
            status
          ),
          vehicles:vehicle_id (
            id,
            plate_number,
            make,
            model,
            year,
            status
          )
        `)
        .eq('status', 'in_progress')
        .eq('tracking_enabled', true);

      if (tripsError) throw tripsError;

      if (!activeTrips || activeTrips.length === 0) {
        setDriverMarkers([]);
        setLoading(false);
        return;
      }

      // Get latest location for each trip
      const markers: DriverMarker[] = [];

      for (const trip of activeTrips) {
        const { data: locations, error: locError } = await supabase
          .from('trip_locations')
          .select('*')
          .eq('trip_id', trip.id)
          .order('timestamp', { ascending: false })
          .limit(1);

        if (locError) {
          console.error(`Error fetching location for trip ${trip.id}:`, locError);
          continue;
        }

        if (locations && locations.length > 0 && trip.drivers && trip.vehicles) {
          markers.push({
            driver: trip.drivers as unknown as Driver,
            trip: trip as Trip,
            vehicle: trip.vehicles as unknown as Vehicle,
            location: locations[0] as TripLocation
          });
        }
      }

      setDriverMarkers(markers);
      setLoading(false);

      // Auto-center map on first marker if available
      if (markers.length > 0 && !selectedDriver) {
        setMapCenter({
          lat: markers[0].location.latitude,
          lon: markers[0].location.longitude
        });
      }
    } catch (err) {
      console.error('Error fetching driver locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load driver locations');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDriverLocations();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDriverLocations();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Focus on selected driver
  const focusOnDriver = (marker: DriverMarker) => {
    setSelectedDriver(marker.driver.id);
    setMapCenter({
      lat: marker.location.latitude,
      lon: marker.location.longitude
    });
    setZoomLevel(15);
  };

  // Calculate map bounds for all markers
  const fitAllMarkers = () => {
    if (driverMarkers.length === 0) return;

    const lats = driverMarkers.map(m => m.location.latitude);
    const lons = driverMarkers.map(m => m.location.longitude);

    const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
    const centerLon = (Math.max(...lons) + Math.min(...lons)) / 2;

    setMapCenter({ lat: centerLat, lon: centerLon });
    setZoomLevel(10);
    setSelectedDriver(null);
  };

  // Get time ago string
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const locationTime = new Date(timestamp);
    const diffMs = now.getTime() - locationTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Driver Tracking</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time location tracking for active trips
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDriverLocations()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-white' : 'bg-gray-600'}`}></span>
            Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 dark:text-red-300 font-medium">Error loading locations</p>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* No Active Trips */}
      {!error && driverMarkers.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            No Active Tracking
          </h3>
          <p className="text-yellow-700 dark:text-yellow-400">
            No drivers are currently being tracked. Tracking starts when a trip is marked as "In Progress" and the driver starts tracking.
          </p>
        </div>
      )}

      {/* Map and Driver List */}
      {driverMarkers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Display */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Map View</h3>
                <div className="flex gap-2">
                  <button
                    onClick={fitAllMarkers}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    Fit All
                  </button>
                  <button
                    onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 18))}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 5))}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    -
                  </button>
                </div>
              </div>
              
              {/* Interactive Map Display */}
              <div 
                ref={mapContainerRef}
                className="relative bg-gray-100 dark:bg-gray-700"
                style={{ height: '600px' }}
              >
                {/* OSM Map iframe */}
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lon - 0.05},${mapCenter.lat - 0.05},${mapCenter.lon + 0.05},${mapCenter.lat + 0.05}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lon}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Driver Location Map"
                ></iframe>

                {/* Marker Overlays - Positioned absolutely */}
                <div className="absolute inset-0 pointer-events-none">
                  {driverMarkers.map((marker) => {
                    // Simple position calculation (this is approximate)
                    const xPercent = ((marker.location.longitude - (mapCenter.lon - 0.05)) / 0.1) * 100;
                    const yPercent = ((mapCenter.lat + 0.05 - marker.location.latitude) / 0.1) * 100;

                    return (
                      <div
                        key={marker.driver.id}
                        className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto"
                        style={{ 
                          left: `${xPercent}%`, 
                          top: `${yPercent}%`,
                          zIndex: selectedDriver === marker.driver.id ? 20 : 10
                        }}
                      >
                        <div 
                          onClick={() => focusOnDriver(marker)}
                          className={`cursor-pointer transition-transform hover:scale-110 ${
                            selectedDriver === marker.driver.id ? 'scale-125' : ''
                          }`}
                        >
                          {/* Vehicle Icon */}
                          <div className={`relative ${
                            selectedDriver === marker.driver.id 
                              ? 'text-blue-600' 
                              : 'text-red-600'
                          }`}>
                            <svg className="w-8 h-8 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                            </svg>
                            {/* Pulse animation for active tracking */}
                            <span className="absolute top-0 right-0 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Driver List */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Active Drivers ({driverMarkers.length})
              </h3>

              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {driverMarkers.map((marker) => {
                  const timeAgo = getTimeAgo(marker.location.timestamp);
                  const isRecent = new Date().getTime() - new Date(marker.location.timestamp).getTime() < 120000; // < 2 min

                  return (
                    <div
                      key={marker.driver.id}
                      onClick={() => focusOnDriver(marker)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedDriver === marker.driver.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      {/* Driver Info */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {marker.driver.full_name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {marker.vehicle.make} {marker.vehicle.model} ({marker.vehicle.plate_number})
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isRecent
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isRecent ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          {isRecent ? 'Live' : 'Delayed'}
                        </span>
                      </div>

                      {/* Trip Info */}
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-start gap-1">
                          <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="line-clamp-1">{marker.trip.origin} → {marker.trip.destination}</span>
                        </div>
                      </div>

                      {/* Location Data */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500 dark:text-gray-500">Speed:</span>
                          <span className="ml-1 text-gray-900 dark:text-white font-medium">
                            {marker.location.speed ? `${Math.round(marker.location.speed)} km/h` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-500">Accuracy:</span>
                          <span className="ml-1 text-gray-900 dark:text-white font-medium">
                            ±{Math.round(marker.location.accuracy || 0)}m
                          </span>
                        </div>
                      </div>

                      {/* Last Update */}
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Updated {timeAgo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {driverMarkers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{driverMarkers.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Drivers</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(driverMarkers.reduce((sum, m) => sum + (m.location.speed || 0), 0) / driverMarkers.length)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Speed (km/h)</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{driverMarkers.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Trips</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {autoRefresh ? '30s' : 'Manual'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Refresh Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
