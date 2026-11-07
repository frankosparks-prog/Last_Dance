'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, RefreshCw, UserPlus, Phone, 
  MapPin, CheckCircle2, Clock, AlertCircle, DollarSign, Send,
  UserCheck, Calendar, MessageSquare, ExternalLink, ShieldCheck,
  ChevronRight, ArrowRight
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminServiceBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  
  // Assign Provider form
  const [providerForm, setProviderForm] = useState({
    providerName: '',
    providerPhone: '',
    assignmentNotes: '',
    notifyClient: true
  });
  const [assigning, setAssigning] = useState(false);

  // Balance prompt form
  const [balancePhone, setBalancePhone] = useState('');
  const [promptingBalance, setPromptingBalance] = useState(false);
  const [balancePromptResult, setBalancePromptResult] = useState(null);

  const [actionNotice, setActionNotice] = useState({ type: '', text: '' });

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/services/admin/bookings/list`, {
        ...getAuthHeader(),
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          balanceStatus: balanceFilter !== 'All' ? balanceFilter : undefined,
          search: searchQuery.trim() || undefined
        }
      });

      if (res.data?.success) {
        setBookings(res.data.bookings || []);
        setMetrics(res.data.metrics || null);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setActionNotice({ type: 'error', text: 'Failed to load bookings. Check authorization.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [statusFilter, balanceFilter]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  // Open Assign Provider Modal
  const openAssignModal = (booking) => {
    setSelectedBooking(booking);
    setProviderForm({
      providerName: booking.assignedProvider?.name || '',
      providerPhone: booking.assignedProvider?.phone || '',
      assignmentNotes: booking.assignedProvider?.assignmentNotes || '',
      notifyClient: true
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignProvider = async (e) => {
    e.preventDefault();
    if (!providerForm.providerName.trim()) {
      alert('Provider name is required.');
      return;
    }

    setAssigning(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/last-dance/services/admin/bookings/${selectedBooking._id}/assign-provider`,
        providerForm,
        getAuthHeader()
      );

      if (res.data?.success) {
        setActionNotice({
          type: 'success',
          text: `Specialist "${providerForm.providerName}" assigned to ${selectedBooking.bookingRef} successfully!`
        });
        setIsAssignModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign provider.');
    } finally {
      setAssigning(false);
    }
  };

  // Open Balance STK Prompt Modal
  const openBalanceModal = (booking) => {
    setSelectedBooking(booking);
    setBalancePhone(booking.clientPhone || '');
    setBalancePromptResult(null);
    setIsBalanceModalOpen(true);
  };

  const handlePromptBalance = async (e) => {
    e.preventDefault();
    if (!balancePhone.trim()) {
      alert('Client phone number is required to send M-Pesa prompt.');
      return;
    }

    setPromptingBalance(true);
    setBalancePromptResult(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/last-dance/services/admin/bookings/${selectedBooking._id}/request-balance`,
        { phone: balancePhone.trim() },
        getAuthHeader()
      );

      if (res.data?.success) {
        setBalancePromptResult({
          success: true,
          message: res.data.message || `M-Pesa STK Prompt sent to ${balancePhone} for KES ${selectedBooking.remainingBalanceKES}.`
        });
        fetchBookings();
      }
    } catch (err) {
      setBalancePromptResult({
        success: false,
        message: err.response?.data?.message || 'Failed to initiate M-Pesa prompt.'
      });
    } finally {
      setPromptingBalance(false);
    }
  };

  // Quick Operational Status Update
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/last-dance/services/admin/bookings/${bookingId}/status`,
        { status: newStatus },
        getAuthHeader()
      );
      fetchBookings();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-black/[0.08] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Bookings &amp; Orders</h1>
            <span className="bg-[#762e99]/10 text-[#762e99] text-xs font-bold px-2.5 py-1 rounded-full">
              {bookings.length} Bookings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Link service providers with clients, track places of service/collection, and prompt remaining balances upon delivery.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="self-start sm:self-auto flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#762e99]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionNotice.text && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
          actionNotice.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice({ type: '', text: '' })} className="underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-black/[0.08] shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
            <p className="text-xl font-black text-slate-900 mt-1">{metrics.totalBookings}</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">{metrics.confirmedBookings} deposit paid</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-black/[0.08] shadow-xs">
            <p className="text-[11px] font-bold text-[#5e2590] uppercase tracking-wider">Deposits Collected</p>
            <p className="text-xl font-black text-[#5e2590] mt-1">KES {Number(metrics.totalDepositsKES).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-1">Upfront commitment</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-black/[0.08] shadow-xs">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Balances Collected</p>
            <p className="text-xl font-black text-emerald-600 mt-1">KES {Number(metrics.totalBalancesCollectedKES).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-1">Post-delivery payouts</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-black/[0.08] shadow-xs">
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Balances</p>
            <p className="text-xl font-black text-amber-600 mt-1">KES {Number(metrics.pendingBalancesKES).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-1">Due on delivery</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-black/[0.08] shadow-xs col-span-2 lg:col-span-1">
            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Providers Linked</p>
            <p className="text-xl font-black text-indigo-600 mt-1">{metrics.providersAssigned}</p>
            <p className="text-[10px] text-slate-400 mt-1">Specialists assigned</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/[0.08] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto">
          {[
            { label: 'All', value: 'All' },
            { label: 'Deposit Paid', value: 'confirmed' },
            { label: 'Provider Assigned', value: 'provider_assigned' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Deposit Pending', value: 'deposit_pending' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.value
                  ? 'bg-[#5e2590] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ref, client, phone, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#762e99]"
          />
        </form>
      </div>

      {/* Bookings List / Table */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-[#762e99] animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-bold">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-black/[0.08]">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? `No reservations matched "${searchQuery}".` : 'No bookings have been made yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const isFullyPaid = booking.balanceStatus === 'completed';
            const hasProvider = !!booking.assignedProvider?.name;
            const isDelivered = booking.status === 'completed';

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  {/* Left: Ref, Service, and Client */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#5e2590] flex items-center justify-center font-mono font-black text-sm shrink-0">
                      {booking.bookingRef.slice(-4)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-sm text-[#5e2590]">
                          {booking.bookingRef}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {booking.serviceCategory}
                        </span>
                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          booking.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : booking.status === 'provider_assigned'
                            ? 'bg-indigo-100 text-indigo-800'
                            : booking.status === 'confirmed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                        {booking.serviceTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                        <span className="font-bold text-slate-800">{booking.clientName}</span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{booking.clientPhone}</span>
                        </span>
                        <span>{booking.clientEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financials & Badges */}
                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                    {/* Upfront Deposit Badge */}
                    <div className="text-right bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">Upfront Deposit</p>
                      <p className="text-xs font-black text-emerald-800">
                        KES {Number(booking.depositAmountKES).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-mono">
                        {booking.depositReceiptNumber || 'Paid'}
                      </p>
                    </div>

                    {/* Remaining Balance Badge */}
                    <div className={`text-right px-3 py-2 rounded-xl border ${
                      isFullyPaid 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <p className="text-[10px] font-bold uppercase">
                        {isFullyPaid ? 'Balance Paid' : 'Remaining Balance'}
                      </p>
                      <p className="text-xs font-black">
                        KES {Number(booking.remainingBalanceKES).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-medium">
                        {isFullyPaid ? `Receipt: ${booking.balanceReceiptNumber}` : booking.balanceStatus === 'pending' ? 'STK Prompt Sent...' : 'Due on Delivery'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Middle details: Location & Provider Assignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3.5 text-xs">
                  {/* Preferred Location */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start space-x-2.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-700">Preferred Place of Service / Collection:</p>
                      <p className="font-extrabold text-slate-900 mt-0.5 text-xs">{booking.preferredLocation}</p>
                      {booking.scheduledDate && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Scheduled: {booking.scheduledDate} {booking.scheduledTimeSlot}
                        </p>
                      )}
                      {booking.clientNotes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">Note: &quot;{booking.clientNotes}&quot;</p>
                      )}
                    </div>
                  </div>

                  {/* Assigned Provider Status */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    hasProvider 
                      ? 'bg-indigo-50/70 border-indigo-100' 
                      : 'bg-amber-50/60 border-amber-200/80'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        hasProvider ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Assigned Specialist / Provider
                        </p>
                        <p className="font-black text-slate-900 text-xs">
                          {hasProvider ? booking.assignedProvider.name : 'No specialist linked yet'}
                        </p>
                        {hasProvider && booking.assignedProvider.phone && (
                          <p className="text-[11px] text-indigo-700 font-semibold">{booking.assignedProvider.phone}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openAssignModal(booking)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#762e99] hover:bg-slate-50 font-bold text-xs shadow-xs transition"
                    >
                      {hasProvider ? 'Change' : 'Assign Provider'}
                    </button>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[11px]">Workflow:</span>
                    <select
                      value={booking.status}
                      onChange={(e) => handleUpdateStatus(booking._id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                    >
                      <option value="deposit_pending">Deposit Pending</option>
                      <option value="confirmed">Confirmed (Deposit Paid)</option>
                      <option value="provider_assigned">Provider Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed / Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    {/* View Booking Details button */}
                    <a
                      href={`/last-dance/services/booking/${booking.bookingRef}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* PROMPT REMAINING BALANCE STK PUSH (Core User Requirement) */}
                    {!isFullyPaid && (
                      <button
                        onClick={() => openBalanceModal(booking)}
                        className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Prompt Balance (KES {Number(booking.remainingBalanceKES).toLocaleString()})</span>
                      </button>
                    )}

                    {isFullyPaid && (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-100 px-3 py-1.5 rounded-xl text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fully Paid</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Modal: Assign Provider */}
      {isAssignModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Link Service Provider</h3>
                <p className="text-xs text-slate-500">
                  Assign specialist for {selectedBooking.bookingRef} ({selectedBooking.serviceTitle})
                </p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAssignProvider} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Provider / Specialist Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah M. (Nail Artist)"
                  value={providerForm.providerName}
                  onChange={(e) => setProviderForm({ ...providerForm, providerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#762e99]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Provider Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0712345678"
                  value={providerForm.providerPhone}
                  onChange={(e) => setProviderForm({ ...providerForm, providerPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#762e99]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment / Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Arrive with complete gel polish kit and UV lamp."
                  value={providerForm.assignmentNotes}
                  onChange={(e) => setProviderForm({ ...providerForm, assignmentNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#762e99]"
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={providerForm.notifyClient}
                  onChange={(e) => setProviderForm({ ...providerForm, notifyClient: e.target.checked })}
                  className="rounded text-[#762e99] focus:ring-[#762e99]"
                />
                <span className="font-bold text-slate-700">Dispatch SMS alert to client ({selectedBooking.clientPhone})</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 rounded-xl bg-[#5e2590] text-white font-bold flex items-center space-x-1.5"
                >
                  {assigning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Prompt Remaining Balance STK Push (After Delivery) */}
      {isBalanceModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Prompt Remaining Balance</h3>
                <p className="text-xs text-slate-500">
                  Send M-Pesa STK push for remaining balance after delivery.
                </p>
              </div>
              <button onClick={() => setIsBalanceModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-amber-800 font-medium">Service / Product:</span>
                <span className="font-bold text-slate-900">{selectedBooking.serviceTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-800 font-medium">Client Name:</span>
                <span className="font-bold text-slate-900">{selectedBooking.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-800 font-medium">Deposit Already Paid:</span>
                <span className="font-bold text-emerald-700">KES {selectedBooking.depositAmountKES}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-sm">
                <span className="font-extrabold text-amber-900">Remaining Amount Due:</span>
                <span className="font-black text-emerald-800">
                  KES {Number(selectedBooking.remainingBalanceKES).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handlePromptBalance} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  M-Pesa Phone Number to Prompt *
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Confirm or update the phone number that will receive the M-Pesa PIN prompt.
                </p>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="0712345678 or 254..."
                    value={balancePhone}
                    onChange={(e) => setBalancePhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#762e99]"
                  />
                </div>
              </div>

              {balancePromptResult && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  balancePromptResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {balancePromptResult.message}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={promptingBalance}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition"
                >
                  {promptingBalance ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending M-Pesa Prompt...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send M-Pesa Prompt (KES {selectedBooking.remainingBalanceKES})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
