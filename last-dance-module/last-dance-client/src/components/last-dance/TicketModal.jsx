'use client';

import React, { useState } from 'react';
import { X, Ticket, CheckCircle2, ShieldCheck, Phone, Mail, User, CreditCard } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TicketModal({ ticketPriceKES = 500, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: 1
  });
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl w-full max-w-md text-slate-900 shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-3">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Event Entry Pass</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Graduation Eve Send-Off | October 26th</p>
        </div>

        {status.success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">M-Pesa Payment Triggered</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Please enter your PIN on your phone to confirm payment of <strong>KES {totalAmountKES.toLocaleString()}</strong>.
            </p>
            <p className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              🎟️ Digital QR tickets will be dispatched to <strong>{form.email}</strong> upon confirmation.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition"
            >
              Done / Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {status.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold">
                {status.error}
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Ticket Quantity</div>
                <div className="text-[11px] text-slate-500 font-medium">KES {ticketPriceKES.toLocaleString()} per ticket</div>
              </div>
              <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="font-bold text-slate-900 text-sm px-2">{form.quantity}</span>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address (For QR Delivery)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* M-Pesa Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="0712345678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Total Price & Submit */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-rose-600 text-base font-extrabold">KES {totalAmountKES.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {status.loading ? 'Initiating M-Pesa Payment...' : `Purchase Ticket(s) (KES ${totalAmountKES.toLocaleString()})`}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant M-Pesa Daraja Checkout
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
