import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, Product, CartItem, EnrichedCartItem, Order, Coupon, SiteSettings, ReturnExchangeRequest, ShippingAddress, Category } from './types';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  token: string | null;
  user: User | null;
  setUser: (user: any | null) => void;
  isAdmin: boolean;
  role: 'admin' | 'user' | string | null;
  settings: SiteSettings;
  cart: EnrichedCartItem[];
  cartCount: number;
  cartSubtotal: number;
  checkedCartItemIds: string[];
  setCheckedCartItemIds: React.Dispatch<React.SetStateAction<string[]>>;
  buyNowMode: boolean;
  setBuyNowMode: (mode: boolean) => void;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  toasts: Toast[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  pendingCartItem: { variantId: string; quantity: number } | null;
  setPendingCartItem: (item: { variantId: string; quantity: number } | null) => void;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  forgotPassword?: (email: string) => Promise<boolean>;
  verifyResetOtp?: (email: string, otp: string) => Promise<string | null>;
  resetPassword?: (email: string, resetToken: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  updateAddress: (address: User['address'], phone: string, name?: string, email?: string) => Promise<boolean>;

  // Cart actions
  addToCart: (variantId: string, quantity: number, isBuyNow?: boolean) => Promise<boolean>;
  updateCartQty: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Coupon actions
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Order actions
  createOrder: (shippingAddress: ShippingAddress, customPaymentId?: string) => Promise<Order | null>;
  fetchUserOrders: () => Promise<Order[]>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  submitReview: (orderId: string, rating: number, comment: string, reviewImages: string[]) => Promise<boolean>;
  cancelOrder: (id: string, reason: string) => Promise<boolean>;
  dismissCancellationRequest: (id: string, adminNotes?: string) => Promise<boolean>;
  confirmDelivery: (id: string, otp: string, paymentMode?: 'cash' | 'upi' | 'card' | 'cod') => Promise<boolean>;
  requestCallbackSupport: (orderId: string, phone: string, topic: string, notes: string) => Promise<boolean>;

  // Returns actions
  submitReturn: (orderId: string, orderItemId: string, type: 'RETURN' | 'EXCHANGE', reason: string) => Promise<boolean>;
  fetchUserReturns: () => Promise<ReturnExchangeRequest[]>;

  // Wishlist actions
  wishlist: any[];
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;

  // Toast triggers
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Refresh utils
  // Refresh utils
  refreshSettings: () => Promise<void>;
  refreshCart: () => Promise<void>;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;

  // Categories
  categories: Category[];
  fetchCategories: () => Promise<void>;
  addCategory: (name: string, type: 'CLOTHING' | 'FOOTWEAR' | 'CAPS' | 'ORNAMENTS') => Promise<boolean>;
  deleteCategory: (id: string, force?: boolean) => Promise<boolean>;

  // Products
  globalProducts: Product[];
  isProductsLoaded: boolean;
  fetchGlobalProducts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser } = useUser();
  const { getToken, signOut } = useAuth();

  // Track mapped user
  const [user, setUser] = useState<User | null>(null);

  const [cart, setCart] = useState<EnrichedCartItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    announcementText: "FREE SHIPPING WORLDWIDE ON ORDERS OVER ₹200 | DRIPEON",
    showAnnouncement: true,
    heroTitle: "DRIPEON",
    heroSub: "URBAN INNOVATION APPAREL",
    freeShippingThreshold: 200,
    shippingRate: 15,
    contactEmail: "storedripeon@gmail.com",
    homeHeroImage: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1500&q=80",
    footwearHeroImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1920&q=80",
    earPiercingImage: "https://images.unsplash.com/photo-1519764622345-23439dd774f7?q=80&w=1000&auto=format&fit=crop",
    aboutImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    clothingStoryImage1: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    clothingStoryImage2: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80"
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalProducts, setGlobalProducts] = useState<Product[]>([]);
  const [isProductsLoaded, setIsProductsLoaded] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [pendingCartItem, setPendingCartItem] = useState<{ variantId: string; quantity: number } | null>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Buy Now selection states
  const [checkedCartItemIds, setCheckedCartItemIds] = useState<string[]>([]);
  const [buyNowMode, setBuyNowMode] = useState<boolean>(false);

  // Derived Values
  const userRoleUpper = user?.role?.toUpperCase();
  const role = userRoleUpper === 'ADMIN' ? 'admin' : (user ? 'user' : null);
  const isAdmin = userRoleUpper === 'ADMIN';
  const cartCount = cart.length;

  // Subtotal is based only on the checked items!
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (checkedCartItemIds.includes(item.id)) {
        return sum + (item.product?.price || 0) * item.quantity;
      }
      return sum;
    }, 0);
  }, [cart, checkedCartItemIds]);

  // Sync checked items with cart changes
  useEffect(() => {
    if (cart.length > 0) {
      setCheckedCartItemIds(prev => {
        // Keep checked IDs that are still in the cart
        const validPrev = prev.filter(id => cart.some(item => item.id === id));
        if (validPrev.length === 0 && !buyNowMode) {
          // Default to checking everything on normal visits / loads
          return cart.map(item => item.id);
        }
        return validPrev;
      });
    } else {
      setCheckedCartItemIds([]);
    }
  }, [cart, buyNowMode]);

  const discountAmount = appliedCoupon
    ? (appliedCoupon.discountType === 'PERCENT'
      ? Math.round(cartSubtotal * (appliedCoupon.discountValue / 100))
      : appliedCoupon.discountValue)
    : 0;

  // Custom toasting
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    // Limit to exactly 1 toast at any given moment
    setToasts([{ id, message, type }]);

    // Auto remove after 3000ms for high-end professional readability
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Token cache — avoid calling Clerk getToken() on every API request (it's a network call)
  const tokenCacheRef = React.useRef<{ token: string; expiresAt: number } | null>(null);
  const getCachedToken = useCallback(async (): Promise<string | null> => {
    const now = Date.now();
    if (tokenCacheRef.current && now < tokenCacheRef.current.expiresAt) {
      return tokenCacheRef.current.token;
    }
    try {
      const fresh = await getToken();
      if (fresh) {
        tokenCacheRef.current = { token: fresh, expiresAt: now + 55_000 }; // cache 55s
      }
      return fresh;
    } catch {
      return null;
    }
  }, [getToken]);

  // Helper fetch with cached token
  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...((options.headers as any) || {}),
    };

    try {
      const activeToken = await getCachedToken();
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
        headers['X-User-Email'] = clerkUser?.primaryEmailAddress?.emailAddress || '';
      }
    } catch (e) { }

    const res = await fetch(url, { ...options, headers });

    // Check if the content-type returned is JSON
    const contentType = res.headers.get('content-type');
    let data: any = null;
    let isJson = false;

    if (contentType && contentType.toLowerCase().includes('application/json')) {
      try {
        data = await res.json();
        isJson = true;
      } catch (err) {
        console.warn("[JSON Parse Warning]", err);
      }
    }

    if (!res.ok) {
      const errorMsg = isJson && data?.error ? data.error : `Request failed with status ${res.status}`;
      // Do not force logout on 403 (Forbidden) or 401. Clerk handles the actual session lifecycle.
      throw new Error(errorMsg);
    }

    if (!isJson) {
      // If response is OK but not JSON (e.g. 201 No Content), just return null safely
      if (res.ok) return null;
      throw new Error("Expected JSON response but received a different format.");
    }

    return data;
  }, [clerkUser?.primaryEmailAddress?.emailAddress]);

  // Sync Clerk User to AppContext User
  useEffect(() => {
    if (clerkUser) {
      let userRole = (clerkUser.publicMetadata?.role as string) || 'USER';
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const adminEmails = [
        'storedripeon@gmail.com',
        'aurora.web011@gmail.com',
        'admin@dripeon.com',
        'dripeon@gmail.com',
        'yraj15927@gmail.com',
        'btech60045.24@bitmesra.ac.in'
      ];
      if (adminEmails.includes(email.toLowerCase())) {
        userRole = 'ADMIN';
      }
      setUser({
        id: clerkUser.id,
        name: clerkUser.fullName || 'Collector',
        email: email,
        role: userRole.toUpperCase(),
      } as any);
    } else {
      setUser(null);
    }
  }, [clerkUser]);

  // Loading settings
  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Error loaded settings", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch('/api/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.warn('Categories endpoint returned unexpected data');
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading categories', err);
      setCategories([]);
    }
  };


  const addCategory = async (name: string, type: 'CLOTHING' | 'FOOTWEAR' | 'CAPS' | 'ORNAMENTS') => {
    try {
      const res = await apiFetch('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name, type })
      });
      if (res && res.id) {
        setCategories(prev => [...prev, res]);
        return true;
      }
      addToast("Failed to add category: Invalid response format.", "error");
      return false;
    } catch (err: any) {
      addToast(`Failed to add category: ${err.message}`, "error");
      return false;
    }
  };

  const deleteCategory = async (id: string, force: boolean = false) => {
    try {
      await apiFetch(`/api/admin/categories/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== id));
      addToast(force ? "Category and its products deleted" : "Category deleted successfully", "success");
      return true;
    } catch (err: any) {
      addToast(err.message || "Failed to delete category (it may be in use)", "error");
      return false;
    }
  };

  // Loading cart
  const refreshCart = async () => {
    try {
      // Refresh local wishlist for both guests and users
      let localWishlistStr = localStorage.getItem('local_wishlist');
      let localWishlist = localWishlistStr ? JSON.parse(localWishlistStr) : [];
      setWishlist(localWishlist);

      const activeToken = await getToken();
      if (!activeToken) {
        const localCartStr = localStorage.getItem('local_cart');
        const localCart = localCartStr ? JSON.parse(localCartStr) : [];
        if (localCart.length > 0) {
          const products = await apiFetch('/api/products');
          const enriched: any[] = [];
          for (const localItem of localCart) {
            let foundVariant: any = null;
            let foundProduct: any = null;
            for (const p of products) {
              const v = p.variants?.find((v: any) => v.id === localItem.variantId);
              if (v) {
                foundVariant = v;
                foundProduct = p;
                break;
              }
            }
            if (foundVariant && foundProduct) {
              enriched.push({
                id: `local-${localItem.variantId}`,
                userId: 'local',
                productVariantId: localItem.variantId,
                quantity: localItem.quantity,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                variant: foundVariant,
                product: foundProduct,
              });
            }
          }
          setCart(enriched);
        } else {
          setCart([]);
        }
        return;
      }
      
      const [data, serverWishlist] = await Promise.all([
        apiFetch('/api/cart'),
        apiFetch('/api/wishlist')
      ]);

      // Sync local wishlist up to server
      if (localWishlist.length > 0) {
        for (const item of localWishlist) {
          if (!serverWishlist.find((w: any) => w.productId === item.productId)) {
            await apiFetch('/api/wishlist', {
              method: 'POST',
              body: JSON.stringify({ productId: item.productId })
            }).catch(() => {});
          }
        }
        localStorage.removeItem('local_wishlist'); // Merged, now clear it
        const finalServerWishlist = await apiFetch('/api/wishlist');
        setWishlist(finalServerWishlist);
      } else {
        setWishlist(serverWishlist);
      }

      setCart(data);
    } catch (err) {
      console.error("Error loading cart/wishlist", err);
    }
  };

  const fetchGlobalProducts = async () => {
    try {
      const data = await apiFetch('/api/products');
      if (Array.isArray(data)) {
        // Optimize Cloudinary Images for super fast loading
        const optimizedData = data.map((p: any) => ({
          ...p,
          images: p.images?.map((img: any) => {
            let optimizedUrl = img.imageUrl;
            if (optimizedUrl && optimizedUrl.includes('res.cloudinary.com') && !optimizedUrl.includes('f_auto')) {
              const parts = optimizedUrl.split('/upload/');
              if (parts.length === 2) {
                optimizedUrl = `${parts[0]}/upload/f_auto,q_auto,w_1200,c_limit/${parts[1]}`;
              }
            }
            return { ...img, imageUrl: optimizedUrl };
          })
        }));
        setGlobalProducts(optimizedData);
        setIsProductsLoaded(true);
      }
    } catch (err) {
      console.error('Error loading global products', err);
    }
  };

  useEffect(() => {
    refreshSettings();
    fetchCategories();
    fetchGlobalProducts();
    // Poll products every 5 minutes (not 2 seconds — that was hammering the server)
    const interval = setInterval(() => {
      fetchGlobalProducts();
      fetchCategories();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleAuthChange = async () => {
      const activeToken = await getToken();
      if (activeToken) {
        // Sync local cart to backend
        const localCartStr = localStorage.getItem('local_cart');
        if (localCartStr) {
          try {
            const localCart = JSON.parse(localCartStr);
            if (localCart && localCart.length > 0) {
              for (const item of localCart) {
                await fetch('/api/cart', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${activeToken}`,
                    'X-User-Email': clerkUser?.primaryEmailAddress?.emailAddress || ''
                  },
                  body: JSON.stringify({ productVariantId: item.variantId, quantity: item.quantity })
                }).catch(() => {});
              }
              localStorage.removeItem('local_cart');
            }
          } catch (e) {
            console.error("Failed to sync local cart", e);
          }
        }

        refreshCart();

        // Auto-resume action after successful authentication
        const pendingStr = localStorage.getItem('pending_cart_item');
        if (pendingStr) {
          try {
            const pending = JSON.parse(pendingStr);
            localStorage.removeItem('pending_cart_item');
            setTimeout(async () => {
              const success = await addToCart(pending.variantId, pending.quantity, true);
              if (success) {
                window.location.href = '/checkout';
              }
            }, 150);
          } catch (e) {
            console.error("Failed to parse pending cart item", e);
          }
        }
      } else {
        refreshCart();
      }
    };
    handleAuthChange();
  }, [clerkUser]);

  // Auth Operations (Now delegated to Clerk)
  const login = async (email: string, password: string) => {
    window.location.href = '/login';
    return true;
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    window.location.href = '/login?mode=signup';
    return true;
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch reset email');
      return true;
    } catch (err: any) {
      addToast("Failed to send reset email.", "error");
      return false;
    }
  };

  const verifyResetOtp = async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, intent: 'password_reset' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      return data.resetToken || null;
    } catch (err: any) {
      addToast(err.message, "error");
      return null;
    }
  };

  const resetPassword = async (email: string, resetToken: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      return true;
    } catch (err: any) {
      addToast(err.message, "error");
      return false;
    }
  };

  const logout = async () => {
    await signOut();
    localStorage.removeItem('pending_cart_item');
    sessionStorage.removeItem('redirect_after_login');
    setUser(null);
    setCart([]);
    setAppliedCoupon(null);
  };

  const updateAddress = async (address: User['address'], phone: string, name?: string, email?: string) => {
    // Simulated update profile
    try {
      // Suppress annoying profile update success toast
      if (user) {
        const nextUser = {
          ...user,
          address,
          phone,
          name: name || user.name,
          email: email || user.email
        };
        setUser(nextUser);
      }
      return true;
    } catch (err: any) {
      addToast("Failed to update details", "error");
      return false;
    }
  };

  // Cart Operations
  const addToCart = async (variantId: string, quantity: number, isBuyNow: boolean = false): Promise<boolean> => {
    try {
      // Premium interactive animation trigger before fetch starts
      try {
        const activeEl = document.activeElement;
        let coordData: { x: number; y: number; imageUrl?: string } | null = null;
        if (activeEl) {
          const rect = activeEl.getBoundingClientRect();
          // Find standard grid card, product gallery container, or similar wrappers
          const closestContainer = activeEl.closest('.group, [class*="Grid"], [class*="grid"], [class*="ProductDetail"], [class*="Sartorial"], [class*="card"]');
          const img = closestContainer?.querySelector('img');
          const imageUrl = img?.getAttribute('src') || undefined;

          coordData = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            imageUrl,
          };
        }
        window.dispatchEvent(new CustomEvent('item-added-to-cart', { detail: coordData }));
      } catch (animErr) {
        console.warn("Non-blocking animation telemetry failure", animErr);
      }

      const activeToken = await getCachedToken();
      
      // Look up product/variant info so the drawer renders instantly and correctly
      let foundVariant = null;
      let foundProduct = null;
      for (const p of globalProducts) {
        const v = p.variants?.find((vx: any) => vx.id === variantId);
        if (v) {
          foundVariant = v;
          foundProduct = p;
          break;
        }
      }

      if (!activeToken) {
        if (isBuyNow) {
          setPendingCartItem({ variantId, quantity });
          localStorage.setItem('pending_cart_item', JSON.stringify({ variantId, quantity }));
          window.location.href = '/login';
          return false;
        } else {
          const localCartStr = localStorage.getItem('local_cart');
          let localCart: { variantId: string; quantity: number }[] = localCartStr ? JSON.parse(localCartStr) : [];
          const existingIndex = localCart.findIndex(item => item.variantId === variantId);
          if (existingIndex > -1) {
            localCart[existingIndex].quantity += quantity;
          } else {
            localCart.push({ variantId, quantity });
          }
          localStorage.setItem('local_cart', JSON.stringify(localCart));
          
          // Optimistic local update
          setCart(prev => {
            const existing = prev.find(item => item.productVariantId === variantId);
            if (existing) {
              return prev.map(item => item.productVariantId === variantId ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, {
              id: `local-${variantId}`,
              userId: 'local',
              productVariantId: variantId,
              quantity,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              variant: foundVariant,
              product: foundProduct,
            }];
          });
          setIsCartOpen(true);
          return true;
        }
      }

      // ⚡ AUTHENTICATED: Fully Optimistic update
      setCart(prev => {
        const existing = prev.find(item => item.productVariantId === variantId);
        if (existing) {
          return prev.map(item =>
            item.productVariantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        // New item — add with temp id and enriched data instantly
        const tempItem: EnrichedCartItem = {
          id: `temp-${variantId}-${Date.now()}`,
          userId: user?.id || '',
          productVariantId: variantId,
          quantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          variant: foundVariant,
          product: foundProduct,
        };
        return [...prev, tempItem];
      });

      if (isBuyNow) {
        setBuyNowMode(true);
      } else {
        setBuyNowMode(false);
        // Open cart immediately (0ms delay)
        setIsCartOpen(true);
      }

      // Fire API in background
      apiFetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productVariantId: variantId, quantity })
      }).then((resData) => {
        if (resData && !('alreadyAdded' in resData) && (resData as any).capped) {
          addToast((resData as any).message, 'info');
        }
        // Reconcile real IDs
        return apiFetch('/api/cart');
      }).then(freshCart => {
        if (freshCart) {
          setCart(freshCart);
          if (isBuyNow) {
            const addedItem = freshCart.find((item: any) => item.productVariantId === variantId);
            if (addedItem) setCheckedCartItemIds([addedItem.id]);
          } else {
            setCheckedCartItemIds(freshCart.map((item: any) => item.id));
          }
        }
      }).catch((e) => {
        console.error(e);
        addToast("Failed to add to cart. Network error.", "error");
      });

      return true;
    } catch (e: any) {
      console.error("Cart Add Error", e);
      addToast(e.message || "Failed to add item to bag.", "error");
      return false;
    }
  };

  const updateCartQty = async (itemId: string, quantity: number) => {
    const activeToken = await getCachedToken();
    if (!activeToken) {
      // Guest: update localStorage + state instantly
      const localCartStr = localStorage.getItem('local_cart');
      if (localCartStr) {
        const localCart = JSON.parse(localCartStr);
        const vId = itemId.replace('local-', '');
        const item = localCart.find((i: any) => i.variantId === vId);
        if (item) {
          item.quantity = quantity;
          localStorage.setItem('local_cart', JSON.stringify(localCart));
        }
      }
      setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
      return;
    }
    // ⚡ Optimistic: update UI instantly, sync in background
    const prevCart = [...cart];
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
    apiFetch(`/api/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }).catch(() => {
      setCart(prevCart); // rollback
      addToast("Failed to update quantity.", "error");
    });
  };

  const removeFromCart = async (itemId: string) => {
    const activeToken = await getCachedToken();
    if (!activeToken) {
      // Guest: update localStorage + state instantly
      const localCartStr = localStorage.getItem('local_cart');
      if (localCartStr) {
        const vId = itemId.replace('local-', '');
        const filtered = JSON.parse(localCartStr).filter((i: any) => i.variantId !== vId);
        localStorage.setItem('local_cart', JSON.stringify(filtered));
      }
      setCart(prev => prev.filter(item => item.id !== itemId));
      setCheckedCartItemIds(prev => prev.filter(id => id !== itemId));
      return;
    }
    // ⚡ Optimistic: remove from UI instantly
    const prevCart = [...cart];
    setCart(prev => prev.filter(item => item.id !== itemId));
    setCheckedCartItemIds(prev => prev.filter(id => id !== itemId));
    apiFetch(`/api/cart/${itemId}`, { method: 'DELETE' }).catch(() => {
      setCart(prevCart); // rollback
      addToast("Failed to remove item.", "error");
    });
  };

  const clearCart = async () => {
    const activeToken = await getCachedToken();
    if (!activeToken) {
      localStorage.removeItem('local_cart');
      setCart([]);
      setCheckedCartItemIds([]);
      return;
    }
    // ⚡ Optimistic: clear UI instantly
    const prevCart = [...cart];
    setCart([]);
    setCheckedCartItemIds([]);
    apiFetch('/api/cart', { method: 'DELETE' }).catch(() => {
      setCart(prevCart); // rollback
      addToast("Failed to clear cart.", "error");
    });
  };

  // Wishlist Operations
  const addToWishlist = async (productId: string): Promise<boolean> => {
    try {
      // FULLY OPTIMISTIC: Do not await any token before updating UI
      const isLoggedIn = !!user;
      
      if (!isLoggedIn) {
        const localWishlistStr = localStorage.getItem('local_wishlist');
        const localWishlist = localWishlistStr ? JSON.parse(localWishlistStr) : [];
        if (!localWishlist.find((w: any) => w.productId === productId)) {
          const newEntry = { id: `wish-${Date.now()}`, productId };
          localWishlist.push(newEntry);
          localStorage.setItem('local_wishlist', JSON.stringify(localWishlist));
          setWishlist((prev: any[]) => [...prev, newEntry]);
        }
      } else {
        // Optimistic update immediately - UI turns red instantly
        setWishlist((prev: any[]) => [...prev, { id: `optimistic-${Date.now()}`, productId }]);
        
        // Fire and forget to server using cached token
        getCachedToken().then(activeToken => {
          apiFetch('/api/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId })
          }).then(() => {
            // Sync real server state in background
            apiFetch('/api/wishlist').then(serverWishlist => setWishlist(serverWishlist)).catch(() => {});
          }).catch(() => {
            // Rollback on failure
            setWishlist((prev: any[]) => prev.filter(w => w.productId !== productId));
            addToast("Failed to save to wishlist.", "error");
          });
        });
      }
      addToast("Saved to wishlist.", "success");
      return true;
    } catch (e: any) {
      addToast(e.message, "error");
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    try {
      const isLoggedIn = !!user;
      
      if (!isLoggedIn) {
        const localWishlistStr = localStorage.getItem('local_wishlist');
        let localWishlist = localWishlistStr ? JSON.parse(localWishlistStr) : [];
        localWishlist = localWishlist.filter((w: any) => w.productId !== productId);
        localStorage.setItem('local_wishlist', JSON.stringify(localWishlist));
        setWishlist(localWishlist);
      } else {
        // Optimistic remove immediately - UI turns empty instantly
        setWishlist((prev: any[]) => prev.filter(w => w.productId !== productId));
        
        // Fire and forget
        getCachedToken().then(activeToken => {
          apiFetch(`/api/wishlist/${productId}`, { method: 'DELETE' }).catch(() => {
            // Rollback: re-fetch if delete failed
            apiFetch('/api/wishlist').then(serverWishlist => setWishlist(serverWishlist)).catch(() => {});
          });
        });
      }
      return true;
    } catch (e: any) {
      addToast(e.message, "error");
      return false;
    }
  };

  // Apply Coupon
  const applyCoupon = async (code: string) => {
    const activeToken = await getToken();
    if (!activeToken) {
      addToast("Please log in to continue.", "error");
      return false;
    }
    try {
      const data = await apiFetch('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, cartValue: cartSubtotal })
      });
      setAppliedCoupon(data);
      addToast(`Coupon "${code}" applied.`, "success");

      // Dispatch celebration event
      try {
        window.dispatchEvent(new Event('coupon-applied-confetti'));
      } catch (confettiErr) {
        console.warn("Could not dispatch confetti celebration event", confettiErr);
      }

      return true;
    } catch (err: any) {
      addToast(err.message, "error");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast("Coupon removed.");
  };

  // Create Order
  const createOrder = async (shippingAddress: ShippingAddress, customPaymentId?: string) => {
    try {
      const actualAmountToPay = Math.max(0, cartSubtotal + (cartSubtotal >= (settings?.freeShippingThreshold ?? 5000) ? 0 : (settings?.shippingRate ?? 150)) - discountAmount);

      const orderData = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress,
          items: cart
            .filter(itm => checkedCartItemIds.includes(itm.id))
            .map(itm => ({
              productVariantId: itm.productVariantId,
              quantity: itm.quantity
            })),
          totalAmount: actualAmountToPay || 0,
          shippingAmount: cartSubtotal >= (settings?.freeShippingThreshold || 5000) ? 0 : (settings?.shippingRate || 150),
          paymentId: customPaymentId || `rzp_mock_${Date.now()}`,
          couponCode: appliedCoupon?.code || undefined
        })
      });

      await refreshCart();
      setAppliedCoupon(null);
      addToast("Order placed successfully.", "success");
      return orderData;
    } catch (err: any) {
      addToast(err.message, "error");
      return null;
    }
  };

  const fetchUserOrders = async () => {
    try {
      return await apiFetch('/api/orders');
    } catch (err: any) {
      addToast("Failed to fetch order history", "error");
      return [];
    }
  };

  const fetchOrderById = async (id: string) => {
    try {
      return await apiFetch(`/api/orders/${id}`);
    } catch (err: any) {
      addToast("Failed to load order details", "error");
      return null;
    }
  };

  const submitReview = async (orderId: string, rating: number, comment: string, reviewImages: string[]) => {
    try {
      await apiFetch(`/api/orders/${orderId}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment, reviewImages })
      });
      addToast("Review submitted. Thank you.", "success");
      return true;
    } catch (err: any) {
      addToast(err.message, "error");
      return false;
    }
  };

  const cancelOrder = async (id: string, reason: string) => {
    try {
      const res = await apiFetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      if (res && res.requestSubmitted) {
        addToast("Cancellation request submitted for administrative audit", "info");
      } else {
        addToast("Order cancelled successfully.", "success");
      }
      return true;
    } catch (err: any) {
      addToast(err.message, "error");
      return false;
    }
  };

  const dismissCancellationRequest = async (id: string, adminNotes?: string) => {
    try {
      await apiFetch(`/api/admin/orders/${id}/dismiss-cancel`, {
        method: 'POST',
        body: JSON.stringify({ adminNotes })
      });
      addToast("Cancellation request dismissed successfully", "success");
      return true;
    } catch (err: any) {
      addToast(err.message, "error");
      return false;
    }
  };

  const confirmDelivery = async (id: string, otp: string, paymentMode?: 'cash' | 'upi' | 'card' | 'cod') => {
    try {
      await apiFetch(`/api/orders/${id}/confirm-delivery`, {
        method: 'POST',
        body: JSON.stringify({ otp, paymentMode })
      });
      addToast("Delivery confirmed successfully!", "success");
      return true;
    } catch (err: any) {
      addToast(err.message, "error");
      return false;
    }
  };

  const requestCallbackSupport = async (orderId: string, phone: string, topic: string, notes: string) => {
    try {
      await apiFetch(`/api/orders/${orderId}/support-request`, {
        method: 'POST',
        body: JSON.stringify({ phone, topic, notes })
      });
      addToast("Vip Concierge Call scheduled under 15 minutes!", "success");
      return true;
    } catch (err: any) {
      addToast(err.message, "error");
      return false;
    }
  };

  // Returns
  const submitReturn = async (orderId: string, orderItemId: string, type: 'RETURN' | 'EXCHANGE', reason: string) => {
    try {
      await apiFetch('/api/returns', {
        method: 'POST',
        body: JSON.stringify({ orderId, orderItemId, type, reason })
      });
      addToast("Return/Exchange request submitted.", "success");
      return true;
    } catch (err: any) {
      addToast(err.message, "error");
      return false;
    }
  };

  const fetchUserReturns = async () => {
    try {
      return await apiFetch('/api/returns');
    } catch {
      return [];
    }
  };

  return (
    <AppContext.Provider
      value={{
        setUser,
        token: null, // Stubbed for backward compatibility
        user,
        isAdmin,
        role,
        settings,
        cart,
        cartCount,
        cartSubtotal,
        checkedCartItemIds,
        setCheckedCartItemIds,
        buyNowMode,
        setBuyNowMode,
        appliedCoupon,
        discountAmount,
        toasts,
        login,
        register,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        logout,
        updateAddress,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        wishlist,
        applyCoupon,
        removeCoupon,
        createOrder,
        fetchUserOrders,
        fetchOrderById,
        submitReview,
        cancelOrder,
        dismissCancellationRequest,
        confirmDelivery,
        requestCallbackSupport,
        submitReturn,
        fetchUserReturns,
        addToast,
        removeToast,
        refreshSettings,
        refreshCart,
        apiFetch,
        isCartOpen,
        setIsCartOpen,
        pendingCartItem,
        setPendingCartItem,
        categories,
        fetchCategories,
        addCategory,
        deleteCategory,
        globalProducts,
        isProductsLoaded,
        fetchGlobalProducts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
