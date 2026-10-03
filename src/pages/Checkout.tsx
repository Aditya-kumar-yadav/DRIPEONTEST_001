import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { getProductImageUrl } from '../utils/imageFallback';
import {
  ShoppingCart, RefreshCw, Trash2, ShieldCheck, Truck, ArrowRight, CreditCard, Lock, CheckCircle2, ChevronRight, Check, X, MapPin, Phone, User, Home, Building2, Smartphone, Mail, QrCode, Sparkles, ArrowLeft, Info, AlertCircle, Compass
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Add loadRazorpay utility
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Turnstile } from '@marsidev/react-turnstile';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize the Stripe Client Promise safely
const stripePublishableKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51O9rEaSFM6S3sU14zXF95YvjQREj661Pbyf1YmU6bQz8WfIe27918l828aN5f725a3962bQ';
const stripePromise = loadStripe(stripePublishableKey);

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
}

function StripePaymentForm({ clientSecret, orderId, amount }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { addToast, clearCart, refreshCart } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStripePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      addToast("Stripe payment gateway has not initialized yet.", "error");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Execute Stripe Confirm Payment
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Redirect page where user is sent after successful card verification (e.g., 3D Secure fallback)
          return_url: `${window.location.origin}/order-confirmation?id=${orderId}`,
        },
        redirect: 'if_required', // Prevents redundant redirection if payment completes on the spot
      });

      if (result.error) {
        // Handle failed payment securely
        setErrorMessage(result.error.message || "An atypical billing error occurred.");
        addToast(result.error.message || "Payment declined or cancelled.", "error");
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        addToast("Transaction completed successfully!", "success");
        await clearCart();
        await refreshCart();
        navigate(`/order-confirmation?id=${orderId}`);
      } else {
        // 3D Secure / redirect happened or pending state
        console.log("Stripe result:", result);
        if (result.paymentIntent) {
          await clearCart();
          await refreshCart();
          navigate(`/order-confirmation?id=${orderId}&status=${result.paymentIntent.status}`);
        }
      }
    } catch (err: any) {
      console.error("[Stripe Front-end Error]", err);
      setErrorMessage(err.message || "An atypical billing error occurred during transaction confirmation.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleStripePaySubmit} className="space-y-6">
      <div className="border border-red-600/40 bg-white p-5 rounded-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200/35 pb-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-red-600 font-bold">Stripe 3D-Secure Elements Shield</span>
          <div className="flex gap-1.5 items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-medium text-emerald-500/90 uppercase tracking-widest font-bold">PCI-DSS COMPLIANT v4</span>
          </div>
        </div>

        {/* Secure Stripe Payment element wrapper */}
        <div className="p-3 bg-white rounded-sm border border-gray-200/40">
          <PaymentElement
            options={{
              layout: 'tabs'
            }}
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-medium rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-red-600 text-white text-white hover:bg-gray-900 transition-all duration-300 py-3.5 px-4 text-xs font-medium uppercase tracking-[0.2em] font-bold rounded-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              AUTHORIZING CARDS ₹{amount.toLocaleString('en-IN')}...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              FINALIZE BESPOKE TRANSACTION ₹{amount.toLocaleString('en-IN')}
            </>
          )}
        </button>

        <p className="text-[9px] font-medium text-gray-500 text-center uppercase tracking-widest leading-relaxed">
          🔒 Secured by Stripe Gateway • Your details never cross our local server ledger
        </p>
      </div>
    </form>
  );
}

export default function Checkout() {
  const {
    user,
    cart,
    cartSubtotal,
    settings,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    createOrder,
    addToast,
    apiFetch,
    checkedCartItemIds
  } = useApp();

  const navigate = useNavigate();

  // Shipping form hooks
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK'>('HOME');

  // Pre-fill fields from default address if available in user's saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      
      // Auto-verify if authenticated via Clerk since Clerk already verified them
      if (user.email) {
        setIsEmailVerified(true);
      }

      const savedStr = localStorage.getItem(`DRIPEON_addresses_${user.id}`);
      if (savedStr) {
        try {
          const addrs = JSON.parse(savedStr);
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a: any) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setName(defaultAddr.name);
            setPhone(defaultAddr.phone);
            setPincode(defaultAddr.pincode);
            setLocality(defaultAddr.locality);
            setStreet(defaultAddr.locality);
            setCity(defaultAddr.city);
            setState(defaultAddr.state);
            setAddressType(defaultAddr.addressType || 'HOME');
            setIsEmailVerified(true);
          }
        } catch (e) {
          console.error("Failed loading saved addresses", e);
        }
      } else if (user.address) {
        setStreet(user.address.street || '');
        setCity(user.address.city || '');
        setState(user.address.state || '');
        setPincode(user.address.pincode || '');
      }
    }
  }, [user]);

  // Email OTP Verification
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [showOtpPanel, setShowOtpPanel] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState(''); // shown only in dev mode when Resend not configured

  // Cloudflare Turnstile token
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Address helper functions
  const triggerSendOtp = async () => {
    if (!email || !email.includes('@')) {
      addToast("Please enter a valid email address first", "error");
      return;
    }
    setOtpSending(true);
    setOtpError('');
    setEnteredOtp('');
    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      setShowOtpPanel(true);
      if (data.devOtp) setDevOtp(data.devOtp); // dev mode only
      addToast(`Verification code sent to ${email}`, "success");
    } catch (err: any) {
      setOtpError(err.message || "Failed to send code. Try again.");
      addToast(err.message || "Failed to send OTP", "error");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    if (code.length !== 6) return;
    setOtpVerifying(true);
    setOtpError('');
    try {
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid code");
      setIsEmailVerified(true);
      setShowOtpPanel(false);
      setEnteredOtp('');
      setDevOtp('');
      addToast("Email verified ✔", "success");
    } catch (err: any) {
      setOtpError(err.message || "Invalid code. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      addToast("Fetching your GPS coordinates...", "info");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
            const data = await res.json();

            if (data && data.address) {
              setPincode(data.address.postcode || '');
              setCity(data.address.city || data.address.state_district || data.address.county || '');
              setState(data.address.state || '');
              setLocality(data.address.suburb || data.address.neighbourhood || data.address.town || '');
              setStreet(data.address.road || '');
              addToast("Location identified successfully!", "success");
            } else {
              addToast("Could not resolve address from coordinates.", "error");
            }
          } catch (err) {
            addToast("Failed to fetch address details.", "error");
          }
        },
        (error) => {
          addToast("Location access denied or unavailable.", "error");
        }
      );
    } else {
      addToast("Geolocation is not supported by your browser.", "error");
    }
  };

  const [loading, setLoading] = useState(false);

  // Stripe client payment states
  const [stripeClientSecret, setStripeClientSecret] = useState<string>('');
  const [stripeOrderId, setStripeOrderId] = useState<string>('');
  const [stripeAmount, setStripeAmount] = useState<number>(0);
  const [initializingStripe, setInitializingStripe] = useState(false);

  const handleStripeInitialize = async () => {
    if (!name.trim() || !phone.trim() || !street.trim() || !city.trim() || !state.trim() || !pincode.trim() || !locality.trim()) {
      addToast("Please fill out all mandatory shipping details (Name, Phone, Pincode, Locality, Address, City, State)", "error");
      return;
    }

    if (!isEmailVerified) {
      addToast("Please verify your email address via OTP first", "error");
      triggerSendOtp();
      return;
    }

    setInitializingStripe(true);
    try {
      const formatFullAddress = () => {
        let full = street;
        if (locality) full += `, ${locality}`;
        if (landmark) full += ` (Landmark: ${landmark})`;
        if (addressType) full += ` [${addressType}]`;
        if (alternatePhone) full += ` (Alt: ${alternatePhone})`;
        return full;
      };

      const addressPayload = {
        name,
        phone,
        address: formatFullAddress(),
        city,
        state,
        pincode
      };

      const response = await apiFetch('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: addressPayload,
          items: cart
            .filter(itm => (checkedCartItemIds || []).includes(itm.id))
            .map(itm => ({
              productVariantId: itm.productVariantId,
              quantity: itm.quantity
            })),
          couponCode: appliedCoupon?.code || undefined
        })
      });

      if (response && response.clientSecret) {
        setStripeClientSecret(response.clientSecret);
        setStripeOrderId(response.orderId);
        setStripeAmount(response.amount);
        addToast("Premium Stripe Checkout Gateway secured!", "success");
      } else {
        throw new Error(response?.error || "Failed to secure transaction token from Stripe gateway.");
      }
    } catch (err: any) {
      console.error("[Stripe Session Initialization Error]", err);
      addToast(err.message || "An atypical billing error occurred during Stripe session initialisation.", "error");
    } finally {
      setInitializingStripe(false);
    }
  };

  // Payment Gateway Simulator States
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [qrMinutes, setQrMinutes] = useState(5);
  const [qrSeconds, setQrSeconds] = useState(0);
  const [paymentStep, setPaymentStep] = useState<string>('');

  // Format Helper Functions
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`.slice(0, 5);
    }
    return v;
  };

  const getCardType = (num: string) => {
    const stripped = num.replace(/\s+/g, '');
    if (stripped.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(stripped)) return 'Mastercard';
    if (/^3[47]/.test(stripped)) return 'AMEX';
    return '';
  };

  // Timer loop for simulation QR Code countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (showQr && (qrMinutes > 0 || qrSeconds > 0)) {
      timer = setInterval(() => {
        if (qrSeconds === 0) {
          setQrMinutes(prev => prev - 1);
          setQrSeconds(59);
        } else {
          setQrSeconds(prev => prev - 1);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showQr, qrMinutes, qrSeconds]);

  // Quick select UPI Extensions handles click
  const selectUpiExt = (ext: string) => {
    const prefix = upiId.includes('@') ? upiId.split('@')[0] : upiId || 'customer';
    setUpiId(`${prefix}${ext}`);
  };

  // Redirection guard to check if cart has items
  useEffect(() => {
    if (cart.length === 0) {
      addToast("Your Shopping Bag is empty. Please select an apparel first", "info");
      navigate('/clothing');
    }
  }, [cart, navigate]);

  // Auto-apply FREE coupon to make checkout all free by default
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    if (cart.length > 0 && !appliedCoupon) {
      // Auto apply FREE coupon for 100% complimentary checkouts as requested
      apiFetch('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: 'FREE', cartValue: cartSubtotal })
      }).then((data) => {
        if (data) {
          applyCoupon('FREE');
        }
      }).catch(err => console.warn("Failed auto voucher setup", err));
    }
  }, [cart, appliedCoupon, cartSubtotal]);

  // Derived values
  const shippingFee = cartSubtotal >= (settings.freeShippingThreshold ?? 5000) ? 0 : (settings.shippingRate ?? 150);
  const totalAmountToPay = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  const handleManualCouponApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponCodeInput.trim().toUpperCase());
      setCouponCodeInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !street.trim() || !city.trim() || !state.trim() || !pincode.trim() || !locality.trim()) {
      addToast("Please fill out all mandatory shipping details (Name, Phone, Pincode, Locality, Address, City, State) to proceed", "error");
      return;
    }

    if (cart.length === 0 || checkedCartItemIds.length === 0) {
      addToast("Your selected cart is empty", "error");
      return;
    }

    if (!isEmailVerified) {
      addToast("Please verify your email address to proceed securely", "error");
      return;
    }

    if (!turnstileToken && import.meta.env.PROD) {
      addToast("Please complete the security check to proceed", "error");
      return;
    }

    // Payment validation
    if (paymentMethod === 'upi') {
      if (!upiId.includes('@') || upiId.trim().length < 5) {
        addToast("Please provide a valid unified payments UPI alias (e.g. user@bank)", "error");
        return;
      }
    }

    const formatFullAddress = () => {
      let full = street;
      if (locality) full += `, ${locality}`;
      if (landmark) full += ` (Landmark: ${landmark})`;
      if (addressType) full += ` [${addressType}]`;
      if (alternatePhone) full += ` (Alt: ${alternatePhone})`;
      return full;
    };

    const addressPayload = {
      name,
      phone,
      address: formatFullAddress(),
      city,
      state,
      pincode
    };

    setLoading(true);
    try {
      if (paymentMethod === 'card' || paymentMethod === 'upi') {
        // Initialize Real Razorpay Integration
        const res = await loadRazorpay();
        if (!res) {
          addToast("Razorpay SDK failed to load. Please check your internet connection.", "error");
          setLoading(false);
          return;
        }

        // Fetch Order ID from our backend
        const orderRes = await apiFetch('/api/payments/create-order', {
          method: 'POST',
          body: JSON.stringify({ totalAmount: totalAmountToPay })
        });

        const razorpayKey = (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

        if (razorpayKey === "rzp_test_placeholder") {
          // Simulate Razorpay gateway for local testing since no key is provided
          addToast("Test mode: Simulating Razorpay payment...", "info");
          setPaymentStep("Initializing Razorpay Secure Gateway...");
          await new Promise(r => setTimeout(r, 1000));
          setPaymentStep("Payment successful! Finalizing order...");
          const customPaymentId = `rzp_mock_${Date.now()}`;
          const order = await createOrder(addressPayload, customPaymentId);
          if (order) {
            navigate(`/order-confirmation?id=${order.id}`);
          }
          setLoading(false);
          return;
        }

        const options = {
          key: razorpayKey, // Valid Razorpay test/live key
          amount: orderRes.amount,
          currency: orderRes.currency,
          name: "Infinity Traders",
          description: "Premium Purchase",
          order_id: orderRes.id,
          handler: async function (response: any) {
            try {
              setPaymentStep("Payment successful! Finalizing order...");
              const customPaymentId = response.razorpay_payment_id || `rzp_${Date.now()}`;
              const order = await createOrder(addressPayload, customPaymentId);
              if (order) {
                navigate(`/order-confirmation?id=${order.id}`);
              }
            } catch (err: any) {
              addToast("Failed to finalize order.", "error");
            }
          },
          prefill: {
            name: name,
            email: "customer@example.com",
            contact: phone
          },
          theme: {
            color: "#C9A96E"
          }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
          addToast(response.error.description || "Payment failed", "error");
        });
        rzp1.open();

        // We don't set loading to false here because the modal is open.
        // If they close it, we can't easily catch it without custom bindings, 
        // but Razorpay handles the overlay. 
        setLoading(false);
        return;
      } else {
        setPaymentStep("Processing secondary cash on delivery courier allocation...");
        await new Promise(r => setTimeout(r, 1100));
        setPaymentStep("Contacting automatic verification service center...");
        await new Promise(r => setTimeout(r, 1200));
        setPaymentStep("Courier allocated! Fulfilling luxury dispatch packaging...");
        await new Promise(r => setTimeout(r, 1000));
      }

      const customPaymentId = `cod_${Date.now()}`;

      // Call API to process order creation for COD
      const order = await createOrder(addressPayload, customPaymentId);
      if (order) {
        setPaymentStep("Order finalized successfully! Enjoy your luxury attire!");
        await new Promise(r => setTimeout(r, 800));
        navigate(`/order-confirmation?id=${order.id}`);
      }
    } catch (err: any) {
      addToast(err.message || "An atypical billing error occurred. Please try again", "error");
    } finally {
      if (paymentMethod !== 'card' && paymentMethod !== 'upi') {
        setLoading(false);
        setPaymentStep('');
      }
    }
  };

  return (
    <div className="flex-grow pt-32 pb-24 font-['Inter'] px-6 max-w-7xl mx-auto min-h-screen text-gray-900">

      {/* Dynamic Keyframes Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* Browser Autofill Overrides for inputs AND textareas */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus,
        textarea:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #f9fafb inset !important;
            -webkit-text-fill-color: #000000 !important;
        }

        @keyframes smoke {
          0% { transform: scale(1) translateY(0); opacity: 0.8; }
          100% { transform: scale(2) translateY(-8px); opacity: 0; }
        }
        @keyframes carBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px) rotate(0.5deg); }
        }
        @keyframes roadDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-40px); }
        }
        @keyframes slideBox1 {
          0% { transform: translate(-100px, -45px) scale(0.4); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(-10px, 8px) scale(1.05); opacity: 0; }
        }
        @keyframes slideBox2 {
          0% { transform: translate(-130px, -50px) scale(0.4); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(5px, 8px) scale(1.05); opacity: 0; }
        }
        @keyframes wheelRot {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-smoke-puff {
          animation: smoke 0.6s infinite ease-out;
        }
        .animate-car-bounce {
          animation: carBounce 0.16s infinite ease-in-out;
        }
        .animate-road-drift {
          animation: roadDrift 0.35s infinite linear;
          width: 250%;
        }
        .animate-slide-box-1 {
          animation: slideBox1 1.2s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }
        .animate-slide-box-2 {
          animation: slideBox2 1.5s infinite cubic-bezier(0.25, 1, 0.5, 1);
          animation-delay: 0.4s;
        }
        .animate-wheel-spin {
          animation: wheelRot 0.25s infinite linear;
        }
      `}</style>

      {/* LUXURY INTERACTIVE CAR/DELIVERY LOADER OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[99999] flex flex-col items-center justify-center p-6 text-center select-none text-white transition-opacity duration-300">
          <div className="max-w-md w-full space-y-8 relative">

            {paymentStep.includes('success') ? (
              <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.6)] text-white">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-['Inter'] text-2xl font-black text-white uppercase tracking-widest mt-4">
                  PAYMENT SECURED
                </h3>
                <p className="text-xs font-medium text-green-400 uppercase tracking-[0.2em]">
                  Order confirmed. Rerouting...
                </p>
              </div>
            ) : (
              <>
                {/* Title stage */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-600/15 border border-red-600/30 rounded-full text-red-600 text-[10px] font-medium uppercase tracking-[0.2em] font-bold animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> SECURING TRANSACTION
                  </div>
                  <h3 className="font-['Inter'] text-2xl text-white uppercase tracking-wider">
                    DRIPEON Courier Express
                  </h3>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-relaxed">
                    Fulfilling premium tailoring standards & secure routing
                  </p>
                </div>

            {/* Dynamic Road & Luxury Transport Animation Stage */}
            <div className="relative h-48 bg-white border border-gray-200/50 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-end p-4">

              {/* Backdrops */}
              <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

              {/* Floating shopping bag on the top-left */}
              <div className="absolute top-5 left-8 flex flex-col items-center animate-bounce" style={{ animationDuration: '2s' }}>
                <div className="w-12 h-12 bg-red-600/25 border border-red-600/55 rounded-full flex items-center justify-center text-red-600 shadow-lg shadow-brand-gold/10">
                  <ShoppingCart className="w-4.5 h-4.5" />
                </div>
                <span className="text-[7.5px] font-medium text-red-600 uppercase tracking-[0.18em] mt-1.5 font-bold">CRAFTING BAG</span>
              </div>

              {/* Floating destination house on the top-right */}
              <div className="absolute top-5 right-8 flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/45 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl">🏠</span>
                </div>
                <span className="text-[7.5px] font-medium text-emerald-400 uppercase tracking-[0.18em] mt-1.5 font-bold">DESTINATION</span>
              </div>

              {/* Sliding package boxes falling from Cart Bag down to Delivery Vehicle */}
              <div className="absolute inset-x-0 top-11 flex justify-between px-20 pointer-events-none z-10">
                {/* Visual parcel box 1 */}
                <div className="w-4 h-4 bg-red-600 text-white border border-white/20 rounded-sm shadow-md animate-slide-box-1" />
                {/* Visual parcel box 2 */}
                <div className="w-4 h-4 bg-[#b3955d] border border-white/10 rounded-sm shadow-md animate-slide-box-2" />
              </div>

              {/* THE CAR/ROAD CONTAINER */}
              <div className="w-full relative py-3">

                {/* Dashed Roadway Pathway */}
                <div className="relative w-full h-3 bg-neutral-900 border-y border-gray-200/50 rounded-full overflow-hidden">
                  <div className="absolute inset-0 flex gap-4 animate-road-drift">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <span key={i} className="h-0.5 w-4 bg-red-600/60 shrink-0 self-center" />
                    ))}
                  </div>
                </div>

                {/* Highly-Luxury Delivery Truck (Store Van) */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center">

                  {/* Car structure with bounce animation */}
                  <div className="relative animate-car-bounce">

                    {/* Store Delivery Van SVG */}
                    <svg className="w-16 h-9 text-red-600 drop-shadow-[0_4px_12px_rgba(201,169,110,0.55)]" viewBox="0 0 100 50" fill="currentColor">
                      {/* Van main body frame */}
                      <path d="M5 40 L5 12 C5 9 7 7 10 7 L65 7 C68 7 70 9 70 12 L70 18 L88 18 C92 18 95 21 95 25 L95 40 Z" />
                      {/* Windshield translucent cutout */}
                      <path d="M72 12 L85 18 L72 18 Z" fill="#000000" opacity="0.45" />
                      {/* Luxury signature design accent parallel lines */}
                      <line x1="12" y1="20" x2="58" y2="20" stroke="#000000" strokeWidth="3" />
                      <line x1="16" y1="24" x2="52" y2="24" stroke="#000000" strokeWidth="2" strokeDasharray="3,1" />
                      {/* Handle indicator */}
                      <circle cx="34" cy="14" r="2" fill="#ffffff" opacity="0.8" />
                    </svg>

                    {/* Left golden wheel with spin indicators */}
                    <div className="absolute bottom-[-1.5px] left-[15px] w-5 h-5 bg-neutral-950 border-2 border-red-600 rounded-full flex items-center justify-center animate-wheel-spin">
                      <span className="w-1.5 h-3 bg-red-600 text-white rounded-full" />
                    </div>

                    {/* Right golden wheel with spin indicators */}
                    <div className="absolute bottom-[-1.5px] right-[21px] w-5 h-5 bg-neutral-950 border-2 border-red-600 rounded-full flex items-center justify-center animate-wheel-spin">
                      <span className="w-1.5 h-3 bg-red-600 text-white rounded-full" />
                    </div>

                    {/* Back Exhaust Smoke Puffs */}
                    <div className="absolute left-[-9px] bottom-1 flex gap-1 pointer-events-none">
                      <span className="w-1 h-1 rounded-full bg-gray-100/50 animate-smoke-puff" style={{ animationDelay: '100ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-100/35 animate-smoke-puff" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>

                {/* Tracking location beacons overlaying the road map */}
                <div className="absolute top-[-8px] left-[5%] right-[5%] flex justify-between h-4.5 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 text-white animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>

              </div>

              {/* Realtime Courier speed readouts */}
              <div className="text-center pt-2">
                <span className="text-[9px] font-medium text-red-600 uppercase tracking-[0.25em] font-bold block">FAST SHIP ROUTING</span>
                <span className="text-[10px] font-medium text-gray-900/90 uppercase tracking-widest mt-0.5 truncate block font-medium">
                  COURIER STATUS: EXPRESS AUTO-DISPATCH ACTIVE • SCALE ₹0 COMPLIANT
                </span>
              </div>

            </div>

            {/* Progress bar and logs */}
            <div className="space-y-4">

              {/* Progress Slider track */}
              <div className="relative w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-gray-200/30">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-gold to-emerald-400 transition-all duration-300"
                  style={{
                    width: paymentStep.includes('Loom') || paymentStep.includes('validated') || paymentStep.includes('released') || paymentStep.includes('successful') || paymentStep.includes('Packaging') || paymentStep.includes('allocated')
                      ? '85%'
                      : paymentStep.includes('funds') || paymentStep.includes('confirma') || paymentStep.includes('Verifying') || paymentStep.includes('push') || paymentStep.includes('automatic')
                        ? '55%'
                        : '25%'
                  }}
                />
              </div>

              {/* Streaming Secure Logs Console */}
              <div className="bg-white border border-gray-200/60 hover:border-red-600/40 p-4 rounded-sm flex items-center gap-3 shadow-md">
                <RefreshCw className="w-4 h-4 text-red-600 animate-spin shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-red-600 font-bold block">🔐 SECURE GATEWAY ENCRYPTED</span>
                  <span className="text-[11px] text-gray-900 uppercase tracking-wider font-medium truncate block mt-0.5 leading-relaxed font-semibold">
                    {paymentStep || "INITIALISING SECURE DISPATCH RELEASE..."}
                  </span>
                </div>
              </div>

              {/* Bottom taglines */}
              <p className="text-[8.5px] font-medium text-gray-500 uppercase tracking-[0.15em] leading-relaxed">
                🛡️ TRANSACTION COMPLIMENTARY SECURED BY SECURE CARD VAULT PROTOCOLS
              </p>
            </div>
            </>
            )}

          </div>
        </div>
      )}

      {/* Detail header title navigation bar */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200/25 select-none text-[11px] font-medium text-gray-500 uppercase tracking-widest">
        <button onClick={() => navigate(-1)} className="hover:text-gray-900 flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to bag
        </button>
        <span>/</span>
        <span className="text-red-600 font-semibold">Secure Checkout Studio</span>
      </div>

      {/* MAIN TWO COLUMN GRID DESIGN REPRESENTING USER IMAGE MODEL COHESIVELY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT COLUMN: Shipping and Payment Cards Wrapped in a single standard form */}
        <div className="lg:col-span-7 space-y-8">

          {/* FORM ELEMENT WRAPPER FOR BOTH CONTAINERS */}
          <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-8">

            {/* CARD 1: SHIPPING ADDRESS MODULE (Mockup Aligned Luxury Style) */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden transition-all hover:border-red-600/20">

              {/* ── Email OTP verification removed: inline panel below email field ── */}

              {savedAddresses.length > 0 && (
                <div className="bg-white/40 border border-red-600/25 p-5 rounded space-y-4 text-left select-none mb-6">
                  <span className="text-[10px] font-medium text-red-600 uppercase tracking-[0.2em] block font-bold">SELECT RECIPIENT FROM YOUR SAVED ADDRESS BOOK</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
                    {savedAddresses.map((addr: any) => {
                      const isCurrentlySelected =
                        name === addr.name &&
                        phone === addr.phone &&
                        pincode === addr.pincode &&
                        city === addr.city;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setName(addr.name);
                            setPhone(addr.phone);
                            setPincode(addr.pincode);
                            setLocality(addr.locality);
                            setStreet(addr.locality);
                            setCity(addr.city);
                            setState(addr.state);
                            setAddressType(addr.addressType || 'HOME');
                            // Removed isPhoneVerified(true)
                            addToast(`Prefilled shipping details: ${addr.name}`, "info");
                          }}
                          className={`p-3.5 border rounded cursor-pointer transition-all hover:bg-neutral-900 ${isCurrentlySelected
                              ? 'border-red-600 bg-red-600/5 text-gray-900'
                              : 'border-gray-200/40 text-gray-500 hover:border-gray-200'
                            }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-neutral-900 text-red-600 border border-gray-200/40 rounded-sm">
                              {addr.addressType} {addr.isDefault ? '(Default)' : ''}
                            </span>
                            {isCurrentlySelected && (
                              <span className="text-red-600 text-xs font-bold">✓ Selected</span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-900 mt-2 uppercase">{addr.name}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">{addr.phone}</p>
                          <p className="text-[10px] font-medium text-gray-500 leading-relaxed mt-2 uppercase">
                            {addr.locality}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-b border-gray-200/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 text-white relative">
                      <span className="absolute inset-0 bg-red-600 text-white rounded-full animate-ping" />
                    </span>
                    ADD A NEW ADDRESS
                  </h3>
                  <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-1">Specify destination credentials for logistics handover</p>
                </div>

                {/* Geolocation Button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="bg-[#2874f0] hover:bg-red-600 active:bg-red-700 text-gray-900 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded shrink-0 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Use my current location
                </button>
              </div>

              {/* Grid fields mimicking Mockup Attachment */}
              <div className="space-y-4">

                {/* Row 1: Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none placeholder-neutral-600 transition-all font-['Inter'] uppercase"
                    />
                  </div>

                  {/* Email + OTP inline verification */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-red-600 block font-semibold mb-1">
                      Email Address *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setIsEmailVerified(false); 
                          setOtpSent(false); 
                          setShowOtpPanel(false); 
                          setEnteredOtp(''); 
                          setDevOtp('');
                        }}
                        className={`flex-grow bg-gray-50 border px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none placeholder-gray-400 transition-all font-medium ${
                          isEmailVerified ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200/50 focus:border-red-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={triggerSendOtp}
                        disabled={isEmailVerified || otpSending || !email.includes('@')}
                        className={`shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 min-w-[100px] ${
                          isEmailVerified
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-400/40 cursor-default'
                            : otpSending
                              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-wait'
                              : email.includes('@')
                                ? 'bg-red-600 hover:bg-gray-900 text-white cursor-pointer border border-transparent'
                                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {isEmailVerified
                          ? <><span>✓</span> Verified</>
                          : otpSending
                            ? 'Sending...'
                            : otpSent ? 'Resend' : 'Verify Email'}
                      </button>
                    </div>

                    {/* ── Inline OTP panel ── slides in below email field */}
                    {showOtpPanel && !isEmailVerified && (
                      <div className="mt-2 border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-3 animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-wide">Enter Verification Code</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              A 6-digit code was sent to <span className="text-red-600 font-semibold">{email}</span>
                            </p>
                            {devOtp && (
                              <p className="text-[10px] text-amber-600 font-mono font-bold mt-1 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                [DEV] Code: {devOtp}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => { setShowOtpPanel(false); setEnteredOtp(''); setOtpError(''); }}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0 mt-0.5"
                          >×</button>
                        </div>

                        {/* 6-box OTP input */}
                        <div className="flex gap-2 justify-center">
                          {[0,1,2,3,4,5].map(i => (
                            <input
                              key={i}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={enteredOtp[i] || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                const newOtp = enteredOtp.split('');
                                newOtp[i] = val.slice(-1); // Take only the last typed char if multiple
                                const joined = newOtp.join('').slice(0, 6);
                                setEnteredOtp(joined);
                                setOtpError('');
                                // Move to next box
                                if (val && i < 5) {
                                  const next = document.getElementById(`otp-box-${i+1}`);
                                  next?.focus();
                                }
                                // Auto verify when all 6 entered
                                if (joined.length === 6) {
                                  handleVerifyOtp(joined);
                                }
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                if (pastedData) {
                                  setEnteredOtp(pastedData);
                                  setOtpError('');
                                  if (pastedData.length === 6) {
                                    handleVerifyOtp(pastedData);
                                  } else {
                                    const next = document.getElementById(`otp-box-${pastedData.length}`);
                                    next?.focus();
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !enteredOtp[i] && i > 0) {
                                  const prev = document.getElementById(`otp-box-${i-1}`);
                                  prev?.focus();
                                  const newOtp = enteredOtp.split('');
                                  newOtp[i-1] = '';
                                  setEnteredOtp(newOtp.join(''));
                                }
                              }}
                              id={`otp-box-${i}`}
                              className={`w-10 h-11 text-center text-base font-bold border rounded-lg focus:outline-none transition-all ${
                                otpError ? 'border-red-500 bg-red-50 text-red-600'
                                  : enteredOtp[i] ? 'border-red-600 bg-white text-gray-900'
                                  : 'border-gray-200 bg-white text-gray-900 focus:border-red-600'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Error message */}
                        {otpError && (
                          <p className="text-[10px] text-red-600 font-medium text-center">{otpError}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerifyOtp(enteredOtp)}
                            disabled={enteredOtp.length !== 6 || otpVerifying}
                            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                              enteredOtp.length === 6 && !otpVerifying
                                ? 'bg-red-600 hover:bg-gray-900 text-white cursor-pointer'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {otpVerifying ? 'Verifying...' : 'Confirm Code'}
                          </button>
                          <button
                            type="button"
                            onClick={triggerSendOtp}
                            disabled={otpSending}
                            className="px-4 py-2.5 border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-800 text-[10px] font-medium uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Resend
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 1.5: Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">10-digit mobile number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none placeholder-neutral-600 transition-all font-medium"
                    />
                  </div>
                  <div className="hidden sm:block"></div>
                </div>

                {/* Row 2: Pincode and Locality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-red-600 rounded focus:outline-none placeholder-neutral-600 transition-all font-medium font-bold"
                    />
                  </div>

                  {/* Locality */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">Locality *</label>
                    <input
                      type="text"
                      required
                      placeholder="Locality"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none placeholder-neutral-600 transition-all font-['Inter'] uppercase"
                    />
                  </div>
                </div>

                {/* Row 3: Address (Area and Street) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">Address (Area and Street) *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Address (Area and Street)"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none placeholder-neutral-600 transition-all font-['Inter'] resize-none uppercase"
                  />
                </div>

                {/* Row 4: City/District/Town and State Dropdown Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">City/District/Town *</label>
                    <input
                      type="text"
                      required
                      placeholder="City/District/Town"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none placeholder-neutral-600 transition-all font-['Inter'] uppercase"
                    />
                  </div>

                  {/* Dropdown state identifier */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">State *</label>
                    <div className="relative">
                      <select
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none transition-all font-['Inter'] cursor-pointer appearance-none uppercase"
                      >
                        <option value="">--Select State--</option>
                        <option value="Jharkhand">Jharkhand</option>
                      </select>
                      <div className="absolute right-3.5 top-3.5 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-red-600" />
                    </div>
                  </div>
                </div>

                {/* Row 5: Landmark and Alternate Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Landmark */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="Landmark (Optional)"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none placeholder-neutral-600 transition-all font-['Inter'] uppercase"
                    />
                  </div>

                  {/* Alternate Phone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">Alternate Phone (Optional)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Alternate Phone (Optional)"
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-gray-50 border border-gray-200/50 focus:border-red-600 px-3.5 py-2.5 text-xs text-black font-bold rounded focus:outline-none placeholder-neutral-600 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Row 6: Address Type Radio Buttons */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-medium uppercase tracking-widest text-gray-500 block">Address Type</label>
                  <div className="flex gap-6 items-center select-none">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-900">
                      <input
                        type="radio"
                        name="addressType"
                        checked={addressType === 'HOME'}
                        onChange={() => setAddressType('HOME')}
                        className="accent-brand-gold w-4 h-4 cursor-pointer"
                      />
                      Home
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-900">
                      <input
                        type="radio"
                        name="addressType"
                        checked={addressType === 'WORK'}
                        onChange={() => setAddressType('WORK')}
                        className="accent-brand-gold w-4 h-4 cursor-pointer"
                      />
                      Work
                    </label>
                  </div>
                </div>

                {/* Row 7: Mockup styled CTA triggers */}
                <div className="pt-4 flex gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (!name.trim() || !phone.trim() || !pincode.trim() || !locality.trim() || !street.trim() || !city.trim() || !state.trim()) {
                        addToast("Please fill out all mandatory shipping fields (*) to save", "error");
                        return;
                      }
                      if (phone.length !== 10) {
                        addToast("Please enter a valid 10-digit mobile number", "error");
                        return;
                      }
                      if (!isEmailVerified) {
                        addToast("Please verify your email address via OTP first", "error");
                        triggerSendOtp();
                        return;
                      }
                      addToast("Shipping credentials verified and locked successfully!", "success");
                    }}
                    className="bg-[#2874f0] hover:bg-red-600 text-gray-900 font-medium text-[11px] font-bold uppercase tracking-wider px-8 py-3 rounded cursor-pointer transition-all shadow-md shrink-0 flex items-center justify-center min-w-[120px]"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName('');
                      setPhone('');
                      setPincode('');
                      setLocality('');
                      setStreet('');
                      setCity('');
                      setState('');
                      setLandmark('');
                      setAlternatePhone('');
                      setAddressType('HOME');
                      // Handle saved address deselection
                      setOtpSent(false);
                      addToast("Form cleared successfully.", "info");
                    }}
                    className="text-red-600 hover:text-gray-900 hover:underline text-[11px] font-medium uppercase tracking-widest cursor-pointer py-2 px-3"
                  >
                    CANCEL
                  </button>
                </div>

              </div>

            </div>

            {/* CARD 2: PAYMENT METHOD CONTAINER (High-fidelity design of Image 2) */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-6 space-y-6 shadow-xl relative overflow-hidden transition-all hover:border-red-600/20">
              <div className="border-b border-gray-200/40 pb-4">
                <h3 className="font-['Inter'] text-xl text-gray-900 uppercase tracking-wider font-bold">3. Payment Settlement</h3>
              </div>

              {/* Two Tab Selection matching Razorpay/COD design */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
                {/* Razorpay Online Payment Tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-5 rounded-xl border flex flex-col items-start gap-2 transition-all text-left cursor-pointer ${paymentMethod === 'card' || paymentMethod === 'upi'
                      ? 'border-red-600 bg-red-600/10 text-red-600 font-bold shadow-lg shadow-red-600/10 scale-[1.02]'
                      : 'border-gray-200/50 text-gray-500 bg-transparent hover:border-red-600/40 hover:text-gray-900'
                    }`}
                >
                  <CreditCard className="w-6 h-6 mb-1" />
                  <span className="text-sm font-black uppercase tracking-wider">Razorpay Online Payment</span>
                  <span className="text-[10px] font-medium opacity-80 normal-case tracking-wide">Pay via Cards, UPI, Netbanking</span>
                </button>

                {/* COD Tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-5 rounded-xl border flex flex-col items-start gap-2 transition-all text-left cursor-pointer ${paymentMethod === 'cod'
                      ? 'border-red-600 bg-red-600/10 text-red-600 font-bold shadow-lg shadow-red-600/10 scale-[1.02]'
                      : 'border-gray-200/50 text-gray-500 bg-transparent hover:border-red-600/40 hover:text-gray-900'
                    }`}
                >
                  <Truck className="w-6 h-6 mb-1" />
                  <span className="text-sm font-black uppercase tracking-wider">Cash on Delivery (COD)</span>
                  <span className="text-[10px] font-medium opacity-80 normal-case tracking-wide">Settle with cash upon delivery</span>
                </button>
              </div>



            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: Order Summary, Items list, Coupon Entry, and BUY AT pricing Action Button (Linked cleanly) */}
        <div className="lg:col-span-5 space-y-6">

          {/* ORDER SUMMARY CONTAINER (Modular Card layout from Image 2) */}
          <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden transition-all hover:border-red-600/20 select-none">
            <div className="flex items-center justify-between border-b border-gray-200/40 pb-3">
              <h3 className="font-['Inter'] text-base font-bold tracking-widest text-black uppercase flex items-center gap-2">
                <ShoppingCart className="w-4.5 h-4.5 text-red-600" /> Order Summary
              </h3>
              <span className="text-xs font-medium text-red-600 font-bold">{cart.filter(item => (checkedCartItemIds || []).includes(item.id)).length} Articles</span>
            </div>

            {/* Product items loop with thumbnails */}
            <div className="space-y-4 max-h-[290px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.filter(item => (checkedCartItemIds || []).includes(item.id)).map((item) => {
                const imgUrl = getProductImageUrl(item.product);
                return (
                  <div key={item.id} className="flex gap-5 items-center">
                    <div className="w-24 h-32 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200/45 shadow-sm">
                      <img
                        src={imgUrl}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-2">
                      <h4 className="text-sm text-black font-['Inter'] tracking-wider truncate uppercase font-extrabold mb-1.5">{item.product?.name}</h4>
                      <p className="text-xs text-gray-800 font-bold uppercase">
                        {item.variant?.color || 'Custom'} • Fit {item.variant?.size} • Qty {item.quantity}
                      </p>
                    </div>
                    <div className="text-base text-red-600 font-black tracking-tight">
                      ₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VOUCHER / COUPON ENGINE CARD (Apply voucher field for 100% Free experience) */}
            <div className="border-t border-b border-gray-200/40 py-4.5 space-y-3">
              <span className="text-[9px] font-medium uppercase tracking-widest text-gray-500 block font-semibold">🎁 PROMO VOUCHERS</span>

              <form onSubmit={handleManualCouponApply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER PROMO (E.G. FREE)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="bg-white border border-gray-200/60 focus:border-red-600 text-xs text-gray-900 px-3 py-2 rounded focus:outline-none uppercase font-medium flex-1 placeholder-brand-grey/50"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="bg-red-600 hover:bg-gray-900 text-white px-4.5 text-[10px] font-medium uppercase tracking-wider font-extrabold rounded transition-all cursor-pointer disabled:opacity-50"
                >
                  Apply
                </button>
              </form>

              {/* Fast single-tap promos listed under field */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => applyCoupon('FREE')}
                  className={`text-[8px] font-medium uppercase px-2 py-1 rounded border transition-all ${appliedCoupon?.code === 'FREE'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-200/50 bg-transparent text-gray-500 hover:border-red-600 hover:text-red-600'
                    }`}
                >
                  🎁 FREE (100% OFF)
                </button>
                <button
                  type="button"
                  onClick={() => applyCoupon('DRIP10')}
                  className={`text-[8px] font-medium uppercase px-2 py-1 rounded border transition-all ${appliedCoupon?.code === 'DRIP10'
                      ? 'border-red-600 bg-red-600/10 text-red-600'
                      : 'border-gray-200/50 bg-transparent text-gray-500 hover:border-red-600 hover:text-red-600'
                    }`}
                >
                  ✨ DRIP10 (10% OFF)
                </button>
              </div>
            </div>

            {/* SUB-TOTALS CALCULATIONS & BREAKDOWN */}
            <div className="space-y-3.5 text-xs font-['Inter']">

              <div className="flex justify-between text-gray-500">
                <span>Selected items value</span>
                <span className="font-medium text-gray-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-red-600 font-medium animate-fade-in bg-red-600/5 py-1.5 px-2.5 rounded border border-red-600/10">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    Coupon code applied ({appliedCoupon.code})
                  </span>
                  <span className="font-medium">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>Express delivery courier</span>
                <span className="font-medium text-gray-900">
                  {shippingFee === 0 ? 'COMPLIMENTARY' : `₹${shippingFee}`}
                </span>
              </div>

              <div className="border-t border-gray-200/65 pt-4.5 flex justify-between items-baseline">
                <span className="text-sm font-['Inter'] text-gray-900 uppercase tracking-wider font-semibold">Total obligation</span>
                <span className="text-2xl font-['Inter'] font-black text-red-600 tracking-tighter">
                  ₹{totalAmountToPay.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* REAL-TIME DELIVERIES LOGISTIC ROUTE PREVIEW */}
            <div className="bg-gray-100/10 border border-gray-200/40 p-3.5 rounded-lg text-left select-none text-[10.5px]">
              <div className="flex items-center justify-between text-red-600 font-medium uppercase tracking-wider font-bold mb-1.5">
                <span>📦 Delivery Route Pinpoint</span>
                <span className="text-[7.5px] bg-red-600/20 text-red-600 px-1.5 py-0.5 rounded">AUTO MATCH</span>
              </div>
              <p className="text-gray-900 font-['Inter'] uppercase font-light text-xs line-clamp-2 leading-relaxed">
                {street ? `${street}, ${city}, ${state} - ${pincode}` : 'Fill shipping coordinates on left form to calibrate logistics...'}
              </p>
            </div>

            {/* THE PRIMARY SUBMIT ACTION BUTTON (PROCEED TO PAY) */}
            <div className="pt-2 space-y-4">
              <div className="flex justify-center w-full min-h-[65px]">
                <Turnstile
                  siteKey={(import.meta as any).env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'light' }}
                />
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full bg-red-600 text-white hover:bg-gray-900 text-xs font-black tracking-[0.2em] h-14 uppercase rounded-full shadow-lg shadow-red-600/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-red-600"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    FULFILLING ORDER...
                  </>
                ) : (
                  <>
                    PROCEED TO PAY ₹{totalAmountToPay.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </div>

            {/* Verification assurance logos */}
            <p className="text-[8.5px] font-medium text-gray-500 text-center uppercase tracking-widest leading-relaxed mt-4 shrink-0">
              ⚡ PCI-DSS Level 1 • RSA Cryptography • complimentary insurance dispatches
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
