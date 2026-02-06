// Trip Table Component - Defined per trip-scheduling-module.md
import { useState } from 'react';
import { Trip, Vehicle, Driver } from '../types';
import { Button, Badge } from './ui';

interface TripTableProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onEdit: (trip: Trip) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onViewRoute: (trip: Trip) => void;
}

export default function TripTable({ 
  trips, 
  vehicles, 
  drivers, 
  onEdit, 
  onStart, 
  onComplete, 
  onCancel,
  onViewRoute 
}: TripTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Helper functions to display related data
  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.plate_number}${vehicle.conduction_number ? ` (${vehicle.conduction_number})` : ''}` : 'N/A';
  };

  const getDriverInfo = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.full_name : 'N/A';
  };

  // Action: Start Trip (success, updates status to in_progress, records actual_departure)
  const handleStart = (trip: Trip) => {
    if (window.confirm(`Start trip to ${trip.destination}?`)) {
      onStart(trip.id);
    }
  };

  // Action: Complete Trip (success, updates status to completed, records actual_arrival)
  const handleComplete = (trip: Trip) => {
    if (window.confirm(`Mark trip to ${trip.destination} as completed?`)) {
      onComplete(trip.id);
    }
  };

  // Action: Cancel Trip (danger, confirmation required)
  const handleCancel = (trip: Trip) => {
    if (window.confirm(`Are you sure you want to cancel this trip to ${trip.destination}?`)) {
      onCancel(trip.id);
    }
  };

  // Filter trips based on vehicle search query
  const filteredTrips = trips.filter((trip) => {
    if (!searchQuery) return true;
    
    const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
    if (!vehicle) return false;
    
    const searchLower = searchQuery.toLowerCase();
    const plateNumber = vehicle.plate_number?.toLowerCase() || '';
    const conductionNumber = vehicle.conduction_number?.toLowerCase() || '';
    const make = vehicle.make?.toLowerCase() || '';
    const model = vehicle.model?.toLowerCase() || '';
    
    return plateNumber.includes(searchLower) ||
           conductionNumber.includes(searchLower) ||
           make.includes(searchLower) ||
           model.includes(searchLower);
  });

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elevated mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-1">No trips scheduled</h3>
        <p className="text-text-secondary">Get started by creating your first trip</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Search Filter */}
      <div className="mb-4 px-6 pt-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by vehicle (plate number, conduction number, make, model)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border-muted rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
              title="Clear search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-text-secondary">
            Found {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-muted">
          <thead className="bg-bg-elevated">
            <tr>
              {/* Columns match Trip Table definition in markdown */}
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Distance (km)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Origin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Planned Departure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Planned Arrival
              </th>



            </tr>
          </thead>
          <tbody className="bg-bg-secondary divide-y divide-border-muted">
            {filteredTrips.length === 0 && searchQuery ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No trips found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria</p>
                </td>
              </tr>
            ) : null}
            {filteredTrips.map((trip) => (
              <tr 
                key={trip.id} 
                className="hover:bg-bg-elevated transition-colors cursor-pointer"
                onDoubleClick={() => onEdit(trip)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {/* Status enum(planned, in_progress, completed, cancelled) */}
                  <Badge variant={
                    trip.status === 'planned' ? 'accent' :
                    trip.status === 'in_progress' ? 'warning' :
                    trip.status === 'completed' ? 'success' :
                    'default'
                  }>
                    {trip.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {/* Actions based on status per markdown */}
                  {trip.status === 'planned' && (
                    <>
                      {/* Update Trip (primary, submit) */}
                      <Button
                        onClick={() => onEdit(trip)}
                        variant="ghost"
                        size="sm"
                        title="Edit"
                      >
                        Edit
                      </Button>
                      {/* Start Trip (success) */}
                      <Button
                        onClick={() => handleStart(trip)}
                        variant="primary"
                        size="sm"
                        title="Start Trip"
                      >
                        Start
                      </Button>
                      {/* Cancel Trip (danger) */}
                      <Button
                        onClick={() => handleCancel(trip)}
                        variant="ghost"
                        size="sm"
                        title="Cancel"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {trip.status === 'in_progress' && (
                    <>
                      {/* Complete Trip (success) */}
                      <Button
                        onClick={() => handleComplete(trip)}
                        variant="primary"
                        size="sm"
                        title="Complete Trip"
                      >
                        Complete
                      </Button>
                      {/* View Route Map (secondary) */}
                      <Button
                        onClick={() => onViewRoute(trip)}
                        variant="ghost"
                        size="sm"
                        title="View Route"
                      >
                        Route
                      </Button>
                    </>
                  )}
                  {(trip.status === 'completed' || trip.status === 'cancelled') && (
                    <Button
                      onClick={() => onViewRoute(trip)}
                      variant="ghost"
                      size="sm"
                      title="View Details"
                    >
                      View
                    </Button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {getVehicleInfo(trip.vehicle_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {getDriverInfo(trip.driver_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {trip.distance_km.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {trip.origin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {trip.destination}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {new Date(trip.planned_departure).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {new Date(trip.planned_arrival).toLocaleString()}
                </td>
                

                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
