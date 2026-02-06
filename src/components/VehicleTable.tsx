import { useState } from 'react';
import { Vehicle } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from './ui';
import Modal from './Modal';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onDispose: (vehicleId: string, disposalReason: string, currentMileage: number) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
}

export default function VehicleTable({ vehicles, onDispose, onEdit, onDelete }: VehicleTableProps) {
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [disposalReason, setDisposalReason] = useState<string>('end_of_life');
  const [currentMileage, setCurrentMileage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDispose = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDisposalReason('end_of_life');
    setCurrentMileage(0);
    setIsDisposalModalOpen(true);
  };

  const handleSubmitDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVehicle) {
      onDispose(selectedVehicle.id, disposalReason, currentMileage);
      setIsDisposalModalOpen(false);
      setSelectedVehicle(null);
    }
  };

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const plateNumber = vehicle.plate_number?.toLowerCase() || '';
    const conductionNumber = vehicle.conduction_number?.toLowerCase() || '';
    const make = vehicle.make?.toLowerCase() || '';
    const model = vehicle.model?.toLowerCase() || '';
    const vin = vehicle.vin?.toLowerCase() || '';
    
    return plateNumber.includes(searchLower) ||
           conductionNumber.includes(searchLower) ||
           make.includes(searchLower) ||
           model.includes(searchLower) ||
           vin.includes(searchLower);
  });

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elevated mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-1">No vehicles found</h3>
        <p className="text-text-secondary">Get started by adding your first vehicle to the fleet</p>
      </div>
    );
  }

  return (
    <>
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
          placeholder="Search by plate number, conduction number, make, model, VIN..."
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
          Found {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </p>
      )}
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plate Number</TableHead>
          <TableHead>Conduction #</TableHead>
          <TableHead>Make</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Variant</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>VIN</TableHead>
          <TableHead>Fuel Capacity</TableHead>
          <TableHead>Ownership Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Insurance Expiry</TableHead>
          <TableHead>Registration Expiry</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredVehicles.length === 0 && searchQuery ? (
          <TableRow>
            <TableCell colSpan={13} className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No vehicles found</h3>
              <p className="text-slate-600">Try adjusting your search criteria</p>
            </TableCell>
          </TableRow>
        ) : null}
        {filteredVehicles.map((vehicle) => (
          <TableRow
            key={vehicle.id}
            className="cursor-pointer"
            onDoubleClick={() => onEdit(vehicle)}
            title="Double-click to edit"
          >
            <TableCell className="font-medium">
              {vehicle.plate_number}
            </TableCell>
            <TableCell className="font-mono">
              {vehicle.conduction_number || '-'}
            </TableCell>
            <TableCell>
              {vehicle.make}
            </TableCell>
            <TableCell>
              {vehicle.model}
            </TableCell>
            <TableCell>
              {vehicle.variant || '-'}
            </TableCell>
            <TableCell>
              {vehicle.year}
            </TableCell>
            <TableCell className="font-mono">
              {vehicle.vin}
            </TableCell>
            <TableCell>
              {vehicle.fuel_capacity ? `${vehicle.fuel_capacity} L` : '-'}
            </TableCell>
            <TableCell className="capitalize">
              {vehicle.ownership_type}
            </TableCell>
            <TableCell>
              <Badge variant={
                vehicle.status === 'disposed' ? 'danger' :
                vehicle.status === 'active' ? 'success' :
                vehicle.status === 'maintenance' ? 'warning' :
                'default'
              }>
                {vehicle.status}
              </Badge>
            </TableCell>
            <TableCell>
              {vehicle.insurance_expiry}
            </TableCell>
            <TableCell>
              {vehicle.registration_expiry}
            </TableCell>
            <TableCell className="text-right space-x-2">
              {vehicle.status !== 'disposed' && (
                <>
                  <Button
                    onClick={() => onEdit(vehicle)}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDispose(vehicle)}
                    variant="ghost"
                    size="sm"
                  >
                    Dispose
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete ${vehicle.plate_number || vehicle.conduction_number}?`)) {
                        onDelete(vehicle.id);
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Disposal Request Modal */}
    <Modal 
      isOpen={isDisposalModalOpen} 
      onClose={() => {
        setIsDisposalModalOpen(false);
        setSelectedVehicle(null);
      }} 
      title="Create Disposal Request"
    >
      <form onSubmit={handleSubmitDisposal} className="space-y-4">
        <div className="bg-accent-soft border border-border-muted rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-text-primary mb-2">Vehicle Information</h4>
          {selectedVehicle && (
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Plate Number:</span> {selectedVehicle.plate_number}
              </p>
              {selectedVehicle.conduction_number && (
                <p className="text-sm text-text-secondary">
                  <span className="font-medium">Conduction Number:</span> {selectedVehicle.conduction_number}
                </p>
              )}
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Vehicle:</span> {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
              </p>
              <p className="text-sm text-text-secondary">
                <span className="font-medium">VIN:</span> {selectedVehicle.vin}
              </p>
            </div>
          )}
        </div>

        <div>
          <Select
            label={<>Reason for Disposal <span className="text-red-600">*</span></>}
            value={disposalReason}
            onChange={(e) => setDisposalReason(e.target.value)}
            required
          >
            <option value="end_of_life">End of Life</option>
            <option value="excessive_maintenance">Excessive Maintenance</option>
            <option value="accident_damage">Accident Damage</option>
            <option value="upgrade">Upgrade</option>
            <option value="policy_change">Policy Change</option>
          </Select>
        </div>

        <div>
          <Input
            label={<>Current Mileage (km) <span className="text-red-600">*</span></>}
            type="number"
            value={currentMileage}
            onChange={(e) => setCurrentMileage(parseInt(e.target.value))}
            required
            min="0"
            step="1"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => {
              setIsDisposalModalOpen(false);
              setSelectedVehicle(null);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit Disposal Request
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
}
