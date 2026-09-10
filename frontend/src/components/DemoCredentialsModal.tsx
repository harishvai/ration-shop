import React from 'react';
import { Modal } from './Modal';
import { Key, User, Store, Shield, Check, Copy } from 'lucide-react';

interface DemoCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'PUBLIC' | 'SALESMAN' | 'HEAD', data: any) => void;
}

export const DemoCredentialsModal: React.FC<DemoCredentialsModalProps> = ({ isOpen, onClose, onSelectRole }) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Demo Login Credentials & Quick-Fill"
      icon={<Key className="w-5 h-5 text-amber-500" />}
    >
      <div className="space-y-6 text-sm">
        {/* PUBLIC BENEFICIARY */}
        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <User className="w-4 h-4" />
              <span>Public Beneficiaries (Ration Cards)</span>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Passwordless Card Login</span>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-blue-100">
              <div>
                <p className="font-semibold text-slate-800">Rajesh Kumar (Shop 101)</p>
                <p className="text-xs font-mono text-blue-600">RC-TN-2024-1001</p>
              </div>
              <button
                onClick={() => {
                  onSelectRole('PUBLIC', { cardNumber: 'RC-TN-2024-1001' });
                  onClose();
                }}
                className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Use Card
              </button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-blue-100">
              <div>
                <p className="font-semibold text-slate-800">Priya Sharma (Shop 101 - AAY)</p>
                <p className="text-xs font-mono text-blue-600">RC-TN-2024-1002</p>
              </div>
              <button
                onClick={() => {
                  onSelectRole('PUBLIC', { cardNumber: 'RC-TN-2024-1002' });
                  onClose();
                }}
                className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Use Card
              </button>
            </div>
          </div>
        </div>

        {/* SALESMAN */}
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <Store className="w-4 h-4" />
              <span>Ration Shop Salesmen</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Password: salesman123</span>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-100">
              <div>
                <p className="font-semibold text-slate-800">Shop 101 — Anna Nagar Central</p>
                <p className="text-xs text-slate-500 font-mono">Shop: SHOP-101 | Emp: EMP-101</p>
              </div>
              <button
                onClick={() => {
                  onSelectRole('SALESMAN', { shopNumber: 'SHOP-101', employeeId: 'EMP-101', password: 'salesman123' });
                  onClose();
                }}
                className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Login 101
              </button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-100">
              <div>
                <p className="font-semibold text-slate-800">Shop 104 — Mylapore (Low Stock Alert)</p>
                <p className="text-xs text-slate-500 font-mono">Shop: SHOP-104 | Emp: EMP-104</p>
              </div>
              <button
                onClick={() => {
                  onSelectRole('SALESMAN', { shopNumber: 'SHOP-104', employeeId: 'EMP-104', password: 'salesman123' });
                  onClose();
                }}
                className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Login 104
              </button>
            </div>
          </div>
        </div>

        {/* HEAD OF DEPARTMENT */}
        <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-purple-700 font-bold">
              <Shield className="w-4 h-4" />
              <span>Head of Department</span>
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">Password: head123</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-100 mt-2">
            <div>
              <p className="font-semibold text-slate-800">Chief Director, Civil Supplies</p>
              <p className="text-xs text-slate-500 font-mono">Head ID: HEAD-001</p>
            </div>
            <button
              onClick={() => {
                onSelectRole('HEAD', { headId: 'HEAD-001', password: 'head123' });
                onClose();
              }}
              className="px-3 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Login as Head
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
