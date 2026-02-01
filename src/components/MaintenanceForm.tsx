import React, { useState, useEffect } from 'react';
import { Maintenance } from '../types';
import { Input, Select, Textarea, Button } from './ui';

interface MaintenanceFormProps {
  onSchedule: (maintenance: Omit<Maintenance, 'id'>) => void;
  onUpdate?: (maintenance: Maintenance) => void;
  vehicles: Array<{ id: string; plate_number: string; conduction_number?: string; model: string; make: string }>;
  initialData?: Maintenance;
}

export default function MaintenanceForm({ onSchedule, onUpdate, vehicles, initialData }: MaintenanceFormProps) {
  const [formData, setFormData] = useState<Omit<Maintenance, 'id'>>({
    vehicle_id: initialData?.vehicle_id || '',
    maintenance_type: initialData?.maintenance_type || 'preventive',
    scheduled_date: initialData?.scheduled_date || '',
    status: initialData?.status || 'pending',
    cost: initialData?.cost || undefined,
    description: initialData?.description || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicle_id: initialData.vehicle_id,
        maintenance_type: initialData.maintenance_type,
        scheduled_date: initialData.scheduled_date,
        status: initialData.status,
        cost: initialData.cost,
        description: initialData.description || '',
      });
    } else {
      setFormData({
        vehicle_id: '',
        maintenance_type: 'preventive',
        scheduled_date: '',
        status: 'pending',
        cost: undefined,
        description: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData && onUpdate) {
      onUpdate({ ...formData, id: initialData.id });
    } else {
      onSchedule(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Select
            label={<>Vehicle <span className="text-red-600">*</span></>}
            name="vehicle_id"
            value={formData.vehicle_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => {
              const identifier = vehicle.plate_number || vehicle.conduction_number || 'Unknown';
              const displayText = `${identifier} - ${vehicle.make} ${vehicle.model}`;
              return (
                <option key={vehicle.id} value={vehicle.id}>
                  {displayText}
                </option>
              );
            })}
          </Select>
        </div>

        <div>
          <Select
            label="Maintenance Type"
            name="maintenance_type"
            value={formData.maintenance_type}
            onChange={handleChange}
          >
            <option value="preventive">preventive</option>
            <option value="repair">repair</option>
          </Select>
        </div>

        <div>
          <Input
            label="Scheduled Date"
            type="date"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <Input
            label="Cost"
            type="number"
            name="cost"
            value={formData.cost || ''}
            onChange={handleChange}
            step="0.01"
          />
        </div>
      </div>

      <div>
        <Textarea
          label="Description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          placeholder="Enter maintenance details, notes, or observations..."
        />
      </div>

      <div className="mt-6 pt-6 border-t border-border-muted flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
        >
          Schedule Maintenance
        </Button>
      </div>
    </form>
  );
}

