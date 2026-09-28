import { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CompanyDetail } from './pages/CompanyDetail';
import { Alerts } from './pages/Alerts';
import {
  getPortfolio,
  getPortfolioSummary,
  getCompanyDetail,
  getCompanySignals,
  getCompanyHistory,
  getAlerts,
  triggerRefresh,
  checkHealth
} from './services/api';
import type {
  PortfolioCompany,
  PortfolioSummary,
  CompanyDetailData,
  SignalDetail,
  ScoreHistoryPoint,
  AlertItem
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'dashboard' | 'alerts' | 'company'>('home');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [portfolio, setPortfolio] = useState<PortfolioCompany[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const [companyDetail, setCompanyDetail] = useState<CompanyDetailData | null>(null);
  const [companySignals, setCompanySignals] = useState<SignalDetail[]>([]);
  const [companyHistory, setCompanyHistory] = useState<ScoreHistoryPoint[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Load portfolio overview data
  const loadPortfolioData = async () => {
    setLoading(true);

    const [healthRes, pRes, sRes, aRes] = await Promise.all([
      checkHealth(),
      getPortfolio(),
      getPortfolioSummary(),
      getAlerts()
    ]);

    setIsFallback(pRes.isFallback || healthRes.status === 'offline');
    setPortfolio(pRes.data);
    setSummary(sRes.data);
    setAlerts(aRes.data);

    if (pRes.data.length > 0 && pRes.data[0].last_updated) {
      setLastUpdated(pRes.data[0].last_updated);
    } else {
      setLastUpdated(new Date().toISOString());
    }

    setLoading(false);
  };

  // Load details for a selected company
  const loadCompanyDetailsData = async (id: number) => {
    setLoading(true);
    const [cdRes, csRes, chRes] = await Promise.all([
      getCompanyDetail(id),
      getCompanySignals(id),
      getCompanyHistory(id)
    ]);

    setCompanyDetail(cdRes.data);
    setCompanySignals(csRes.data);
    setCompanyHistory(chRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const handleSelectCompany = (id: number) => {
    setSelectedCompanyId(id);
    setCurrentTab('company');
    loadCompanyDetailsData(id);
  };

  const handleTabChange = (tab: 'home' | 'dashboard' | 'alerts') => {
    setCurrentTab(tab);
    if (tab === 'dashboard' || tab === 'alerts') {
      loadPortfolioData();
    }
  };

  const handleRefreshPipeline = async () => {
    await triggerRefresh();
    await loadPortfolioData();
    if (selectedCompanyId) {
      await loadCompanyDetailsData(selectedCompanyId);
    }
  };

  return (
    <AppShell
      currentTab={currentTab}
      selectedCompanyId={selectedCompanyId}
      onTabChange={handleTabChange}
      isFallback={isFallback}
      alertCount={alerts.length}
      lastUpdated={lastUpdated}
      onRefresh={handleRefreshPipeline}
    >
      {loading && portfolio.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#8A6A43] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#746E63] font-semibold">
            Loading VENTRA Model Intelligence...
          </p>
        </div>
      ) : (
        <>
          {currentTab === 'home' && (
            <Home onNavigateToDashboard={() => setCurrentTab('dashboard')} />
          )}

          {currentTab === 'dashboard' && (
            <Dashboard
              summary={summary}
              companies={portfolio}
              onSelectCompany={handleSelectCompany}
            />
          )}

          {currentTab === 'alerts' && (
            <Alerts
              alerts={alerts}
              onReviewCompany={handleSelectCompany}
            />
          )}

          {currentTab === 'company' && companyDetail && (
            <CompanyDetail
              company={companyDetail}
              signals={companySignals}
              history={companyHistory}
              onBack={() => setCurrentTab('dashboard')}
            />
          )}
        </>
      )}
    </AppShell>
  );
}

export default App;
