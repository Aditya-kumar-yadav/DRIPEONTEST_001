import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Order, OrderStatus } from '../types';
import { 
  Package, Truck, CheckCircle, Clock, MapPin, 
  ArrowLeft, Copy, Check, Star, Upload, Trash2, 
  PhoneCall, Headphones, AlertTriangle, X, CheckSquare,
  RefreshCw, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Status labels and steps map (Exactly matching the Admin panel)
const TIMELINE_STEPS: { status: OrderStatus; label: string; text: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { 
    status: 'PENDING', 
    label: 'Pending', 
    text: 'Order placed, awaiting system verification.',
    icon: Clock
  },
  { 
    status: 'CONFIRMED', 
    label: 'Confirmed', 
    text: 'Order was successfully verified by our admins.',
    icon: RefreshCw
  },
  { 
    status: 'SHIPPED', 
    label: 'Shipped', 
    text: 'Package processed and handed over to logistics.',
    icon: Truck
  },
  { 
    status: 'TRANSIT', 
    label: 'Transit', 
    text: 'Package is in transit between distribution hubs.',
    icon: Compass
  },
  { 
    status: 'DELIVERED', 
    label: 'Delivered', 
    text: 'Shipment safely arrived at your destination.',
    icon: CheckCircle2
  }
];

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { fetchOrderById, submitReview, cancelOrder, confirmDelivery, requestCallbackSupport, addToast, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const initialOrderData = location.state?.orderData || null;

  const [order, setOrder] = useState<Order | null>(initialOrderData);
  const [loading, setLoading] = useState<boolean>(!initialOrderData);
  const [copied, setCopied] = useState<boolean>(false);

  // Cancellation States
  const [cancelReason, setCancelReason] = useState<string>('Incorrect sizing selected');
  const [cancelNotes, setCancelNotes] = useState<string>('');
  const [showCancelConfirmation, setShowCancelConfirmation] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);

  // Delivery Simulator States
  const [deliveryOtpValue, setDeliveryOtpValue] = useState<string>('');
  const [deliveryPaymentMode, setDeliveryPaymentMode] = useState<'cash' | 'upi'>('cash');
  const [confirmingDelivery, setConfirmingDelivery] = useState<boolean>(false);
  const [showDeliverySimulator, setShowDeliverySimulator] = useState<boolean>(false);

  // Support Callback States
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [supportPhone, setSupportPhone] = useState<string>('');
  const [supportTopic, setSupportTopic] = useState<string>('Custom Sizing and Fit Customization');
  const [supportNotes, setSupportNotes] = useState<string>('');
  const [submittingSupport, setSubmittingSupport] = useState<boolean>(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    const cleanPhone = supportPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      addToast("Please enter a valid 10-digit mobile number first", "error");
      return;
    }
    setSubmittingSupport(true);
    const success = await requestCallbackSupport(orderId, cleanPhone, supportTopic, supportNotes);
    setSubmittingSupport(false);
    if (success) {
      setShowSupportModal(false);
      setSupportNotes('');
      // Prefill support phone again
      loadOrder(); // Reload updated order with timeline
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    setCancelling(true);
    const success = await cancelOrder(orderId, `${cancelReason} ${cancelNotes ? '• ' + cancelNotes : ''}`.trim());
    setCancelling(false);
    if (success) {
      setShowCancelConfirmation(false);
      loadOrder();
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    if (!deliveryOtpValue.trim()) {
      addToast("Please enter the 4-digit verification OTP", "error");
      return;
    }
    setConfirmingDelivery(true);
    const isCod = order?.paymentMethod === 'cod';
    const finalMode = isCod ? deliveryPaymentMode : order?.paymentMethod;

    const success = await confirmDelivery(orderId, deliveryOtpValue, finalMode);
    setConfirmingDelivery(false);
    if (success) {
      setDeliveryOtpValue('');
      loadOrder();
    }
  };

  // Review Form States
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [quickTags, setQuickTags] = useState<string[]>([
    "Superb Heavyweight Twill",
    "Elite Architectural Fit",
    "Pristine Stitching Detail",
    "Stunning Horn Closure",
    "Highly Breathable Fabric",
    "Ultra-Fast Luxury Cargo"
  ]);

  const loadOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    const orderData = await fetchOrderById(orderId);
    if (orderData) {
      setOrder(orderData);
      if (orderData.review) {
        setRating(orderData.review.rating);
        setComment(orderData.review.comment);
        setReviewImages(orderData.review.reviewImages || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // Set up polling for pending orders to display real-time stock auto-confirmation
  useEffect(() => {
    if (!order || order.status !== 'PENDING') return;

    const interval = setInterval(async () => {
      if (!orderId) return;
      const orderData = await fetchOrderById(orderId);
      if (orderData) {
        setOrder(orderData);
        if (orderData.status !== 'PENDING') {
          clearInterval(interval);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [order, orderId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast("Tracking number copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Convert files to base64 images for simulated persistence
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) {
        addToast("Only image files are permitted for couture reviews", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReviewImages(prev => [...prev.slice(-3), reader.result as string]); // Limit to max 3 photos
          addToast("Luxury image reference loaded", "success");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    addToast("Image removed", "info");
  };

  const handleTagClick = (tag: string) => {
    setComment(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${tag}.` : `${tag}.`;
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    if (rating === 0) {
      addToast("Please select a star rating first", "error");
      return;
    }

    setSubmitting(true);
    const success = await submitReview(orderId, rating, comment, reviewImages);
    setSubmitting(false);

    if (success) {
      loadOrder(); // Reload updated order values from server
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border border-red-600/40 border-t-[#C9A96E] rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase font-medium text-red-600 tracking-[0.2em]">Retracing Shipment...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans text-center px-4">
        <div className="max-w-md w-full border border-red-600/15 rounded-3xl p-8 bg-white">
          <Package className="w-12 h-12 text-red-600/40 mx-auto mb-4" />
          <h2 className="text-lg font-sans uppercase tracking-widest text-gray-900 mb-2">Shipment Not Registered</h2>
          <p className="text-xs text-gray-500/80 mb-6">We could not retrieve an active order listing matching this serial ID.</p>
          <Link to="/account" className="mt-4 inline-block px-6 py-2 px-6 py-2.5 bg-red-600 text-white hover:bg-gray-900 text-white text-xs font-medium uppercase tracking-widest rounded-full transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Determine indices of current progress
  const statusOrder: OrderStatus[] = ['CANCELLED', 'REFUND_REQUESTED', 'REFUNDED', 'PENDING', 'CONFIRMED', 'SHIPPED', 'TRANSIT', 'DELIVERED'];
  const currentIndex = statusOrder.indexOf(order.status);

  // Fallback carrier details if missing from historical checkout items
  const carrierName = order.carrier || 'DHL Express Courier';
  const trackingNumber = order.trackingNumber || `DL-${Math.floor(100000 + Math.random() * 899999)}IN`;

  return (
    <div className="min-h-screen bg-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumbs / Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-red-600/10 pb-6">
          <div className="space-y-1.5">
            <Link 
              to="/account" 
              className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-red-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Collector Account
            </Link>
            <h1 className="text-2xl font-sans tracking-widest text-gray-900 uppercase font-bold flex items-center gap-3">
              LIVE CARGO TIMELINE
            </h1>
          </div>
          
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            <span className="text-[10px] font-medium text-gray-500 uppercase">STATUS:</span>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase border ${
              order.status === 'DELIVERED' 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : order.status === 'CANCELLED' || order.status === 'REFUNDED'
                ? 'bg-red-950/40 text-red-400 border-red-500/20'
                : 'bg-red-600/10 text-red-600 border-red-600/20 animate-pulse'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* FLIPKART/AMAZON STYLE SUCCESSFUL CANCELLATION & PAYOUT RETURN BANNER */}
        {order.status === 'CANCELLED' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#05110c] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 space-y-6 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-sans tracking-wider uppercase font-bold text-gray-900">CANCELLED SUCCESSFULLY</h2>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-medium px-2 py-0.5 rounded uppercase tracking-wider font-semibold">Refund Completed</span>
                </div>
                <p className="text-xs text-gray-500/90 font-light leading-relaxed">
                  We have successfully cancelled your luxury requisition. As per our automated escrow policy, the full payout of <span className="text-red-600 font-bold font-medium">${order.totalAmount.toLocaleString()}</span> has been credited back to your original source mode of payment.
                </p>
              </div>
            </div>

            <div className="border-t border-red-600/15 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-6 font-medium text-xs">
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Refund Amount</span>
                <span className="text-sm text-red-600 font-bold">${order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Refund Destination</span>
                <span className="text-sm text-gray-900 font-medium">Original Bank Mode / UPI</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Transaction ID</span>
                <span className="text-sm text-gray-900 font-light tracking-tight">REF-DL-{order.id.split('-')[1] || '98273645'}</span>
              </div>
            </div>

            <div className="bg-[#091b14] border border-emerald-500/10 rounded-2xl p-4 flex gap-3 text-left">
              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Flipkart/Amazon Escrow Payout Return Verification</h4>
                <p className="text-[11px] text-emerald-100/70 font-light leading-relaxed">
                  Reflected under transaction code <code className="text-red-600 bg-black/40 px-1 py-0.5 rounded">DRIPEON-REFUND-SECURE</code>. The instant credit was authorized through UPI/Card gateway settlement protocols on our server. No action is required.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AUTOMATED STOCK / PENDING BANNER */}
        {order.status === 'PENDING' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#050f11] border border-red-600/30 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl relative overflow-hidden"
          >
            {/* Pulsing indicator line */}
            <div className="absolute top-0 right-0 left-0 h-[2.5px] bg-gradient-to-r from-brand-gold/5 via-brand-gold/80 to-brand-gold/5" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600/5 border border-red-600/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-red-600 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-sans tracking-wider uppercase font-bold text-gray-900">Automated Stock Reservation</h2>
                  <span className="bg-red-600/15 text-red-600 border border-red-600/20 text-[9px] font-medium px-2 py-0.5 rounded uppercase tracking-wider font-semibold animate-pulse">Pending check</span>
                </div>
                <p className="text-xs text-gray-500/90 font-light leading-relaxed">
                  Our custom order verification system is executing a real-time warehouse check to allocate dedicated stock rolls for your carriage deliveries. Once stock verification and allocation are completed on our server, your order status will automatically update to <span className="text-red-600 font-bold font-medium">CONFIRMED</span>.
                </p>
              </div>
            </div>

            <div className="bg-white border border-red-600/10 rounded-2xl p-4 flex gap-3 text-left items-center justify-between">
              <div className="flex gap-3 items-center">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 text-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-xs text-[#82a39a] font-medium">Please stand by. Inventory allocation algorithms active...</span>
              </div>
              <div className="text-[10px] font-medium text-red-600 uppercase tracking-wider font-bold animate-pulse">
                EST. &lt; 5 SECONDS
              </div>
            </div>
          </motion.div>
        )}

        {/* FLIPKART/AMAZON STYLE PENDING CANCELLATION EXPLANATORY BANNER */}
        {order.cancellationRequested && order.status !== 'CANCELLED' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a0608] border border-red-500/20 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-sans tracking-wider uppercase font-bold text-gray-900">CANCELLATION REQUESTED</h2>
                  <span className="bg-red-500/10 text-red-400 border border-red-500/25 text-[9px] font-medium px-2 py-0.5 rounded uppercase tracking-wider font-semibold animate-pulse">
                    Pending Admin Audit
                  </span>
                </div>
                <p className="text-xs text-gray-500/90 font-light leading-relaxed">
                  Your retraction and transaction cancellation request has been logged successfully and is currently undergoing administrative verification at our sorting dispatch office.
                </p>
                <div className="bg-[#2a0c0f] border border-red-500/15 rounded-xl p-3 mt-3 text-red-350 italic text-[11px] font-medium">
                  Your reasoning: "{order.cancellationReason || 'Unspecified selection change'}"
                </div>
              </div>
            </div>

            <div className="border-t border-red-600/15 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6 font-medium text-xs font-bold">
              <div className="space-y-1">
                <span className="text-[9px] text-[#82a39a] uppercase tracking-widest block">Ledger Verification Status</span>
                <span className="text-xs text-red-400 uppercase tracking-wider">Awaiting Courier Dispatch Verification</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-[#82a39a] uppercase tracking-widest block">Audit Execution Time</span>
                <span className="text-xs text-gray-900">Completed within 1 to 4 business hours</span>
              </div>
            </div>

            <div className="bg-[#120405] border border-red-500/10 rounded-2xl p-4 flex gap-3 text-left">
              <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 font-sans">
                <h4 className="text-xs font-semibold text-red-400 font-medium uppercase tracking-widest">Multi-Tier Retraction Pipeline</h4>
                <p className="text-[11px] text-red-200/70 font-light leading-relaxed">
                  <strong>E-commerce Professional Standard Flow:</strong> 
                  <br />Our system implements the professional Flipkart & Amazon cancellation protocol:
                </p>
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-red-200/70 font-light leading-relaxed">
                  <li>If the cargo is <span className="text-red-600 font-bold">PENDING</span>: Cancellation is instant; funds are auto-credited back to your original payment mode (card/UPI) by our payment gateway.</li>
                  <li>If the cargo is <span className="text-red-600 font-bold">CONFIRMED</span> or <span className="text-red-600 font-bold">SHIPPED</span>: We initiate a dispatch audit. Our sorting office verifies if the courier vehicle can be intercepted. Once intercepted, stock is re-allocated and a full refund is immediately processed.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* 1. ORDER SUMMARY HEADER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main ID Block */}
          <div className="bg-white border border-red-600/10 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-2 right-2 opacity-5">
              <Package className="w-20 h-20 text-gray-900" />
            </div>
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest mb-1">REGISTERED INDEX</p>
              <h2 className="text-lg font-medium font-bold text-red-600 tracking-tight">{order.id}</h2>
            </div>
            <div className="pt-4 border-t border-red-600/5 text-[10px] font-medium text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Ordered {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Logistics Box */}
          <div className="bg-white border border-red-600/10 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-2 right-2 opacity-5">
              <Truck className="w-20 h-20 text-gray-900" />
            </div>
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest mb-1">COUTURE CARRIER</p>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">{carrierName}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-medium text-red-600/90">{trackingNumber}</span>
                <button 
                  type="button" 
                  onClick={() => copyToClipboard(trackingNumber)}
                  className="p-1 rounded bg-[#121212] border border-red-600/10 hover:border-red-600/40 text-red-600 hover:text-gray-900 transition-all text-[9px] font-semibold"
                  id="copy-tracking-btn"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-red-600/5 text-[10px] font-medium text-gray-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Int. Transit Node V.3
            </div>
          </div>

          {/* Delivery Coordinates Destination */}
          <div className="bg-white border border-red-600/10 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-2 right-2 opacity-5">
              <MapPin className="w-20 h-20 text-gray-900" />
            </div>
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest mb-1">DESTINATION HOLDER</p>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase line-clamp-1">{order.shippingAddress.name}</h3>
              <p className="text-xs text-gray-500/80 line-clamp-1 mt-1 font-light tracking-wide">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
            </div>
            <div className="pt-4 border-t border-red-600/5 text-[10px] font-medium text-gray-500 flex justify-between items-center">
              <span>VALUED: ₹{order.totalAmount.toLocaleString()}</span>
              {order.paymentStatus === 'REFUNDED' ? (
                <span className="text-red-450 font-semibold uppercase">[ REFUNDED ]</span>
              ) : order.paymentStatus === 'PENDING' ? (
                <span className="text-amber-500 font-semibold uppercase animate-pulse">COD [ DUE ]</span>
              ) : (
                <span className="text-emerald-400 font-semibold">PAID ({order.paymentMethod?.toUpperCase() || 'SECURE'})</span>
              )}
            </div>
          </div>

        </div>

        {/* SECURE DELIVERY VERIFICATION OTP BLOCK FOR HANDOVER */}
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-red-600/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-left shadow-[0_4px_16px_rgba(220,38,38,0.05)]"
          >
            <div className="space-y-1.5 flex-1 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 relative">
                  <span className="absolute inset-0 rounded-full bg-red-600 animate-ping"></span>
                </span>
                <h4 className="text-xs font-bold uppercase tracking-widest text-red-600">
                  Delivery Handover Verification Required
                </h4>
              </div>
              <p className="text-[11px] text-gray-700 font-medium leading-relaxed max-w-lg">
                For secure luxury checkout, please communicate this secret 4-digit verification code to the delivery professional at your door. Once verified with your choice of <span className="text-gray-900 font-bold">Cash or instant UPI</span> (for Cash on Delivery orders), your delivery confirms.
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl px-8 py-4 text-center shrink-0 min-w-[160px] relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />
              <div className="text-[10px] font-bold uppercase text-gray-700 tracking-widest mb-1 select-none">DELIVERY OTP</div>
              <div className="text-2xl font-black text-red-600 tracking-widest leading-none">
                {order.deliveryOtp || '4792'}
              </div>
              <div className="text-[9px] font-bold text-red-600 mt-1.5 uppercase select-none opacity-90">Do share with executive</div>
            </div>
          </motion.div>
        )}

        {/* 2. DYNAMIC TIMELINE STEPS */}
        <div className="bg-transparent p-4 sm:p-6 max-w-lg mx-auto">
          
          {/* Header Row: Timeline --- In Progress */}
          <div className="flex items-center justify-between mb-10">
            <span className="text-sm font-bold text-black tracking-widest uppercase">Timeline</span>
            
            <div className="flex-1 border-t border-black/10 mx-6"></div>
            
            <span className={`px-4 py-1.5 border text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${
              order.status === 'DELIVERED' ? 'border-black text-black bg-white' :
              order.status === 'CANCELLED' ? 'border-black text-black bg-white' :
              'border-black text-black bg-white'
            }`}>
              {order.status === 'DELIVERED' ? (
                <><CheckSquare size={12} /> Delivered</>
              ) : order.status === 'CANCELLED' ? (
                <><X size={12} /> Cancelled</>
              ) : (
                <><Clock size={12} /> In Progress</>
              )}
            </span>
          </div>

          {/* Timeline Node Generator */}
          <div className="space-y-0 relative pl-4 sm:pl-6">
            
            {TIMELINE_STEPS.map((step, idx) => {
              const stepIndexInDb = statusOrder.indexOf(step.status);
              const isPassedOrCurrent = currentIndex >= stepIndexInDb && order.status !== 'CANCELLED';
              const isCurrent = order.status === step.status;
              
              const StepIcon = step.icon;

              const foundTimelineLog = order.statusTimeline?.find(log => log.status === step.status);
              const customDescription = foundTimelineLog?.description || step.text;
              
              let formattedTime = "";
              let formattedDate = "";
              if (foundTimelineLog) {
                const dt = new Date(foundTimelineLog.timestamp);
                formattedDate = dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                formattedTime = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
              } else if (idx === 0) {
                const dt = new Date(order.createdAt);
                formattedDate = dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                formattedTime = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
              }

              return (
                <div key={idx} className="flex relative items-start gap-4 sm:gap-6 group pb-8 last:pb-0">
                  
                  {/* Vertical Connection Line */}
                  {idx !== TIMELINE_STEPS.length - 1 && (
                    <div className="absolute left-[19px] sm:left-[27px] top-[40px] bottom-[-8px] w-[1px] bg-black/10" />
                  )}
                  
                  {/* Circle Indicator Container */}
                  <div className="relative z-10 flex items-center justify-center shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                      isPassedOrCurrent ? 'bg-black border-black text-white' : 'bg-white border-black/20 text-black/20'
                    }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Text Description Box */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <h4 className={`text-base font-bold uppercase tracking-wider ${isPassedOrCurrent ? 'text-black' : 'text-black/30'}`}>
                        {step.label}
                      </h4>
                      {isPassedOrCurrent && (formattedDate || formattedTime) && (
                        <span className="text-xs font-medium text-black/40 shrink-0">
                          {formattedDate}, {formattedTime}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 font-medium ${isPassedOrCurrent ? 'text-black/60' : 'text-black/20'}`}>
                      {customDescription}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Rate Delivery Button */}
          {order.status === 'DELIVERED' && (
             <div className="mt-8">
               <button onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  addToast("Please fill the review form at the top", "info");
               }} className="w-full bg-black hover:bg-black/90 text-white transition-colors py-4 rounded-none font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                 RATE THIS DELIVERY
               </button>
             </div>
          )}

          {/* Cancellations Warnings Alert Block */}
          {(order.status === 'CANCELLED' || order.status === 'REFUNDED') && (
            <div className="mt-8 border border-black p-4 flex gap-3 text-left bg-white">
              <XCircle className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-black uppercase tracking-widest">Order Cancelled</h4>
                <p className="text-sm text-black/60 mt-1 font-medium">This shipment process is retracted or money returned under our guidelines.</p>
              </div>
            </div>
          )}

        </div>

        {/* VIP STUDIO CONCIERGE & LOGISTICS CALLBACK INITIATOR */}
        <div className="bg-white border border-red-600/15 rounded-3xl p-6 sm:p-8 text-left shadow-[0_15px_40px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all hover:border-red-600/30">
          <div className="absolute top-0 right-0 bg-red-600/5 text-red-600 font-medium text-[8.5px] uppercase tracking-widest px-3.5 py-1.5 rounded-bl-xl border-l border-b border-red-600/15">
            STUDIO VIP ROUTING
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 text-white relative">
                  <span className="absolute inset-0 rounded-full bg-red-600 text-white animate-ping"></span>
                </span>
                <h4 className="text-xs uppercase font-medium font-bold text-gray-900 tracking-widest flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5 text-red-600" /> STUDIO VIP CONCIERGE ASSISTANCE
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 font-light leading-relaxed max-w-2xl">
                Need details regarding size adjustments, bespoke custom fits, or want to schedule priority DHL Express delivery redirection? Schedule an executive callback to your contact number in under 15 minutes.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setSupportPhone(order.shippingAddress.phone || '');
                setShowSupportModal(true);
              }}
              className="px-5 py-3 bg-red-600 text-white text-white hover:bg-gray-900 transition-all font-medium text-[10px] uppercase tracking-widest rounded-xl cursor-pointer font-bold shadow-[0_4px_12px_rgba(201,169,110,0.25)] shrink-0 text-center"
            >
              Request Custom Support Call
            </button>
          </div>
        </div>


        {/* INTERACTIVE USER CANCEL REQUISITION SECURE CONTROL OR PENDING NOTICE */}
        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <div className="bg-white border border-red-600/15 rounded-3xl p-6 sm:p-8 text-left shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
            {order.cancellationRequested ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-red-400 font-medium text-xs font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Couture Retraction Pipeline Engaged
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-sans font-light">
                  Our administrators have been notified of your cancellation ledger request under reference <span className="text-red-600 font-medium font-bold">{order.id}</span>. We are carrying out physical inventory stock checks and verifying package locations with DHL Couture sorting managers to intercept this delivery. 
                </p>
                <div className="pt-3 border-t border-red-500/10 flex flex-wrap items-center justify-between gap-3 text-[10px] font-medium">
                  <span className="text-[#c73e44] uppercase font-bold">● RETRACTION AUDIT IN PROCESS</span>
                  <span className="text-gray-500">Reason: {order.cancellationReason || "Customer retraction"}</span>
                </div>
              </div>
            ) : !showCancelConfirmation ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs uppercase font-medium font-bold text-red-600 tracking-widest">Need to cancel this order?</h4>
                  <p className="text-[11px] text-gray-500 font-light leading-relaxed">Authorized curators can retract non-delivered shipments and trigger automatic escrow credit payouts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirmation(true)}
                  className="px-5 py-2.5 border border-red-500/20 hover:border-red-500/50 bg-red-950/10 hover:bg-red-950/30 text-red-400 hover:text-red-300 transition-all font-medium text-[10px] uppercase tracking-widest rounded-lg cursor-pointer shrink-0"
                >
                  Cancel Requisition
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="border-b border-red-600/10 pb-3 flex justify-between items-center">
                  <h4 className="text-xs uppercase font-medium font-bold text-red-400 tracking-widest">CONFIRM CANCEL REQUEST</h4>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirmation(false)}
                    className="text-[10px] font-medium uppercase text-[#A1A1A1] hover:text-gray-900 cursor-pointer"
                  >
                    [ Close ]
                  </button>
                </div>
 
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-red-600 font-bold block text-left">
                      Reason for cancellation *
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 shadow-sm"
                    >
                      <option value="Wrong size ordered">Wrong size ordered</option>
                      <option value="Changed delivery address">Changed delivery address</option>
                      <option value="Bought from another store">Bought from another store</option>
                      <option value="Ordered by mistake">Ordered by mistake</option>
                      <option value="Delivery taking too long">Delivery taking too long</option>
                      <option value="Other reason">Other reason</option>
                    </select>
                  </div>
 
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-red-600 font-bold block text-left">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any additional information about your cancellation..."
                      value={cancelNotes}
                      onChange={(e) => setCancelNotes(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 resize-none shadow-sm placeholder:text-gray-400"
                    />
                  </div>
 
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={handleCancelOrder}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 px-5 text-sm font-bold uppercase tracking-widest rounded-xl transition-all text-center cursor-pointer shadow-sm"
                    >
                      {cancelling ? '⏳ Processing...' : 'Confirm Cancellation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirmation(false)}
                      className="px-5 py-3 border border-gray-200 hover:border-gray-400 bg-white text-gray-600 hover:text-gray-900 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      Keep Order
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* 3. CONDITIONAL POST-DELIVERY REVIEW / FEEDBACK CONTAINER */}
        <AnimatePresence>
          {order.status === 'DELIVERED' && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="bg-white border border-red-600/20 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
              id="review-section-container"
            >
              
              {/* Review section Header */}
              <div className="border-b border-red-600/10 pb-6 mb-8 text-left">
                <div className="flex items-center gap-1 text-[9px] font-medium text-red-600 uppercase tracking-widest mb-1.5">
                  <Star className="w-2.5 h-2.5 fill-[#C9A96E]" /> COLLECTOR ARCHIVE PROOF
                </div>
                <h2 className="text-2xl font-sans text-gray-900 uppercase font-bold tracking-wider">
                  RATE THIS LUXURY EDITION
                </h2>
                <p className="text-xs text-gray-500/80 mt-1 font-light leading-relaxed">
                  Help prospective collectors curate our limited runs. Share your thoughts on cutting proportions, fabric density, or physical drape.
                </p>
              </div>

              {/* If already submitted, read back cleanly */}
              {order.review ? (
                <div className="space-y-6 text-left" id="already-reviewed-panel">
                  <div className="bg-[#0d1310] border border-emerald-800/10 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-medium uppercase tracking-widest font-semibold">
                        <Check className="w-3 h-3" /> Submitted Portfolio Feedback
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 uppercase">
                        {new Date(order.review.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Interactive Stars Display Read-only */}
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((sIndex) => (
                          <Star 
                            key={sIndex} 
                            className={`w-6 h-6 ${
                              sIndex <= (order.review?.rating || 0) 
                                ? 'text-red-600 fill-[#C9A96E]' 
                                : 'text-neutral-800'
                            }`} 
                          />
                        ))}
                        <span className="text-sm font-sans font-bold text-red-600 ml-2 uppercase">
                          {order.review.rating} / 5 Rating
                        </span>
                      </div>

                      {/* Review text review comment */}
                      {order.review.comment ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium tracking-wide text-gray-800 leading-relaxed font-sans italic">
                          "{order.review.comment}"
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500/60 italic font-light">No written summary recorded.</p>
                      )}

                      {/* Images view */}
                      {order.review.reviewImages && order.review.reviewImages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium text-red-600 uppercase tracking-wider">Review Proof References</p>
                          <div className="flex flex-wrap gap-3">
                            {order.review.reviewImages.map((img, imIdx) => (
                              <div key={imIdx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center relative group">
                                <img src={img} alt="Couture Submission Proof" className="w-full h-full object-cover rounded-lg" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Write active rating selection form */
                <form onSubmit={handleReviewSubmit} className="space-y-6 text-left" id="active-review-form">
                  
                  {/* Star Rating selector component */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-red-600 block font-bold">
                      Select Aesthetic Grade *
                    </label>
                    
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((sVal) => {
                        const isActive = sVal <= (hoveredRating || rating);
                        return (
                          <button
                            key={sVal}
                            type="button"
                            onClick={() => setRating(sVal)}
                            onMouseEnter={() => setHoveredRating(sVal)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-1 transition-all duration-150 hover:scale-125 focus:outline-none cursor-pointer"
                            id={`star-btn-${sVal}`}
                            title={`Rate ${sVal} Stars`}
                          >
                            <Star 
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                                isActive 
                                  ? 'text-red-600 fill-[#C9A96E] drop-shadow-[0_0_10px_rgba(201,169,110,0.3)]' 
                                  : 'text-neutral-800 hover:text-neutral-600'
                              }`} 
                            />
                          </button>
                        );
                      })}
                      
                      <span className="text-xs font-medium uppercase tracking-widest font-bold text-gray-500 ml-3">
                        {rating === 0 ? 'Curate Rank' : `${rating} STARS SELECTED`}
                      </span>
                    </div>
                  </div>

                  {/* Fabric comment input box */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-red-600 block font-bold">
                      Written Collector Appraisal <span className="text-[9px] text-red-600/50 font-normal lowercase">(optional)</span>
                    </label>
                    
                    {/* Quick Tags row */}
                    <div className="text-[9px] font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      ⚡ Quick tags (Click to insert):
                    </div>
                    <div className="flex flex-wrap gap-2 pb-2">
                      {quickTags.map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="px-2.5 py-1 text-[9px] font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white hover:border-transparent transition-all rounded-lg cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <div className="border border-gray-200 bg-white focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600/20 rounded-2xl p-2.5 transition-all shadow-sm">
                      <textarea
                        rows={4}
                        placeholder="Share your thoughts on fabric quality, fit, stitching, comfort..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-gray-800 leading-relaxed placeholder:text-gray-400 cursor-text font-medium"
                        id="review-comment-textarea"
                      />
                    </div>
                  </div>

                  {/* Drag and Drop Image Uploader Block */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-red-600 block font-bold">
                      Upload Fit reference (Media Gallery) <span className="text-[9px] text-red-600/50 font-normal lowercase">(optional)</span>
                    </label>
                    <p className="text-[10px] text-gray-500 font-light mb-2">Showcase the drape for our dynamic catalog. Limit 3 references.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      
                      {/* Drag & Drop Card */}
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`sm:col-span-3 border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                          dragActive 
                            ? 'border-red-600 bg-red-600/5' 
                            : 'border-red-600/15 bg-white hover:border-red-600/40'
                        } relative flex flex-col items-center justify-center min-h-[140px]`}
                      >
                        <input
                          type="file"
                          id="review-file-input"
                          multiple
                          accept="image/*"
                          onChange={handleFileInput}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-6 h-6 text-red-600/60 mb-2" />
                        <span className="text-xs text-gray-900 leading-relaxed">
                          Drag & Drop or <span className="text-red-600 underline font-medium">Appraise Media</span>
                        </span>
                        <span className="text-[9px] font-medium text-red-600/40 uppercase tracking-wider mt-1">PNG, JPG formats supported</span>
                      </div>

                      {/* Image Thumbnail gallery list */}
                      <div className="col-span-1 flex sm:flex-col gap-2.5 overflow-x-auto justify-start items-center">
                        {reviewImages.length === 0 ? (
                          <div className="flex items-center justify-center h-full w-full border border-gray-200 rounded-2xl bg-gray-50 text-center p-3 text-[10px] text-gray-400 font-medium select-none">
                            NO MEDIA LOADED
                          </div>
                        ) : (
                          reviewImages.map((img, idx) => (
                            <div key={idx} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-red-600/15 bg-[#121212] flex items-center justify-center relative shrink-0 group">
                              <img src={img} alt="Couture Review Preview" className="w-full h-full object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 hover:text-red-300 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Complete submit button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-red-600 text-white hover:bg-gray-900 text-white font-semibold text-xs py-4 tracking-widest uppercase transition-all rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-brand-gold/15"
                      id="review-submit-btn"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" /> ARCHIVING APPRAISAL...
                        </>
                      ) : (
                        <>
                          REGISTER PORTFOLIO REVIEW <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. ORDER ITEMS SPECIFICATION BLOCK */}
        <div className="bg-white border border-red-600/10 rounded-2xl p-6 text-left">
          <h3 className="text-xs uppercase font-medium font-bold text-red-600 tracking-widest mb-4">PURCHASE CATALOG REFERENCE</h3>
          
          <div className="divide-y divide-[#C9A96E]/10 space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-4 ${idx > 0 ? 'pt-4' : ''}`}>
                <div className="w-14 h-16 bg-[#121212] border border-red-600/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  {item.productSnapshot.imageUrl ? (
                    <img src={item.productSnapshot.imageUrl} alt={item.productSnapshot.name} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                  ) : (
                    <Package className="w-6 h-6 text-red-600/20" />
                  )}
                </div>
                
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-xs font-sans text-gray-900 tracking-widest uppercase font-semibold">{item.productSnapshot.name}</h4>
                  <p className="text-[10px] font-medium text-red-600 uppercase tracking-[0.1em]">
                    {item.productSnapshot.color} / {item.productSnapshot.size}
                  </p>
                  <p className="text-[10px] font-medium text-gray-500">QTY: {item.quantity}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-medium font-bold text-gray-900">₹{item.unitPrice.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-red-600/10 mt-6 pt-4 flex justify-between items-center text-xs font-medium">
            <span className="text-gray-500 uppercase">CARGO SECURE SUB-TOTAL</span>
            <span className="text-red-600 font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* MODAL OVERLAY FOR VIP ASSISTANCE */}
        {showSupportModal && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 select-none animate-[fadeIn_0.2s_ease-out]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="max-w-md w-full bg-white border border-red-600/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />
              
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center border border-red-600/30 text-red-600">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-medium font-bold uppercase tracking-widest text-red-600">
                    VIP HELPLINE COORDINATION
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                    Establish high-drape priority logistics response
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSupportSubmit} className="space-y-4 text-left">
                
                {/* Topic selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">
                    Assistance Subject *
                  </label>
                  <select
                    required
                    value={supportTopic}
                    onChange={(e) => setSupportTopic(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-red-600 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-600/20 cursor-pointer shadow-sm"
                  >
                    <option value="Sizing & Fit Help">Sizing &amp; Fit Help</option>
                    <option value="Change Delivery Address">Change Delivery Address</option>
                    <option value="Billing & Invoice">Billing &amp; Invoice</option>
                    <option value="Design Consultation">Design Consultation</option>
                    <option value="Other Assistance">Other Assistance</option>
                  </select>
                </div>

                {/* Preferred Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">
                    Preferred Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Your 10-digit mobile number"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white border border-gray-200 focus:border-red-600 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-red-600/20 shadow-sm"
                  />
                  <span className="text-[9px] font-medium text-gray-500 block leading-normal mt-0.5">
                    We pre-filled your secure order destination contact for convenience.
                  </span>
                </div>

                {/* Additional notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block font-semibold text-red-600">
                    Brief Inquiry context / Custom requests
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your issue briefly so our team can assist you faster..."
                    value={supportNotes}
                    onChange={(e) => setSupportNotes(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-red-600 rounded-xl p-3 text-sm text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-600/20 resize-none placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                {/* CTAs */}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submittingSupport}
                    className="w-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm uppercase py-3.5 tracking-widest rounded-xl transition-all shadow-md cursor-pointer text-center"
                  >
                    {submittingSupport ? '⏳ Sending...' : 'Send Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSupportModal(false);
                      setSupportNotes('');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 hover:border-gray-400 bg-white text-gray-600 hover:text-gray-900 font-semibold text-sm rounded-xl transition-all cursor-pointer text-center shadow-sm"
                  >
                    Close
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
