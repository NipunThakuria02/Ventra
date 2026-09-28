import React, { useState } from 'react';
import {
  ArrowRight,
  Activity,
  Newspaper,
  Building2,
  FileCheck,
  Smartphone,
  Users,
  Sparkles,
  ChevronDown,
  TrendingDown
} from 'lucide-react';
import type { DataMode } from '../types';

interface HomeProps {
  onNavigateToDashboard: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToDashboard }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDataModeBadge = (mode: DataMode) => {
    switch (mode) {
      case 'live':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider">
            Live API
          </span>
        );
      case 'manual':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
            Manual Input
          </span>
        );
      case 'estimated':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-100 text-sky-900 border border-sky-300 uppercase tracking-wider">
            Estimated
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* SECTION 1: HERO / PROJECT INTRODUCTION */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DED6C8] bg-gradient-to-b from-[#FFFDF8] to-[#F1EBDD]/60 p-8 md:p-12 shadow-xs">
        <div className="max-w-3xl space-y-6">
          {/* Logo & Sub-tag */}
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#FFFDF8] border border-[#DED6C8] shadow-xs">
            <img src="/ventra-logo.png" alt="Ventra Logo" className="h-6 object-contain" />
            <span className="text-xs font-bold text-[#8A6A43] uppercase tracking-wider">
              Venture Debt Early Warning System
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#292721] tracking-tight leading-tight">
            Detect portfolio-company distress earlier through multiple public-data signals.
          </h1>

          {/* Primary Supporting Message */}
          <p className="text-sm md:text-base text-[#746E63] leading-relaxed font-normal">
            <strong className="font-semibold text-[#4C3B2A]">#VENTRA</strong> combines alternative signals such as headcount, hiring activity, news sentiment, GSTIN status, MCA filings, and app-store health into a composite distress score for venture-debt portfolio monitoring.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onNavigateToDashboard}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-[#8A6A43] hover:bg-[#4C3B2A] text-[#FFFDF8] font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              View Portfolio <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={scrollToHowItWorks}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-[#FFFDF8] hover:bg-[#F1EBDD] text-[#4C3B2A] border border-[#DED6C8] font-bold text-sm rounded-lg shadow-xs transition-all"
            >
              Explore How It Works <ChevronDown className="w-4 h-4 ml-2 text-[#8A6A43]" />
            </button>
          </div>
        </div>

        {/* Hero Side Preview Box */}
        <div className="mt-10 lg:mt-0 lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2 lg:w-80 glass-warm p-5 rounded-xl space-y-4 shadow-sm border border-[#DED6C8]">
          <div className="flex items-center justify-between border-b border-[#DED6C8] pb-3">
            <span className="text-xs font-bold text-[#4C3B2A] uppercase tracking-wider">
              System Highlights
            </span>
            <Sparkles className="w-4 h-4 text-[#8A6A43]" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#746E63]">Monitored Portfolio</span>
              <span className="font-bold text-[#292721]">6 Indian Startups</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#746E63]">Alternative Signals</span>
              <span className="font-bold text-[#292721]">6 Core Vectors</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#746E63]">Authoritative Scorer</span>
              <span className="font-semibold text-[#557A61]">Python ML Model</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#746E63]">Byju's Retrospective</span>
              <span className="font-semibold text-[#B07A32]">Validated Q2 2023</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS FLOW VISUAL HIGHLIGHT */}
      <section className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl p-6 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A6A43]">
            Risk Intelligence Vector Pipeline
          </span>
          <h3 className="text-lg font-extrabold text-[#292721]">
            From Multi-Signal Collection to Portfolio Risk Action
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-[#F7F3EA] rounded-lg border border-[#DED6C8]">
            <div className="w-10 h-10 rounded-full bg-[#F1EBDD] text-[#8A6A43] font-black mx-auto flex items-center justify-center mb-2">
              6
            </div>
            <h4 className="font-bold text-sm text-[#292721]">6 Public Data Signals</h4>
            <p className="text-xs text-[#746E63] mt-1">
              Headcount, hiring activity, news sentiment, GST, MCA, and app store ratings.
            </p>
          </div>

          <div className="p-4 bg-[#F7F3EA] rounded-lg border border-[#DED6C8]">
            <div className="w-10 h-10 rounded-full bg-[#F1EBDD] text-[#8A6A43] font-black mx-auto flex items-center justify-center mb-2">
              Σ
            </div>
            <h4 className="font-bold text-sm text-[#292721]">Composite Distress Score</h4>
            <p className="text-xs text-[#746E63] mt-1">
              Weighted composite normalization (0–100) generated strictly by Python model.
            </p>
          </div>

          <div className="p-4 bg-[#F7F3EA] rounded-lg border border-[#DED6C8]">
            <div className="w-10 h-10 rounded-full bg-[#F1EBDD] text-[#7F302B] font-black mx-auto flex items-center justify-center mb-2">
              !
            </div>
            <h4 className="font-bold text-sm text-[#292721]">Portfolio Risk Action</h4>
            <p className="text-xs text-[#746E63] mt-1">
              Early warning flags (Green, Amber, Red, Critical) for fund manager covenant review.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW #VENTRA WORKS (METHODOLOGY) */}
      <section id="how-it-works" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#8A6A43] uppercase tracking-wider">
            Methodology & Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#292721]">
            How #VENTRA Works
          </h2>
          <p className="text-xs text-[#746E63]">
            A 3-step structured pipeline transforming public signal noise into institutional early warnings.
          </p>
        </div>

        {/* 3 Interactive Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div
            onClick={() => setActiveStep(1)}
            className={`p-6 rounded-xl border transition-all cursor-pointer ${
              activeStep === 1
                ? 'bg-[#FFFDF8] border-2 border-[#8A6A43] shadow-md transform -translate-y-1'
                : 'bg-[#FFFDF8]/70 border-[#DED6C8] hover:border-[#8A6A43]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black text-[#8A6A43]">01</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F1EBDD] text-[#4C3B2A]">
                COLLECT
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#292721] mb-2">Public-Data Signals</h3>
            <p className="text-xs text-[#746E63] leading-relaxed">
              Monitor alternative signals across company operations, hiring activity, news, filings, and customer-facing applications.
            </p>
            {activeStep === 1 && (
              <div className="mt-4 pt-3 border-t border-[#DED6C8] text-[11px] text-[#4C3B2A] italic">
                Active Monitoring: Aggregates 6 public channels without requiring proprietary founder access.
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setActiveStep(2)}
            className={`p-6 rounded-xl border transition-all cursor-pointer ${
              activeStep === 2
                ? 'bg-[#FFFDF8] border-2 border-[#8A6A43] shadow-md transform -translate-y-1'
                : 'bg-[#FFFDF8]/70 border-[#DED6C8] hover:border-[#8A6A43]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black text-[#8A6A43]">02</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F1EBDD] text-[#4C3B2A]">
                ANALYZE
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#292721] mb-2">Normalize + Score Signals</h3>
            <p className="text-xs text-[#746E63] leading-relaxed">
              The existing Python normalization and scoring pipeline transforms those signals into comparable distress scores.
            </p>
            {activeStep === 2 && (
              <div className="mt-4 pt-3 border-t border-[#DED6C8] text-[11px] text-[#4C3B2A] italic">
                Weighted Average: Headcount (25%), News (20%), MCA (15%), GSTIN (15%), Hiring (15%), App Store (10%).
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setActiveStep(3)}
            className={`p-6 rounded-xl border transition-all cursor-pointer ${
              activeStep === 3
                ? 'bg-[#FFFDF8] border-2 border-[#8A6A43] shadow-md transform -translate-y-1'
                : 'bg-[#FFFDF8]/70 border-[#DED6C8] hover:border-[#8A6A43]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black text-[#8A6A43]">03</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F1EBDD] text-[#4C3B2A]">
                FLAG
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#292721] mb-2">Identify Elevated Portfolio Risk</h3>
            <p className="text-xs text-[#746E63] leading-relaxed">
              The resulting composite score highlights companies requiring closer monitoring and fund manager action.
            </p>
            {activeStep === 3 && (
              <div className="mt-4 pt-3 border-t border-[#DED6C8] text-[11px] text-[#4C3B2A] italic">
                Risk Taxonomy: Green (0–34), Amber (35–54), Red (55–74), Critical (≥75).
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack Diagram */}
        <div className="p-6 bg-[#FFFDF8] border border-[#DED6C8] rounded-xl text-center space-y-3">
          <span className="text-[11px] font-bold text-[#746E63] uppercase tracking-wider block">
            End-to-End System Architecture
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-[#292721]">
            <span className="px-3 py-1.5 rounded bg-[#F1EBDD] border border-[#DED6C8]">Public Data Signals</span>
            <span className="text-[#8A6A43]">→</span>
            <span className="px-3 py-1.5 rounded bg-[#F1EBDD] border border-[#DED6C8] text-[#8A6A43]">Python ML Pipeline</span>
            <span className="text-[#8A6A43]">→</span>
            <span className="px-3 py-1.5 rounded bg-[#F1EBDD] border border-[#DED6C8]">SQLite Persistence</span>
            <span className="text-[#8A6A43]">→</span>
            <span className="px-3 py-1.5 rounded bg-[#F1EBDD] border border-[#DED6C8]">FastAPI REST</span>
            <span className="text-[#8A6A43]">→</span>
            <span className="px-3 py-1.5 rounded bg-[#4C3B2A] text-[#FFFDF8]">React Dashboard</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: SIX SIGNALS / RISK INTELLIGENCE */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#8A6A43] uppercase tracking-wider">
            Alternative Data Channels
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#292721]">
            Six Signal Risk Intelligence
          </h2>
          <p className="text-xs text-[#746E63]">
            Comprehensive monitoring across workforce, news sentiment, compliance, and product health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Signal 1: LinkedIn Headcount */}
          <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl p-5 shadow-xs hover:border-[#8A6A43] transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[#F1EBDD] border border-[#DED6C8]">
                  <Users className="w-5 h-5 text-[#8A6A43]" />
                </div>
                <h4 className="font-bold text-[#292721] text-base">LinkedIn Headcount</h4>
              </div>
              {getDataModeBadge('manual')}
            </div>
            <p className="text-xs text-[#746E63] leading-relaxed mb-3">
              Tracks workforce contraction or expansion. Headcount drops show up on LinkedIn 3–6 months before appearing in quarterly financial reports.
            </p>
            <div className="pt-2 border-t border-[#DED6C8] text-[11px] font-semibold text-[#8A6A43]">
              Weight: 25% (Narrative Anchor)
            </div>
          </div>

          {/* Signal 2: Hiring Activity */}
          <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl p-5 shadow-xs hover:border-[#8A6A43] transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[#F1EBDD] border border-[#DED6C8]">
                  <Activity className="w-5 h-5 text-[#8A6A43]" />
                </div>
                <h4 className="font-bold text-[#292721] text-base">Hiring Activity</h4>
              </div>
              {getDataModeBadge('live')}
            </div>
            <p className="text-xs text-[#746E63] leading-relaxed mb-3">
              Derived from hiring/layoff news activity. Measures recruitment volume spikes versus workforce reduction press coverage.
            </p>
            <div className="pt-2 border-t border-[#DED6C8] text-[11px] font-semibold text-[#8A6A43]">
              Weight: 15% (Live Scraped)
            </div>
          </div>

          {/* Signal 3: News Sentiment */}
          <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl p-5 shadow-xs hover:border-[#8A6A43] transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[#F1EBDD] border border-[#DED6C8]">
                  <Newspaper className="w-5 h-5 text-[#8A6A43]" />
                </div>
                <h4 className="font-bold text-[#292721] text-base">News Sentiment</h4>
              </div>
              {getDataModeBadge('live')}
            </div>
            <p className="text-xs text-[#746E63] leading-relaxed mb-3">
              Measures sentiment contribution to distress risk using NewsAPI + VADER scoring over rolling 30-day headline coverage.
            </p>
            <div className="pt-2 border-t border-[#DED6C8] text-[11px] font-semibold text-[#8A6A43]">
              Weight: 20% (Live Scraped)
            </div>
          </div>

          {/* Signal 4: GSTIN Status */}
          <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl p-5 shadow-xs hover:border-[#8A6A43] transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[#F1EBDD] border border-[#DED6C8]">
                  <Building2 className="w-5 h-5 text-[#8A6A43]" />
                </div>
                <h4 className="font-bold text-[#292721] text-base">GSTIN Status</h4>
              </div>
              {getDataModeBadge('manual')}
            </div>
            <p className="text-xs text-[#746E63] leading-relaxed mb-3">
              Monitors available GST registration/status information. Suspended or cancelled GSTIN signals immediate tax compliance scrutiny.
            </p>
            <div className="pt-2 border-t border-[#DED6C8] text-[11px] font-semibold text-[#8A6A43]">
              Weight: 15% (Regulatory Flag)
            </div>
          </div>

          {/* Signal 5: MCA Filing Status */}
          <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl p-5 shadow-xs hover:border-[#8A6A43] transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[#F1EBDD] border border-[#DED6C8]">
                  <FileCheck className="w-5 h-5 text-[#8A6A43]" />
                </div>
                <h4 className="font-bold text-[#292721] text-base">MCA Filing Status</h4>
              </div>
              {getDataModeBadge('manual')}
            </div>
            <p className="text-xs text-[#746E63] leading-relaxed mb-3">
              Tracks available filing-status indicators, auditor resignations, overdue annual returns, or active NCLT liquidation filings.
            </p>
            <div className="pt-2 border-t border-[#DED6C8] text-[11px] font-semibold text-[#8A6A43]">
              Weight: 15% (Compliance Flag)
            </div>
          </div>

          {/* Signal 6: App Store Health */}
          <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl p-5 shadow-xs hover:border-[#8A6A43] transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[#F1EBDD] border border-[#DED6C8]">
                  <Smartphone className="w-5 h-5 text-[#8A6A43]" />
                </div>
                <h4 className="font-bold text-[#292721] text-base">App Store Health</h4>
              </div>
              {getDataModeBadge('estimated')}
            </div>
            <p className="text-xs text-[#746E63] leading-relaxed mb-3">
              Uses available application/customer-facing health indicators, Play Store ratings, review velocity, or app store delistings.
            </p>
            <div className="pt-2 border-t border-[#DED6C8] text-[11px] font-semibold text-[#8A6A43]">
              Weight: 10% (Product Health)
            </div>
          </div>
        </div>
      </section>

      {/* RETROSPECTIVE DEMO VALIDATION */}
      <section className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED6C8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#7F302B]" />
              <h3 className="text-lg font-bold text-[#292721]">
                Real-World Retrospective Validation: Byju's Case
              </h3>
            </div>
            <p className="text-xs text-[#746E63] mt-0.5">
              Demonstrating how alternative public signals flag distress months before public acknowledgement.
            </p>
          </div>
          <button
            onClick={onNavigateToDashboard}
            className="px-4 py-2 bg-[#8A6A43] hover:bg-[#4C3B2A] text-[#FFFDF8] text-xs font-bold rounded transition-colors self-start md:self-auto"
          >
            Inspect in Dashboard →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-[#F7F3EA] rounded-lg border border-[#DED6C8]">
            <div className="text-xs font-bold text-[#557A61] uppercase tracking-wider mb-1">
              Jan 2022 — Score: 26.9 (Green)
            </div>
            <p className="text-xs text-[#746E63]">
              Pre-crisis baseline. Headcount stable (-3%), MCA filings current, app store rating 3.7.
            </p>
          </div>

          <div className="p-4 bg-[#FBF3E6] rounded-lg border border-[#F0D4AC]">
            <div className="text-xs font-bold text-[#B07A32] uppercase tracking-wider mb-1">
              Jun 2023 — Score: 65.2 (Red)
            </div>
            <p className="text-xs text-[#746E63]">
              First major layoff round (-30%), auditor resignations, negative press, GST scrutiny.
            </p>
          </div>

          <div className="p-4 bg-[#F7E7E5] rounded-lg border border-[#DB9D99]">
            <div className="text-xs font-bold text-[#7F302B] uppercase tracking-wider mb-1">
              Oct 2023 — Score: 85.9 (Critical)
            </div>
            <p className="text-xs text-[#746E63]">
              Deep headcount contraction (-55%), NCLT insolvency proceedings, Play Store app delisting.
            </p>
          </div>
        </div>
      </section>

      {/* HOME PAGE FOOTER */}
      <footer className="pt-8 border-t border-[#DED6C8] text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <img src="/ventra-logo.png" alt="Ventra Logo" className="h-7 object-contain" />
          <span className="font-extrabold text-lg text-[#292721] tracking-tight">
            VENTRA
          </span>
        </div>

        <p className="text-xs font-semibold text-[#8A6A43]">
          Venture Debt Early Warning System — Alternative-signal portfolio monitoring
        </p>

        <p className="text-[11px] text-[#9A9387] max-w-xl mx-auto italic">
          Data may include live, manual, and estimated inputs depending on signal availability. Model formulas and distress risk status definitions originate strictly from the authoritative Python pipeline.
        </p>

        <p className="text-[10px] text-[#9A9387] pt-2">
          Capital Craft Summit 2026 — SRMIST • Venture Lending Risk Intelligence Platform
        </p>
      </footer>
    </div>
  );
};
