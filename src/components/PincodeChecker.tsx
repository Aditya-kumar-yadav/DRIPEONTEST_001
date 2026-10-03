import React, { useState } from 'react';
import { MapPin, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../AppContext';

export default function PincodeChecker({ integrated = false }: { integrated?: boolean }) {
  const { settings } = useApp();
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [message, setMessage] = useState('');

  const checkPincode = () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setStatus('unavailable');
      setMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setStatus('checking');
    
    setTimeout(() => {
      const allowedPincodes = settings?.deliverablePincodes || [];
      
      // If admin has set specific pincodes, strictly check against them
      if (allowedPincodes.length > 0) {
        if (allowedPincodes.includes(pincode)) {
          setStatus('available');
          setMessage(`Delivery available for ${pincode}.`);
        } else {
          setStatus('unavailable');
          setMessage(`Sorry, we currently do not deliver to ${pincode}.`);
        }
        return;
      }

      // Fallback dummy logic if no specific pincodes are set in admin
      if (pincode.startsWith('826')) {
        setStatus('available');
        setMessage(`Same-day or next-day delivery available for Dhanbad (${pincode}).`);
      } else if (pincode.startsWith('82')) {
        setStatus('available');
        setMessage(`Delivery available in Jharkhand area within 2-3 days.`);
      } else {
        setStatus('available');
        setMessage(`Standard delivery available in 3-5 business days.`);
      }
    }, 600);
  };

  return (
    <div className={integrated ? "w-full" : "w-full mt-6 bg-gray-50/50 border border-gray-200 rounded-xl p-4 sm:p-5"}>
      {!integrated && (
        <div className="flex items-center gap-2 mb-3">
          <Truck className="w-4 h-4 text-gray-700" />
          <h4 className="text-xs sm:text-sm font-semibold tracking-wider text-gray-900 uppercase">Check Delivery Options</h4>
        </div>
      )}
      {integrated && (
        <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> Delivery Availability Checker
        </label>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit PIN code"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ''));
              setStatus('idle');
            }}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-colors placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={checkPincode}
          disabled={status === 'checking' || pincode.length < 6}
          className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === 'checking' ? 'Checking...' : 'Check'}
        </button>
      </div>

      {status === 'available' && (
        <div className="flex items-start gap-2 mt-3 text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-100 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-[11px] sm:text-xs leading-relaxed font-medium">{message}</p>
        </div>
      )}
      
      {status === 'unavailable' && (
        <div className="flex items-start gap-2 mt-3 text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 animate-fade-in">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-[11px] sm:text-xs leading-relaxed font-medium">{message}</p>
        </div>
      )}
      
      <div className="mt-3 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><Truck className="w-3 h-3" /> Free shipping over ₹5,000</span>
        <span>Pay on delivery available</span>
      </div>
    </div>
  );
}
