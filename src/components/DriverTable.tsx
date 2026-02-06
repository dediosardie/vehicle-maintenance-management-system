import { useState } from 'react';
import { Driver } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from './ui';

interface DriverTableProps {
  drivers: Driver[];
  onSuspend: (id: string) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (id: string) => void;
}

export default function DriverTable({ drivers, onSuspend, onEdit, onDelete }: DriverTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSuspend = (driver: Driver) => {
    if (window.confirm(`Are you sure you want to suspend driver ${driver.full_name}?`)) {
      onSuspend(driver.id);
    }
  };

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter((driver) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const fullName = driver.full_name?.toLowerCase() || '';
    const licenseNumber = driver.license_number?.toLowerCase() || '';
    const phone = driver.phone?.toLowerCase() || '';
    
    return fullName.includes(searchLower) ||
           licenseNumber.includes(searchLower) ||
           phone.includes(searchLower);
  });

  if (drivers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elevated mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-1">No drivers found</h3>
        <p className="text-text-secondary">Add your first driver to get started</p>
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
            placeholder="Search by name, license number, or phone..."
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
            Found {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>License Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.length === 0 && searchQuery ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No drivers found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria</p>
                </TableCell>
              </TableRow>
            ) : null}
            {filteredDrivers.map((driver) => (
              <TableRow 
                key={driver.id}
                onDoubleClick={() => onEdit(driver)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">
                  {driver.full_name}
                </TableCell>
                <TableCell className="font-mono">
                  {driver.license_number}
                </TableCell>
                <TableCell>
                  {driver.phone || '—'}
                </TableCell>
                <TableCell>
                  {driver.license_expiry}
                </TableCell>
                <TableCell>
                  <Badge variant={driver.status === 'active' ? 'success' : 'warning'}>
                    {driver.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    onClick={() => onEdit(driver)}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleSuspend(driver)}
                    variant="ghost"
                    size="sm"
                  >
                    Suspend
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete driver ${driver.full_name}?`)) {
                        onDelete(driver.id);
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
