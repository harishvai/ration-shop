import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { EntitlementItem } from '../../types';
import {
  Store,
  CreditCard,
  User,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Wheat,
  Sprout,
  Cookie,
  Package,
  Droplets,
  Sparkles
} from 'lucide-react';

interface PublicRationViewProps {
  onProceedToCart: () => void;
}

export const PublicRationView: React.FC<PublicRationViewProps> = ({ onProceedToCart }) => {
  const { session, cart, addToCart, updateCartQty, removeFromCart, cartTotalAmount, cartTotalItemsCount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementItem[]>([]);
  const [cardDetails, setCardDetails] = useState<any>(null);

  const fetchQuota = async () => {
    try {
      setLoading(true);
      const res = await api.getEntitlements();
      setEntitlements(res.entitlements);
      setCardDetails(res.card);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load entitlement data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  const getItemIcon = (code: string) => {
    switch (code.toUpperCase()) {
      case 'RICE':
        return <Wheat className="w-6 h-6 text-amber-500" />;
      case 'WHEAT':
        return <Sprout className="w-6 h-6 text-emerald-600" />;
      case 'SUGAR':
        return <Cookie className="w-6 h-6 text-sky-500" />;
      case 'DAL':
        return <Package className="w-6 h-6 text-orange-500" />;
      case 'OIL':
        return <Droplets className="w-6 h-6 text-yellow-600" />;
      default:
        return <Package className="w-6 h-6 text-slate-500" />;
    }
  };

  // Mask card number: e.g. RC-TN-2024-1001 -> RC-TN-****-1001
  const maskCardNumber = (cardNum?: string) => {
    if (!cardNum) return 'RC-TN-****-****';
    const parts = cardNum.split('-');
    if (parts.length >= 4) {
      return `${parts[0]}-${parts[1]}-****-${parts[3]}`;
    }
    return cardNum;
  };

  const getCartQuantity = (itemId: number) => {
    const item = cart.find(c => c.itemId === itemId);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (item: EntitlementItem) => {
    const currentCartQty = getCartQuantity(item.itemId);
    if (currentCartQty < item.remainingQty) {
      const step = item.unit === 'kg' && item.remainingQty >= 5 ? 1 : 1;
      const nextQty = Math.min(item.remainingQty, currentCartQty + step);

      if (currentCartQty === 0) {
        addToCart({
          itemId: item.itemId,
          itemName: item.itemName,
          unit: item.unit,
          quantity: nextQty,
          unitPrice: item.subsidizedPrice,
          marketPrice: item.marketPrice,
          remainingAllowed: item.remainingQty,
        });
      } else {
        updateCartQty(item.itemId, nextQty);
      }
    }
  };

  const handleDecrement = (item: EntitlementItem) => {
    const currentCartQty = getCartQuantity(item.itemId);
    if (currentCartQty > 0) {
      updateCartQty(item.itemId, currentCartQty - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-medium">Loading your monthly ration entitlement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. BENEFICIARY & SHOP PROFILE HEADER CARD */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>September 2026 Quota Allocation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {cardDetails?.customer_name || session?.fullName || 'Beneficiary'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-emerald-100">
              <span className="font-mono bg-black/20 px-2.5 py-1 rounded-lg">
                Card: {maskCardNumber(cardDetails?.card_number || session?.cardNumber)}
              </span>
              <span className="bg-emerald-500/30 px-2.5 py-1 rounded-lg font-bold">
                Category: {cardDetails?.card_type || session?.cardType || 'PHH'}
              </span>
              <span>• Family Members: {cardDetails?.family_members_count || 4}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0">
            <div className="flex items-center gap-2 text-xs text-emerald-200 font-semibold mb-1">
              <Store className="w-4 h-4 text-emerald-300" />
              <span>Assigned Fair Price Shop</span>
            </div>
            <p className="font-bold text-white text-sm">{cardDetails?.shop_name || session?.shop?.shopName}</p>
            <p className="text-xs text-emerald-200/80 font-mono mt-0.5">Shop ID: {cardDetails?.shop_id || session?.shop?.shopId}</p>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">{cardDetails?.location}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. ENTITLEMENT COMMODITY GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Ration Entitlement</h2>
            <p className="text-xs text-slate-500">
              Select quantities allowed within your monthly government quota. Subsidized rates applied automatically.
            </p>
          </div>
          {cartTotalItemsCount > 0 && (
            <button
              onClick={onProceedToCart}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart ({cartTotalItemsCount}) • ₹{cartTotalAmount.toFixed(2)}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {entitlements.map((item) => {
            const currentCartQty = getCartQuantity(item.itemId);
            const isFullyClaimed = item.remainingQty <= 0;
            const savings = (item.marketPrice - item.subsidizedPrice) * item.allocatedQty;

            return (
              <div
                key={item.itemId}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                  currentCartQty > 0
                    ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                    : isFullyClaimed
                    ? 'border-slate-200 opacity-60 bg-slate-50/50'
                    : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      {getItemIcon(item.itemCode)}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-700">
                        {item.subsidizedPrice === 0 ? 'FREE' : `₹${item.subsidizedPrice.toFixed(2)}`}
                      </span>
                      <span className="text-[11px] text-slate-400 block line-through">
                        Mkt: ₹{item.marketPrice.toFixed(2)} / {item.unit}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.itemName}</h3>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Monthly Allocation:</span>
                      <span className="font-semibold text-slate-800">{item.allocatedQty} {item.unit}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Available Quota:</span>
                      <span className={`font-bold ${isFullyClaimed ? 'text-red-500' : 'text-emerald-700'}`}>
                        {item.remainingQty} {item.unit} available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isFullyClaimed ? (
                    <span className="text-xs font-semibold text-slate-400 py-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      <span>Quota fully claimed for this month</span>
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrement(item)}
                          disabled={currentCartQty === 0}
                          className="w-9 h-9 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <div className="min-w-16 text-center font-bold text-sm text-slate-800">
                          {currentCartQty} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                        </div>

                        <button
                          onClick={() => handleIncrement(item)}
                          disabled={currentCartQty >= item.remainingQty}
                          className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:bg-emerald-600 transition-colors shadow-xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <span className="text-[11px] font-medium text-slate-500">
                        Max: {item.remainingQty} {item.unit}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. YOUR RATION CART FLOATING / BOTTOM BAR */}
      {cart.length > 0 && (
        <div className="sticky bottom-4 z-30 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Your Ration Cart</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {cart.map(c => `${c.itemName} (${c.quantity} ${c.unit})`).join(' • ')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Total Amount</span>
              <span className="text-xl font-black text-emerald-400">₹{cartTotalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={onProceedToCart}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
