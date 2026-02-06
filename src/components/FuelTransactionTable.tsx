// Fuel Transaction Table - Defined per fuel-tracking-module.md
import { useState } from 'react';
import { FuelTransaction, Vehicle, Driver } from '../types';
import { Button, Badge } from './ui';
// Format number with thousand separators
const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format currency with Php prefix
const formatCurrency = (amount: number): string => {
  return `Php ${formatNumber(amount, 2)}`;
};
interface FuelTransactionTableProps {
  transactions: FuelTransaction[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onEdit: (transaction: FuelTransaction) => void;
  onDelete: (id: string) => void;
  onViewEfficiency: () => void;
}

export default function FuelTransactionTable({ 
  transactions, 
  vehicles, 
  drivers, 
  onEdit, 
  onDelete
}: FuelTransactionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.plate_number}${vehicle.conduction_number ? ` (${vehicle.conduction_number})` : ''}` : 'N/A';
  };

  const getDriverInfo = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.full_name : 'N/A';
  };

  // Action: Delete Transaction (danger, confirmation required)
  const handleDelete = (transaction: FuelTransaction) => {
    if (window.confirm(`Delete fuel transaction for ${getVehicleInfo(transaction.vehicle_id)}?`)) {
      onDelete(transaction.id);
    }
  };

  // Filter transactions based on vehicle search query
  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true;
    
    const vehicle = vehicles.find(v => v.id === transaction.vehicle_id);
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No fuel transactions</h3>
        <p className="text-slate-600">Start tracking fuel usage by adding transactions</p>
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
            Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-muted">
          <thead className="bg-bg-elevated">
            <tr>
              {/* Columns per Fuel Transaction Table definition */}
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Odometer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Liters
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Cost/L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Fuel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Station
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-bg-secondary divide-y divide-border-muted">
            {filteredTransactions.length === 0 && searchQuery ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No transactions found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria</p>
                </td>
              </tr>
            ) : null}
            {filteredTransactions.map((transaction) => (
              <tr 
                key={transaction.id} 
                className="hover:bg-bg-elevated transition-colors cursor-pointer"
                onDoubleClick={() => onEdit(transaction)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                  {getVehicleInfo(transaction.vehicle_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {getDriverInfo(transaction.driver_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {formatNumber(transaction.odometer_reading, 0)} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {formatNumber(transaction.liters, 2)} L
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {formatCurrency(transaction.cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {formatCurrency(transaction.cost_per_liter)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={
                    transaction.fuel_type === 'diesel' ? 'warning' :
                    transaction.fuel_type === 'petrol' ? 'accent' :
                    transaction.fuel_type === 'electric' ? 'success' :
                    'default'
                  }>
                    {transaction.fuel_type}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {transaction.station_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Action: Edit Transaction */}
                    <Button
                      onClick={() => onEdit(transaction)}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                    {/* Action: Delete Transaction (danger) */}
                    <Button
                      onClick={() => handleDelete(transaction)}
                      variant="danger"
                      size="sm"
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
