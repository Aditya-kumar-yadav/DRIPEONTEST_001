import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Order } from '../types';
import { CheckCircle2, ArrowRight, Printer, Gift, Clock } from 'lucide-react';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchOrderById } = useApp();
  
  const orderId = searchParams.get('id') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isTerminalState = false;

    const loadConfirmDetails = async () => {
      if (!orderId) {
        navigate('/');
        return;
      }
      setLoading(true);
      const data = await fetchOrderById(orderId);
      if (data) {
        setOrder(data);
        if (data.status === 'CONFIRMED' || data.status === 'DELIVERED' || data.status === 'CANCELLED') {
          isTerminalState = true;
          if (interval) clearInterval(interval);
        }
      }
      setLoading(false);
    };

    loadConfirmDetails();

    interval = setInterval(async () => {
      if (isTerminalState) {
        clearInterval(interval);
        return;
      }
      const data = await fetchOrderById(orderId);
      if (data) {
        setOrder(data);
        if (data.status === 'CONFIRMED' || data.status === 'DELIVERED' || data.status === 'CANCELLED') {
          isTerminalState = true;
          clearInterval(interval);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex-grow pt-32 pb-24 font-sans px-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-8 h-8 text-red-600 animate-bounce mx-auto" />
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Scribing booking receipts...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-grow pt-40 pb-24 font-sans px-6 max-w-3xl mx-auto text-center min-h-screen space-y-4">
        <h1 className="font-sans text-3xl uppercase tracking-wider text-gray-900">Receipt Not Found</h1>
        <p className="text-xs text-gray-500 uppercase">We couldn't retrieve the specified order receipt at this time.</p>
        <Link to="/" className="inline-block border border-red-600 py-3 px-6 text-xs text-red-600 uppercase tracking-widest rounded-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow pt-32 pb-24 font-sans px-6 max-w-3xl mx-auto min-h-screen text-center space-y-10">
      
      {/* Celebratory Checkmark or Securing Stocks Spinner */}
      <div className="space-y-4 max-w-lg mx-auto">
        {order.status === 'PENDING' ? (
          <div className="w-16 h-16 bg-amber-500/15 border-2 border-dashed border-amber-400 rounded-full flex items-center justify-center mx-auto text-amber-400 animate-spin">
            <Clock className="w-8 h-8" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-red-600/15 border-2 border-red-600 rounded-full flex items-center justify-center mx-auto text-red-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        )}
        
        <span className="text-[10px] font-medium tracking-widest text-red-600 uppercase">
          {order.status === 'PENDING' ? '⏳ Security Reservation Checks Active' : '🎉 Payment & Stock Authorized'}
        </span>
        
        <h1 className="font-sans text-3xl sm:text-4xl text-gray-900 uppercase tracking-wide">
          {order.status === 'PENDING' ? 'Reserving Your Garments...' : 'Allocation Successful'}
        </h1>
        
        <p className="text-xs text-gray-500 uppercase tracking-wider leading-relaxed">
          {order.status === 'PENDING' ? (
            <>
              Standby, <span className="text-gray-900 font-medium">{order.shippingAddress.name}</span>. We are running security checks, allocating raw fabric, and locking your wardrobe items from New York.
            </>
          ) : (
            <>
              Thank you, <span className="text-gray-900 font-medium">{order.shippingAddress.name}</span>. Your luxury garments are booked and assigned to bespoke tailors under DRIPEON.
            </>
          )}
        </p>
      </div>

      {/* Order Credentials Card */}
      <div className="border border-gray-200 bg-gray-100/10 p-6 rounded-sm text-left grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <span className="text-[9px] font-medium text-gray-500 uppercase block">Booking ID</span>
          <span className="text-xs font-medium text-red-600 font-semibold uppercase">{order.id}</span>
        </div>
        
        <div className="space-y-1.5">
          <span className="text-[9px] font-medium text-gray-500 uppercase block">Estimated Delivery Timeline</span>
          <span className="text-xs text-gray-900 font-medium flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-red-600" /> 3–7 business days
          </span>
        </div>

        <div className="border-t border-gray-200/30 pt-4 md:col-span-2 space-y-2.5">
          <span className="text-[9px] font-medium text-gray-500 uppercase block">Recipient Dispatch Address</span>
          
          <div className="bg-white border border-gray-200/60 rounded-lg p-4 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 bg-gray-100/25 rounded-lg flex items-center justify-center shrink-0 border border-gray-200/40 text-red-600">
                <span className="text-base text-red-600">🏠</span>
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium font-black tracking-widest text-red-600">HOME</span>
                  <span className="text-[8px] font-medium text-gray-500 uppercase">/ Courier Destination Locked</span>
                </div>
                <p className="text-xs text-gray-900 uppercase font-light tracking-wide mt-1 break-words leading-relaxed max-w-md">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                </p>
                <p className="text-[9.5px] font-medium text-gray-500 uppercase tracking-wide mt-1.5">
                  Recipient: <span className="text-gray-900 font-medium">{order.shippingAddress.name}</span> | Contact: {order.shippingAddress.phone}
                </p>
              </div>
            </div>
            <div className="text-red-600 shrink-0 pr-1 flex items-center">
              <span className="text-sm font-medium font-bold leading-none">➔</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Timelines Card */}
      <div className="p-6 border border-red-600/20 bg-red-600/5 text-left rounded-sm space-y-4">
        <h3 className="font-sans text-sm tracking-widest text-red-600 uppercase flex items-center gap-2">
          <Gift className="w-4 h-4" /> Editorial Dispatch Protocols
        </h3>
        <p className="text-[11px] text-gray-500 uppercase leading-relaxed tracking-wider">
          • <strong>Handcrafted Custom Tailoring Prep:</strong> Takes 1–3 business days. Garment is cut, zip-locked and packed in bespoke containers in New York.
          <br />
          • <strong>Transit & Carriage:</strong> Takes 3–7 business days. Fully tracked courier details will stream to your registered inbox.
        </p>
      </div>

      {/* Navigation pathways */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Link 
          to={`/orders/${order.id}`}
          className="flex items-center justify-center gap-2 border border-red-600 px-6 h-12 text-xs uppercase text-red-600 tracking-widest rounded-sm hover:border-gray-900 hover:text-gray-900 transition-colors bg-white font-bold cursor-pointer"
        >
          Track Cargo Live <Clock className="w-4 h-4 text-red-600" />
        </Link>

        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 border border-gray-200 px-6 h-12 text-xs uppercase text-gray-900 tracking-widest rounded-sm hover:border-gray-900 hover:text-red-600 transition-colors bg-white cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
        
        <Link 
          to="/clothing"
          className="flex items-center justify-center gap-2 border border-red-600 px-6 h-12 text-xs uppercase text-white bg-red-600 text-white tracking-widest rounded-sm hover:bg-gray-900 hover:text-white transition-colors font-bold cursor-pointer"
        >
          Continue Exploring <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
