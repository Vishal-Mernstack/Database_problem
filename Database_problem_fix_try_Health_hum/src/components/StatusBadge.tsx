import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  | 'pending' | 'paid' | 'partial'
  | 'requested' | 'sample-collected' | 'processing'
  | 'available' | 'occupied' | 'maintenance'
  | 'passed' | 'failed'
  | 'approved' | 'rejected' | 'fulfilled'
  | 'stored' | 'expired' | 'issued' | 'disposed';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  // Appointment statuses
  'scheduled': { label: 'Scheduled', variant: 'secondary' },
  'in-progress': { label: 'In Progress', variant: 'default' },
  'completed': { label: 'Completed', variant: 'outline' },
  'cancelled': { label: 'Cancelled', variant: 'destructive' },
  
  // Bill statuses
  'pending': { label: 'Pending', variant: 'secondary' },
  'paid': { label: 'Paid', variant: 'outline' },
  'partial': { label: 'Partial', variant: 'secondary' },
  
  // Lab test statuses
  'requested': { label: 'Requested', variant: 'secondary' },
  'sample-collected': { label: 'Sample Collected', variant: 'default' },
  'processing': { label: 'Processing', variant: 'default' },
  
  // Bed statuses
  'available': { label: 'Available', variant: 'outline' },
  'occupied': { label: 'Occupied', variant: 'default' },
  'maintenance': { label: 'Maintenance', variant: 'destructive' },
  
  // Blood bank statuses
  'passed': { label: 'Passed', variant: 'outline' },
  'failed': { label: 'Failed', variant: 'destructive' },
  'approved': { label: 'Approved', variant: 'outline' },
  'rejected': { label: 'Rejected', variant: 'destructive' },
  'fulfilled': { label: 'Fulfilled', variant: 'outline' },
  'stored': { label: 'Stored', variant: 'default' },
  'expired': { label: 'Expired', variant: 'destructive' },
  'issued': { label: 'Issued', variant: 'secondary' },
  'disposed': { label: 'Disposed', variant: 'destructive' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  
  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  );
}
