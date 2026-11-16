'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, ShieldCheck, DollarSign, RefreshCw, CheckCircle2, 
  XCircle, AlertCircle, Search, Filter, Phone, MapPin, 
  Users, Bed, MessageSquare, ExternalLink, ArrowRight, 
  Receipt, Sparkles, Settings, Eye, Check, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminAccommodationsPage() {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'ledger' | 'refunds' | 'settings'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Metrics
  const [metrics, setMetrics] = useState({
    totalListings: 0,
    activeListings: 0,
    bookedListings: 0,
    totalHostFeesCollectedKES: 0,
    totalGuestFeesCollectedKES: 0,
    totalPlatformEarningsKES: 0,
    unbookedEligibleRefundCount: 0,
    totalRefundsProcessedKES: 0
  });

  // Tab 1: Listings Data
  const [listings, setListings] = useState([]);
  const [listingSearch, setListingSearch] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');

  // Tab 2: Financial Audit Ledger Data
  const [transactions, setTransactions] = useState([]);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');

  // Tab 4: Fee & Disclaimer Settings Data
  const [settingsData, setSettingsData] = useState({
    enabled: true,
    hostListingFeeKES: 100,
    hostRefundFeeKES: 50,
    clientBookingFeeKES: 100,
    disclaimerText: ''
  });

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showNotification = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4500);
  };

  // Fetch Metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/admin/metrics`, getAuthHeader());
      if (res.data?.success && res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.warn('Metrics fetch error:', err.message);
    }
  }, []);

  // Fetch Listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/admin/listings`, getAuthHeader());
      if (res.data?.success) {
        setListings(res.data.listings || []);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Financial Ledger
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/admin/transactions`, getAuthHeader());
      if (res.data?.success) {
        setTransactions(res.data.ledger || []);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to load ledger.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/admin/settings`, getAuthHeader());
      if (res.data?.success && res.data.settings) {
        setSettingsData(res.data.settings);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMetrics();
    if (activeTab === 'listings' || activeTab === 'refunds') {
      fetchListings();
    } else if (activeTab === 'ledger') {
      fetchTransactions();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, fetchMetrics, fetchListings, fetchTransactions, fetchSettings]);

  // Handle Listing Status Update
  const handleUpdateListingStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to change status to "${status}"?`)) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/last-dance/accommodations/admin/listings/${id}/status`,
        { status },
        getAuthHeader()
      );
      if (res.data?.success) {
        showNotification('success', `Listing status updated to ${status}.`);
        fetchListings();
        fetchMetrics();
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle KES 50 Unbooked Refund Execution
  const handleProcessRefund = async (listing) => {
    const confirmPrompt = window.prompt(
      `Process KES 50 refund for Host ${listing.hostName} (${listing.hostPhone})?\n\nEnter refund reference note / M-Pesa B2C code below:`,
      `REFUND-KES50-${listing.listingRef}`
    );
    if (!confirmPrompt) return;

    setActionLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/last-dance/accommodations/admin/refund/${listing._id}`,
        { refundNotes: confirmPrompt },
        getAuthHeader()
      );
      if (res.data?.success) {
        showNotification('success', `KES 50 refund recorded successfully for ${listing.listingRef}. Host notified via SMS.`);
        fetchListings();
        fetchMetrics();
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Refund processing failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/last-dance/accommodations/admin/settings`,
        settingsData,
        getAuthHeader()
      );
      if (res.data?.success) {
        showNotification('success', 'Accommodation module settings saved successfully.');
        fetchMetrics();
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter listings
  const filteredListings = listings.filter(l => {
    const matchesStatus = listingStatusFilter === 'all' || l.status === listingStatusFilter;
    const q = listingSearch.toLowerCase().trim();
    const matchesSearch = !q || 
      (l.title || '').toLowerCase().includes(q) ||
      (l.listingRef || '').toLowerCase().includes(q) ||
      (l.hostName || '').toLowerCase().includes(q) ||
      (l.hostPhone || '').includes(q) ||
      (l.locationZone || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filter unbooked listings for refunds
  const unbookedRefundListings = listings.filter(l => l.refundEligible || l.refundStatus === 'processed' || l.status === 'active');

  // Filter ledger transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesType = transactionTypeFilter === 'all' || t.transactionType === transactionTypeFilter;
    const q = transactionSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (t.reference || '').toLowerCase().includes(q) ||
      (t.mpesaReceipt || '').toLowerCase().includes(q) ||
      (t.phone || '').includes(q) ||
      (t.targetTitle || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-black tracking-tight">
              Accommodations &amp; Stays Hub
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e2590] bg-purple-100 px-2.5 py-0.5 rounded-full">
              Add-On Module
            </span>
          </div>
          <p className="text-[13px] text-black/60 mt-0.5">
            Audit host enlisting fees, guest bookings, moderation, and unbooked property refunds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchMetrics();
            if (activeTab === 'listings' || activeTab === 'refunds') fetchListings();
            if (activeTab === 'ledger') fetchTransactions();
            if (activeTab === 'settings') fetchSettings();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/15 bg-white text-[12.5px] font-medium text-black/75 hover:border-[#5e2590] hover:text-[#5e2590] transition shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notification banner */}
      {feedback.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-[13px] font-medium transition ${
          feedback.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* =============================================
          FINANCIAL METRICS CARDS
      ============================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Earnings */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-black/50">Total Platform Revenue</p>
          <p className="text-[22px] font-bold text-[#5e2590] mt-1">
            KES {Number(metrics.totalPlatformEarningsKES || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-black/55 mt-0.5">Host + Guest fees collected</p>
        </div>

        {/* Host Enlisting Fees */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-black/50">Host Enlisting Fees (KES 100)</p>
          <p className="text-[22px] font-bold text-black mt-1">
            KES {Number(metrics.totalHostFeesCollectedKES || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-black/55 mt-0.5">From {metrics.totalListings} enlisted listings</p>
        </div>

        {/* Guest Booking Fees */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-black/50">Guest Connection Fees (KES 100)</p>
          <p className="text-[22px] font-bold text-black mt-1">
            KES {Number(metrics.totalGuestFeesCollectedKES || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{metrics.bookedListings} confirmed connections</p>
        </div>

        {/* Unbooked Refund Pool */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-900">Unbooked KES 50 Refund Review</p>
          <p className="text-[22px] font-bold text-purple-950 mt-1">
            {metrics.unbookedEligibleRefundCount} eligible
          </p>
          <p className="text-[11px] text-purple-800 mt-0.5">
            KES {Number(metrics.totalRefundsProcessedKES || 0).toLocaleString()} refunded to date
          </p>
        </div>
      </div>

      {/* =============================================
          NAVIGATION TABS
      ============================================= */}
      <div className="flex border-b border-black/[0.08] gap-4 text-[13px] font-medium overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`pb-2.5 transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'listings' ? 'border-[#5e2590] text-[#5e2590] font-bold' : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Listings Moderation ({listings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`pb-2.5 transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ledger' ? 'border-[#5e2590] text-[#5e2590] font-bold' : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Financial Audit Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('refunds')}
          className={`pb-2.5 transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'refunds' ? 'border-[#5e2590] text-[#5e2590] font-bold' : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Unbooked Refund Desk ({metrics.unbookedEligibleRefundCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-2.5 transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'border-[#5e2590] text-[#5e2590] font-bold' : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Fees &amp; Disclaimer Config</span>
        </button>
      </div>

      {/* =============================================
          TAB 1: LISTINGS MODERATION
      ============================================= */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ref, title, host, phone..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden focus:border-[#5e2590]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={listingStatusFilter}
                onChange={(e) => setListingStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden text-black/75"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="booked">Booked</option>
                <option value="rejected">Rejected</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
          </div>

          {/* Listings Table */}
          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-[#f7f7f7] border-b border-black/[0.08] text-[11px] font-bold uppercase tracking-wider text-black/55">
                  <tr>
                    <th className="py-3 px-4">Ref &amp; Property</th>
                    <th className="py-3 px-4">Zone &amp; Rate</th>
                    <th className="py-3 px-4">Host Contacts</th>
                    <th className="py-3 px-4">Enlisting Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-black/50 italic">
                        No accommodation listings found.
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map(l => (
                      <tr key={l._id} className="hover:bg-black/[0.015] transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-[#5e2590] text-[11px] bg-purple-50 px-2 py-0.5 rounded-md">
                            {l.listingRef}
                          </span>
                          <p className="font-bold text-black mt-1 line-clamp-1">{l.title}</p>
                          <p className="text-[11px] text-black/55">{l.propertyType} • {l.maxGuests} max guests</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium text-black">{l.locationZone}</p>
                          <p className="font-bold text-[#5e2590] text-[13px]">KES {Number(l.pricePerNightKES).toLocaleString()}/night</p>
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <p className="font-bold text-black">{l.hostName}</p>
                          <p className="text-black/70 flex items-center gap-1 font-mono text-[11.5px]">
                            <Phone className="w-3 h-3 text-[#5e2590]" />
                            <span>{l.hostPhone}</span>
                            {l.isPhoneVerified && <span className="text-emerald-600 font-bold">✓ OTP</span>}
                          </p>
                          {l.hostWhatsApp && (
                            <a
                              href={`https://wa.me/${l.hostWhatsApp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 text-[11px] hover:underline flex items-center gap-1"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            l.enlistingPaymentStatus === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {l.enlistingPaymentStatus === 'completed' ? `Paid (KES ${l.enlistingFeeKES})` : 'Pending'}
                          </span>
                          {l.enlistingReceiptNumber && (
                            <p className="font-mono text-[10.5px] text-black/55 mt-0.5">{l.enlistingReceiptNumber}</p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            l.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            l.status === 'booked' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            l.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {l.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {l.status !== 'active' && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateListingStatus(l._id, 'active')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11.5px] font-medium transition"
                              >
                                Approve
                              </button>
                            )}

                            {l.status !== 'rejected' && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateListingStatus(l._id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11.5px] font-medium transition"
                              >
                                Reject
                              </button>
                            )}

                            {l.status !== 'unlisted' && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateListingStatus(l._id, 'unlisted')}
                                className="px-2.5 py-1 rounded-lg border border-black/15 text-black hover:bg-black/5 text-[11.5px] font-medium transition"
                              >
                                Unlist
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =============================================
          TAB 2: FINANCIAL AUDIT LEDGER
      ============================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone, receipt, ref..."
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden focus:border-[#5e2590]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden text-black/75"
              >
                <option value="all">All Fee Types</option>
                <option value="host_enlisting_fee">Host Enlisting Fee (KES 100)</option>
                <option value="guest_connection_fee">Guest Connection Fee (KES 100)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-[#f7f7f7] border-b border-black/[0.08] text-[11px] font-bold uppercase tracking-wider text-black/55">
                  <tr>
                    <th className="py-3 px-4">Fee Type</th>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Target Property / Stay</th>
                    <th className="py-3 px-4">Handset &amp; User</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">M-Pesa Receipt</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-black/50 italic">
                        No financial records matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t, idx) => (
                      <tr key={idx} className="hover:bg-black/[0.015] transition">
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${
                            t.transactionType === 'host_enlisting_fee'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {t.transactionType === 'host_enlisting_fee' ? 'Host Enlisting' : 'Guest Booking'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-black text-[11.5px]">
                          {t.reference}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-black line-clamp-1">{t.targetTitle}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium text-black">{t.userName || 'Client'}</p>
                          <p className="font-mono text-[11px] text-black/60">{t.phone}</p>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#5e2590]">
                          KES {t.amountKES}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11.5px] font-bold text-emerald-700">
                          {t.mpesaReceipt || 'Auto-Verified'}
                        </td>

                        <td className="py-3.5 px-4 text-black/50 text-[11px]">
                          {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =============================================
          TAB 3: UNBOOKED KES 50 REFUND DESK
      ============================================= */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/60 flex items-start gap-3 text-[12.5px] text-purple-950">
            <Sparkles className="w-5 h-5 text-[#5e2590] shrink-0 mt-0.5" />
            <div>
              <strong>Host Fairness Refund Policy:</strong> When a host pays KES 100 to enlist their house but it remains unbooked throughout the festival eve, our policy grants them a <strong>KES 50 refund</strong>. The admin desk reviews unbooked listings below, triggers the refund payout, and registers the transaction in the audit ledger.
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-[#f7f7f7] border-b border-black/[0.08] text-[11px] font-bold uppercase tracking-wider text-black/55">
                  <tr>
                    <th className="py-3 px-4">Listing Ref &amp; Title</th>
                    <th className="py-3 px-4">Host Contacts</th>
                    <th className="py-3 px-4">Enlisting Receipt</th>
                    <th className="py-3 px-4">Refund Status</th>
                    <th className="py-3 px-4 text-right">Refund Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {unbookedRefundListings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-black/50 italic">
                        No unbooked listings eligible for refund at this time.
                      </td>
                    </tr>
                  ) : (
                    unbookedRefundListings.map(l => (
                      <tr key={l._id} className="hover:bg-black/[0.015] transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-[#5e2590] text-[11px] bg-purple-50 px-2 py-0.5 rounded-md">
                            {l.listingRef}
                          </span>
                          <p className="font-bold text-black mt-1 line-clamp-1">{l.title}</p>
                          <p className="text-[11px] text-black/55">{l.propertyType} • Zone: {l.locationZone}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-black">{l.hostName}</p>
                          <p className="font-mono text-[11.5px] text-black/60">{l.hostPhone}</p>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-black/70">
                          {l.enlistingReceiptNumber || 'Verified Payment'}
                        </td>

                        <td className="py-3.5 px-4">
                          {l.refundStatus === 'processed' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>KES {l.refundAmountKES || 50} Refunded</span>
                            </span>
                          ) : l.refundEligible ? (
                            <span className="inline-flex items-center gap-1 text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full text-[11px] font-bold">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Eligible (KES {l.refundAmountKES || 50})</span>
                            </span>
                          ) : (
                            <span className="text-black/50 text-[11.5px]">Awaiting festival end</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {l.refundStatus === 'processed' ? (
                            <span className="text-[11px] text-black/45 font-mono italic">
                              {l.refundReceiptCode || 'Recorded'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleProcessRefund(l)}
                              className="px-3 py-1.5 rounded-lg bg-[#5e2590] hover:bg-[#762e99] text-white text-[12px] font-medium transition disabled:opacity-50"
                            >
                              Process KES 50 Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =============================================
          TAB 4: FEES & DISCLAIMER SETTINGS
      ============================================= */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 shadow-2xs space-y-5">
          <div>
            <h3 className="text-[16px] font-bold text-black">
              Accommodations Pricing &amp; Connector Terms
            </h3>
            <p className="text-[12.5px] text-black/60 mt-0.5">
              Customize the fee structure and middleman connector terms displayed to hosts and festival guests.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-black/75 mb-1">
                  Host Enlisting Fee (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={settingsData.hostListingFeeKES}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, hostListingFeeKES: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 text-[13px] font-bold focus:outline-hidden focus:border-[#5e2590]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-black/75 mb-1">
                  Host Unbooked Refund (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={settingsData.hostRefundFeeKES}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, hostRefundFeeKES: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 text-[13px] font-bold focus:outline-hidden focus:border-[#5e2590]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-black/75 mb-1">
                  Guest Connection Fee (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={settingsData.clientBookingFeeKES}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, clientBookingFeeKES: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 text-[13px] font-bold focus:outline-hidden focus:border-[#5e2590]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-black/75 mb-1">
                Platform Connector Disclaimer Text
              </label>
              <textarea
                rows={4}
                value={settingsData.disclaimerText}
                onChange={(e) => setSettingsData(prev => ({ ...prev, disclaimerText: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-black/15 text-[12.5px] leading-relaxed focus:outline-hidden focus:border-[#5e2590]"
              />
              <p className="text-[11px] text-black/50 mt-1">
                Clearly states that the festival is an introductory connector only and does not own or insure properties.
              </p>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13px] font-medium transition shadow-sm disabled:opacity-50"
            >
              {actionLoading ? 'Saving Settings...' : 'Save Accommodations Configuration'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
