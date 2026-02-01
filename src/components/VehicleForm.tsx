import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { Input, Select, Button } from './ui';

interface VehicleFormProps {
  onSave: (vehicle: Omit<Vehicle, 'id'>) => void;
  onUpdate?: (vehicle: Vehicle) => void;
  initialData?: Vehicle;
  viewOnly?: boolean;
}

export default function VehicleForm({ onSave, onUpdate, initialData, viewOnly = false }: VehicleFormProps) {
  const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>({
    plate_number: initialData?.plate_number || '',
    conduction_number: initialData?.conduction_number || '',
    make: initialData?.make || '',
    model: initialData?.model || '',
    variant: initialData?.variant || '',
    year: initialData?.year || new Date().getFullYear(),
    vin: initialData?.vin || '',
    engine_number: initialData?.engine_number || '',
    fuel_capacity: initialData?.fuel_capacity || undefined,
    ownership_type: initialData?.ownership_type || 'Internal',
    status: initialData?.status || 'active',
    insurance_expiry: initialData?.insurance_expiry || '',
    registration_expiry: initialData?.registration_expiry || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        plate_number: initialData.plate_number,
        conduction_number: initialData.conduction_number || '',
        make: initialData.make,
        model: initialData.model,
        variant: initialData.variant || '',
        year: initialData.year,
        vin: initialData.vin,
        engine_number: initialData.engine_number || '',
        fuel_capacity: initialData.fuel_capacity || undefined,
        ownership_type: initialData.ownership_type,
        status: initialData.status,
        insurance_expiry: initialData.insurance_expiry,
        registration_expiry: initialData.registration_expiry,
      });
    } else {
      setFormData({
        plate_number: '',
        conduction_number: '',
        make: '',
        model: '',
        variant: '',
        year: new Date().getFullYear(),
        vin: '',
        engine_number: '',
        fuel_capacity: undefined,
        ownership_type: 'Internal',
        status: 'active',
        insurance_expiry: '',
        registration_expiry: '',
      });
    }
  }, [initialData]);

  // Auto-calculate registration expiry when plate_number or year changes
  useEffect(() => {
    if (formData.plate_number && formData.year) {
      const calculatedExpiry = calculateRegistrationExpiry(formData.plate_number, formData.year);
      if (calculatedExpiry && calculatedExpiry !== formData.registration_expiry) {
        setFormData(prev => ({
          ...prev,
          registration_expiry: calculatedExpiry,
        }));
      }
    }
  }, [formData.plate_number, formData.year]);

  // Calculate LTO registration expiry based on plate number and vehicle age
  const calculateRegistrationExpiry = (plateNumber: string, modelYear: number): string => {
    if (!plateNumber || !modelYear) return '';

    // Extract last digit (for month) - search for last digit in plate number
    const digits = plateNumber.match(/\d/g);
    if (!digits || digits.length === 0) return '';

    const lastDigit = parseInt(digits[digits.length - 1]);
    
    // Month mapping based on last digit
    const monthMap: { [key: number]: number } = {
      1: 0,  // January (0-indexed)
      2: 1,  // February
      3: 2,  // March
      4: 3,  // April
      5: 4,  // May
      6: 5,  // June
      7: 6,  // July
      8: 7,  // August
      9: 8,  // September
      0: 9,  // October
    };

    const month = monthMap[lastDigit];
    if (month === undefined) return '';

    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - modelYear;

    let expiryYear: number;
    
    // If vehicle age > 3 years, use current year
    if (vehicleAge > 3) {
      expiryYear = currentYear;
    } else {
      // If vehicle age <= 3 years, use model year + 3
      expiryYear = modelYear + 3;
    }

    // Get last day of the target month
    const lastDayOfMonth = new Date(expiryYear, month + 1, 0).getDate();
    const expiryDate = new Date(expiryYear, month, lastDayOfMonth);
    
    // Format as YYYY-MM-DD for date input
    return expiryDate.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue: any = value;
    
    if (name === 'year') {
      updatedValue = parseInt(value);
    } else if (name === 'fuel_capacity') {
      updatedValue = value ? parseFloat(value) : undefined;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    if (initialData && onUpdate) {
      onUpdate({ 
        ...formData, 
        id: initialData.id,
        created_at: initialData.created_at,
        updated_at: initialData.updated_at,
      });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Input
          label="Plate Number"
          type="text"
          name="plate_number"
          value={formData.plate_number}
          onChange={handleChange}
          required
          disabled={viewOnly}
        />

        <Input
          label="Conduction Number"
          type="text"
          name="conduction_number"
          value={formData.conduction_number}
          onChange={handleChange}
          helperText="(Use when plate not available)"
          disabled={viewOnly}
        />

        <Input
          label="Make"
          type="text"
          name="make"
          value={formData.make}
          onChange={handleChange}
          required
          disabled={viewOnly}
        />

        <Input
          label="Model"
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
          disabled={viewOnly}
        />

        <Input
          label="Variant"
          type="text"
          name="variant"
          value={formData.variant || ''}
          onChange={handleChange}
          placeholder="e.g., Sport, Deluxe, Base"
          disabled={viewOnly}
        />

        <Input
          label="Year"
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
          disabled={viewOnly}
        />

        <Input
          label="VIN"
          type="text"
          name="vin"
          value={formData.vin}
          onChange={handleChange}
          required
          disabled={viewOnly}
        />

        <Input
          label="Engine Number"
          type="text"
          name="engine_number"
          value={formData.engine_number || ''}
          onChange={handleChange}
          disabled={viewOnly}
        />

        <Input
          label="Fuel Capacity (Liters)"
          type="number"
          name="fuel_capacity"
          value={formData.fuel_capacity || ''}
          onChange={handleChange}
          step="0.1"
          min="0"
          placeholder="e.g., 60"
          disabled={viewOnly}
        />

        <Select
          label="Ownership Type"
          name="ownership_type"
          value={formData.ownership_type}
          onChange={handleChange}
          options={[
            { value: 'Internal', label: 'Internal' },
            { value: 'Leased', label: 'Leased' },
            { value: 'Leased to Own', label: 'Leased to Own' },
            { value: 'Shuttle', label: 'Shuttle' }
          ]}
          disabled={viewOnly}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'active', label: 'active' },
            { value: 'maintenance', label: 'maintenance' },
            { value: 'disposed', label: 'disposed' }
          ]}
          disabled={viewOnly}
        />

        <Input
          label="Insurance Expiry"
          type="date"
          name="insurance_expiry"
          value={formData.insurance_expiry}
          onChange={handleChange}
          disabled={viewOnly}
        />

        <div>
          <Input
            label="Registration Expiry"
            type="date"
            name="registration_expiry"
            value={formData.registration_expiry}
            onChange={handleChange}
            helperText="Auto-calculated by LTO rules"
            className="bg-bg-elevated"
            title="Automatically calculated based on plate number and vehicle age"
            disabled={viewOnly}
          />
          {formData.plate_number && formData.year && formData.registration_expiry && (
            <p className="text-xs text-emerald-500 mt-1">
              ✓ Calculated based on plate ending and vehicle age
            </p>
          )}
        </div>
      </div>

      {!viewOnly && (
        <div className="mt-6 pt-6 border-t border-border-muted flex justify-end gap-3">
          <Button type="submit" variant="primary">
            {initialData ? 'Update Vehicle' : 'Save Vehicle'}
          </Button>
        </div>
      )}
      {viewOnly && (
        <div className="mt-6 pt-6 border-t border-border-muted">
          <p className="text-sm text-text-secondary text-center">
            <svg className="inline-block w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This vehicle was disposed and cannot be edited
          </p>
        </div>
      )}
    </form>
  );
}

