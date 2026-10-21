'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, Power, CreditCard, Sparkles, Save, 
  CheckCircle2, AlertCircle, RefreshCw, Music, 
  Calendar, DollarSign, ShieldCheck, Tag, X, ArrowRight
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const [formState, setFormState] = useState({
    enabled: true,
    activePaymentGateway: 'mpesa',
    eventTitle: 'Last Dance',
    tagline: 'One Last Night. One Last Dance.',
    eventDate: '2026-10-26',
    ticketPriceKES: 500,
    musicUrl: '',
    votePackages: [
      { label: 'Single Vote', votes: 1, priceKES: 10, discountText: '', isPopular: false },
      { label: '10-Vote Power Pack', votes: 10, priceKES: 90, discountText: 'Save 10%', isPopular: true },
      { label: '25-Vote Boost Pack', votes: 25, priceKES: 200, discountText: 'Save 20%', isPopular: false },
      { label: '50-Vote Legend Pack', votes: 50, priceKES: 380, discountText: 'Save 24%', isPopular: false }
    ]
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/settings`);
      if (res.data?.success && res.data.settings) {
        const s = res.data.settings;
        setFormState({
          enabled: s.enabled !== false,
          activePaymentGateway: s.activePaymentGateway || 'mpesa',
          eventTitle: s.eventTitle || 'Last Dance',
          tagline: s.tagline || 'One Last Night. One Last Dance.',
          eventDate: s.eventDate || '2026-10-26',
          ticketPriceKES: s.ticketPriceKES || 500,
          musicUrl: s.musicUrl || '',
          votePackages: s.votePackages?.length ? s.votePackages : formState.votePackages
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      showMessage('error', 'Could not load existing settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showMessage = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage({ type: '', text: '' }), 4500);
  };

  const handlePackageChange = (index, field, value) => {
    const updated = [...formState.votePackages];
    updated[index] = {
      ...updated[index],
      [field]: field === 'votes' || field === 'priceKES' ? Number(value) : value
    };
    setFormState({ ...formState, votePackages: updated });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.post(
        `${API_BASE_URL}/last-dance/admin/settings`,
        formState,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showMessage('success', 'System settings & payment configuration updated successfully!');
      } else {
        showMessage('error', res.data?.message || 'Failed to update settings.');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      showMessage('error', err.response?.data?.message || 'Server error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
      
      {/* Toast Notification */}
      {actionMessage.text && (
        <div className={`p-4 rounded-2xl border text-[13px] font-medium flex items-center justify-between shadow-sm animate-fade-in ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button 
            onClick={() => setActionMessage({ type: '', text: '' })}
            className="text-black/40 hover:text-black ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-black/[0.08] pb-6">
        <div>
          <p className="text-[12px] font-medium text-[#762e99] uppercase tracking-wider">
            Engine & Configuration
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-normal tracking-[-0.02em] text-black mt-1">
            System Settings
          </h1>
          <p className="text-[13px] text-black/50 mt-0.5">
            Configure payment gateways, pass pricing, voting tier packages, and live event availability
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] hover:opacity-95 text-white text-[12px] font-semibold shadow-md transition disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Master System Switch */}
        <div className="bg-white border border-black/[0.08] p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#762e99]">
                Public Access Gate
              </span>
              <h2 className="text-[18px] font-normal text-black">
                Master Event Module Status
              </h2>
              <p className="text-[12px] text-black/50">
                When enabled, students can browse the leaderboard, vote for nominees, and buy graduation tickets.
              </p>
            </div>

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setFormState({ ...formState, enabled: !formState.enabled })}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formState.enabled ? 'bg-emerald-500' : 'bg-black/20'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formState.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 bg-[#f7f7f7] rounded-2xl border border-black/[0.05] flex items-center space-x-2 text-[12px]">
            <span className={`w-2 h-2 rounded-full ${formState.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-medium text-black">
              Current Status: {formState.enabled ? 'Live & Accepting Votes / Ticket Purchases' : 'Temporarily Closed (Maintenance Mode)'}
            </span>
          </div>
        </div>

        {/* Section 2: Active Payment Gateway Selection */}
        <div className="bg-white border border-black/[0.08] p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#762e99]">
              Transaction Processing
            </span>
            <h2 className="text-[18px] font-normal text-black">
              Active Payment Gateway
            </h2>
            <p className="text-[12px] text-black/50">
              Select which backend engine processes customer STK push prompts for tickets and votes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Option 1: Safaricom M-Pesa Daraja */}
            <div 
              onClick={() => setFormState({ ...formState, activePaymentGateway: 'mpesa' })}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                formState.activePaymentGateway === 'mpesa'
                  ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-black/[0.08] hover:border-black/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-[15px] text-black">Safaricom M-Pesa Daraja</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Direct STK
                    </span>
                  </div>
                  <p className="text-[12px] text-black/55 leading-relaxed">
                    Direct integration with Safaricom Daraja API. Triggers immediate STK Push prompts to Safaricom phone numbers with real-time callbacks.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  formState.activePaymentGateway === 'mpesa'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-black/20 bg-white'
                }`}>
                  {formState.activePaymentGateway === 'mpesa' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {/* Option 2: PayHero Kenya */}
            <div 
              onClick={() => setFormState({ ...formState, activePaymentGateway: 'payhero' })}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                formState.activePaymentGateway === 'payhero'
                  ? 'bg-purple-50/40 border-[#762e99] ring-2 ring-[#762e99]/20'
                  : 'bg-white border-black/[0.08] hover:border-black/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-[15px] text-black">PayHero Kenya API</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      Multi-Gateway
                    </span>
                  </div>
                  <p className="text-[12px] text-black/55 leading-relaxed">
                    Universal Kenyan fintech payment router. Supports automated channel dispatching and automated reconciliation fallbacks.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  formState.activePaymentGateway === 'payhero'
                    ? 'border-[#762e99] bg-[#762e99] text-white'
                    : 'border-black/20 bg-white'
                }`}>
                  {formState.activePaymentGateway === 'payhero' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section: Nominee Categories Architecture */}
        <div className="bg-white border border-black/[0.08] p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#762e99]">
                Award Architecture & Ballots
              </span>
              <h2 className="text-[18px] font-normal text-black">
                Nominee Categories & Ballot Navigation
              </h2>
              <p className="text-[12px] text-black/50">
                Configure award categories, reorder leaderboard navigation tabs, and manage live candidate distribution.
              </p>
            </div>

            <Link
              href="/last-dance/admin/categories"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#f7f7f7] border border-black/15 text-black hover:border-[#762e99] hover:text-[#762e99] text-[12px] font-semibold transition self-start sm:self-auto shrink-0 shadow-xs"
            >
              <Tag className="w-3.5 h-3.5 text-[#762e99]" />
              <span>Configure Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Section 3: Pass Pricing & Event Meta */}
        <div className="bg-white border border-black/[0.08] p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#762e99]">
              Event Operations
            </span>
            <h2 className="text-[18px] font-normal text-black">
              Event Metadata & Pass Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Ticket Base Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-black/60">
                Ticket Base Price (KES)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 text-[12px] font-medium">
                  KES
                </span>
                <input
                  type="number"
                  min="1"
                  value={formState.ticketPriceKES}
                  onChange={(e) => setFormState({ ...formState, ticketPriceKES: Number(e.target.value) })}
                  className="w-full pl-12 pr-4 py-2.5 bg-[#f7f7f7] border border-black/[0.08] rounded-2xl text-[13px] font-semibold text-black focus:outline-none focus:border-[#762e99] focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Event Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-black/60">
                Event Title
              </label>
              <input
                type="text"
                value={formState.eventTitle}
                onChange={(e) => setFormState({ ...formState, eventTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f7f7f7] border border-black/[0.08] rounded-2xl text-[13px] text-black focus:outline-none focus:border-[#762e99] focus:bg-white transition"
                required
              />
            </div>

            {/* Event Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-black/60">
                Event Date
              </label>
              <input
                type="date"
                value={formState.eventDate}
                onChange={(e) => setFormState({ ...formState, eventDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f7f7f7] border border-black/[0.08] rounded-2xl text-[13px] text-black focus:outline-none focus:border-[#762e99] focus:bg-white transition"
              />
            </div>

            {/* Ambient Music URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-black/60">
                Festival Audio URL
              </label>
              <input
                type="url"
                placeholder="https://... audio.mp3"
                value={formState.musicUrl}
                onChange={(e) => setFormState({ ...formState, musicUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f7f7f7] border border-black/[0.08] rounded-2xl text-[13px] text-black focus:outline-none focus:border-[#762e99] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-black/60">
              Event Tagline / Subtitle
            </label>
            <input
              type="text"
              value={formState.tagline}
              onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#f7f7f7] border border-black/[0.08] rounded-2xl text-[13px] text-black focus:outline-none focus:border-[#762e99] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Section 4: Voting Packages Configuration */}
        <div className="bg-white border border-black/[0.08] p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#762e99]">
              Voting Revenue Packages
            </span>
            <h2 className="text-[18px] font-normal text-black">
              Vote Bundles & Discount Rates
            </h2>
            <p className="text-[12px] text-black/50">
              Configure the 4 voting bundles presented to supporters on candidate profile popups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {formState.votePackages.map((pkg, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-3xl border border-black/[0.08] bg-[#f7f7f7] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#762e99]">
                    Tier #{idx + 1}
                  </span>
                  {pkg.isPopular && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#ff914d] text-white px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-black/45">Package Label</label>
                  <input
                    type="text"
                    value={pkg.label}
                    onChange={(e) => handlePackageChange(idx, 'label', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-[12px] font-medium text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase text-black/45">Votes</label>
                    <input
                      type="number"
                      min="1"
                      value={pkg.votes}
                      onChange={(e) => handlePackageChange(idx, 'votes', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-[12px] font-semibold text-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase text-black/45">Price (KES)</label>
                    <input
                      type="number"
                      min="1"
                      value={pkg.priceKES}
                      onChange={(e) => handlePackageChange(idx, 'priceKES', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-[12px] font-semibold text-[#762e99]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-black/45">Badge / Discount Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Save 10%"
                    value={pkg.discountText || ''}
                    onChange={(e) => handlePackageChange(idx, 'discountText', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-[11px] text-black"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="px-6 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] hover:opacity-95 text-white text-[13px] font-semibold shadow-md transition disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
