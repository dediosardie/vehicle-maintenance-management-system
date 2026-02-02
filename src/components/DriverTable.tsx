import { Driver } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from './ui';

interface DriverTableProps {
  drivers: Driver[];
  onSuspend: (id: string) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (id: string) => void;
}

export default function DriverTable({ drivers, onSuspend, onEdit, onDelete }: DriverTableProps) {
  const handleSuspend = (driver: Driver) => {
    if (window.confirm(`Are you sure you want to suspend driver ${driver.full_name}?`)) {
      onSuspend(driver.id);
    }
  };

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
            {drivers.map((driver) => (
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
