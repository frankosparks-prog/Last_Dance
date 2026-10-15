'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, UserPlus, Ticket, Settings, ArrowRight, 
  CreditCard, CheckCircle2, Clock, Sparkles, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminOverviewPage() {
  const [candidateStats, setCandidateStats] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'admin-token' : 'admin-token';
      const headers = { Authorization: `Bearer ${token}` };

      const [candRes, ticketRes, setRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/last-dance/admin/candidates`, { headers }).catch(() => ({ data: {} })),
        axios.get(`${API_BASE_URL}/last-dance/admin/tickets`, { headers }).catch(() => ({ data: {} })),
        axios.get(`${API_BASE_URL}/last-dance/settings`).catch(() => ({ data: {} }))
      ]);

      if (candRes.data?.success) {
        setCandidateStats(candRes.data.stats || null);
        const candidates = candRes.data.candidates || [];
        setPendingCandidates(candidates.filter(c => !c.isApproved).slice(0, 4));
      }

      if (ticketRes.data?.success) {
        setTicketStats(ticketRes.data.stats || null);
        setRecentTickets((ticketRes.data.tickets || []).slice(0, 5));
      }

      if (setRes.data?.success) {
        setSettings(setRes.data.settings || null);
      }
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
      
      {/* Header matching /last-dance page typography */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-black/[0.08] pb-6">
        <div>
          <p className="text-[12px] font-medium text-[#762e99] uppercase tracking-wider">
            Executive Summary
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-normal tracking-[-0.02em] text-black mt-1">
            Dashboard Overview
          </h1>
          <p className="text-[13px] text-black/50 mt-0.5">
            Real-time performance, revenue, and pending approvals for Last Dance 2026
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-black/5 text-[12px] font-medium transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh stats</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Candidates */}
        <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-2 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Total Nominees
          </p>
          <p className="text-[32px] font-normal tracking-[-0.02em] text-black leading-none">
            {candidateStats?.totalCandidates || 0}
          </p>
          <div className="pt-1 flex items-center space-x-1.5 text-[12px] text-[#ff914d] font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{candidateStats?.pendingCount || 0} pending review</span>
          </div>
        </div>

        {/* Card 2: Approved Candidates */}
        <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-2 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Approved Stars
          </p>
          <p className="text-[32px] font-normal tracking-[-0.02em] text-[#10b981] leading-none">
            {candidateStats?.approvedCount || 0}
          </p>
          <div className="pt-1 flex items-center space-x-1.5 text-[12px] text-black/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Active on public leaderboard</span>
          </div>
        </div>

        {/* Card 3: Ticket Revenue */}
        <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-2 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Ticket Passes Revenue
          </p>
          <p className="text-[32px] font-normal tracking-[-0.02em] text-[#762e99] leading-none">
            KES {(ticketStats?.totalRevenueKES || 0).toLocaleString()}
          </p>
          <div className="pt-1 flex items-center space-x-1.5 text-[12px] text-black/50">
            <span>{ticketStats?.totalTicketsSold || 0} all-access passes issued</span>
          </div>
        </div>

        {/* Card 4: Votes Revenue */}
        <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-2 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
            Paid Votes Revenue
          </p>
          <p className="text-[32px] font-normal tracking-[-0.02em] text-black leading-none">
            KES {(candidateStats?.voteStats?.totalRevenue || 0).toLocaleString()}
          </p>
          <div className="pt-1 flex items-center space-x-1.5 text-[12px] text-black/50">
            <span>{(candidateStats?.voteStats?.totalVotes || 0).toLocaleString()} paid votes cast</span>
          </div>
        </div>
      </div>

      {/* Payment Gateway Status Banner */}
      <div className="bg-white border border-black/[0.08] p-6 sm:p-7 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#762e99]">
              Payment Engine Configuration
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Live
            </span>
          </div>
          <h3 className="text-[18px] font-normal text-black flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#762e99]" />
            <span>Active Gateway: <strong className="font-medium text-black uppercase">{settings?.activePaymentGateway || 'mpesa'}</strong></span>
          </h3>
          <p className="text-[13px] text-black/50">
            Automated M-Pesa STK push for tickets and nominee voting packages.
          </p>
        </div>

        <Link
          href="/last-dance/admin/settings"
          className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] px-5 py-2.5 text-[13px] font-medium text-white hover:opacity-90 transition shrink-0"
        >
          <span>Configure Gateways</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid: Pending Nominees & Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Pending Nominees Widget */}
        <div className="bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div>
              <h3 className="text-[18px] font-normal text-black">Pending Nominees</h3>
              <p className="text-[12px] text-black/45">Profiles awaiting verification</p>
            </div>
            <Link
              href="/last-dance/admin/nominees"
              className="text-[12px] font-medium text-[#762e99] hover:underline flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingCandidates.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-black/45">
              No nominees pending review at this time.
            </div>
          ) : (
            <div className="divide-y divide-black/[0.05]">
              {pendingCandidates.map((c) => (
                <div key={c._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 truncate">
                    <img
                      src={c.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                      alt={c.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-black/10"
                    />
                    <div className="truncate">
                      <p className="text-[13px] font-medium text-black truncate">{c.name}</p>
                      <p className="text-[11px] text-black/45 truncate">{c.category}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#ff914d] bg-[#ff914d]/10 px-2 py-0.5 rounded-full shrink-0">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tickets Widget */}
        <div className="bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div>
              <h3 className="text-[18px] font-normal text-black">Recent Ticket Orders</h3>
              <p className="text-[12px] text-black/45">Latest attendee purchases</p>
            </div>
            <Link
              href="/last-dance/admin/tickets"
              className="text-[12px] font-medium text-[#762e99] hover:underline flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-black/45">
              No ticket orders recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-black/[0.05]">
              {recentTickets.map((t) => (
                <div key={t._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="text-[13px] font-medium text-black truncate">{t.buyerName}</p>
                    <p className="text-[11px] text-black/45 truncate">
                      {t.quantity} pass(es) &bull; {t.mpesaReceiptNumber || 'M-Pesa'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-medium text-black">
                      KES {(t.totalAmountKES || 0).toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {t.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
