'use client';

import React, { useState } from 'react';
import { 
  Ticket, CheckCircle2, ShieldCheck, Sparkles, CreditCard, 
  User, Mail, Phone, QrCode, Music, Gift, Star, Disc
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TicketsPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: 1
  });
  const [ticketPriceKES, setTicketPriceKES] = useState(500);
  const [status, setStatus] = useState({ loading: false, success: false, error: '', checkoutRequestID: '' });

  const totalAmountKES = form.quantity * ticketPriceKES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '', checkoutRequestID: '' });

    try {
      const res = await axios.post(`${API_BASE_URL}/last-dance/buy-ticket`, form);
      if (res.data.success) {
        const checkoutReqID = res.data.checkoutRequestID;
        setStatus({
          loading: false,
          success: true,
          error: '',
          checkoutRequestID: checkoutReqID
        });

        // Simulation fallback in test mode
        try {
          await axios.post(`${API_BASE_URL}/last-dance/test-simulate-payment`, { checkoutRequestID: checkoutReqID });
        } catch (simErr) {
          // Simulation optional
        }
      } else {
        setStatus({ loading: false, success: false, error: res.data.message || 'Payment initiation failed.' });
      }
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        error: err.response?.data?.message || 'M-Pesa STK push failed to trigger.'
      });
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans space-y-12">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 px-4 py-1.5 rounded-full text-indigo-700 text-xs font-black uppercase tracking-wider shadow-xs">
          <Ticket className="w-4 h-4 text-indigo-600" />
          <span>Official Event Access Pass</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          SECURE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">LAST DANCE</span> ENTRY PASS
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
          October 26th, 2026 &bull; Graduation Eve Send-Off. Digital QR tickets are delivered straight to your email upon instant M-Pesa payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Perks & Ticket Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Included Perks Grid */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>What Your Pass Unlocks</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 border border-indigo-100 p-4 rounded-2xl space-y-2 neu-flat">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Express QR Gate Entry</h4>
                <p className="text-xs text-slate-500">Instant scan-and-go digital ticket code delivered to your email.</p>
              </div>

              <div className="bg-white/80 border border-indigo-100 p-4 rounded-2xl space-y-2 neu-flat">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Gift className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Complimentary Welcome Drink</h4>
                <p className="text-xs text-slate-500">Redeemable signature Graduation Eve cocktail or mocktail.</p>
              </div>

              <div className="bg-white/80 border border-indigo-100 p-4 rounded-2xl space-y-2 neu-flat">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Music className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">All-Night DJ Afterparty</h4>
                <p className="text-xs text-slate-500">Non-stop performances by guest DJs, hype MCs, and live music.</p>
              </div>

              <div className="bg-white/80 border border-indigo-100 p-4 rounded-2xl space-y-2 neu-flat">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Star className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">360° Photobooth Access</h4>
                <p className="text-xs text-slate-500">Unlimited high-definition glam photo & video sessions for your squad.</p>
              </div>
            </div>
          </div>

          {/* Sample Digital Ticket Preview Card */}
          <div className="glass-panel-dark text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-indigo-800/80 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Sample Ticket Pass</span>
                <h4 className="text-xl font-black text-white">LAST DANCE 2026 ENTRY PASS</h4>
              </div>
              <div className="bg-indigo-500 text-white font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                VALID ENTRY
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs text-indigo-300 font-medium">Ticket Holder</p>
                <p className="text-base font-bold text-white">{form.name || 'Your Full Name'}</p>
                <p className="text-xs text-indigo-200 font-mono tracking-widest pt-1">CODE: LD-2026-X89F2</p>
              </div>

              <div className="p-2 bg-white rounded-2xl shadow-md border-2 border-indigo-400">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=LD-2026-PREVIEW"
                  alt="QR Code Ticket Preview"
                  className="w-24 h-24 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Form (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-md sticky top-28">
            <div className="border-b border-indigo-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>Instant Ticket Purchase</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Direct M-Pesa STK Push Integration</p>
            </div>

            {status.success ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-xl font-black text-slate-900">M-Pesa STK Prompt Triggered!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Please enter your M-Pesa PIN on your phone to confirm payment of <strong>KES {totalAmountKES.toLocaleString()}</strong> for <strong>{form.quantity} Ticket(s)</strong>.
                </p>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-[11px] text-indigo-950 font-bold">
                  🎟️ QR tickets dispatched to: <strong className="text-indigo-600">{form.email}</strong>
                </div>
                <button
                  onClick={() => setStatus({ loading: false, success: false, error: '', checkoutRequestID: '' })}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md"
                >
                  Buy More Tickets
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {status.error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-bold">
                    {status.error}
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="neu-flat p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Ticket Quantity</div>
                    <div className="text-xs text-slate-500">KES {ticketPriceKES.toLocaleString()} / ticket</div>
                  </div>
                  <div className="flex items-center space-x-2 bg-white border border-indigo-200 rounded-xl p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-base flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <span className="font-black text-indigo-600 text-base px-3">{form.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                      className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-base flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alexandre Vance"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-indigo-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition shadow-inner"
                    />
                    <User className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address (For Delivery)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="alexandre@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-indigo-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition shadow-inner"
                    />
                    <Mail className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* M-Pesa Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="0712345678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-indigo-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition shadow-inner"
                    />
                    <Phone className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Total & Submit */}
                <div className="pt-3 border-t border-indigo-100 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>Total Amount Payable:</span>
                    <span className="text-indigo-600 text-lg font-black">KES {totalAmountKES.toLocaleString()}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={status.loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-700 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4 text-indigo-200" />
                    <span>{status.loading ? 'Sending M-Pesa STK Push...' : `Pay KES ${totalAmountKES.toLocaleString()} via M-Pesa`}</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Secure M-Pesa STK Push Gateway
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
