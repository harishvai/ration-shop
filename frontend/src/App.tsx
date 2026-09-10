import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

// Views
import { WelcomeView } from './views/WelcomeView';
import { PublicLoginView } from './views/public/PublicLoginView';
import { PublicRationView } from './views/public/PublicRationView';
import { PublicCartView } from './views/public/PublicCartView';
import { PublicTokenSuccessView } from './views/public/PublicTokenSuccessView';
import { PublicTokenView } from './views/public/PublicTokenView';

import { SalesmanLoginView } from './views/salesman/SalesmanLoginView';
import { SalesmanDashboardView } from './views/salesman/SalesmanDashboardView';
import { SalesmanTokensView } from './views/salesman/SalesmanTokensView';
import { SalesmanStockView } from './views/salesman/SalesmanStockView';
import { SalesmanSalesView } from './views/salesman/SalesmanSalesView';

import { HeadLoginView } from './views/head/HeadLoginView';
import { HeadDashboardView } from './views/head/HeadDashboardView';
import { HeadShopsView } from './views/head/HeadShopsView';
import { HeadSearchView } from './views/head/HeadSearchView';
import { HeadAnalyticsView } from './views/head/HeadAnalyticsView';

// Layouts & Modals
import { PublicLayout } from './layouts/PublicLayout';
import { SalesmanLayout } from './layouts/SalesmanLayout';
import { HeadLayout } from './layouts/HeadLayout';
import { DemoCredentialsModal } from './components/DemoCredentialsModal';
import { Key } from 'lucide-react';

export function App() {
  const { session, logout, login } = useAuth();

  // Active view state
  // If not logged in, can be 'welcome', 'login-public', 'login-salesman', 'login-head'
  const [unauthView, setUnauthView] = useState<'welcome' | 'login-public' | 'login-salesman' | 'login-head'>('welcome');

  // Active tabs within authenticated roles
  const [publicTab, setPublicTab] = useState<'ration' | 'cart' | 'my-token' | 'history'>('ration');
  const [salesmanTab, setSalesmanTab] = useState<'dashboard' | 'tokens' | 'stock' | 'sales' | 'profile'>('dashboard');
  const [headTab, setHeadTab] = useState<'dashboard' | 'shops' | 'search' | 'analytics' | 'reports'>('dashboard');

  // Token Success state when order is placed
  const [recentlyGeneratedToken, setRecentlyGeneratedToken] = useState<any | null>(null);

  // Search Shop target for Head drill-down
  const [headDrillDownShopId, setHeadDrillDownShopId] = useState<string>('SHOP-101');

  // Demo Credentials modal
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Quick switch role from demo modal
  const handleDemoSelectRole = (role: 'PUBLIC' | 'SALESMAN' | 'HEAD', data: any) => {
    logout();
    if (role === 'PUBLIC') {
      setUnauthView('login-public');
    } else if (role === 'SALESMAN') {
      setUnauthView('login-salesman');
    } else {
      setUnauthView('login-head');
    }
  };

  // --- UNATHENTICATED STATE ---
  if (!session) {
    return (
      <>
        {unauthView === 'welcome' && (
          <WelcomeView
            onSelectRole={(role) => {
              if (role === 'PUBLIC') setUnauthView('login-public');
              if (role === 'SALESMAN') setUnauthView('login-salesman');
              if (role === 'HEAD') setUnauthView('login-head');
            }}
            onOpenDemoCredentials={() => setDemoModalOpen(true)}
          />
        )}

        {unauthView === 'login-public' && (
          <PublicLoginView
            onBackToRoles={() => setUnauthView('welcome')}
            onSuccess={() => {
              setPublicTab('ration');
            }}
          />
        )}

        {unauthView === 'login-salesman' && (
          <SalesmanLoginView
            onBackToRoles={() => setUnauthView('welcome')}
            onSuccess={() => {
              setSalesmanTab('dashboard');
            }}
          />
        )}

        {unauthView === 'login-head' && (
          <HeadLoginView
            onBackToRoles={() => setUnauthView('welcome')}
            onSuccess={() => {
              setHeadTab('dashboard');
            }}
          />
        )}

        <DemoCredentialsModal
          isOpen={demoModalOpen}
          onClose={() => setDemoModalOpen(false)}
          onSelectRole={handleDemoSelectRole}
        />
      </>
    );
  }

  // --- AUTHENTICATED STATE: ROLE VERIFICATION & DASHBOARD ---

  // 1. PUBLIC PORTAL
  if (session.role === 'PUBLIC') {
    return (
      <PublicLayout currentTab={publicTab} onNavigate={(tab) => { setRecentlyGeneratedToken(null); setPublicTab(tab); }}>
        {recentlyGeneratedToken ? (
          <PublicTokenSuccessView
            tokenData={recentlyGeneratedToken}
            onTrackToken={() => {
              setRecentlyGeneratedToken(null);
              setPublicTab('my-token');
            }}
            onBackToRation={() => {
              setRecentlyGeneratedToken(null);
              setPublicTab('ration');
            }}
          />
        ) : publicTab === 'ration' ? (
          <PublicRationView onProceedToCart={() => setPublicTab('cart')} />
        ) : publicTab === 'cart' ? (
          <PublicCartView
            onBackToShopping={() => setPublicTab('ration')}
            onTokenGenerated={(tok) => {
              setRecentlyGeneratedToken(tok);
            }}
          />
        ) : (
          <PublicTokenView />
        )}
      </PublicLayout>
    );
  }

  // 2. SALESMAN PORTAL
  if (session.role === 'SALESMAN') {
    return (
      <SalesmanLayout currentTab={salesmanTab} onNavigate={(tab) => setSalesmanTab(tab)}>
        {salesmanTab === 'dashboard' && (
          <SalesmanDashboardView onNavigate={(t) => setSalesmanTab(t)} />
        )}
        {salesmanTab === 'tokens' && <SalesmanTokensView />}
        {salesmanTab === 'stock' && <SalesmanStockView />}
        {salesmanTab === 'sales' && <SalesmanSalesView />}
        {salesmanTab === 'profile' && (
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white max-w-xl mx-auto space-y-4">
            <h2 className="text-xl font-bold">Shop Profile & Counter Identity</h2>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Shop:</span>
                <span className="font-bold text-white font-mono">{session.shop?.shopId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shop Name:</span>
                <span className="font-semibold text-slate-200">{session.shop?.shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Salesman Name:</span>
                <span className="font-semibold text-slate-200">{session.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Employee ID:</span>
                <span className="font-mono text-emerald-400">{session.employeeId}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Your session is bound to shop {session.shop?.shopId}. The backend security filter blocks any cross-shop data leaks.
            </p>
          </div>
        )}
      </SalesmanLayout>
    );
  }

  // 3. HEAD OF DEPARTMENT PORTAL
  if (session.role === 'HEAD') {
    return (
      <HeadLayout currentTab={headTab} onNavigate={(tab) => setHeadTab(tab)}>
        {headTab === 'dashboard' && (
          <HeadDashboardView
            onNavigate={(t) => setHeadTab(t)}
            onSelectShopForSearch={(sId) => {
              setHeadDrillDownShopId(sId);
              setHeadTab('search');
            }}
          />
        )}
        {headTab === 'shops' && (
          <HeadShopsView
            onDrillDown={(sId) => {
              setHeadDrillDownShopId(sId);
              setHeadTab('search');
            }}
          />
        )}
        {headTab === 'search' && <HeadSearchView initialShopId={headDrillDownShopId} />}
        {headTab === 'analytics' && <HeadAnalyticsView />}
        {headTab === 'reports' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Official Directorate Audit & Reports</h2>
            <p className="text-xs text-slate-500">
              Statutory PDS compliance records for the current fiscal period.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block text-sm">Monthly Quota Offtake Audit</span>
                <p className="text-slate-500 mt-1">Certified by State Food & Civil Supplies Directorate.</p>
                <span className="mt-3 inline-block font-mono text-[11px] text-purple-700 font-bold">STATUS: COMPLIANT</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block text-sm">Anti-Leakage & Stock Reconciliation</span>
                <p className="text-slate-500 mt-1">Full transaction ledger backed by PostgreSQL ACID guarantees.</p>
                <span className="mt-3 inline-block font-mono text-[11px] text-emerald-700 font-bold">ZERO VARIANCE</span>
              </div>
            </div>
          </div>
        )}
      </HeadLayout>
    );
  }

  return null;
}
