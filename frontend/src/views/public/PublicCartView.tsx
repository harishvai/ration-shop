import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Store,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ticket,
  ArrowLeft
} from 'lucide-react';

interface PublicCartViewProps {
  onBackToShopping: () => void;
  onTokenGenerated: (tokenData: any) => void;
}

export const PublicCartView: React.FC<PublicCartViewProps> = ({ onBackToShopping, onTokenGenerated }) => {
  const { session, cart, updateCartQty, removeFromCart, clearCart, cartTotalAmount } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'PAY_AT_SHOP'>('UPI');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo payment details
  const [upiId, setUpiId] = useState('beneficiary@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          You haven't selected any ration commodities yet. Return to the entitlement page to pick your items.
        </p>
        <button
          onClick={onBackToShopping}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
        >
          Select Ration Items
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      setError(null);

      const itemsPayload = cart.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      const res = await api.createOrder(itemsPayload, paymentMethod);
      clearCart();
      onTokenGenerated(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToShopping}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Ration Cart</h1>
          <p className="text-xs text-slate-500">
            Review your allocated items, choose a safe demo payment method, and generate your shop token.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center justify-between">
              <span>Selected Commodities</span>
              <span className="text-xs text-slate-400 font-normal">{cart.length} commodities</span>
            </h2>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.itemId} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{item.itemName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>Rate: {item.unitPrice === 0 ? 'FREE' : `₹${item.unitPrice.toFixed(2)}`} / {item.unit}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">Subsidized</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(item.itemId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="min-w-10 text-center font-bold text-sm text-slate-800">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.itemId, Math.min(item.remainingAllowed, item.quantity + 1))}
                      disabled={item.quantity >= item.remainingAllowed}
                      className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-16">
                    <span className="font-extrabold text-sm text-slate-900">
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.itemId)}
                      className="block ml-auto text-slate-400 hover:text-red-600 mt-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-3 text-xs text-blue-800">
            <Store className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold">Collection Center: {session?.shop?.shopId || 'SHOP-101'}</p>
              <p className="text-blue-600 text-[11px]">{session?.shop?.shopName || 'Anna Nagar Central FPS'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Safe Demo Payment & Checkout */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Safe Demo Payment
            </h2>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod('UPI')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/10'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Instant UPI (Demo)</p>
                    <p className="text-[11px] text-slate-500 font-mono">{upiId}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/10'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Debit / Credit Card (Mock)</p>
                    <p className="text-[11px] text-slate-500 font-mono">{cardNumber}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('PAY_AT_SHOP')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'PAY_AT_SHOP'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/10'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Pay at Shop Counter</p>
                    <p className="text-[11px] text-slate-500">Pay cash upon ration physical pickup</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'PAY_AT_SHOP'}
                  onChange={() => setPaymentMethod('PAY_AT_SHOP')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            {/* Bill Summary */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Subsidized):</span>
                <span className="font-semibold text-slate-800">₹{cartTotalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PDS Subsidy Service Fee:</span>
                <span className="font-bold text-emerald-600">₹0.00 (Waived)</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
                <span className="font-extrabold text-slate-900">Total Payable:</span>
                <span className="font-black text-emerald-700 text-base">₹{cartTotalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Safe payment disclaimer */}
            <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Safe Sandbox: Mock transaction generated instantly. No actual bank charges apply.</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment & Generating Token...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>Confirm & Generate Token</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
