'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, CheckCircle2, AlertCircle, RefreshCw, Phone, Mail, 
  User, MapPin, Calendar, Users, ShieldCheck, 
  ArrowRight, MessageSquare, ExternalLink, Smartphone, Check,
  Home, Bed, Info
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AccommodationBookingModal({ listing, isOpen, onClose, onBookingSuccess }) {
  const [step, setStep] = useState('form'); // 'form' | 'prompting' | 'polling' | 'success' | 'failed'
  
  // Guest Form fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [checkInDate, setCheckInDate] = useState('2026-10-26');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-27');
  const [guestNotes, setGuestNotes] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Payment tracking
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [pollCountdown, setPollCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifyingManually, setIsVerifyingManually] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (isOpen && listing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('form');
      setErrorMessage('');
      setPollCountdown(60);
      setBookingData(null);
    }
  }, [isOpen, listing]);

  const verifyPaymentRecord = useCallback(async () => {
    if (!checkoutRequestID) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/booking-status/${checkoutRequestID}`);
      
      if (res.data?.success && res.data.status === 'completed') {
        setBookingRef(res.data.bookingRef || '');
        setBookingData(res.data.booking || null);
        
        // Persist booking reference in localStorage for frictionless guest dashboard access
        try {
          if (typeof window !== 'undefined') {
            const stored = JSON.parse(localStorage.getItem('last_dance_my_accommodations') || '[]');
            const newEntry = {
              bookingRef: res.data.bookingRef || bookingRef,
              listingId: listing?._id,
              propertyTitle: listing?.title || '',
              locationZone: listing?.locationZone || '',
              pricePerNightKES: listing?.pricePerNightKES || 0,
              connectionFeeKES: 100,
              guestName,
              guestPhone,
              checkInDate,
              checkOutDate,
              hostSnapshot: res.data.booking?.hostDetails || res.data.booking?.hostSnapshot || res.data.hostDetails || null,
              hostDetails: res.data.booking?.hostDetails || res.data.booking?.hostSnapshot || res.data.hostDetails || null,
              paymentStatus: 'completed',
              receiptNumber: res.data.receipt || '',
              createdAt: new Date().toISOString()
            };
            
            const filtered = stored.filter(b => b.bookingRef !== newEntry.bookingRef);
            localStorage.setItem('last_dance_my_accommodations', JSON.stringify([newEntry, ...filtered]));
          }
        } catch (err) {
          console.warn('localStorage error:', err);
        }

        setStep('success');
        if (onBookingSuccess) onBookingSuccess(res.data.bookingRef || bookingRef);
        return true;
      } else if (res.data?.status === 'failed') {
        setErrorMessage(res.data.message || 'Payment was cancelled or failed on your handset.');
        setStep('failed');
        return false;
      }
    } catch {
      // Continue polling
    }
    return false;
  }, [checkoutRequestID, bookingRef, listing, guestName, guestPhone, checkInDate, checkOutDate, onBookingSuccess]);

  // Polling logic for M-Pesa STK Push
  useEffect(() => {
    let timer = null;
    let pollInterval = null;

    if (step === 'polling' && checkoutRequestID) {
      pollInterval = setInterval(async () => {
        const isDone = await verifyPaymentRecord();
        if (isDone) {
          clearInterval(pollInterval);
          clearInterval(timer);
        }
      }, 2500);

      timer = setInterval(() => {
        setPollCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            clearInterval(pollInterval);
            setErrorMessage('Payment verification timed out. If you entered your PIN, please check status manually below.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timer) clearInterval(timer);
    };
  }, [step, checkoutRequestID, verifyPaymentRecord]);

  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!disclaimerAccepted) {
      setErrorMessage('Please accept the platform connector terms to continue.');
      return;
    }

    if (!guestPhone || guestPhone.trim().length < 9) {
      setErrorMessage('Please enter a valid 10-digit M-Pesa phone number (e.g. 0712345678).');
      return;
    }

    setStep('prompting');

    try {
      const payload = {
        listingId: listing._id,
        guestName: guestName.trim() || 'Festival Guest',
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || undefined,
        guestCount: Number(guestCount) || 1,
        checkInDate,
        checkOutDate,
        guestNotes: guestNotes.trim(),
        termsAccepted: disclaimerAccepted,
        disclaimerAccepted: disclaimerAccepted
      };

      const res = await axios.post(`${API_BASE_URL}/last-dance/accommodations/book`, payload);

      if (res.data?.success && res.data.checkoutRequestID) {
        setCheckoutRequestID(res.data.checkoutRequestID);
        setBookingRef(res.data.bookingRef);
        setPollCountdown(60);
        setStep('polling');
      } else {
        throw new Error(res.data?.message || 'Failed to dispatch M-Pesa prompt.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to connect. Please check your network and try again.';
      setErrorMessage(msg);
      setStep('failed');
    }
  };

  const handleManualVerify = async () => {
    setIsVerifyingManually(true);
    setErrorMessage('');
    const done = await verifyPaymentRecord();
    setIsVerifyingManually(false);
    if (!done) {
      setErrorMessage('Payment not yet detected. If you just entered your PIN, please give it a moment and try again.');
    }
  };

  if (!isOpen || !listing) return null;

  const hostSnapshot = bookingData?.hostDetails || bookingData?.hostSnapshot || (listing ? {
    name: listing.hostName,
    phone: listing.hostPhone,
    whatsApp: listing.hostWhatsApp || listing.hostPhone,
    specificAddress: listing.specificAddress
  } : null);
  const rawWa = hostSnapshot?.whatsApp || hostSnapshot?.phone || listing?.hostWhatsApp || listing?.hostPhone || '';
  const cleanWa = rawWa ? String(rawWa).replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanWa 
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hi ${hostSnapshot?.name || 'Host'}, I have confirmed my booking (${bookingRef}) for "${listing.title}" on Last Dance Accommodations. Looking forward to connecting!`)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-black/[0.08] shadow-2xl flex flex-col justify-between"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-black/[0.08] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#5e2590]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-black/50">
                Accommodation Booking &amp; Connection
              </span>
              <h3 className="text-[17px] sm:text-[18px] font-medium text-black leading-tight truncate max-w-[260px] sm:max-w-md">
                {listing.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* STEP 1: GUEST FORM */}
          {step === 'form' && (
            <form onSubmit={handleInitiateBooking} className="space-y-4">
              {/* Accommodation Summary Box */}
              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/5 shrink-0">
                    <img 
                      src={listing.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&auto=format&fit=crop&q=80'} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-black">{listing.title}</p>
                    <p className="text-[11.5px] text-black/60 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#5e2590]" />
                      Zone: {listing.locationZone} • KES {Number(listing.pricePerNightKES).toLocaleString()}/night
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-[#5e2590] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Connection Fee
                  </span>
                  <p className="text-[15px] font-bold text-black mt-0.5">KES 100</p>
                </div>
              </div>

              {/* Guest Full Name */}
              <div>
                <label className="block text-[12.5px] font-medium text-black/75 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-black/50" />
                  <span>Your Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frank Maina"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590] transition"
                />
              </div>

              {/* M-Pesa Phone Number */}
              <div>
                <label className="block text-[12.5px] font-medium text-black/75 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-black/50" />
                  <span>M-Pesa Phone Number (for KES 100 Connection Fee STK Push) *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0712345678 or 254712345678"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590] transition"
                />
                <p className="text-[11px] text-black/50 mt-1">
                  You will receive an instant M-Pesa PIN prompt on this phone.
                </p>
              </div>

              {/* Guest Email (Optional for notification) */}
              <div>
                <label className="block text-[12.5px] font-medium text-black/75 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-black/50" />
                  <span>Email Address (Optional, for stay pass &amp; host contacts)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590] transition"
                />
              </div>

              {/* Occupants & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-black/75 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-black/50" />
                    <span>Guests</span>
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-[13px] bg-white focus:outline-hidden focus:border-[#5e2590]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map(n => (
                      <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-black/75 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-black/50" />
                    <span>Check-In</span>
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden focus:border-[#5e2590]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-black/75 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-black/50" />
                    <span>Check-Out</span>
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden focus:border-[#5e2590]"
                  />
                </div>
              </div>

              {/* Special Requests / Notes */}
              <div>
                <label className="block text-[12px] font-medium text-black/75 mb-1">
                  Notes for Host (Arrival time, luggage requests, etc.)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Arriving around 5 PM with one small suitcase."
                  value={guestNotes}
                  onChange={(e) => setGuestNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-black/15 text-[13px] focus:outline-hidden focus:border-[#5e2590] resize-none"
                />
              </div>

              {/* Platform Terms of Service Disclaimer Checkbox */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3.5 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-left">
                  <input
                    type="checkbox"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-sm border-black/25 text-[#5e2590] focus:ring-[#5e2590]"
                  />
                  <div className="text-[12px] text-black/75 leading-relaxed">
                    <strong className="text-black">I accept the Platform Connector Terms:</strong> Last Dance Festival operates solely as a discovery connector and is not the property owner or insurer. Nightly fees are arranged directly with the host.
                  </div>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[14px] font-medium transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Pay KES 100 &amp; Unlock Host Contacts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: PROMPTING STK */}
          {step === 'prompting' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-[#5e2590] mx-auto flex items-center justify-center animate-spin">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-[17px] font-bold text-black">Connecting to M-Pesa...</h4>
                <p className="text-[13px] text-black/60 mt-1">
                  Dispatching STK push to <strong className="text-black">{guestPhone}</strong>
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: POLLING */}
          {step === 'polling' && (
            <div className="py-8 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
                <div className="absolute inset-0 rounded-full border-4 border-[#5e2590] border-t-transparent animate-spin" />
                <Smartphone className="w-8 h-8 text-[#5e2590]" />
              </div>

              <div>
                <h4 className="text-[18px] font-bold text-black">Check Your Handset</h4>
                <p className="text-[13px] text-black/65 mt-1 max-w-sm mx-auto">
                  An M-Pesa prompt for <strong className="text-black">KES 100</strong> has been sent to <strong className="text-black">{guestPhone}</strong>. Enter your PIN to verify booking.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#5e2590] text-[12px] font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Waiting for confirmation ({pollCountdown}s)</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[12px] text-left">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={isVerifyingManually}
                  className="w-full py-2.5 rounded-full border border-[#5e2590] text-[#5e2590] hover:bg-purple-50 text-[13px] font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifyingManually ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking with Safaricom...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>I have entered my PIN — Verify Payment</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-[12px] text-black/45 hover:text-black py-1 transition"
                >
                  Cancel or edit phone number
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <div className="space-y-5 py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-[20px] font-bold text-black">Booking Connected!</h4>
                <p className="text-[13px] text-black/60 max-w-sm mx-auto">
                  Your KES 100 connection fee was confirmed. Host contact details are unlocked below:
                </p>
              </div>

              {/* Host Unlocked Snapshot */}
              <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Verified Host Snapshot
                  </span>
                  <span className="text-[11.5px] font-mono font-bold text-emerald-900">
                    Ref: {bookingRef}
                  </span>
                </div>

                <div className="space-y-2 text-[13.5px]">
                  <p className="font-bold text-black flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>Host: {hostSnapshot?.name || 'Verified Property Host'}</span>
                  </p>
                  <p className="text-black/80 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Calling Handset: <strong>{hostSnapshot?.phone || 'Provided via SMS'}</strong></span>
                  </p>
                  <p className="text-black/80 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Specific Address: <strong>{hostSnapshot?.specificAddress || listing.locationZone}</strong></span>
                  </p>
                </div>

                {/* Direct WhatsApp Button */}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[13.5px] font-medium transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Direct WhatsApp Chat with Host</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                )}
              </div>

              {/* Stay Details Reminder */}
              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-4 text-[12.5px] text-black/75 space-y-1.5">
                <p><strong>Property:</strong> {listing.title} ({listing.propertyType})</p>
                <p><strong>Check-In:</strong> {checkInDate} • <strong>Check-Out:</strong> {checkOutDate}</p>
                <p><strong>Nightly Rate:</strong> KES {Number(listing.pricePerNightKES).toLocaleString()} (Pay host directly on arrival)</p>
                <p className="text-[11.5px] text-black/55 pt-1">
                  An SMS and email confirmation have also been dispatched to your handset.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <a
                  href={`/last-dance/accommodations/booking/${bookingRef}`}
                  className="flex-1 py-3 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13.5px] font-medium transition text-center shadow-md"
                >
                  View Full Booking Receipt
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-full border border-black/15 text-[13px] font-medium text-black hover:bg-black/5 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FAILED */}
          {step === 'failed' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-[18px] font-bold text-black">Payment Could Not Complete</h4>
                <p className="text-[13px] text-black/60 mt-1 max-w-sm mx-auto">
                  {errorMessage || 'Your M-Pesa transaction was cancelled or timed out.'}
                </p>
              </div>

              <div className="flex gap-2.5 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-6 py-2.5 rounded-full bg-[#5e2590] text-white text-[13px] font-medium hover:bg-[#762e99] transition"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-black/15 text-[13px] font-medium text-black hover:bg-black/5 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
