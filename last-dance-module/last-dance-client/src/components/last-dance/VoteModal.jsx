'use client';

import React, { useState } from 'react';
import { X, Vote, CheckCircle2, ShieldCheck, Phone, Zap } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const VOTE_PACKAGES = [
  { label: 'Single Vote', votes: 1, priceKES: 10, discountText: '', isPopular: false },
  { label: '10-Vote Power Pack', votes: 10, priceKES: 90, discountText: 'Save 10%', isPopular: true },
  { label: '25-Vote Boost Pack', votes: 25, priceKES: 200, discountText: 'Save 20%', isPopular: false },
  { label: '50-Vote Legend Pack', votes: 50, priceKES: 380, discountText: 'Save 24%', isPopular: false }
];

export default function VoteModal({ candidate, onClose, onSuccess }) {
  const [selectedPkg, setSelectedPkg] = useState(VOTE_PACKAGES[1]);
  const [customVotes, setCustomVotes] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, error: '', checkoutRequestID: '' });

  if (!candidate) return null;

  const votesCount = customVotes && Number(customVotes) > 0 ? Number(customVotes) : selectedPkg.votes;
  const amountKES = customVotes && Number(customVotes) > 0 ? Number(customVotes) * 10 : selectedPkg.priceKES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '', checkoutRequestID: '' });

    try {
      const res = await axios.post(`${API_BASE_URL}/last-dance/cast-vote`, {
        candidateId: candidate._id,
        votesCount,
        phone
      });

      if (res.data.success) {
        const checkoutReqID = res.data.checkoutRequestID;
        setStatus({
          loading: false,
          success: true,
          error: '',
          checkoutRequestID: checkoutReqID
        });

        // Trigger simulation fallback in test mode after 1.5s if needed
        try {
          await axios.post(`${API_BASE_URL}/last-dance/test-simulate-payment`, { checkoutRequestID: checkoutReqID });
        } catch (simErr) {
          // Simulation optional
        }

        if (onSuccess) onSuccess();
      } else {
        setStatus({ loading: false, success: false, error: res.data.message || 'Vote payment failed.' });
      }
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        error: err.response?.data?.message || 'M-Pesa STK push failed.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl w-full max-w-md text-slate-900 shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Candidate Profile Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src={candidate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
              alt={candidate.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm mx-auto"
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            {candidate.category}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 mt-2">{candidate.name}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Current Score: <span className="font-bold text-slate-900">{(candidate.voteCount || 0).toLocaleString()} votes</span>
          </p>
        </div>

        {status.success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">M-Pesa STK Prompt Triggered!</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Please enter your M-Pesa PIN on your phone to cast <strong>{votesCount} votes</strong> for <strong>{candidate.name}</strong> (KES {amountKES}).
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition"
            >
              Done / Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                {status.error}
              </div>
            )}

            {/* Select Vote Package Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Select Vote Package
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {VOTE_PACKAGES.map((pkg) => {
                  const isSelected = !customVotes && selectedPkg.votes === pkg.votes;
                  return (
                    <button
                      type="button"
                      key={pkg.votes}
                      onClick={() => {
                        setSelectedPkg(pkg);
                        setCustomVotes('');
                      }}
                      className={`relative p-3.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className={`absolute -top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-amber-400'
                        }`}>
                          Popular
                        </span>
                      )}
                      <div className="font-bold text-xs">{pkg.votes} Vote{pkg.votes > 1 ? 's' : ''}</div>
                      <div className={`font-extrabold text-sm mt-0.5 ${isSelected ? 'text-amber-300' : 'text-rose-600'}`}>
                        KES {pkg.priceKES}
                      </div>
                      {pkg.discountText && (
                        <div className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-slate-300' : 'text-emerald-700'}`}>
                          {pkg.discountText}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Vote Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Custom Vote Quantity</label>
                <span className="text-[10px] text-slate-400 font-semibold">1 Vote = KES 10</span>
              </div>
              <input
                type="number"
                min="1"
                placeholder="Enter custom vote count..."
                value={customVotes}
                onChange={(e) => setCustomVotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
              />
            </div>

            {/* M-Pesa Phone Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Total Payable Summary */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                <span>Total Amount Payable:</span>
                <span className="text-rose-600 text-base font-extrabold">KES {amountKES.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Vote className="w-4 h-4 text-amber-300" />
                {status.loading ? 'Sending M-Pesa Prompt...' : `Cast ${votesCount} Vote${votesCount > 1 ? 's' : ''} (KES ${amountKES.toLocaleString()})`}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant M-Pesa Integration
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
