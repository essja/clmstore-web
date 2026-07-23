import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `Le ${amount.toLocaleString('en-SL', { maximumFractionDigits: 0 })}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatDate(dateStr);
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    accepted: 'Rider Assigned',
    on_the_way: 'On the Way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };
  return labels[status] ?? status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-purple-100 text-purple-800',
    accepted: 'bg-indigo-100 text-indigo-800',
    on_the_way: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    failed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

export function getDeliveryEta(estimatedMin: number): string {
  if (estimatedMin < 60) return `${estimatedMin} min`;
  const hrs = Math.floor(estimatedMin / 60);
  const mins = estimatedMin % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function isOrderActive(status: string): boolean {
  return ['pending', 'confirmed', 'preparing', 'ready', 'accepted', 'on_the_way'].includes(status);
}
