'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, CheckCircle2, AlertCircle, RefreshCw, Phone, Mail, 
  User, MapPin, Calendar, Clock, Sparkles, ShieldCheck, 
  ArrowRight, ExternalLink, Smartphone, Check
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const LOCATION_PRESETS = [
  'Egerton Gate',
  'Campus Pavilion',
  'Njokerio',
  'Hostel',
  'Student Center'
];

export default function ServiceBookingModal({ service, isOpen, onClose, onBookingSuccess }) {
  const [step, setStep] = useState('form'); // 'form' | 'prompting' | 'polling' | 'success' | 'failed'
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [locationPreset, setLocationPreset] = useState(LOCATION_PRESETS[0]);
  const [specificLocation, setSpecificLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-10-26');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('Afternoon (2 PM - 6 PM)');
  const [clientNotes, setClientNotes] = useState('');

  // Payment tracking
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [pollCountdown, setPollCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const [depositReceipt, setDepositReceipt] = useState('');
  const [isVerifyingManually, setIsVerifyingManually] = useState(false);

  // Reset modal when opened with a new service
  useEffect(() => {
    if (isOpen && service) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('form');
      setErrorMessage('');
      setPollCountdown(60);
    }
  }, [isOpen, service]);

  const verifyPaymentRecord = useCallback(async () => {
    if (!checkoutRequestID) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/services/payment-status/${checkoutRequestID}`);
      
      if (res.data?.success && res.data.status === 'completed') {
        setDepositReceipt(res.data.receipt || '');
        
        // Persist booking reference in localStorage for frictionless guest dashboard access
        try {
          if (typeof window !== 'undefined') {
            const stored = JSON.parse(localStorage.getItem('last_dance_my_bookings') || '[]');
            const newEntry = {
              bookingRef: res.data.bookingRef || bookingRef,
              serviceTitle: service?.title || '',
              serviceCategory: service?.category || '',
              depositAmountKES: service?.depositAmountKES || 50,
              totalPriceKES: service?.totalPriceKES || 0,
              remainingBalanceKES: Math.max(0, (service?.totalPriceKES || 0) - (service?.depositAmountKES || 50)),
              preferredLocation: specificLocation ? `${locationPreset} - ${specificLocation}` : locationPreset,
              depositReceiptNumber: res.data.receipt || '',
              status: 'confirmed',
              createdAt: new Date().toISOString()
            };
            
            // Prepend and deduplicate
            const filtered = stored.filter(b => b.bookingRef !== newEntry.bookingRef);
            localStorage.setItem('last_dance_my_bookings', JSON.stringify([newEntry, ...filtered]));
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
    } catch (pollErr) {
      // Continue polling
    }
    return false;
  }, [checkoutRequestID, bookingRef, service, locationPreset, specificLocation, onBookingSuccess]);

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
            setErrorMessage('Payment verification timed out. If you entered your PIN, you can check status manually below.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [step, checkoutRequestID, verifyPaymentRecord]);

  const handleManualVerify = async () => {
    setIsVerifyingManually(true);
    try {
      const isDone = await verifyPaymentRecord();
      if (!isDone && step !== 'failed') {
        setErrorMessage('Awaiting M-Pesa network confirmation. Please ensure your PIN is entered.');
      }
    } finally {
      setIsVerifyingManually(false);
    }
  };

  if (!isOpen || !service) return null;

  const depositKES = Number(service.depositAmountKES) || 50;
  const totalKES = Number(service.totalPriceKES) || 0;
  const balanceKES = Math.max(0, totalKES - depositKES);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Please fill in your Name, Phone Number, and Email.');
      return;
    }

    const fullLocation = specificLocation.trim() 
      ? `${locationPreset} (${specificLocation.trim()})`
      : locationPreset;

    setStep('prompting');
    setErrorMessage('');

    try {
      const res = await axios.post(`${API_BASE_URL}/last-dance/services/book`, {
        serviceId: service._id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        preferredLocation: fullLocation,
        scheduledDate,
        scheduledTimeSlot,
        clientNotes: clientNotes.trim()
      });

      if (res.data?.success && res.data.checkoutRequestID) {
        setCheckoutRequestID(res.data.checkoutRequestID);
        setBookingRef(res.data.bookingRef);
        setPollCountdown(60);
        setStep('polling');
      } else {
        throw new Error(res.data?.message || 'Failed to initiate M-Pesa prompt.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'M-Pesa payment prompt could not be initiated.');
      setStep('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-[500px] w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-black/[0.08]"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.08]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-[#5e2590] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#762e99]">
                {service.category}
              </span>
              <h2 className="text-[18px] font-medium text-black tracking-tight leading-tight mt-0.5">
                Book {service.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-black/40 hover:text-black rounded-full transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: GUEST BOOKING FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmitBooking} className="mt-5 space-y-4 text-xs">
            {/* Price & Deposit Summary Callout */}
            <div className="bg-[#f7f7f7] p-4 rounded-2xl border border-black/[0.08] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-black/50 uppercase tracking-wide">Total Price</p>
                <p className="text-[18px] font-medium text-black">KES {totalKES.toLocaleString()}</p>
                <p className="text-[11px] text-black/50 mt-0.5">Bal: KES {balanceKES.toLocaleString()} due on delivery</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-white text-[#5e2590] border border-black/10 px-3 py-1 rounded-full text-[12px] font-medium shadow-xs">
                  Pay KES {depositKES.toLocaleString()} Upfront
                </span>
                <p className="text-[11px] text-[#762e99] font-medium mt-1">Secures reservation now</p>
              </div>
            </div>

            {/* Client Full Name */}
            <div>
              <label className="block text-[12px] font-medium text-black mb-1">Your Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Christine Achieng"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-black/15 bg-transparent text-[13.5px] text-black outline-none focus:border-[#762e99]"
                />
              </div>
            </div>

            {/* Phone & Email (Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-black mb-1">
                  M-Pesa Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="07XXXXXXXX or 254..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-black/15 bg-transparent text-[13.5px] font-medium text-black outline-none focus:border-[#762e99]"
                  />
                </div>
                <p className="text-[10.5px] text-black/45 mt-1">Receives M-Pesa PIN prompt</p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-black mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-black/15 bg-transparent text-[13.5px] text-black outline-none focus:border-[#762e99]"
                  />
                </div>
                <p className="text-[10.5px] text-black/45 mt-1">Receives booking receipt</p>
              </div>
            </div>

            {/* Preferred Place of Service or Product Collection */}
            <div>
              <label className="block text-[12px] font-medium text-black mb-1">
                Preferred Place of Service / Product Collection *
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {LOCATION_PRESETS.map((loc) => (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => setLocationPreset(loc)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition ${
                      locationPreset === loc
                        ? 'border-[#5e2590] bg-[#5e2590] text-white'
                        : 'border-black/10 bg-white text-black/70 hover:border-[#ff914d] hover:text-[#ff914d]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Specific room, hostel block, or meetup point (e.g. Hall 4 Room 12)"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-black/15 bg-transparent text-[13px] text-black outline-none focus:border-[#762e99]"
                />
              </div>
            </div>

            {/* Time Slot Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-black mb-1">Preferred Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/15 bg-transparent text-[13px] text-black outline-none focus:border-[#762e99]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-black mb-1">Time Slot Preference</label>
                <select
                  value={scheduledTimeSlot}
                  onChange={(e) => setScheduledTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-transparent text-[13px] text-black outline-none focus:border-[#762e99]"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Graduation Eve Peak (4 PM - 8 PM)">Graduation Eve Peak (4 PM - 8 PM)</option>
                  <option value="Night Festival (8 PM onwards)">Night Festival (8 PM onwards)</option>
                </select>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-[12px] font-medium text-black mb-1">Special Requests / Style Notes (Optional)</label>
              <textarea
                rows="2"
                placeholder="e.g. Natural glam finish, specific hoodie size (M), bring chrome polish..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/15 bg-transparent text-[13px] text-black outline-none focus:border-[#762e99]"
              />
            </div>

            {/* Frictionless Notice */}
            <div className="flex items-center space-x-2 text-[11.5px] text-black/60 bg-[#f7f7f7] p-2.5 rounded-xl border border-black/[0.08]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No account needed! Your order and reservation details will be saved to your browser and sent via SMS &amp; Email.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] hover:opacity-95 text-white font-medium text-[13.5px] shadow-md flex items-center justify-center space-x-2 transition active:scale-[0.99]"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay Deposit of KES {depositKES} via M-Pesa</span>
            </button>
          </form>
        )}

        {/* STEP 2: PROMPTING M-PESA STK PUSH */}
        {step === 'prompting' && (
          <div className="py-12 text-center space-y-4">
            <RefreshCw className="w-9 h-9 text-[#762e99] animate-spin mx-auto" />
            <h3 className="text-[18px] font-medium text-black">Connecting to M-Pesa...</h3>
            <p className="text-[13px] text-black/60 max-w-xs mx-auto">
              Dispatching KES {depositKES} upfront deposit prompt to <strong>{phone}</strong>.
            </p>
          </div>
        )}

        {/* STEP 3: POLLING M-PESA PIN ENTRY */}
        {step === 'polling' && (
          <div className="py-6 text-left space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                Awaiting PIN Entry on Phone
              </div>

              <div className="text-[12px] text-black/50 font-medium">
                {pollCountdown}s remaining
              </div>
            </div>

            <div>
              <h3 className="text-[22px] font-medium tracking-tight text-black">
                Check your phone screen
              </h3>
              <p className="mt-1 text-[13.5px] text-black/70 leading-relaxed">
                An M-Pesa prompt for <strong>KES {depositKES}</strong> has been sent to <strong className="text-black">{phone}</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-[#f7f7f7] p-4 text-[12px] text-black/70 space-y-2">
              <div className="flex items-start gap-2">
                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">1</span>
                <span>Unlock your phone screen now.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">2</span>
                <span>Enter your M-Pesa PIN on the prompt to confirm your booking deposit.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">3</span>
                <span>Your booking will automatically confirm as soon as Safaricom approves.</span>
              </div>
            </div>

            {errorMessage && (
              <div className="border-l-2 border-amber-500 bg-amber-50 px-3.5 py-2.5 text-[12px] text-amber-800 rounded-r-lg">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-black/[0.08] pt-3 text-[12px] text-black/50">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${pollCountdown > 0 ? 'animate-spin' : ''} text-[#762e99]`} />
                <span>
                  {pollCountdown > 0 
                    ? `Verifying with M-Pesa network...`
                    : 'Awaiting network confirmation...'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleManualVerify}
                disabled={isVerifyingManually}
                className="w-full rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] py-3 px-4 text-[13px] font-medium text-white shadow-md hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifyingManually ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with Safaricom / PayHero...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I have entered my PIN — Verify Payment</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full rounded-full border border-black/15 py-2.5 text-[12.5px] font-medium text-black hover:bg-black/5 transition"
              >
                Cancel / Change Phone Number
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="py-6 text-left space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md text-xl font-bold">
              ✓
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Deposit Received &amp; Booking Confirmed
            </div>

            <h3 className="text-[24px] font-medium tracking-tight text-black">
              Reservation Confirmed!
            </h3>
            <p className="text-[13.5px] text-black/70">
              Upfront deposit of <strong>KES {depositKES}</strong> received (Receipt: {depositReceipt || 'Verified'}). Details have been sent to <strong>{email}</strong> &amp; <strong>{phone}</strong>.
            </p>

            <div className="bg-[#f7f7f7] p-4 rounded-xl border border-black/[0.08] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-black/50">Service / Item:</span>
                <span className="font-medium text-black">{service.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/50">Booking Reference:</span>
                <span className="font-mono font-bold text-[#5e2590]">{bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/50">Remaining Balance:</span>
                <span className="font-medium text-black">KES {balanceKES.toLocaleString()} (Due on Delivery)</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-black/[0.08]">
                <span className="text-black/50">Place of Service:</span>
                <span className="font-medium text-black truncate max-w-[200px]">{specificLocation || locationPreset}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href={`/last-dance/services/booking/${bookingRef}`}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white font-medium text-[13px] flex items-center justify-center space-x-1.5 shadow-md hover:opacity-95 transition"
              >
                <span>View Order Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-full border border-black/15 text-black font-medium text-[12.5px] hover:bg-black/5 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FAILED STATE */}
        {step === 'failed' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h3 className="text-[20px] font-medium text-black">Payment Not Completed</h3>
            <p className="text-[13px] text-rose-700 max-w-xs mx-auto">
              {errorMessage || 'The transaction was cancelled or timed out before completion.'}
            </p>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-5 py-2.5 rounded-full bg-[#5e2590] text-white font-medium text-[13px] hover:bg-[#762e99] transition shadow-xs"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-black/15 text-black font-medium text-[13px] hover:bg-black/5 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
