'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Phone, MapPin, Clock, CheckCircle2, Circle, ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import toast from 'react-hot-toast';

const LiveMap = dynamic(() => import('@/components/map/LiveMap'), { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" /> });

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];

function StatusTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);

  const labels: Record<OrderStatus, string> = {
    pending: 'Order placed',
    accepted: 'Restaurant accepted',
    confirmed: 'Restaurant confirmed',
    preparing: 'Preparing your food',
    ready: 'Ready for delivery',
    ready_for_pickup: 'Ready for pickup',
    out_for_delivery: 'Rider on the way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const displaySteps = STATUS_STEPS.filter((s) => s !== 'cancelled');

  return (
    <div className="space-y-3">
      {displaySteps.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {done ? (
                <CheckCircle2 className={`h-5 w-5 ${active ? 'text-[#1B8C4E]' : 'text-[#1B8C4E]'}`} />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
              {idx < displaySteps.length - 1 && (
                <div className={`w-0.5 h-6 mt-1 ${idx < currentIdx ? 'bg-[#1B8C4E]' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pt-0.5">
              <p className={`text-sm font-medium ${active ? 'text-[#1A1A2E]' : done ? 'text-gray-600' : 'text-gray-300'}`}>
                {labels[step]}
              </p>
              {active && (
                <p className="text-xs text-[#1B8C4E] font-medium">In progress…</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuthStore();
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); }
  }, [isAuthenticated]);

  const { data, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(Number(id)).then((r) => r.data),
    refetchInterval: 30000,
    enabled: isAuthenticated && !!id,
  });

  const order: Order | undefined = data?.data;

  // WebSocket for live tracking
  useEffect(() => {
    if (!order || !accessToken) return;
    if (!['confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status)) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/api/v1/ws/orders/${id}/track?token=${accessToken}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'location_update') {
          setRiderLocation({ lat: msg.latitude, lng: msg.longitude });
        }
        if (msg.type === 'status_update') {
          refetch();
          toast.success(`Order status: ${getOrderStatusLabel(msg.status)}`);
        }
      } catch { /* ignore */ }
    };

    return () => { ws.close(); };
  }, [order?.id, order?.status, accessToken]);

  if (!order) {
    return (
      <div className="container-page py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#1B8C4E] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const isActive = ['confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container-page py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-black text-[#1A1A2E] text-xl">{order.order_number}</h1>
          <p className="text-xs text-gray-500">{formatDateTime(order.created_at)}</p>
        </div>
        <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full ${getOrderStatusColor(order.status)}`}>
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      {/* Live map (active deliveries) */}
      {isActive && (
        <div className="mb-5">
          <LiveMap
            orderId={Number(id)}
            riderLocation={riderLocation}
            deliveryAddress={order.delivery_address as any}
          />
        </div>
      )}

      {/* Delivered banner */}
      {isDelivered && (
        <div className="bg-[#E8F5EE] border border-[#1B8C4E]/30 rounded-2xl p-5 mb-5 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold text-[#1B8C4E] text-lg">Order Delivered!</p>
          <p className="text-sm text-gray-600 mt-1">Enjoy your meal!</p>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5 text-center">
          <p className="text-3xl mb-2">❌</p>
          <p className="font-bold text-red-600 text-lg">Order Cancelled</p>
        </div>
      )}

      {/* Status timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Order Progress</h2>
          <StatusTimeline currentStatus={order.status} />
        </div>
      )}

      {/* Rider info */}
      {order.delivery?.rider && isActive && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
          <h2 className="font-bold text-[#1A1A2E] mb-3">Your Rider</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1B8C4E] rounded-full flex items-center justify-center text-white font-bold">
              {order.delivery.rider.first_name?.[0]}
            </div>
            <div>
              <p className="font-semibold text-[#1A1A2E]">
                {order.delivery.rider.first_name} {order.delivery.rider.last_name}
              </p>
              {order.delivery.rider.phone_number && (
                <a href={`tel:${order.delivery.rider.phone_number}`} className="flex items-center gap-1 text-[#1B8C4E] text-sm mt-1">
                  <Phone className="h-3.5 w-3.5" />
                  {order.delivery.rider.phone_number}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
        <h2 className="font-bold text-[#1A1A2E] mb-4">Order Details</h2>
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.quantity}× {item.name}</span>
              <span className="font-medium">{formatCurrency(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal_amount)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery fee</span><span>{formatCurrency(order.delivery_fee)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-[#1B8C4E]">
              <span>Discount</span><span>−{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-[#1A1A2E] text-base border-t border-gray-100 pt-2 mt-1">
            <span>Total</span><span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {order.delivery_address && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Delivery Address</p>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-[#1B8C4E] mt-0.5 shrink-0" />
              <span>{(order.delivery_address as any)?.address_line1 ?? 'Saved address'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {isDelivered && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/restaurants/${order.restaurant?.slug}`)}
            className="py-3 rounded-xl border border-[#1B8C4E] text-[#1B8C4E] font-semibold text-sm hover:bg-[#E8F5EE] transition-colors"
          >
            Reorder
          </button>
          <button
            onClick={() => router.push(`/orders/${id}/review`)}
            className="py-3 rounded-xl bg-[#1B8C4E] text-white font-semibold text-sm hover:bg-[#146B3A] transition-colors"
          >
            Leave a Review
          </button>
        </div>
      )}
    </div>
  );
}
