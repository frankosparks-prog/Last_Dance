'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, Sparkles, MapPin, Phone, Mail, Calendar, 
  Clock, ShieldCheck, Printer, Share2, ArrowLeft, RefreshCw,
  UserCheck, AlertCircle, ShoppingBag, Receipt, DollarSign,
  FileText, MessageSquare, Smartphone, Check
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export default function ServiceBookingDetailsPage() {
  const params = useParams();
  const bookingRef = params?.bookingRef;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Deposit Retry / Payment states
  const [retryPhone, setRetryPhone] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [isPollingDeposit, setIsPollingDeposit] = useState(false);
  const [depositCheckoutID, setDepositCheckoutID] = useState('');
  const [pollCountdown, setPollCountdown] = useState(60);
  const [isVerifyingManually, setIsVerifyingManually] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!bookingRef) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/services/booking/${bookingRef}`);
      if (res.data?.success && res.data.booking) {
        setBooking(res.data.booking);
        if (!retryPhone && res.data.booking.clientPhone) {
          setRetryPhone(res.data.booking.clientPhone);
        }
        setError('');
      } else {
        setError('Booking record not found.');
      }
    } catch (err) {
      console.error('Booking fetch error:', err);
      setError(err.response?.data?.message || 'Unable to retrieve booking details.');
    } finally {
      setLoading(false);
    }
  }, [bookingRef, retryPhone]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooking();
  }, [fetchBooking]);

  // Real-time socket subscription
  useEffect(() => {
    if (!bookingRef) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      path: '/api/socket.io'
    });

    socket.on(`last_dance:service_booking_updated:${bookingRef}`, (updatedBooking) => {
      if (updatedBooking) {
        setBooking(updatedBooking);
        setIsPollingDeposit(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingRef]);

  // Polling logic when deposit STK push is active
  useEffect(() => {
    let pollInterval = null;
    let countdownInterval = null;

    if (isPollingDeposit && depositCheckoutID) {
      pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/last-dance/services/payment-status/${depositCheckoutID}`);
          if (res.data?.success && res.data.status === 'completed') {
            clearInterval(pollInterval);
            clearInterval(countdownInterval);
            setIsPollingDeposit(false);
            setRetryMessage('Payment received and verified successfully!');
            fetchBooking();
          } else if (res.data?.status === 'failed') {
            clearInterval(pollInterval);
            clearInterval(countdownInterval);
            setIsPollingDeposit(false);
            setRetryMessage(res.data.message || 'Payment was cancelled or failed.');
            fetchBooking();
          }
        } catch (e) {
          // Keep polling
        }
      }, 2500);

      countdownInterval = setInterval(() => {
        setPollCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(pollInterval);
            clearInterval(countdownInterval);
            setIsPollingDeposit(false);
            setRetryMessage('Verification timeout. If prompted, please check status manually below.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isPollingDeposit, depositCheckoutID, fetchBooking]);

  const handleRetryDeposit = async (e) => {
    if (e) e.preventDefault();
    if (!retryPhone.trim()) {
      alert('Please enter a valid phone number for the M-Pesa prompt.');
      return;
    }

    setIsRetrying(true);
    setRetryMessage('');

    try {
      const res = await axios.post(`${API_BASE_URL}/last-dance/services/booking/${bookingRef}/pay-deposit`, {
        phone: retryPhone.trim()
      });

      if (res.data?.success && res.data.checkoutRequestID) {
        setDepositCheckoutID(res.data.checkoutRequestID);
        setPollCountdown(60);
        setIsPollingDeposit(true);
        setRetryMessage(res.data.message || 'STK Push sent. Please enter your PIN on your phone.');
      } else {
        setRetryMessage(res.data?.message || 'Could not send STK push.');
      }
    } catch (err) {
      setRetryMessage(err.response?.data?.message || 'Payment prompt failed. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleVerifyManually = async () => {
    const targetID = depositCheckoutID || booking?.depositCheckoutRequestID;
    if (!targetID) {
      fetchBooking();
      return;
    }

    setIsVerifyingManually(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/services/payment-status/${targetID}`);
      if (res.data?.success && res.data.status === 'completed') {
        setIsPollingDeposit(false);
        setRetryMessage('Deposit verified successfully!');
        fetchBooking();
      } else if (res.data?.status === 'failed') {
        setIsPollingDeposit(false);
        setRetryMessage(res.data.message || 'Payment failed or cancelled.');
        fetchBooking();
      } else {
        setRetryMessage('Payment is still awaiting M-Pesa PIN confirmation.');
      }
    } catch (err) {
      setRetryMessage('Status check failed. Please ensure PIN is entered on your phone.');
    } finally {
      setIsVerifyingManually(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        <div className="text-center">
          <RefreshCw className="w-7 h-7 text-[#762e99] animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-black/60 font-medium">Loading booking & order details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div 
        className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center border border-black/[0.08] shadow-xs">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-[20px] font-medium text-black">Booking Not Found</h2>
          <p className="text-[13px] text-black/60 mt-1">{error || 'Invalid booking reference code.'}</p>
          <Link
            href="/last-dance/services"
            className="mt-5 inline-flex items-center space-x-2 text-[13px] font-medium text-white bg-[#5e2590] hover:bg-[#762e99] px-5 py-2.5 rounded-full transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  const isDepositPaid = booking.depositStatus === 'completed';
  const isDepositFailed = booking.depositStatus === 'failed';
  const isDepositPending = booking.depositStatus === 'pending' || !isDepositPaid;
  const isBalancePaid = booking.balanceStatus === 'completed';
  const hasProvider = !!booking.assignedProvider?.name;

  return (
    <div 
      className="min-h-screen bg-[#f7f7f7] text-black py-8 sm:py-12 px-4 sm:px-6"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="max-w-[840px] mx-auto space-y-5">
        {/* Top Navigation & Action Controls */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/last-dance/services"
            className="inline-flex items-center space-x-2 text-[13px] font-medium text-black/70 hover:text-black bg-white px-4 py-2 rounded-full border border-black/10 transition hover:border-[#ff914d] hover:text-[#ff914d]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Services &amp; Merch</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 text-[13px] font-medium text-black/70 bg-white px-4 py-2 rounded-full border border-black/10 hover:border-[#ff914d] hover:text-[#ff914d] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share Details'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 text-[13px] font-medium text-white bg-[#5e2590] hover:bg-[#762e99] px-4 py-2 rounded-full transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

        {/* Deposit Warning Banner if Payment is NOT yet completed */}
        {!isDepositPaid && (
          <div className={`p-4 rounded-2xl border text-[13px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDepositFailed 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isDepositFailed ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <p className="font-medium text-[14px]">
                  {isDepositFailed ? 'Deposit Payment Unconfirmed / Cancelled' : 'Deposit Payment Pending'}
                </p>
                <p className="text-[12.5px] opacity-85 mt-0.5">
                  {isDepositFailed 
                    ? `Payment of KES ${Number(booking.depositAmountKES).toLocaleString()} was not completed. Re-prompt below to secure your booking.`
                    : `Awaiting M-Pesa confirmation of KES ${Number(booking.depositAmountKES).toLocaleString()}. Enter PIN on handset or retry.`
                  }
                </p>
              </div>
            </div>

            <a
              href="#pay-deposit-section"
              className="shrink-0 px-4 py-2 rounded-full bg-[#5e2590] text-white text-[12px] font-medium hover:bg-[#762e99] transition shadow-xs"
            >
              Pay Deposit Now
            </a>
          </div>
        )}

        {/* Main Details & Receipt Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#5e2590] to-[#762e99] p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full border border-white/20">
                  {booking.serviceCategory} &bull; Booking Receipt
                </span>
                <h1 className="text-[24px] sm:text-[28px] font-normal tracking-[-0.02em] leading-tight mt-2.5 text-white">
                  {booking.serviceTitle}
                </h1>
                <p className="text-[13px] text-white/80 mt-1">
                  Last Dance Festival 2026 Marketplace &bull; Order Details
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 text-left sm:text-right shrink-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/70">Booking Reference</p>
                <p className="text-[20px] font-bold font-mono tracking-wider text-white mt-0.5">
                  {booking.bookingRef}
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Status Progress Stepper */}
            <div>
              <p className="text-[11px] font-medium text-black/50 uppercase tracking-wider mb-2.5">Order &amp; Fulfillment Status</p>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {/* 1. Deposit Paid Status */}
                <div className={`p-3.5 rounded-xl border ${
                  isDepositPaid 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : isDepositFailed 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                    isDepositPaid 
                      ? 'bg-emerald-600 text-white' 
                      : isDepositFailed 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-amber-500 text-white'
                  }`}>
                    {isDepositPaid ? '✓' : isDepositFailed ? '✕' : '⏳'}
                  </div>
                  <p className="font-medium text-[13px] mt-1.5">
                    {isDepositPaid ? 'Deposit Paid' : isDepositFailed ? 'Deposit Incomplete' : 'Deposit Pending'}
                  </p>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    KES {Number(booking.depositAmountKES).toLocaleString()}
                  </p>
                </div>

                {/* 2. Specialist / Provider Assignment */}
                <div className={`p-3.5 rounded-xl border ${
                  hasProvider ? 'bg-purple-50 border-purple-200 text-[#5e2590]' : 'bg-[#f7f7f7] border-black/10 text-black/60'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                    hasProvider ? 'bg-[#5e2590] text-white' : 'bg-black/10 text-black/60'
                  }`}>
                    {hasProvider ? '✓' : '•'}
                  </div>
                  <p className="font-medium text-[13px] mt-1.5">
                    {hasProvider ? 'Specialist Assigned' : 'Assigning Specialist'}
                  </p>
                  <p className="text-[11px] truncate max-w-[130px] mx-auto mt-0.5 opacity-80">
                    {hasProvider ? booking.assignedProvider.name : 'In Queue'}
                  </p>
                </div>

                {/* 3. Final Balance */}
                <div className={`p-3.5 rounded-xl border ${
                  isBalancePaid 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-[#f7f7f7] border-black/10 text-black/70'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                    isBalancePaid ? 'bg-emerald-600 text-white' : 'bg-[#ff914d] text-white'
                  }`}>
                    {isBalancePaid ? '✓' : '•'}
                  </div>
                  <p className="font-medium text-[13px] mt-1.5">
                    {isBalancePaid ? 'Fully Paid' : 'Balance on Delivery'}
                  </p>
                  <p className="text-[11px] mt-0.5 opacity-80">
                    KES {Number(booking.remainingBalanceKES).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* If deposit is pending or failed, show the interactive M-Pesa prompt retry card */}
            {!isDepositPaid && (
              <div id="pay-deposit-section" className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-amber-900 font-medium text-[13.5px]">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>Complete Upfront Deposit (KES {Number(booking.depositAmountKES).toLocaleString()})</span>
                </div>

                <p className="text-[12.5px] text-amber-900/80 leading-relaxed">
                  Your reservation is held. An upfront deposit of KES {Number(booking.depositAmountKES).toLocaleString()} is required to confirm provider dispatch. Enter your M-Pesa number to receive the payment prompt:
                </p>

                <form onSubmit={handleRetryDeposit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    value={retryPhone}
                    onChange={(e) => setRetryPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="flex-1 px-4 py-2.5 rounded-full border border-amber-300 bg-white text-[13.5px] text-black outline-none focus:border-[#762e99]"
                  />
                  <button
                    type="submit"
                    disabled={isRetrying || isPollingDeposit}
                    className="px-6 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13px] font-medium transition disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Prompt...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Prompt M-Pesa PIN</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Polling / Manual Verification during active push */}
                {(isPollingDeposit || pollCountdown < 60) && (
                  <div className="pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-amber-900">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className={`w-3.5 h-3.5 ${isPollingDeposit ? 'animate-spin' : ''} text-amber-700`} />
                      <span>
                        {isPollingDeposit ? `Awaiting PIN entry on handset (${pollCountdown}s)` : 'Waiting for network response'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyManually}
                      disabled={isVerifyingManually}
                      className="px-4 py-1.5 rounded-full bg-white border border-amber-300 text-amber-900 font-medium hover:bg-amber-100/50 transition flex items-center space-x-1.5"
                    >
                      {isVerifyingManually ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>I Have Entered PIN — Verify</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {retryMessage && (
                  <p className="text-[12px] font-medium text-amber-800 bg-amber-100/60 p-2.5 rounded-xl">
                    {retryMessage}
                  </p>
                )}
              </div>
            )}

            {/* Customer & Booking Details */}
            <div className="bg-[#f7f7f7] rounded-xl p-5 border border-black/[0.08] space-y-4 text-xs">
              <div className="flex items-center space-x-2 text-black/70 font-medium border-b border-black/[0.08] pb-2">
                <FileText className="w-4 h-4 text-[#762e99]" />
                <span className="text-[12px] uppercase tracking-wide">Client &amp; Service Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-black/45 text-[11px]">Booked By:</span>
                  <p className="font-medium text-black text-[14px] mt-0.5">{booking.clientName}</p>
                </div>

                <div>
                  <span className="text-black/45 text-[11px]">Contact Handset:</span>
                  <p className="font-medium text-black text-[14px] mt-0.5">{booking.clientPhone}</p>
                </div>

                <div>
                  <span className="text-black/45 text-[11px]">Email Address:</span>
                  <p className="font-medium text-black text-[14px] mt-0.5">{booking.clientEmail}</p>
                </div>

                <div>
                  <span className="text-black/45 text-[11px]">Booking Timestamp:</span>
                  <p className="font-medium text-black text-[14px] mt-0.5">
                    {new Date(booking.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Place of Service / Product Collection */}
            <div className="bg-purple-50/50 rounded-xl p-5 border border-purple-100/80 flex items-start space-x-3.5 text-xs">
              <MapPin className="w-4 h-4 text-[#5e2590] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-[#762e99] text-[12px]">Place of Service or Collection:</p>
                <p className="text-[14px] font-medium text-black mt-1">{booking.preferredLocation}</p>
                {booking.scheduledDate && (
                  <p className="text-[12px] text-black/60 mt-1">
                    Scheduled: <strong>{booking.scheduledDate}</strong> {booking.scheduledTimeSlot ? `(${booking.scheduledTimeSlot})` : ''}
                  </p>
                )}
                {booking.clientNotes && (
                  <p className="text-[11.5px] text-black/55 italic mt-1.5 pt-1.5 border-t border-purple-200/50">
                    Client Note: &quot;{booking.clientNotes}&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Assigned Specialist Details (if assigned by admin) */}
            {hasProvider ? (
              <div className="bg-purple-50/40 rounded-xl p-5 border border-purple-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#5e2590] text-white flex items-center justify-center font-medium shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-[#762e99] uppercase tracking-wider">Assigned Specialist</span>
                    <p className="font-medium text-black text-[14px]">{booking.assignedProvider.name}</p>
                    {booking.assignedProvider.phone && (
                      <p className="text-[12px] text-black/60 mt-0.5">Phone: {booking.assignedProvider.phone}</p>
                    )}
                    {booking.assignedProvider.assignmentNotes && (
                      <p className="text-[11.5px] text-[#5e2590] italic mt-0.5">
                        Note: &quot;{booking.assignedProvider.assignmentNotes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {booking.assignedProvider.phone && (
                  <a
                    href={`tel:${booking.assignedProvider.phone}`}
                    className="self-start sm:self-auto px-4 py-2 rounded-full bg-white text-[#5e2590] font-medium text-[12px] border border-black/10 hover:border-[#ff914d] hover:text-[#ff914d] transition shadow-xs"
                  >
                    Call Specialist
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-[#f7f7f7] rounded-xl p-4 border border-black/[0.08] flex items-center space-x-3 text-xs text-black/60">
                <div className="w-7 h-7 rounded-full bg-black/10 text-black/50 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-medium text-black text-[13px]">Specialist Assignment in Progress</p>
                  <p className="text-[11.5px] text-black/55 mt-0.5">
                    Our team will pair your order with a verified service provider. You will receive an SMS update once linked.
                  </p>
                </div>
              </div>
            )}

            {/* Financial Details / Payment Receipt Summary */}
            <div className="border border-black/[0.08] rounded-xl overflow-hidden text-xs">
              <div className="bg-[#f7f7f7] px-5 py-3 border-b border-black/[0.08] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-black/50" />
                  <span className="font-medium text-black uppercase tracking-wider text-[11px]">Payment Summary</span>
                </div>
                <span className="text-[11px] font-mono text-black/50">Ref: {booking.bookingRef}</span>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-black/70">
                  <span className="text-[13px]">Total Service / Item Price</span>
                  <span className="font-medium text-black text-[15px]">KES {Number(booking.totalPriceKES).toLocaleString()}</span>
                </div>

                {/* Conditional Upfront Deposit Row */}
                {isDepositPaid ? (
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                    <div>
                      <span className="font-medium text-[13px]">✓ Upfront Deposit Paid</span>
                      {booking.depositReceiptNumber && (
                        <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                          M-Pesa Receipt: {booking.depositReceiptNumber}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-emerald-800 text-[15px]">
                      KES {Number(booking.depositAmountKES).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                    <div>
                      <span className="font-medium text-[13px]">⏳ Upfront Deposit Pending</span>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Awaiting payment confirmation
                      </p>
                    </div>
                    <span className="font-bold text-amber-900 text-[15px]">
                      KES {Number(booking.depositAmountKES).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Remaining Balance Row */}
                <div className="flex justify-between items-center pt-2 border-t border-black/[0.07]">
                  <div>
                    <span className="font-medium text-black text-[13px]">Remaining Balance</span>
                    <p className="text-[11.5px] text-black/50 mt-0.5">
                      {isBalancePaid ? 'Cleared via M-Pesa' : 'Prompted after service or product delivery'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-[15px] ${isBalancePaid ? 'text-emerald-700' : 'text-black'}`}>
                      KES {Number(booking.remainingBalanceKES).toLocaleString()}
                    </span>
                    {isBalancePaid ? (
                      <p className="text-[11px] text-emerald-600 font-medium">Receipt: {booking.balanceReceiptNumber || 'Paid'}</p>
                    ) : (
                      <p className="text-[11px] text-black/50 font-medium">Due on Delivery</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Helpful Delivery Notes */}
            <div className="p-4 rounded-xl bg-[#f7f7f7] border border-black/[0.08] text-black/60 text-[12px] leading-relaxed">
              <p className="font-medium text-black mb-1">What to expect next:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your reservation is saved to your browser and sent to your email &amp; SMS.</li>
                <li>Your specialist or delivery runner will contact you at <strong>{booking.clientPhone}</strong> to coordinate meetup.</li>
                <li>Upon completion, the remaining balance of KES {Number(booking.remainingBalanceKES).toLocaleString()} will be prompted to your handset via M-Pesa.</li>
              </ul>
            </div>
          </div>

          {/* Footer Strip */}
          <div className="bg-[#f7f7f7] p-4 border-t border-black/[0.08] text-center text-[12px] text-black/40">
            Last Dance Festival 2026 &bull; Official Graduation Eve Marketplace Order Details
          </div>
        </div>
      </div>
    </div>
  );
}
