import React from 'react';
import {
  CheckCircle2,
  Ticket,
  Store,
  Calendar,
  CreditCard,
  ArrowRight,
  Printer,
  Copy,
  Check
} from 'lucide-react';

interface PublicTokenSuccessViewProps {
  tokenData: {
    tokenNumber: string;
    shopNumber: string;
    orderId: number;
    orderNumber: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    transactionRef: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; unit: string; totalPrice: number }>;
    generatedAt: string;
  };
  onTrackToken: () => void;
  onBackToRation: () => void;
}

export const PublicTokenSuccessView: React.FC<PublicTokenSuccessViewProps> = ({
  tokenData,
  onTrackToken,
  onBackToRation
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToken = () => {
    navigator.clipboard.writeText(tokenData.tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto my-6 space-y-6">
      {/* Success Badge */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce duration-1000">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
          Payment Processed Successfully
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          PAYMENT SUCCESSFUL
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your electronic token has been registered in the Fair Price Shop queue.
        </p>

        {/* Digital Token Ticket */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl relative text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">
                Digital Ration Token
              </span>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-2xl sm:text-3xl font-black tracking-wider font-mono text-emerald-400">
                  {tokenData.tokenNumber}
                </h2>
                <button
                  onClick={copyToken}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy Token"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>READY</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Ration Shop:</span>
              <span className="font-bold text-white font-mono text-sm">{tokenData.shopNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Payment Status:</span>
              <span className="font-bold text-emerald-400">{tokenData.paymentStatus} ({tokenData.paymentMethod})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Txn Reference:</span>
              <span className="font-mono text-slate-300 text-[11px]">{tokenData.transactionRef}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Subsidized Amount:</span>
              <span className="font-bold text-white text-sm">₹{tokenData.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Reserved Items for Pickup:
            </span>
            <div className="space-y-1.5 text-xs">
              {tokenData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-800/60 px-3 py-2 rounded-xl">
                  <span className="font-medium text-slate-200">{item.name}</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onTrackToken}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Ticket className="w-4 h-4" />
            <span>Track in "My Token"</span>
          </button>
          <button
            onClick={onBackToRation}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
          >
            Back to Entitlements
          </button>
        </div>
      </div>
    </div>
  );
};
