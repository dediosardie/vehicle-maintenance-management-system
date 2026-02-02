// Trip Table Component - Defined per trip-scheduling-module.md
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
            {trips.map((trip) => (
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
