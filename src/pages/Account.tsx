import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Order, ReturnExchangeRequest, Product, ProductVariant, User } from '../types';
import { 
  User as UserIcon, 
  MapPin, 
  Package, 
  RefreshCw, 
  Heart, 
  LogOut, 
  Save, 
  ShoppingBag, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Trash2,
  Lock,
  Plus,
  Check
} from 'lucide-react';

export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  city: string;
  state: string;
  addressType: 'HOME' | 'WORK';
  isDefault: boolean;
}

/**
 * Account - Elite User Portal Dashboard
 * Implements a streamlined, high-end 4-tab drawer/tab list strictly adhering to:
 * 1. Profile Details & Address Presets
 * 2. Purchase Orders & Exchange Claims
 * 3. Bookmarked Wishlist Collections with dynamic cart additions
 * 4. Secure Session Terminate
 * 
 * Styled entirely within the minimalist, gold-accented "DRIPEON" luxury aesthetic.
 */
export default function Account(): React.JSX.Element {
  const { 
    user, 
    login, 
    register, 
    logout, 
    updateAddress, 
    fetchUserOrders, 
    fetchUserReturns, 
    submitReturn, 
    addToCart,
    addToast,
    wishlist,
    removeFromWishlist,
    globalProducts
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';

  // Authentication form view states
  const [isLoginView, setIsLoginView] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Profile presets edit states
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateStr, setStateStr] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');

  // Flipkart style states
  const [isEditingPersonal, setIsEditingPersonal] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('Male');

  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [editEmail, setEditEmail] = useState<string>('');

  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [editPhone, setEditPhone] = useState<string>('');

  // Multiple Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address Form fields
  const [addrName, setAddrName] = useState<string>('');
  const [addrPhone, setAddrPhone] = useState<string>('');
  const [addrPincode, setAddrPincode] = useState<string>('');
  const [addrLocality, setAddrLocality] = useState<string>('');
  const [addrCity, setAddrCity] = useState<string>('');
  const [addrState, setAddrState] = useState<string>('');
  const [addrType, setAddrType] = useState<'HOME' | 'WORK'>('HOME');

  // Orders, Returns & Catalog states
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnExchangeRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Return & Exchange claims state
  const [submittingReturn, setSubmittingReturn] = useState<boolean>(false);
  const [returnOrderId, setReturnOrderId] = useState<string>('');
  const [returnItemId, setReturnItemId] = useState<string>('');
  const [returnType, setReturnType] = useState<'RETURN' | 'EXCHANGE'>('RETURN');
  const [returnReason, setReturnReason] = useState<string>('');

  // Wishlist global state synced from AppContext

  // Load User Specific Data and Presets on Authentication
  useEffect(() => {
    if (user) {
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setStateStr(user.address?.state || '');
      setPincode(user.address?.pincode || '');
      setProfilePhone(user.phone || '');

      // Initialize edit states
      const nameParts = (user.name || '').trim().split(/\s+/);
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEditEmail(user.email || '');
      setEditPhone(user.phone || '');
      
      const savedGender = localStorage.getItem(`DRIPEON_gender_${user.id}`);
      if (savedGender === 'Male' || savedGender === 'Female') {
        setGender(savedGender as 'Male' | 'Female');
      } else {
        setGender('Male');
      }

      // Initialize multiple addresses from local storage
      const savedAddresses = localStorage.getItem(`DRIPEON_addresses_${user.id}`);
      if (savedAddresses) {
        try {
          setAddresses(JSON.parse(savedAddresses));
        } catch (e) {
          setAddresses([]);
        }
      } else {
        const initialAddrList: SavedAddress[] = [];
        if (user.address?.street || user.phone) {
          initialAddrList.push({
            id: 'addr-default',
            name: user.name,
            phone: user.phone || '',
            pincode: user.address?.pincode || '',
            locality: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            addressType: 'HOME',
            isDefault: true
          });
        }
        setAddresses(initialAddrList);
        localStorage.setItem(`DRIPEON_addresses_${user.id}`, JSON.stringify(initialAddrList));
      }
      
      loadDashboardData();
    }
  }, [user]);

  const handleSavePersonalInfo = async () => {
    if (!firstName.trim()) {
      addToast("First Name cannot be empty.", "error");
      return;
    }
    const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const success = await updateAddress(user?.address || {}, editPhone, combinedName, editEmail);
    if (success) {
      localStorage.setItem(`DRIPEON_gender_${user?.id}`, gender);
      setIsEditingPersonal(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!editEmail.trim() || !editEmail.includes('@')) {
      addToast("Please provide a valid email.", "error");
      return;
    }
    const success = await updateAddress(user?.address || {}, editPhone, user?.name, editEmail);
    if (success) {
      setIsEditingEmail(false);
    }
  };

  const handleSavePhone = async () => {
    if (!editPhone.trim()) {
      addToast("Mobile Phone cannot be empty.", "error");
      return;
    }
    const success = await updateAddress(user?.address || {}, editPhone, user?.name, editEmail);
    if (success) {
      setIsEditingPhone(false);
    }
  };

  const clearAddressForm = () => {
    setAddrName('');
    setAddrPhone('');
    setAddrPincode('');
    setAddrLocality('');
    setAddrCity('');
    setAddrState('');
    setAddrType('HOME');
  };

  const handleSaveAddressForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrPhone.trim() || !addrPincode.trim() || !addrLocality.trim() || !addrCity.trim() || !addrState.trim()) {
      addToast("Please fill all required address fields.", "error");
      return;
    }

    let updatedList: SavedAddress[] = [...addresses];

    if (editingAddressId) {
      updatedList = updatedList.map(item => {
        if (item.id === editingAddressId) {
          return {
            ...item,
            name: addrName.trim(),
            phone: addrPhone.trim(),
            pincode: addrPincode.trim(),
            locality: addrLocality.trim(),
            city: addrCity.trim(),
            state: addrState.trim(),
            addressType: addrType
          };
        }
        return item;
      });
      addToast("Address details updated successfully.", "success");
    } else {
      const newAddress: SavedAddress = {
        id: `addr-${Date.now()}`,
        name: addrName.trim(),
        phone: addrPhone.trim(),
        pincode: addrPincode.trim(),
        locality: addrLocality.trim(),
        city: addrCity.trim(),
        state: addrState.trim(),
        addressType: addrType,
        isDefault: updatedList.length === 0
      };
      updatedList.push(newAddress);
      addToast("New address saved to your profile.", "success");
    }

    setAddresses(updatedList);
    if (user) {
      localStorage.setItem(`DRIPEON_addresses_${user.id}`, JSON.stringify(updatedList));
      const defaultAddr = updatedList.find(a => a.isDefault) || updatedList[0];
      if (defaultAddr) {
        updateAddress({
          street: defaultAddr.locality,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
          country: "Worldwide"
        }, defaultAddr.phone);
      }
    }

    setIsAddingAddress(false);
    setEditingAddressId(null);
    clearAddressForm();
  };

  const handleDeleteAddress = (id: string) => {
    if (!user) return;
    const nextList = addresses.filter(item => item.id !== id);
    if (addresses.find(item => item.id === id)?.isDefault && nextList.length > 0) {
      nextList[0].isDefault = true;
    }
    setAddresses(nextList);
    localStorage.setItem(`DRIPEON_addresses_${user.id}`, JSON.stringify(nextList));
    addToast("Address removed successfully.", "info");

    const defaultAddr = nextList.find(a => a.isDefault) || nextList[0];
    if (defaultAddr) {
      updateAddress({
        street: defaultAddr.locality,
        city: defaultAddr.city,
        state: defaultAddr.state,
        pincode: defaultAddr.pincode,
        country: "Worldwide"
      }, defaultAddr.phone);
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    if (!user) return;
    const nextList = addresses.map(item => ({
      ...item,
      isDefault: item.id === id
    }));
    setAddresses(nextList);
    localStorage.setItem(`DRIPEON_addresses_${user.id}`, JSON.stringify(nextList));
    addToast("Primary dispatch address designated.", "success");

    const targetAddr = nextList.find(item => item.id === id);
    if (targetAddr) {
      updateAddress({
        street: targetAddr.locality,
        city: targetAddr.city,
        state: targetAddr.state,
        pincode: targetAddr.pincode,
        country: "Worldwide"
      }, targetAddr.phone);
    }
  };

  const handleStartEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setIsAddingAddress(true);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrPincode(addr.pincode);
    setAddrLocality(addr.locality);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrType(addr.addressType);
  };

  // removed loadWishlistCatalog useEffect

  /**
   * Safely loads historical orders and return claims from database ledger
   */
  async function loadDashboardData(): Promise<void> {
    setLoading(true);
    try {
      const [oList, rList] = await Promise.all([
        fetchUserOrders(),
        fetchUserReturns()
      ]);
      setOrders(oList || []);
      setReturns(rList || []);
    } catch (err) {
      console.error("Dashboard database fetch error rejected:", err);
      addToast("Failed to fetch past order records.", "error");
    } finally {
      setLoading(false);
    }
  }



  /**
   * Submission handler for login and registry credentials
   */
  async function handleAuthSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email || !password) {
      addToast("Valid email and password are required.", "error");
      return;
    }

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        if (!name) {
          addToast("Name registration is required.", "error");
          return;
        }
        await register(name, email, password, phone);
      }
    } catch (err) {
      console.error("Auth process error caught:", err);
      addToast("Identity validation failed. Please check credentials.", "error");
    }
  }

  /**
   * Updates user demographic & delivery location presets
   */
  async function handleProfileSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      const payload: User['address'] = {
        street: street.trim(),
        city: city.trim(),
        state: stateStr.trim(),
        pincode: pincode.trim(),
        country: "Worldwide"
      };
      
      const success = await updateAddress(payload, profilePhone.trim());
      if (success) {
        addToast("Address details saved safely inside your profile presets.", "success");
      }
    } catch (err) {
      console.error("Profile edit transaction rejected:", err);
      addToast("Could not store updated demographic details.", "error");
    }
  }

  /**
   * Initiates custom return/exchange transaction ticket
   */
  async function handleReturnSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!returnOrderId || !returnItemId || !returnReason) {
      addToast("All return parameters must be declared.", "error");
      return;
    }

    setSubmittingReturn(true);
    try {
      const success = await submitReturn(returnOrderId, returnItemId, returnType, returnReason.trim());
      if (success) {
        setReturnOrderId('');
        setReturnItemId('');
        setReturnReason('');
        loadDashboardData();
        addToast("Return ticket successfully opened.", "success");
      }
    } catch (err) {
      console.error("Claims submit failure caught:", err);
      addToast("Return initiation rejected by dispatch desk.", "error");
    } finally {
      setSubmittingReturn(false);
    }
  }

  /**
   * Removes item from lookbook
   */
  const handleRemoveFromWishlist = async (productId: string, productName: string) => {
    await removeFromWishlist(productId);
    addToast(`Removed "${productName}" from wishlist collection.`, 'info');
  };

  /**
   * Imports custom wishlist apparel directly into checkout-ready cart list
   */
  const handleAddWishlistToCart = async (product: Product): Promise<void> => {
    if (!product.variants || product.variants.length === 0) {
      addToast("Select apparel article is currently out of stock.", "error");
      return;
    }
    try {
      const defaultVariant = product.variants[0];
      await addToCart(defaultVariant.id, 1);
      addToast(`Direct checkout addition: "${product.name}" (${defaultVariant.size}) added.`, "success");
    } catch (err) {
      console.error("Cart transaction failed:", err);
      addToast("Cart addition failed. Please try again.", "error");
    }
  };

  // Switch Active Tab View
  const selectTab = (tabId: string): void => {
    setSearchParams({ tab: tabId });
  };

  // Render Login & Registration screens
  if (!user) {
    return (
      <div className="flex-grow pt-40 pb-24 px-6 max-w-md mx-auto min-h-screen">
        <div className="bg-white border border-red-600/45 p-8 rounded-sm text-center select-none shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
          <div className="space-y-2 mb-6">
            <h1 className="font-sans text-3xl text-gray-900 uppercase tracking-wider">
              {isLoginView ? "Sign In" : "Sign Up"}
            </h1>
            <p className="text-[10px] text-red-600 font-medium uppercase tracking-[0.25em]">
              DRIPEON — Luxury Studio
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {!isLoginView && (
              <div className="space-y-1">
                <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Your Full Name</label>
                <input
                  type="text"
                  placeholder="Yuvraj Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-red-600/60 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none placeholder-gray-400 uppercase"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Email Address</label>
              <input
                type="email"
                placeholder="yraj15927@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-red-600/60 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none placeholder-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Security Code Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-red-600/60 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none placeholder-gray-400"
              />
            </div>

            {!isLoginView && (
              <div className="space-y-1">
                <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Mobile Phone Connected</label>
                <input
                  type="tel"
                  placeholder="+91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-red-600/60 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none placeholder-gray-400"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 text-white hover:bg-gray-900 text-white font-semibold text-xs py-3 tracking-widest uppercase transition-colors rounded-sm cursor-pointer mt-2"
            >
              {isLoginView ? "SIGN IN CLIENT PORTAL" : "CREATE NEW PROFILE"}
            </button>
          </form>

          {/* Switch link */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200/20 mt-6 font-medium text-[10px] uppercase">
            {isLoginView ? (
              <p>
                New lookbook collector?{' '}
                <button 
                  onClick={() => setIsLoginView(false)} 
                  className="text-red-600 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have a profile?{' '}
                <button 
                  onClick={() => setIsLoginView(true)} 
                  className="text-red-600 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
          
          {/* Authentic Test Credentials */}
          <div className="bg-white border border-gray-200/40 p-4 rounded-sm text-left space-y-1 mt-6">
            <span className="text-[9px] font-medium text-red-600 uppercase block tracking-wider font-semibold">Quick Verification Logins:</span>
            <p className="text-[10px] text-gray-500 font-medium">Customer: <strong>customer@DRIPEON.com / customer</strong></p>
            <p className="text-[10px] text-gray-500 font-medium">Admin Panel: <strong>DRIPEON@gmail.com / admin</strong></p>
          </div>
        </div>
      </div>
    );
  }

  // Find products saved in lookbook look
  const wishlistProductIds = wishlist.map((w: any) => w.productId);
  const wishlistedItems = globalProducts.filter((p: any) => wishlistProductIds.includes(p.id));

  return (
    <div className="flex-grow pt-32 pb-24 font-sans px-6 max-w-7xl mx-auto min-h-screen">
      
      {/* Dynamic Luxury Page Header */}
      <div className="border-b border-gray-200 pb-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div>
          <span className="text-[10px] font-medium text-red-600 uppercase tracking-[0.3em] font-semibold">MEMBER EXCLUSIVITY ACCREDITATION</span>
          <h1 className="font-sans text-3xl sm:text-4xl text-gray-900 uppercase mt-1 tracking-wide">
            {user.name}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 font-medium text-[10px] text-gray-500 uppercase">
            <span>{user.email}</span>
            <span className="text-brand-grey">•</span>
            <span className="text-red-600 font-semibold">Verified Customer</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left items-start">
        
        {/* Left Column - Dynamic Sidebar Menu */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-gray-200 p-5 rounded-sm">
            <span className="text-[10px] font-medium text-red-600 uppercase tracking-widest block mb-4 border-b border-gray-200/40 pb-2">Account Menu</span>
            
            <nav className="flex flex-col gap-1">
              {/* Profile Details Tab */}
              <button
                onClick={() => selectTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-left uppercase font-medium text-xs transition-all w-full cursor-pointer select-none ${
                  currentTab === 'profile'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/20'
                }`}
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">My Profile</span>
                  <span className={`block text-[9px] leading-none mt-0.5 lowercase font-sans font-normal ${
                    currentTab === 'profile' ? 'text-black/70' : 'text-gray-500'
                  }`}>Addresses & credentials</span>
                </div>
              </button>

              {/* Orders Tab */}
              <button
                onClick={() => selectTab('orders')}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-left uppercase font-medium text-xs transition-all w-full cursor-pointer select-none ${
                  currentTab === 'orders'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/20'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">My Orders</span>
                  <span className={`block text-[9px] leading-none mt-0.5 lowercase font-sans font-normal ${
                    currentTab === 'orders' ? 'text-black/70' : 'text-gray-500'
                  }`}>Orders & return desk</span>
                </div>
              </button>

              {/* Wishlist Tab */}
              <button
                onClick={() => selectTab('wishlist')}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-left uppercase font-medium text-xs transition-all w-full cursor-pointer select-none ${
                  currentTab === 'wishlist'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/20'
                }`}
              >
                <Heart className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">My Wishlist</span>
                  <span className={`block text-[9px] leading-none mt-0.5 lowercase font-sans font-normal ${
                    currentTab === 'wishlist' ? 'text-black/70' : 'text-gray-500'
                  }`}>Saved clothing watchlist</span>
                </div>
              </button>

              {/* Address Settings Tab */}
              <button
                onClick={() => selectTab('addresses')}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-left uppercase font-medium text-xs transition-all w-full cursor-pointer select-none ${
                  currentTab === 'addresses'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/20'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">Address Settings</span>
                  <span className={`block text-[9px] leading-none mt-0.5 lowercase font-sans font-normal ${
                    currentTab === 'addresses' ? 'text-black/70' : 'text-gray-500'
                  }`}>Manage saved addresses</span>
                </div>
              </button>

              <div className="my-2 border-t border-gray-200/30"></div>

              {/* Logout Action Tab */}
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-sm text-gray-500 hover:text-red-400 hover:bg-gray-100 text-left uppercase font-medium text-xs transition-all w-full cursor-pointer select-none"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block font-bold">Log Out</span>
                  <span className="block text-[9px] leading-none mt-0.5 lowercase font-sans font-normal">Terminate profile session</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column - Active Content Panels */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: Profile Details & Addresses */}
          {currentTab === 'profile' && (
            <div className="space-y-8 animate-fade-in text-gray-900">
              <div className="space-y-6">
                
                {/* 1. Personal Information Section */}
                <div className="bg-gradient-to-b from-white to-gray-50/80 border border-gray-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-8 rounded-2xl hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:border-red-600/30 transition-all duration-500 relative overflow-hidden group">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200/20 mb-6">
                    <h2 className="text-sm font-medium tracking-wider uppercase text-red-600 font-bold flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-red-600" /> Personal Information
                    </h2>
                    <button
                      onClick={() => {
                        if (isEditingPersonal) {
                          // Cancel
                          setIsEditingPersonal(false);
                          const nameParts = (user?.name || '').trim().split(/\s+/);
                          setFirstName(nameParts[0] || '');
                          setLastName(nameParts.slice(1).join(' ') || '');
                        } else {
                          setIsEditingPersonal(true);
                        }
                      }}
                      className="text-xs font-medium text-red-600 hover:text-gray-900 uppercase font-bold tracking-wider cursor-pointer"
                    >
                      {isEditingPersonal ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={!isEditingPersonal}
                          className={`w-full bg-white border px-3 py-2.5 text-xs focus:outline-none transition-all ${
                            isEditingPersonal 
                              ? 'border-red-600 text-black font-semibold' 
                              : 'border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed font-semibold'
                          }`}
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={!isEditingPersonal}
                          className={`w-full bg-white border px-3 py-2.5 text-xs focus:outline-none transition-all ${
                            isEditingPersonal 
                              ? 'border-red-600 text-black font-semibold' 
                              : 'border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed font-semibold'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Gender Section */}
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 block mb-3">Your Gender</span>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2.5 text-xs font-medium uppercase cursor-pointer select-none">
                          <input
                            type="radio"
                            name="gender"
                            value="Male"
                            checked={gender === 'Male'}
                            onChange={() => isEditingPersonal && setGender('Male')}
                            disabled={!isEditingPersonal}
                            className={`w-4.5 h-4.5 accent-brand-gold cursor-pointer ${
                              !isEditingPersonal ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                          />
                          <span className={gender === 'Male' ? 'text-red-600 font-bold' : 'text-gray-500'}>Male</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs font-medium uppercase cursor-pointer select-none">
                          <input
                            type="radio"
                            name="gender"
                            value="Female"
                            checked={gender === 'Female'}
                            onChange={() => isEditingPersonal && setGender('Female')}
                            disabled={!isEditingPersonal}
                            className={`w-4.5 h-4.5 accent-brand-gold cursor-pointer ${
                              !isEditingPersonal ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                          />
                          <span className={gender === 'Female' ? 'text-red-600 font-bold' : 'text-gray-500'}>Female</span>
                        </label>
                      </div>
                    </div>

                    {isEditingPersonal && (
                      <button
                        onClick={handleSavePersonalInfo}
                        className="bg-red-600 hover:bg-gray-900 text-white font-semibold text-xs px-6 py-2.5 uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-white" /> Save Info
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Email Address Section */}
                <div className="bg-gradient-to-b from-white to-gray-50/80 border border-gray-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-8 rounded-2xl hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:border-red-600/30 transition-all duration-500 relative overflow-hidden group">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200/20 mb-6">
                    <h2 className="text-sm font-medium tracking-wider uppercase text-red-600 font-bold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-600" /> Registered Email Address
                    </h2>
                    <button
                      onClick={() => {
                        if (isEditingEmail) {
                          setIsEditingEmail(false);
                          setEditEmail(user?.email || '');
                        } else {
                          setIsEditingEmail(true);
                        }
                      }}
                      className="text-xs font-medium text-red-600 hover:text-gray-900 uppercase font-bold tracking-wider cursor-pointer"
                    >
                      {isEditingEmail ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1 max-w-md">
                      <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        disabled={!isEditingEmail}
                        className={`w-full bg-white border px-3 py-2.5 text-xs focus:outline-none transition-all ${
                          isEditingEmail 
                            ? 'border-red-600 text-black font-semibold' 
                            : 'border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed font-semibold'
                        }`}
                      />
                    </div>

                    {isEditingEmail && (
                      <button
                        onClick={handleSaveEmail}
                        className="bg-red-600 hover:bg-gray-900 text-white font-semibold text-xs px-6 py-2.5 uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-white" /> Save Email
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Mobile Number Section */}
                <div className="bg-gradient-to-b from-white to-gray-50/80 border border-gray-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-8 rounded-2xl hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:border-red-600/30 transition-all duration-500 relative overflow-hidden group">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200/20 mb-6">
                    <h2 className="text-sm font-medium tracking-wider uppercase text-red-600 font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" /> Contact Mobile Number
                    </h2>
                    <button
                      onClick={() => {
                        if (isEditingPhone) {
                          setIsEditingPhone(false);
                          setEditPhone(user?.phone || '');
                        } else {
                          setIsEditingPhone(true);
                        }
                      }}
                      className="text-xs font-medium text-red-600 hover:text-gray-900 uppercase font-bold tracking-wider cursor-pointer"
                    >
                      {isEditingPhone ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1 max-w-md">
                      <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Mobile Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        disabled={!isEditingPhone}
                        placeholder="+91 99999 99999"
                        className={`w-full bg-white border px-3 py-2.5 text-xs focus:outline-none transition-all ${
                          isEditingPhone 
                            ? 'border-red-600 text-black font-semibold' 
                            : 'border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed font-semibold'
                        }`}
                      />
                    </div>

                    {isEditingPhone && (
                      <button
                        onClick={handleSavePhone}
                        className="bg-red-600 hover:bg-gray-900 text-white font-semibold text-xs px-6 py-2.5 uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-white" /> Save Phone
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: Manage Addresses */}
          {currentTab === 'addresses' && (
            <div className="space-y-8 animate-fade-in text-gray-900">
              <div className="space-y-6">

                {/* 4. Multiple Addresses Section */}
                <div className="bg-gradient-to-b from-white to-gray-50/80 border border-gray-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-8 rounded-2xl hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:border-red-600/30 transition-all duration-500 relative overflow-hidden group space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200/20">
                    <h2 className="text-sm font-medium tracking-wider uppercase text-gray-900 font-bold flex items-center gap-2">
                      <MapPin className="w-4.5 h-4.5 text-red-600" /> Manage Addresses ({addresses.length})
                    </h2>
                    {!isAddingAddress && (
                      <button
                        onClick={() => {
                          clearAddressForm();
                          setEditingAddressId(null);
                          setIsAddingAddress(true);
                        }}
                        className="text-xs font-medium bg-red-600 text-white hover:bg-gray-900 text-white px-4 py-2 uppercase tracking-wider cursor-pointer font-bold inline-flex items-center gap-1 transition-all rounded-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD A NEW ADDRESS
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Address Form */}
                  {isAddingAddress && (
                    <form onSubmit={handleSaveAddressForm} className="bg-white border border-red-600/25 p-5 space-y-4 rounded-sm animate-fade-in text-gray-900 max-w-2xl">
                      <span className="text-[10px] font-medium text-red-600 uppercase tracking-wider block font-bold">
                        {editingAddressId ? 'EDIT RECIPIENT ADDRESS' : 'ADD NEW RECIPIENT ADDRESS'}
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Recipient Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Aditya Yadav"
                            value={addrName}
                            onChange={(e) => setAddrName(e.target.value)}
                            className="w-full bg-white border border-gray-200 focus:border-red-600 px-3 py-2 text-xs text-gray-900 focus:outline-none"
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">10-Digit Phone *</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 1234567890"
                            value={addrPhone}
                            onChange={(e) => setAddrPhone(e.target.value)}
                            className="w-full bg-white border border-gray-200 focus:border-red-600 px-3 py-2 text-xs text-gray-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pincode */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">ZIP / PIN Code *</label>
                          <input
                            type="text"
                            required
                            placeholder="6-digit PIN e.g. 110001"
                            value={addrPincode}
                            onChange={(e) => setAddrPincode(e.target.value)}
                            className="w-full bg-white border border-gray-200 focus:border-red-600 px-3 py-2 text-xs text-gray-900 focus:outline-none font-medium"
                          />
                        </div>

                        {/* Locality */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Locality / Area / Street *</label>
                          <input
                            type="text"
                            required
                            placeholder="Apartment, building, sector details"
                            value={addrLocality}
                            onChange={(e) => setAddrLocality(e.target.value)}
                            className="w-full bg-white border border-gray-200 focus:border-red-600 px-3 py-2 text-xs text-gray-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* City */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">City / District *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. New Chicago"
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            className="w-full bg-white border border-gray-200 focus:border-red-600 px-3 py-2 text-xs text-gray-900 focus:outline-none"
                          />
                        </div>

                        {/* State */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">State *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Chicago"
                            value={addrState}
                            onChange={(e) => setAddrState(e.target.value)}
                            className="w-full bg-white border border-gray-200 focus:border-red-600 px-3 py-2 text-xs text-gray-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Address Type */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] font-medium uppercase tracking-wider text-gray-500 block font-bold">Address Type</span>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setAddrType('HOME')}
                            className={`px-4 py-2 border text-[11px] font-medium uppercase font-bold text-left cursor-pointer transition-all ${
                              addrType === 'HOME'
                                ? 'bg-red-600/15 border-red-600 text-red-600'
                                : 'bg-transparent border-gray-200/40 text-gray-500 hover:border-gray-200'
                            }`}
                          >
                            HOME (Delivery all day)
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddrType('WORK')}
                            className={`px-4 py-2 border text-[11px] font-medium uppercase font-bold text-left cursor-pointer transition-all ${
                              addrType === 'WORK'
                                ? 'bg-red-600/15 border-red-600 text-red-600'
                                : 'bg-transparent border-gray-200/40 text-gray-500 hover:border-gray-200'
                            }`}
                          >
                            WORK (10 AM - 5 PM)
                          </button>
                        </div>
                      </div>

                      {/* Submit form buttons */}
                      <div className="flex gap-4 pt-3 border-t border-gray-200/25 mt-4">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-red-600 text-white hover:bg-gray-900 text-white font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                        >
                          SAVE ADDRESS
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            clearAddressForm();
                            setEditingAddressId(null);
                            setIsAddingAddress(false);
                          }}
                          className="px-6 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-900 text-xs tracking-wider uppercase transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List Saved Addresses */}
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <p className="text-xs font-medium text-gray-500 uppercase">No delivery addresses saved in your registry. Click ADD A NEW ADDRESS.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div 
                            key={addr.id} 
                            className={`border p-4 rounded-sm flex flex-col justify-between transition-all space-y-4 relative ${
                              addr.isDefault 
                                ? 'border-red-600 bg-red-600/5 shadow-[0_4px_20px_rgba(212,175,55,0.1)]' 
                                : 'border-gray-200/40 bg-white/40 hover:border-gray-200'
                            }`}
                          >
                            {/* Address detail header block */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-gray-100 border border-gray-200/50 text-red-600 text-[9px] font-medium font-bold uppercase rounded-sm">
                                  {addr.addressType}
                                </span>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 bg-red-600 text-white text-white text-[9px] font-medium font-black uppercase rounded-sm">
                                    Primary Dispatch
                                  </span>
                                )}
                              </div>

                              <h3 className="text-xs font-medium font-bold text-gray-900 uppercase">{addr.name}</h3>
                              <p className="text-xs font-medium text-gray-500 mt-1">{addr.phone}</p>
                              
                              <p className="text-xs text-gray-500 font-sans font-normal leading-relaxed mt-2.5">
                                {addr.locality}, {addr.city}, {addr.state} - <span className="font-medium">{addr.pincode}</span>
                              </p>
                            </div>

                            {/* Action links */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200/20 mt-2 text-[10px] font-medium uppercase">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleStartEditAddress(addr)}
                                  className="text-red-600 hover:text-gray-900 cursor-pointer"
                                >
                                  Edit Address
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-red-400 hover:text-red-500 cursor-pointer text-[10px]"
                                >
                                  Remove
                                </button>
                              </div>

                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="text-[10px] text-gray-500 hover:text-red-600 cursor-pointer"
                                >
                                  Set as default
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Purchase Ledger & Claims Desk */}
          {currentTab === 'orders' && (
            <div className="space-y-12 animate-fade-in">
              
              {/* Purchase history */}
              <div className="space-y-4">
                <h2 className="font-sans text-lg text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-200/40">
                  <Package className="w-5 h-5 text-red-600" /> Past Invoices ({orders.length})
                </h2>

                {loading ? (
                  <p className="text-xs font-medium text-gray-500 uppercase">Retrieving secure purchase ledger...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-gray-200/50 rounded-sm bg-white">
                    <ShoppingBag className="w-8 h-8 text-brand-grey mx-auto mb-3 animate-pulse" />
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">No past orders found for this customer profile.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border border-gray-200 bg-white rounded-sm p-5 space-y-4 shadow-[0_2px_10px_rgba(0,0,0,0.4)] hover:border-red-600/20 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200/30 pb-3 text-xs uppercase font-medium">
                          <div>
                            <span className="text-gray-500">Order ID:</span>{' '}
                            <span className="text-gray-900 font-semibold">{order.id}</span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-500">
                            <span>{order.createdAt.split('T')[0]}</span>
                            <span className="px-2.5 py-0.5 bg-red-600/15 text-red-600 border border-red-600/25 font-bold rounded-sm text-[10px]">
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order items inside */}
                        <div className="space-y-3">
                          {order.items.map(itm => (
                            <div key={itm.id} className="flex gap-4 items-center">
                              <div className="w-10 h-12 bg-gray-100 rounded-sm overflow-hidden shrink-0 border border-gray-200/30">
                                <img src={itm.productSnapshot.imageUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 text-xs text-left">
                                <h4 className="text-gray-900 font-sans tracking-wider uppercase font-medium">{itm.productSnapshot.name}</h4>
                                <p className="text-[10px] text-gray-500 font-medium uppercase">
                                  Color: {itm.productSnapshot.color} | Size: {itm.productSnapshot.size} | Qty: {itm.quantity}
                                </p>
                              </div>
                              <div className="font-medium text-xs text-red-600 font-semibold">
                                ₹{(itm.unitPrice * itm.quantity).toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200/30 flex-col sm:flex-row gap-3 uppercase font-medium text-xs">
                          <div className="text-gray-500 leading-relaxed text-left w-full sm:w-auto">
                            Total transaction value: <span className="text-red-600 font-semibold">${order.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                            <span className="text-gray-500 text-[10px] hidden md:inline">Gateway Status: Razorpay Encrypted</span>
                            <button 
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="px-4 py-2 bg-red-600 text-white hover:bg-gray-900 text-white text-[10px] font-medium tracking-widest uppercase transition-all rounded-sm font-bold text-center w-full sm:w-auto cursor-pointer"
                            >
                              {order.status === 'DELIVERED' ? 'Post Review / Track' : order.status === 'CANCELLED' ? 'View Details' : 'Track Package'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Claims Desk */}
              <div className="space-y-6">
                <h2 className="font-sans text-lg text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-200/40">
                  <RefreshCw className="w-4.5 h-4.5 text-red-600" /> Returns & Exchanges Claims
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Claim Initiator Form */}
                  <form onSubmit={handleReturnSubmit} className="space-y-4 bg-white p-5 border border-gray-200 rounded-sm">
                    <span className="text-[10px] font-medium text-red-600 uppercase block tracking-widest font-semibold pb-1.5 border-b border-gray-200/30">Initiate Dispatch Actions</span>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Active Shop Invoice</label>
                      <select
                        value={returnOrderId}
                        onChange={(e) => setReturnOrderId(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-red-600 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none"
                        required
                      >
                        <option value="">-- CHOOSE HISTORICAL BUY --</option>
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>{o.id} (${o.totalAmount})</option>
                        ))}
                      </select>
                    </div>

                    {returnOrderId && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Product Article</label>
                        <select
                          value={returnItemId}
                          onChange={(e) => setReturnItemId(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-red-600 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none uppercase"
                          required
                        >
                          <option value="">-- SELECT SPECIFIC CLOTH --</option>
                          {orders.find(o => o.id === returnOrderId)?.items.map(itm => (
                            <option key={itm.id} value={itm.productVariantId}>
                              {itm.productSnapshot.name} ({itm.productSnapshot.color} / {itm.productSnapshot.size})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500 block">Transaction Goal</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-gray-900 font-medium cursor-pointer font-medium">
                          <input 
                            type="radio" 
                            name="return_type" 
                            checked={returnType === 'RETURN'} 
                            onChange={() => setReturnType('RETURN')} 
                            className="accent-brand-gold cursor-pointer"
                          /> RETURN
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-900 font-medium cursor-pointer font-medium">
                          <input 
                            type="radio" 
                            name="return_type" 
                            checked={returnType === 'EXCHANGE'} 
                            onChange={() => setReturnType('EXCHANGE')} 
                            className="accent-brand-gold cursor-pointer"
                          /> EXCHANGE
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Claim details or Size switch rationale</label>
                      <textarea
                        rows={3}
                        placeholder="E.g., desire to exchange for size M due to tailored leg cuffs preference..."
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-red-600 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none placeholder-gray-400 uppercase"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReturn}
                      className="w-full bg-red-600 text-white hover:bg-gray-900 text-white font-semibold text-xs py-3 tracking-widest uppercase transition-colors rounded-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submittingReturn ? "TRANSMITTING TO DISPATCH..." : "SUBMIT RETURN CLAIM"}
                    </button>
                  </form>

                  {/* Active Claims List */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-medium text-red-600 uppercase block tracking-widest font-semibold pb-1.5 border-b border-gray-200/30">Active Claim Registers ({returns.length})</span>
                    
                    {returns.length === 0 ? (
                      <p className="text-xs text-gray-500 uppercase font-medium border border-dashed border-gray-200 p-6 rounded-sm text-center bg-white">
                        No dispatch return claims filed.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                        {returns.map(ret => {
                          let badgeStyle = 'text-red-600 bg-red-600/10 border-red-600/20';
                          if (ret.status === 'APPROVED' || ret.status === 'COMPLETED') {
                            badgeStyle = 'text-green-400 bg-green-500/10 border-green-500/20';
                          } else if (ret.status === 'REJECTED') {
                            badgeStyle = 'text-red-400 bg-red-500/10 border-red-500/20';
                          }

                          return (
                            <div key={ret.id} className="p-4 border border-gray-200 rounded-sm bg-white space-y-2 uppercase font-medium text-[11px] text-left">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-900 font-bold">CLAIM: {ret.id}</span>
                                <span className={`px-2 py-0.5 border rounded-sm font-bold text-[9px] ${badgeStyle}`}>
                                  {ret.status}
                                </span>
                              </div>
                              <p className="text-gray-500">Type: <span className="text-gray-900 font-semibold">{ret.type}</span> | Order: <span className="text-gray-900">{ret.orderId}</span></p>
                              <p className="text-gray-500 leading-relaxed font-light">Reason: <span className="text-gray-900">{ret.reason}</span></p>
                              {ret.adminNotes && (
                                <div className="border-t border-gray-200/40 pt-2 text-[10px] text-red-600 ltr italic leading-relaxed">
                                  Admin Notes: "{ret.adminNotes}"
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Curated Wishlist look */}
          {currentTab === 'wishlist' && (
            <div className="space-y-6 animate-fade-in text-left">
              <h2 className="font-sans text-lg text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-200/40">
                <Heart className="w-5 h-5 text-red-600" /> Curated Watchlist Lookbook ({wishlist.length})
              </h2>

              {wishlistedItems.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200/50 bg-white rounded-sm max-w-lg mx-auto">
                  <Heart className="w-10 h-10 text-brand-grey mx-auto mb-4 animate-pulse duration-1000" />
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-4 px-4 leading-relaxed">
                    Your collection remains empty. Cultivate your visual style by favoriting design pieces inside the boutique window.
                  </p>
                  <button
                    onClick={() => navigate('/clothing')}
                    className="px-5 py-2.5 bg-red-600 text-white hover:bg-gray-900 text-white text-[10px] font-medium tracking-widest uppercase transition-all rounded-sm font-bold"
                  >
                    DISCOVER COLLECTIONS
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {wishlistedItems.map(p => {
                    const primaryImg = p.images?.find(im => im.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
                    return (
                      <div 
                        key={p.id} 
                        className="bg-white border border-gray-200 hover:border-red-600/30 rounded-sm overflow-hidden flex flex-col justify-between tracking-wide shadow-lg group transition-all duration-300"
                      >
                        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                          <img 
                            src={primaryImg} 
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => handleRemoveFromWishlist(p.id, p.name)}
                            className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white border border-gray-200 rounded-full text-gray-500 hover:text-red-400 cursor-pointer select-none transition-colors"
                            title="Remove Look"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-4 space-y-3.5">
                          <div>
                            <span className="text-[8px] font-medium text-red-600 tracking-[0.2em] uppercase">{p.category}</span>
                            <h3 
                              onClick={() => navigate(`/products/${p.slug || p.id}`)}
                              className="font-sans text-sm text-gray-900 uppercase tracking-wider font-semibold truncate hover:text-red-600 cursor-pointer transition-colors"
                            >
                              {p.name}
                            </h3>
                            <div className="mt-1 font-medium text-xs text-red-600 font-bold">
                              ₹{p.price.toLocaleString('en-IN')}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => handleAddWishlistToCart(p)}
                              className="w-full bg-red-600 text-white hover:bg-gray-900 text-white text-[10px] font-medium py-2 tracking-widest font-bold uppercase transition-colors rounded-sm cursor-pointer flex items-center justify-center gap-2"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" /> ADD TO BAG
                            </button>
                            <button
                              onClick={() => navigate(`/products/${p.slug || p.id}`)}
                              className="w-full bg-white hover:bg-gray-100/25 text-gray-900 border border-gray-200 hover:border-gray-900 text-[10px] font-medium py-2 tracking-widest font-semibold uppercase transition-colors rounded-sm cursor-pointer flex items-center justify-center gap-1"
                            >
                              VIEW DETAILS <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
