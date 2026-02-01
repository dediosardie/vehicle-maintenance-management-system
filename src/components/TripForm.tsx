// Trip Form Component - Defined per trip-scheduling-module.md
import React, { useState, useEffect } from 'react';
import { Trip, Vehicle, Driver, Maintenance } from '../types';import { Input, Select, Textarea, Button } from './ui';
interface TripFormProps {
  onSave: (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdate?: (trip: Trip) => void;
  initialData?: Trip;
  vehicles: Vehicle[];
  drivers: Driver[];
  maintenances: Maintenance[];
}

// TODO: Replace with your Google Maps API key
// Get your API key from: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

export default function TripForm({ onSave, onUpdate, initialData, vehicles, drivers, maintenances }: TripFormProps) {
  const [formData, setFormData] = useState<Omit<Trip, 'id' | 'created_at' | 'updated_at'>>({
    vehicle_id: initialData?.vehicle_id || '',
    driver_id: initialData?.driver_id || '',
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    planned_departure: initialData?.planned_departure || '',
    planned_arrival: initialData?.planned_arrival || '',
    actual_departure: initialData?.actual_departure,
    actual_arrival: initialData?.actual_arrival,
    status: initialData?.status || 'planned',
    distance_km: initialData?.distance_km || 0,
    estimated_fuel_consumption: initialData?.estimated_fuel_consumption || 0,
    route_waypoints: initialData?.route_waypoints,
    notes: initialData?.notes,
  });

  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const [maintenanceWarning, setMaintenanceWarning] = useState<string | null>(null);

  // Filter: only active vehicles per business rules
  const activeVehicles = vehicles.filter(v => v.status !== 'disposed');

  // Check for maintenance conflicts
  useEffect(() => {
    if (!formData.vehicle_id || !formData.planned_departure) {
      setMaintenanceWarning(null);
      return;
    }

    const departureDate = new Date(formData.planned_departure).toISOString().split('T')[0];
    const vehicleMaintenance = maintenances.find(
      m => m.vehicle_id === formData.vehicle_id && 
           m.status === 'pending' && 
           m.scheduled_date === departureDate
    );

    if (vehicleMaintenance) {
      setMaintenanceWarning(
        `⚠️ Warning: This vehicle has scheduled ${vehicleMaintenance.maintenance_type} maintenance on ${vehicleMaintenance.scheduled_date}`
      );
    } else {
      setMaintenanceWarning(null);
    }
  }, [formData.vehicle_id, formData.planned_departure, maintenances]);

  // Auto-calculate distance when origin and destination are provided
  useEffect(() => {
    const calculateDistance = async () => {
      if (!formData.origin || !formData.destination) {
        setDistanceError(null);
        return;
      }

      // Skip if API key is not configured
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        setDistanceError('Google Maps API key not configured');
        return;
      }

      setIsCalculatingDistance(true);
      setDistanceError(null);

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
            formData.origin
          )}&destinations=${encodeURIComponent(
            formData.destination
          )}&units=metric&key=${GOOGLE_MAPS_API_KEY}`,
          {
            mode: 'cors',
          }
        );

        const data = await response.json();

        if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
          const distanceInMeters = data.rows[0].elements[0].distance.value;
          const distanceInKm = distanceInMeters / 1000;

          setFormData(prev => ({
            ...prev,
            distance_km: parseFloat(distanceInKm.toFixed(2)),
          }));
          setDistanceError(null);
        } else {
          setDistanceError('Could not calculate distance. Please check addresses.');
        }
      } catch (error) {
        console.error('Error calculating distance:', error);
        setDistanceError('Failed to calculate distance. Please enter manually.');
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    // Debounce: wait 1 second after user stops typing
    const timeoutId = setTimeout(() => {
      calculateDistance();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.origin, formData.destination]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicle_id: initialData.vehicle_id,
        driver_id: initialData.driver_id,
        origin: initialData.origin,
        destination: initialData.destination,
        planned_departure: initialData.planned_departure,
        planned_arrival: initialData.planned_arrival,
        actual_departure: initialData.actual_departure,
        actual_arrival: initialData.actual_arrival,
        status: initialData.status,
        distance_km: initialData.distance_km,
        estimated_fuel_consumption: initialData.estimated_fuel_consumption,
        route_waypoints: initialData.route_waypoints,
        notes: initialData.notes,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'distance_km' || name === 'estimated_fuel_consumption' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: planned arrival must be after planned departure per business rules
    if (new Date(formData.planned_arrival) <= new Date(formData.planned_departure)) {
      alert('Planned arrival must be after planned departure');
      return;
    }

    if (initialData && onUpdate) {
      onUpdate({ 
        ...formData, 
        id: initialData.id,
        created_at: initialData.created_at,
        updated_at: new Date().toISOString()
      });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {maintenanceWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{maintenanceWarning}</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        {/* Vehicle (select, required, from active vehicles) */}
        <div>
          <Select
            label={<>Vehicle <span className="text-red-600">*</span></>}
            name="vehicle_id"
            value={formData.vehicle_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Vehicle</option>
            {activeVehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate_number || vehicle.conduction_number} - {vehicle.make} {vehicle.model}
              </option>
            ))}
          </Select>
        </div>

        {/* Driver (select, required, from available drivers) */}
        <div>
          <Select
            label={<>Driver <span className="text-red-600">*</span></>}
            name="driver_id"
            value={formData.driver_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Driver</option>
            {drivers.filter(d => d.status === 'active').map(driver => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name} - {driver.license_number}
              </option>
            ))}
          </Select>
        </div>

        {/* Origin (text/autocomplete, required) */}
        <div>
          <Input
            label={<>Origin <span className="text-red-600">*</span></>}
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            required
            placeholder="Enter origin address"
          />
        </div>

        {/* Destination (text/autocomplete, required) */}
        <div>
          <Input
            label={<>Destination <span className="text-red-600">*</span></>}
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            placeholder="Enter destination address"
          />
        </div>

        {/* Planned Departure (datetime, required) */}
        <div>
          <Input
            label={<>Planned Departure <span className="text-red-600">*</span></>}
            type="datetime-local"
            name="planned_departure"
            value={formData.planned_departure}
            onChange={handleChange}
            required
          />
        </div>

        {/* Planned Arrival (datetime, required) */}
        <div>
          <Input
            label={<>Planned Arrival <span className="text-red-600">*</span></>}
            type="datetime-local"
            name="planned_arrival"
            value={formData.planned_arrival}
            onChange={handleChange}
            required
          />
        </div>

        {/* Distance (number, required, km) */}
        <div>
          <Input
            label={<>Distance (km) <span className="text-red-600">*</span></>}
            type="number"
            name="distance_km"
            value={formData.distance_km}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
            disabled={isCalculatingDistance}
            helperText="Distance auto-calculates from Google Maps"
          />
          {isCalculatingDistance && (
            <p className="mt-1 text-xs text-blue-600">Calculating...</p>
          )}
          {distanceError && (
            <p className="mt-1 text-xs text-amber-600">{distanceError}</p>
          )}
        </div>

        {/* Estimated Fuel Consumption (number, required, liters) */}
        <div>
          <Input
            label={<>Estimated Fuel Consumption (liters) <span className="text-red-600">*</span></>}
            type="number"
            name="estimated_fuel_consumption"
            value={formData.estimated_fuel_consumption}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
          />
        </div>
      </div>

      {/* Notes (textarea, optional) */}
      <div>
        <Textarea
          label="Notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Add any additional notes about the trip"
        />
      </div>

      {/* Actions: Save/Update (primary, submit) */}
      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary" size="md">
          {initialData ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
}
