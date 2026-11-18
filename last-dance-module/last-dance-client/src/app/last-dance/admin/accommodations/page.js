'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, ShieldCheck, DollarSign, RefreshCw, CheckCircle2, 
  XCircle, AlertCircle, Search, Filter, Phone, MapPin, 
  Users, Bed, MessageSquare, ExternalLink, ArrowRight, 
  Receipt, Sparkles, Settings, Eye, Check, AlertTriangle, Plus,
  Calendar, Mail, FileText, User, X
} from 'lucide-react';
import axios from 'axios';
import AccommodationEnlistModal from '@/components/last-dance/AccommodationEnlistModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminAccommodationsPage() {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'bookings' | 'ledger' | 'refunds' | 'settings'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [isEnlistModalOpen, setIsEnlistModalOpen] = useState(false);

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

  // Tab 2: Guest Reservations / Bookings Data
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Selected Listing & Guest Dossier Modal
  const [selectedListing, setSelectedListing] = useState(null);

  // Tab 3: Financial Audit Ledger Data
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

  // Fetch Guest Bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/admin/bookings`, getAuthHeader());
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to load bookings.');
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
        setTransactions(res.data.transactions || res.data.ledger || []);
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
      fetchBookings();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'ledger') {
      fetchTransactions();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, fetchMetrics, fetchListings, fetchBookings, fetchTransactions, fetchSettings]);

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
      (l.locationZone || '').toLowerCase().includes(q) ||
      (l.booking?.guestName || '').toLowerCase().includes(q) ||
      (l.booking?.guestPhone || '').includes(q) ||
      (l.booking?.guestEmail || '').toLowerCase().includes(q) ||
      (l.booking?.bookingRef || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filter guest bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = bookingStatusFilter === 'all' || b.paymentStatus === bookingStatusFilter;
    const q = bookingSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (b.bookingRef || '').toLowerCase().includes(q) ||
      (b.guestName || '').toLowerCase().includes(q) ||
      (b.guestPhone || '').includes(q) ||
      (b.guestEmail || '').toLowerCase().includes(q) ||
      (b.listingTitle || '').toLowerCase().includes(q) ||
      (b.mpesaReceiptNumber || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filter unbooked listings for refunds
  const unbookedRefundListings = listings.filter(l => l.refundEligible || l.refundStatus === 'processed' || l.status === 'active');

  // Filter ledger transactions
  const filteredTransactions = transactions.filter(t => {
    const type = t.transactionType || t.type;
    const matchesType = transactionTypeFilter === 'all' || 
      type === transactionTypeFilter ||
      (transactionTypeFilter === 'host_enlisting_fee' && (type === 'host_enlisting' || type === 'host_enlisting_fee')) ||
      (transactionTypeFilter === 'guest_connection_fee' && (type === 'guest_booking' || type === 'guest_connection_fee'));
    
    const q = transactionSearch.toLowerCase().trim();
    const ref = (t.reference || '').toLowerCase();
    const receipt = (t.mpesaReceipt || t.receiptNumber || '').toLowerCase();
    const phone = (t.phone || t.payerPhone || '');
    const title = (t.targetTitle || t.itemTitle || '').toLowerCase();
    const user = (t.userName || t.payerName || '').toLowerCase();

    const matchesSearch = !q ||
      ref.includes(q) ||
      receipt.includes(q) ||
      phone.includes(q) ||
      title.includes(q) ||
      user.includes(q);

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEnlistModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5e2590] text-white text-[12.5px] font-bold hover:bg-[#762e99] transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Enlist Property (Admin)</span>
          </button>

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
          onClick={() => setActiveTab('bookings')}
          className={`pb-2.5 transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'bookings' ? 'border-[#5e2590] text-[#5e2590] font-bold' : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Guest Bookings ({bookings.length})</span>
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
              <button
                type="button"
                onClick={() => setIsEnlistModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5e2590] text-white text-[12.5px] font-bold hover:bg-[#762e99] transition shadow-2xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Enlist Property</span>
              </button>

              <select
                value={listingStatusFilter}
                onChange={(e) => setListingStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden text-black/75"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="booked">Booked</option>
                <option value="rejected">Rejected</option>
                <option value="unlisted">Deactivated (Unlisted)</option>
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
                    <th className="py-3 px-4">Booked Guest</th>
                    <th className="py-3 px-4">Enlisting Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-black/50 italic">
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

                        {/* Booked Guest Column */}
                        <td className="py-3.5 px-4 min-w-[190px]">
                          {l.booking ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-black text-[13px]">{l.booking.guestName}</span>
                                <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                                  l.booking.paymentStatus === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {l.booking.paymentStatus === 'completed' ? 'Paid' : l.booking.paymentStatus}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-[11.5px] font-mono text-black/80">
                                <Phone className="w-3 h-3 text-[#5e2590] shrink-0" />
                                <a href={`tel:${l.booking.guestPhone}`} className="hover:underline">{l.booking.guestPhone}</a>
                                {l.booking.guestPhone && (
                                  <a
                                    href={`https://wa.me/${l.booking.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${l.booking.guestName}, contacting you regarding your Last Dance stay reservation (${l.booking.bookingRef}) for "${l.title}".`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-700 hover:text-emerald-800 ml-1 inline-flex items-center"
                                    title="Chat with Guest on WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </a>
                                )}
                              </div>

                              {l.booking.guestEmail && (
                                <p className="text-[11px] text-black/55 truncate max-w-[170px]" title={l.booking.guestEmail}>
                                  {l.booking.guestEmail}
                                </p>
                              )}

                              <div className="flex items-center gap-1.5 text-[11px] text-black/60 pt-0.5">
                                <a
                                  href={`/last-dance/accommodations/booking/${l.booking.bookingRef}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono font-bold text-[#5e2590] hover:underline bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/80 inline-flex items-center gap-0.5"
                                  title="Open Verified Stay Pass"
                                >
                                  <span>{l.booking.bookingRef}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                </a>
                                <span>• {l.booking.guestCount || 1} guest(s)</span>
                              </div>

                              <p className="text-[10.5px] text-black/50">
                                {l.booking.checkInDate} &rarr; {l.booking.checkOutDate}
                              </p>

                              {l.booking.mpesaReceiptNumber && (
                                <p className="font-mono text-[10px] text-emerald-800">
                                  Receipt: <strong>{l.booking.mpesaReceiptNumber}</strong>
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-black/35 text-[11.5px] italic">
                              — Not booked —
                            </span>
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
                            'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {l.status === 'unlisted' ? 'Deactivated' : l.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedListing(l)}
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#5e2590] border border-purple-200 text-[11.5px] font-medium transition flex items-center gap-1"
                              title="View complete property, host & guest details"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>

                            {l.status === 'active' ? (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateListingStatus(l._id, 'unlisted')}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11.5px] font-medium transition"
                                title="Deactivate and remove from public marketplace"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateListingStatus(l._id, 'active')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11.5px] font-medium transition"
                                title="Activate and show on public marketplace"
                              >
                                Activate
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
          TAB 2: GUEST RESERVATIONS & BOOKINGS
      ============================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest, phone, receipt, ref..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden focus:border-[#5e2590]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden text-black/75"
              >
                <option value="all">All Payment Statuses</option>
                <option value="completed">Completed (Confirmed)</option>
                <option value="pending">Pending Payment</option>
                <option value="failed">Failed / Cancelled</option>
              </select>

              <button
                type="button"
                onClick={fetchBookings}
                className="p-2 rounded-xl border border-black/15 text-black/60 hover:text-black hover:bg-black/5 transition"
                title="Refresh Bookings"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-[#f7f7f7] border-b border-black/[0.08] text-[11px] font-bold uppercase tracking-wider text-black/55">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Guest Details</th>
                    <th className="py-3 px-4">Reserved Property</th>
                    <th className="py-3 px-4">Stay Dates &amp; Notes</th>
                    <th className="py-3 px-4">Host Contacts</th>
                    <th className="py-3 px-4">Fee &amp; Receipt</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-black/50 italic">
                        No guest bookings found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b._id} className="hover:bg-black/[0.015] transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#5e2590] text-[11.5px]">
                          <a
                            href={`/last-dance/accommodations/booking/${b.bookingRef}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>{b.bookingRef}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                          <p className="font-sans text-[10.5px] text-black/50 font-normal mt-0.5">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <p className="font-bold text-black text-[13px]">{b.guestName}</p>
                          <p className="text-black/75 flex items-center gap-1 font-mono text-[11.5px]">
                            <Phone className="w-3 h-3 text-[#5e2590]" />
                            <a href={`tel:${b.guestPhone}`} className="hover:underline">{b.guestPhone}</a>
                            {b.guestPhone && (
                              <a
                                href={`https://wa.me/${b.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${b.guestName}, contacting you regarding your Last Dance stay reservation (${b.bookingRef}) for "${b.listingTitle}".`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-800 ml-1 inline-flex items-center"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </p>
                          {b.guestEmail && (
                            <p className="text-[11px] text-black/55">{b.guestEmail}</p>
                          )}
                          <p className="text-[11px] text-black/50">
                            {b.guestCount || 1} guest(s)
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-black">{b.listingTitle}</p>
                          <p className="text-[11px] text-black/60">{b.listingPropertyType} • Zone: {b.listingZone}</p>
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <p className="font-medium text-black text-[12px]">
                            {b.checkInDate} &rarr; {b.checkOutDate}
                          </p>
                          {b.guestNotes ? (
                            <p className="text-[11px] text-black/60 italic line-clamp-2 max-w-[180px]" title={b.guestNotes}>
                              &ldquo;{b.guestNotes}&rdquo;
                            </p>
                          ) : (
                            <span className="text-[10.5px] text-black/40">No arrival notes</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <p className="font-bold text-black text-[12px]">
                            {b.hostDetails?.name || b.listing?.hostName || 'Host'}
                          </p>
                          <p className="text-black/70 flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-2.5 h-2.5 text-emerald-700" />
                            <a href={`tel:${b.hostDetails?.phone || b.listing?.hostPhone}`} className="hover:underline">
                              {b.hostDetails?.phone || b.listing?.hostPhone || 'N/A'}
                            </a>
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#5e2590]">KES {b.connectionFeeKES || 100}</p>
                          <p className="font-mono text-[11px] text-emerald-800 font-semibold">
                            {b.mpesaReceiptNumber || '—'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${
                            b.paymentStatus === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : b.paymentStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`/last-dance/accommodations/booking/${b.bookingRef}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5e2590] hover:bg-[#762e99] text-white text-[11.5px] font-medium transition shadow-2xs"
                          >
                            <span>Stay Pass</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </a>
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
          TAB 3: FINANCIAL AUDIT LEDGER
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
                            t.transactionType === 'host_enlisting_fee' || t.type === 'host_enlisting'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {t.transactionType === 'host_enlisting_fee' || t.type === 'host_enlisting' ? 'Host Enlisting' : 'Guest Booking'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-black text-[11.5px]">
                          {t.reference}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-black line-clamp-1">{t.targetTitle || t.itemTitle}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium text-black">{t.userName || t.payerName || 'Client'}</p>
                          <p className="font-mono text-[11px] text-black/60">{t.phone || t.payerPhone}</p>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#5e2590]">
                          KES {t.amountKES}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11.5px] font-bold text-emerald-700">
                          {t.mpesaReceipt || t.receiptNumber || 'Auto-Verified'}
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

      {/* Admin Enlist Modal */}
      <AccommodationEnlistModal
        isOpen={isEnlistModalOpen}
        onClose={() => setIsEnlistModalOpen(false)}
        isAdmin={true}
        onEnlistSuccess={() => {
          setIsEnlistModalOpen(false);
          fetchListings();
          fetchMetrics();
          showNotification('success', 'Property successfully enlisted by Admin and is now ACTIVE!');
        }}
      />

      {/* Listing & Booked Guest Details Dossier Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-black/[0.08] shadow-2xl p-6 sm:p-7 space-y-6">
            
            <div className="flex items-start justify-between pb-4 border-b border-black/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#5e2590] text-[11px] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {selectedListing.listingRef}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    selectedListing.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    selectedListing.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedListing.status}
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-black mt-1 leading-tight">
                  {selectedListing.title}
                </h3>
                <p className="text-[12.5px] text-black/60">
                  {selectedListing.propertyType} • Zone: {selectedListing.locationZone} • KES {Number(selectedListing.pricePerNightKES).toLocaleString()}/night
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="p-1.5 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 2 Columns: Host on left, Booked Guest on right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Host Summary */}
              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-5 space-y-3">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#5e2590] bg-purple-100/70 px-2.5 py-0.5 rounded-full">
                  Property Host
                </span>
                
                <div className="space-y-1.5 text-[13px]">
                  <p className="font-bold text-black text-[15px]">{selectedListing.hostName}</p>
                  <p className="text-black/80 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#5e2590]" />
                    <a href={`tel:${selectedListing.hostPhone}`} className="hover:underline font-mono">{selectedListing.hostPhone}</a>
                  </p>
                  {selectedListing.hostWhatsApp && (
                    <p className="text-emerald-700 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <a
                        href={`https://wa.me/${selectedListing.hostWhatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline font-mono"
                      >
                        WhatsApp: {selectedListing.hostWhatsApp}
                      </a>
                    </p>
                  )}
                  <p className="text-black/75 flex items-start gap-2 pt-1 text-[12px]">
                    <MapPin className="w-3.5 h-3.5 text-[#5e2590] shrink-0 mt-0.5" />
                    <span>{selectedListing.specificAddress || `Zone: ${selectedListing.locationZone}`}</span>
                  </p>
                </div>
              </div>

              {/* Booked Guest Summary */}
              <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Booked Attendee / Guest
                  </span>
                  {selectedListing.booking && (
                    <span className="font-mono text-[11px] font-bold text-emerald-950">
                      {selectedListing.booking.bookingRef}
                    </span>
                  )}
                </div>

                {selectedListing.booking ? (
                  <div className="space-y-2 text-[13px]">
                    <p className="font-bold text-black text-[15px]">
                      {selectedListing.booking.guestName}
                    </p>

                    <div className="flex items-center gap-2 font-mono text-[12.5px] text-black/85">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <a href={`tel:${selectedListing.booking.guestPhone}`} className="hover:underline font-bold">
                        {selectedListing.booking.guestPhone}
                      </a>
                      <a
                        href={`https://wa.me/${selectedListing.booking.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedListing.booking.guestName}, contacting you regarding your Last Dance stay reservation (${selectedListing.booking.bookingRef}) for "${selectedListing.title}".`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-medium hover:bg-emerald-700 transition flex items-center gap-1 shadow-2xs"
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>Chat</span>
                      </a>
                    </div>

                    {selectedListing.booking.guestEmail && (
                      <p className="text-[12px] text-black/70 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-emerald-700" />
                        <span>{selectedListing.booking.guestEmail}</span>
                      </p>
                    )}

                    <div className="text-[12px] text-black/80 space-y-0.5 pt-1 border-t border-emerald-500/15">
                      <p><strong>Stay:</strong> {selectedListing.booking.checkInDate} &rarr; {selectedListing.booking.checkOutDate}</p>
                      <p><strong>Occupants:</strong> {selectedListing.booking.guestCount || 1} guest(s)</p>
                      {selectedListing.booking.mpesaReceiptNumber && (
                        <p className="font-mono text-emerald-900 font-semibold">
                          M-Pesa: {selectedListing.booking.mpesaReceiptNumber} (KES {selectedListing.booking.connectionFeeKES || 100})
                        </p>
                      )}
                      {selectedListing.booking.guestNotes && (
                        <p className="text-[11.5px] text-black/70 italic pt-0.5">
                          &ldquo;{selectedListing.booking.guestNotes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <a
                        href={`/last-dance/accommodations/booking/${selectedListing.booking.bookingRef}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium transition text-center shadow-2xs flex items-center justify-center gap-1.5"
                      >
                        <span>Open Verified Stay Pass</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-black/50 text-[12.5px] space-y-1">
                    <p className="font-medium text-black/70">No booking on this property yet</p>
                    <p className="text-[11.5px] text-black/45">Currently listed and available for attendees to reserve.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-black/[0.08]">
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="px-5 py-2 rounded-full bg-black/5 hover:bg-black/10 text-black text-[13px] font-medium transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
