import { useState } from 'react';
import { Maintenance } from '../types';
import { Button, Badge } from './ui';

// Format currency with Php prefix
const formatCurrency = (amount: number): string => {
  return `Php ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface MaintenanceTableProps {
  maintenances: Maintenance[];
  vehicles: Array<{ id: string; plate_number: string; conduction_number?: string; model: string; make: string }>;
  onMarkCompleted: (id: string) => void;
  onEdit: (maintenance: Maintenance) => void;
  onDelete: (id: string) => void;
}

export default function MaintenanceTable({ maintenances, vehicles, onMarkCompleted, onEdit, onDelete }: MaintenanceTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'N/A';
    
    const identifier = vehicle.plate_number || vehicle.conduction_number || 'Unknown';
    return `${identifier} - ${vehicle.make} ${vehicle.model}`;
  };

  // Filter maintenances based on vehicle search query
  const filteredMaintenances = maintenances.filter((maintenance) => {
    if (!searchQuery) return true;
    
    const vehicle = vehicles.find(v => v.id === maintenance.vehicle_id);
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

  if (maintenances.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elevated mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-1">No maintenance records</h3>
        <p className="text-text-secondary">Schedule your first maintenance task</p>
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
            Found {filteredMaintenances.length} maintenance{filteredMaintenances.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-muted">
          <thead className="bg-bg-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Maintenance Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Scheduled Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-bg-secondary divide-y divide-border-muted">
            {filteredMaintenances.length === 0 && searchQuery ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No maintenance records found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria</p>
                </td>
              </tr>
            ) : null}
            {filteredMaintenances.map((maintenance) => (
              <tr 
                key={maintenance.id} 
                className="hover:bg-bg-elevated transition-colors cursor-pointer"
                onDoubleClick={() => onEdit(maintenance)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                  {getVehiclePlate(maintenance.vehicle_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary capitalize">
                  {maintenance.maintenance_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {maintenance.scheduled_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={maintenance.status === 'completed' ? 'success' : 'warning'}>
                    {maintenance.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-mono">
                  {maintenance.cost ? formatCurrency(maintenance.cost) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-text-primary max-w-xs truncate">
                  {maintenance.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => onEdit(maintenance)}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                    {maintenance.status === 'pending' && (
                      <Button
                        onClick={() => onMarkCompleted(maintenance.id)}
                        variant="primary"
                        size="sm"
                      >
                        Complete
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(maintenance.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
