'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, CheckCircle2, XCircle, Edit, Trash2, Power, ShieldAlert, 
  Ticket, Vote, Filter, Search, Plus, RefreshCw, Eye, Music, DollarSign,
  LogOut, Mail, CreditCard, Send, Settings, UserPlus, Sparkles, Check
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Admin Sub-tab navigation state
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'nominees' | 'tickets' | 'settings'

  // Data states
  const [candidates, setCandidates] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
  const [candidateStats, setCandidateStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Candidate Filter states
  const [nomineeTab, setNomineeTab] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [musicInput, setMusicInput] = useState('');
  const [ticketPriceInput, setTicketPriceInput] = useState(500);
  const [activeGatewayInput, setActiveGatewayInput] = useState('mpesa');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    // Auth Check
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/last-dance/admin/login');
        return;
      }
    }

    fetchAdminData();
    fetchSettings();
    fetchTicketsData();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/settings`);
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
        if (res.data.settings.musicUrl) setMusicInput(res.data.settings.musicUrl);
        if (res.data.settings.ticketPriceKES) setTicketPriceInput(res.data.settings.ticketPriceKES);
        if (res.data.settings.activePaymentGateway) setActiveGatewayInput(res.data.settings.activePaymentGateway);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.get(`${API_BASE_URL}/last-dance/admin/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setCandidates(res.data.candidates || []);
        setCandidateStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch candidate admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const res = await axios.get(`${API_BASE_URL}/last-dance/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setTickets(res.data.tickets || []);
        setTicketStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch tickets admin data:', err);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('admin_user');
    }
    router.push('/last-dance/admin/login');
  };

  const handleToggleModule = async () => {
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      const newStatus = !settings.enabled;
      const res = await axios.post(`${API_BASE_URL}/last-dance/admin/settings`, 
        { enabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSettings(res.data.settings);
        showActionMsg(`Module status changed to ${newStatus ? 'ACTIVE' : 'DISABLED'}`);
      }
    } catch (err) {
      console.error('Toggle settings error:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      const res = await axios.post(`${API_BASE_URL}/last-dance/admin/settings`,
        { 
          musicUrl: musicInput,
          ticketPriceKES: Number(ticketPriceInput),
          activePaymentGateway: activeGatewayInput
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSettings(res.data.settings);
        showActionMsg('System & Gateway Settings Saved Successfully!');
      }
    } catch (err) {
      console.error('Save settings error:', err);
    }
  };

  const handleApproveCandidate = async (candidateId, approve) => {
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      await axios.patch(`${API_BASE_URL}/last-dance/admin/candidates/${candidateId}/approve`, 
        { approve },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
      showActionMsg(`Candidate ${approve ? 'Approved' : 'Moved to Pending'}`);
    } catch (err) {
      console.error('Approve status error:', err);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate nomination?')) return;
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      await axios.delete(`${API_BASE_URL}/last-dance/admin/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
      showActionMsg('Candidate Deleted');
    } catch (err) {
      console.error('Delete candidate error:', err);
    }
  };

  const handleResendTicketEmail = async (ticketId, buyerEmail) => {
    try {
      const token = localStorage.getItem('token') || 'admin-token';
      const res = await axios.post(`${API_BASE_URL}/last-dance/admin/tickets/${ticketId}/resend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showActionMsg(`Ticket QR code email re-sent to ${buyerEmail}`);
      }
    } catch (err) {
      console.error('Resend ticket email error:', err);
    }
  };

  const showActionMsg = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const filteredCandidates = candidates.filter(c => {
    if (nomineeTab === 'pending' && c.isApproved) return false;
    if (nomineeTab === 'approved' && !c.isApproved) return false;
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans space-y-8">
      
      {/* Toast Notification Banner */}
      {actionMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel neu-flat p-6 sm:p-8 rounded-3xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-indigo-100/80 text-indigo-900 border border-indigo-200 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin Control Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Last Dance Management System</h1>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Master ON/OFF Switch */}
          {settings && (
            <button
              onClick={handleToggleModule}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition neu-button ${
                settings.enabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{settings.enabled ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}</span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-indigo-100/60 hover:bg-indigo-200/60 text-indigo-900 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition neu-button"
          >
            <LogOut className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Admin Sub-Navigation Tabs */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 border-b border-indigo-100 scrollbar-none">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: Trophy },
          { id: 'nominees', label: `Nominees Control (${candidateStats?.pendingCount || 0} Pending)`, icon: UserPlus },
          { id: 'tickets', label: `Tickets Control (${ticketStats?.totalOrders || 0})`, icon: Ticket },
          { id: 'settings', label: 'Payment Engine & System', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg neu-button'
                  : 'glass-panel text-slate-600 hover:text-indigo-900 hover:bg-indigo-50/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {adminTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel neu-flat p-6 rounded-3xl space-y-2">
              <div className="text-xs font-black text-indigo-600 uppercase tracking-wider">Total Candidates</div>
              <div className="text-3xl font-black text-slate-900">{candidateStats?.totalCandidates || candidates.length}</div>
              <div className="text-xs text-indigo-700 font-bold">{candidateStats?.pendingCount || 0} Pending Review</div>
            </div>

            <div className="glass-panel neu-flat p-6 rounded-3xl space-y-2">
              <div className="text-xs font-black text-indigo-600 uppercase tracking-wider">Approved Candidates</div>
              <div className="text-3xl font-black text-emerald-600">{candidateStats?.approvedCount || 0}</div>
              <div className="text-xs text-slate-500 font-medium">Visible on Leaderboard</div>
            </div>

            <div className="glass-panel neu-flat p-6 rounded-3xl space-y-2">
              <div className="text-xs font-black text-indigo-600 uppercase tracking-wider">Ticket Passes Revenue</div>
              <div className="text-3xl font-black text-indigo-600">KES {(ticketStats?.totalRevenueKES || 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">{ticketStats?.totalTicketsSold || 0} Passes Issued</div>
            </div>

            <div className="glass-panel neu-flat p-6 rounded-3xl space-y-2">
              <div className="text-xs font-black text-indigo-600 uppercase tracking-wider">Votes Revenue</div>
              <div className="text-3xl font-black text-violet-600">KES {(candidateStats?.voteStats?.totalRevenue || 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">{(candidateStats?.voteStats?.totalVotes || 0).toLocaleString()} Votes Cast</div>
            </div>
          </div>

          {/* Quick Active Gateway Indicator Card */}
          <div className="glass-panel neu-flat p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-indigo-600">Payment Gateway Status</div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>Active Payment Engine: <strong className="text-indigo-600 uppercase">{settings?.activePaymentGateway || 'mpesa'}</strong></span>
              </h3>
            </div>
            <button
              onClick={() => setAdminTab('settings')}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition neu-button"
            >
              Configure Gateways
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: NOMINEES CONTROL */}
      {adminTab === 'nominees' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
            {/* Nominee Sub-tabs */}
            <div className="flex items-center space-x-2">
              {[
                { id: 'pending', label: `Pending (${candidateStats?.pendingCount || 0})` },
                { id: 'approved', label: `Approved (${candidateStats?.approvedCount || 0})` },
                { id: 'all', label: `All (${candidates.length})` }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setNomineeTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                    nomineeTab === t.id
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                      : 'bg-indigo-50/60 text-slate-600 hover:text-indigo-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search nominee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl text-slate-500 text-xs font-bold">
              No candidates found in this view.
            </div>
          ) : (
            <div className="glass-panel rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-indigo-50/60 text-indigo-900 uppercase text-[10px] font-black border-b border-indigo-100">
                    <tr>
                      <th className="px-6 py-4">Candidate Profile</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Vote Count</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50 text-slate-700">
                    {filteredCandidates.map(c => (
                      <tr key={c._id} className="hover:bg-indigo-50/30 transition">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <img
                            src={c.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                            alt={c.name}
                            className="w-10 h-10 rounded-xl object-cover border border-indigo-200 shadow-xs"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                            <div className="text-[11px] text-slate-500 italic">"{c.oneLiner}"</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{c.category}</td>
                        <td className="px-6 py-4 font-black text-slate-900 text-sm">{(c.voteCount || 0).toLocaleString()} votes</td>
                        <td className="px-6 py-4">
                          {c.isApproved ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">APPROVED</span>
                          ) : (
                            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">PENDING</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {!c.isApproved ? (
                            <button
                              onClick={() => handleApproveCandidate(c._id, true)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveCandidate(c._id, false)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition"
                            >
                              Unapprove
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCandidate(c._id)}
                            className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg transition inline-block align-middle"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TICKETS & SALES CONTROL */}
      {adminTab === 'tickets' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-indigo-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                  <span>Ticket Purchase Logs & Digital Passes</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage ticket buyers and re-dispatch digital QR ticket emails</p>
              </div>
              <button
                onClick={fetchTicketsData}
                className="px-3.5 py-2 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 font-bold text-xs rounded-xl flex items-center space-x-1 neu-button"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Refresh Logs</span>
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold">
                No ticket orders recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-indigo-50/60 text-indigo-900 uppercase text-[10px] font-black border-b border-indigo-100">
                    <tr>
                      <th className="px-6 py-4">Buyer Details</th>
                      <th className="px-6 py-4">Ticket Quantity</th>
                      <th className="px-6 py-4">Total KES</th>
                      <th className="px-6 py-4">M-Pesa Receipt</th>
                      <th className="px-6 py-4">Payment Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50 text-slate-700">
                    {tickets.map(ticket => (
                      <tr key={ticket._id} className="hover:bg-indigo-50/30 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{ticket.buyerName}</div>
                          <div className="text-[11px] text-slate-500">{ticket.buyerEmail} &bull; {ticket.buyerPhone}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                          {ticket.quantity} Pass(es)
                        </td>
                        <td className="px-6 py-4 font-black text-indigo-600 text-sm">
                          KES {(ticket.totalAmountKES || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {ticket.mpesaReceiptNumber || 'PENDING'}
                        </td>
                        <td className="px-6 py-4">
                          {ticket.status === 'completed' ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">COMPLETED</span>
                          ) : (
                            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">PENDING</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleResendTicketEmail(ticket._id, ticket.buyerEmail)}
                            className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] rounded-lg transition flex items-center space-x-1.5 ml-auto neu-button"
                          >
                            <Send className="w-3 h-3 text-indigo-600" />
                            <span>Resend QR Email</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & PAYMENT GATEWAYS */}
      {adminTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Active Payment Gateway Selector */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-indigo-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>Active Payment Gateway Switch</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Select the primary payment engine for ticket purchases & paid voting</p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Safaricom M-Pesa Daraja */}
              <label
                onClick={() => setActiveGatewayInput('mpesa')}
                className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  activeGatewayInput === 'mpesa'
                    ? 'border-indigo-500 bg-indigo-50/80 shadow-xs neu-flat'
                    : 'border-indigo-100 bg-white hover:bg-indigo-50/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">Safaricom M-Pesa Daraja</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">Direct STK</span>
                  </div>
                  <p className="text-xs text-slate-500">Uses official Safaricom Daraja STK Push credentials (Shortcode 174379).</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${activeGatewayInput === 'mpesa' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                  {activeGatewayInput === 'mpesa' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </label>

              {/* Option 2: PayHero Kenya */}
              <label
                onClick={() => setActiveGatewayInput('payhero')}
                className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  activeGatewayInput === 'payhero'
                    ? 'border-indigo-500 bg-indigo-50/80 shadow-xs neu-flat'
                    : 'border-indigo-100 bg-white hover:bg-indigo-50/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">PayHero Kenya API</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold uppercase">Channel 5648</span>
                  </div>
                  <p className="text-xs text-slate-500">Uses PayHero Kenya v2 API backend callback integration with automatic M-Pesa routing.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${activeGatewayInput === 'payhero' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                  {activeGatewayInput === 'payhero' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition neu-button"
            >
              Save Payment Gateway Preference
            </button>
          </div>

          {/* Module Config Controls */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-indigo-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>Ticket Pricing & Media Config</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Adjust ticket base price and celebratory ambient music</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Ticket Base Price (KES)
                </label>
                <input
                  type="number"
                  min="1"
                  value={ticketPriceInput}
                  onChange={(e) => setTicketPriceInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-indigo-50/40 border border-indigo-100 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Custom Ambient Music URL (.mp3 stream)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/audio.mp3"
                  value={musicInput}
                  onChange={(e) => setMusicInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-indigo-50/40 border border-indigo-100 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition neu-button"
              >
                Save Ticket & Media Config
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

