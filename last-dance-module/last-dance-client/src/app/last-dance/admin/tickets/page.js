'use client';

import React, { useState, useEffect } from 'react';
import { 
  Ticket, Search, RefreshCw, Mail, CheckCircle2, 
  Clock, ExternalLink, Download, AlertCircle, Send,
  ChevronRight, Filter, Eye, X
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.get(`${API_BASE_URL}/last-dance/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setTickets(res.data.tickets || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      showMessage('error', 'Failed to retrieve ticket orders from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const showMessage = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage({ type: '', text: '' }), 4000);
  };

  const handleResendEmail = async (ticketId, buyerEmail) => {
    setResendingId(ticketId);
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      const res = await axios.post(
        `${API_BASE_URL}/last-dance/admin/tickets/${ticketId}/resend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showMessage('success', `Ticket pass email re-sent successfully to ${buyerEmail}!`);
        // Update local state to reflect emailSent: true
        setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, emailSent: true } : t));
      } else {
        showMessage('error', res.data?.message || 'Failed to resend ticket email.');
      }
    } catch (err) {
      console.error('Resend email error:', err);
      showMessage('error', err.response?.data?.message || 'Error occurred while sending email.');
    } finally {
      setResendingId(null);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ticket.buyerName?.toLowerCase().includes(q);
      const matchEmail = ticket.buyerEmail?.toLowerCase().includes(q);
      const matchPhone = ticket.buyerPhone?.toLowerCase().includes(q);
      const matchReceipt = ticket.mpesaReceiptNumber?.toLowerCase().includes(q);
      const matchId = ticket._id?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchReceipt || matchId;
    }
    return true;
  });

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-black/[0.08] pb-6">
        <div>
          <p className="text-[12px] font-medium text-[#762e99] uppercase tracking-wider">
            Ticketing Operations
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-normal tracking-[-0.02em] text-black mt-1">
            Tickets & Sales Control
          </h1>
          <p className="text-[13px] text-black/50 mt-0.5">
            Real-time tracking of graduation passes, M-Pesa receipts, and automated email delivery
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh tickets</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Metric 1: Revenue */}
        <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-2 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Total Pass Revenue
          </p>
          <p className="text-[32px] font-normal tracking-[-0.02em] text-[#762e99] leading-none">
            KES {(stats?.totalRevenueKES || 0).toLocaleString()}
          </p>
          <div className="pt-1 flex items-center space-x-1.5 text-[12px] text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats?.completedOrders || 0} completed orders</span>
          </div>
        </div>

        {/* Metric 2: Passes Issued */}
        <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-2 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Total Passes Issued
          </p>
          <p className="text-[32px] font-normal tracking-[-0.02em] text-black leading-none">
            {stats?.totalTicketsSold || 0}
          </p>
          <div className="pt-1 flex items-center space-x-1.5 text-[12px] text-black/50">
            <span>Valid graduation event access wristbands / passes</span>
          </div>
        </div>

        {/* Metric 3: Pending Orders */}
        <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-2 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Pending / Incomplete
          </p>
          <p className="text-[32px] font-normal tracking-[-0.02em] text-[#ff914d] leading-none">
            {stats?.pendingOrders || 0}
          </p>
          <div className="pt-1 flex items-center space-x-1.5 text-[12px] text-black/50">
            <Clock className="w-3.5 h-3.5 text-[#ff914d]" />
            <span>Awaiting STK PIN entry or timed out</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-black/[0.08] p-4 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-[#f7f7f7] rounded-full border border-black/[0.05] self-start">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-black/55 hover:text-black'
              }`}
            >
              All Orders ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-black/55 hover:text-black'
              }`}
            >
              Completed ({stats?.completedOrders || 0})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-[#ff914d] text-white shadow-sm font-semibold'
                  : 'text-black/55 hover:text-black'
              }`}
            >
              Pending ({stats?.pendingOrders || 0})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-black/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by buyer name, email, phone, or receipt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f7f7f7] border border-black/[0.08] rounded-full text-[12px] focus:outline-none focus:border-[#762e99] focus:bg-white transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border border-black/[0.08] rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#762e99] mx-auto" />
            <p className="text-[13px] text-black/50">Loading ticket sales records...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Ticket className="w-10 h-10 text-black/20 mx-auto" />
            <p className="text-[15px] font-medium text-black">No tickets found</p>
            <p className="text-[13px] text-black/45 max-w-sm mx-auto">
              {searchQuery ? 'No purchases matched your search criteria.' : 'No ticket purchases have been made yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] border-b border-black/[0.08] text-[11px] font-semibold uppercase tracking-wider text-black/45">
                <tr>
                  <th className="py-3.5 px-6">Buyer</th>
                  <th className="py-3.5 px-6">Passes</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">M-Pesa Receipt</th>
                  <th className="py-3.5 px-6">Payment</th>
                  <th className="py-3.5 px-6">Email Delivery</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {filteredTickets.map((ticket) => {
                  const isCompleted = ticket.status === 'completed';
                  const isResending = resendingId === ticket._id;

                  return (
                    <tr key={ticket._id} className="hover:bg-black/[0.015] transition">
                      {/* Buyer */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#762e99]/10 text-[#762e99] flex items-center justify-center font-bold text-xs shrink-0">
                            {ticket.buyerName ? ticket.buyerName.charAt(0).toUpperCase() : 'G'}
                          </div>
                          <div>
                            <p className="font-medium text-black">{ticket.buyerName || 'Guest Attendee'}</p>
                            <p className="text-[11px] text-black/45">{ticket.buyerEmail}</p>
                            <p className="text-[11px] text-black/40">{ticket.buyerPhone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Passes Count */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#f7f7f7] border border-black/[0.05] text-[12px] font-semibold text-black">
                          <Ticket className="w-3.5 h-3.5 text-[#762e99]" />
                          <span>{ticket.quantity || 1} {ticket.quantity > 1 ? 'Passes' : 'Pass'}</span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 font-semibold text-black">
                        KES {(ticket.totalAmountKES || 0).toLocaleString()}
                      </td>

                      {/* M-Pesa Receipt */}
                      <td className="py-4 px-6 font-mono text-[11px]">
                        {ticket.mpesaReceiptNumber ? (
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {ticket.mpesaReceiptNumber}
                          </span>
                        ) : (
                          <span className="text-black/35 italic">Pending checkout</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                          <span>{isCompleted ? 'Completed' : 'Pending'}</span>
                        </span>
                      </td>

                      {/* Email Delivery */}
                      <td className="py-4 px-6">
                        {ticket.emailSent ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Delivered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-black/40">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending send</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          
                          {/* View details */}
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            title="Inspect QR codes & details"
                            className="p-1.5 rounded-full border border-black/10 bg-white hover:bg-black/5 text-black/70 hover:text-black transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Resend Email */}
                          {isCompleted && (
                            <button
                              onClick={() => handleResendEmail(ticket._id, ticket.buyerEmail)}
                              disabled={isResending}
                              title="Resend official festival ticket email"
                              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-black/15 bg-white hover:bg-[#762e99] hover:text-white hover:border-[#762e99] text-[11px] font-medium text-black/80 transition"
                            >
                              <Send className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                              <span>{isResending ? 'Sending...' : 'Resend Email'}</span>
                            </button>
                          )}

                          {/* Download / Open Pass in Browser */}
                          {isCompleted && (
                            <a
                              href={`${API_BASE_URL}/last-dance/tickets/${ticket._id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open ticket printable pass"
                              className="p-1.5 rounded-full border border-black/10 bg-white hover:bg-black/5 text-black/70 hover:text-black transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details & QR Preview Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#762e99]">
                  Ticket Pass Details
                </span>
                <h3 className="text-[20px] font-normal text-black mt-0.5">
                  {selectedTicket.buyerName || 'Guest Order'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-[12px] bg-[#f7f7f7] p-4 rounded-2xl border border-black/[0.05]">
              <div>
                <p className="text-black/45">Email</p>
                <p className="font-semibold text-black break-all">{selectedTicket.buyerEmail}</p>
              </div>
              <div>
                <p className="text-black/45">Phone</p>
                <p className="font-semibold text-black">{selectedTicket.buyerPhone}</p>
              </div>
              <div>
                <p className="text-black/45">Passes Purchased</p>
                <p className="font-semibold text-black">{selectedTicket.quantity || 1} All-Access Pass</p>
              </div>
              <div>
                <p className="text-black/45">Amount Paid</p>
                <p className="font-semibold text-[#762e99]">KES {(selectedTicket.totalAmountKES || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-black/45">M-Pesa Receipt</p>
                <p className="font-mono font-semibold text-emerald-700">{selectedTicket.mpesaReceiptNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-black/45">Purchased At</p>
                <p className="font-medium text-black/70">
                  {new Date(selectedTicket.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* QR Codes list */}
            <div className="space-y-3">
              <p className="text-[12px] font-medium uppercase tracking-wider text-black/60">
                Generated Digital Pass Codes
              </p>

              {(!selectedTicket.tickets || selectedTicket.tickets.length === 0) ? (
                <div className="p-4 bg-[#f7f7f7] rounded-2xl text-center text-[12px] text-black/50">
                  QR codes will be activated automatically upon completed payment confirmation.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTicket.tickets.map((t, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3.5 bg-white border border-black/[0.08] rounded-2xl"
                    >
                      <div className="flex items-center space-x-3">
                        {t.qrCodeUrl && (
                          <img 
                            src={t.qrCodeUrl} 
                            alt="QR code" 
                            className="w-12 h-12 rounded-lg border border-black/[0.08] bg-white p-0.5" 
                          />
                        )}
                        <div>
                          <p className="text-[11px] font-semibold text-[#762e99] uppercase">Pass #{idx + 1}</p>
                          <p className="font-mono text-[13px] font-bold text-black">{t.ticketCode}</p>
                          <p className="text-[10px] text-black/45">1 Person Entry Access</p>
                        </div>
                      </div>

                      <a
                        href={t.qrCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full border border-black/10 hover:bg-black/5 text-black/60 hover:text-black transition"
                        title="View Full QR"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={`${API_BASE_URL}/last-dance/tickets/${selectedTicket._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View Full Ticket Pass</span>
              </a>

              {selectedTicket.status === 'completed' && (
                <button
                  onClick={() => {
                    handleResendEmail(selectedTicket._id, selectedTicket.buyerEmail);
                  }}
                  disabled={resendingId === selectedTicket._id}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white text-[12px] font-semibold hover:opacity-95 transition"
                >
                  <Send className={`w-3.5 h-3.5 ${resendingId === selectedTicket._id ? 'animate-spin' : ''}`} />
                  <span>Resend Email</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
