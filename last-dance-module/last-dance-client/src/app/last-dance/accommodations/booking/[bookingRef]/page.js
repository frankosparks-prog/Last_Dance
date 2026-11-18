'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, Sparkles, MapPin, Phone, Mail, Calendar, 
  Users, Bed, ShieldCheck, Printer, Share2, ArrowLeft, RefreshCw,
  UserCheck, AlertCircle, Home, Receipt, DollarSign,
  FileText, MessageSquare, Smartphone, Check, Lock, ExternalLink
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AccommodationBookingDetailsPage() {
  const params = useParams();
  const bookingRef = params?.bookingRef;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!bookingRef) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/booking/${bookingRef}`);
      if (res.data?.success && res.data.booking) {
        setBooking(res.data.booking);
        setError('');
      } else {
        setError('Stay reservation not found.');
      }
    } catch (err) {
      console.error('Stay reservation fetch error:', err);
      setError(err.response?.data?.message || 'Unable to retrieve reservation details.');
    } finally {
      setLoading(false);
    }
  }, [bookingRef]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooking();
  }, [fetchBooking]);

  const handleCopyLink = () => {
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
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-[#5e2590] animate-spin mx-auto" />
          <p className="text-[14px] text-black/60 font-medium">Retrieving Stay Reservation...</p>
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
        <div className="max-w-md w-full bg-white rounded-3xl border border-black/[0.08] p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-[20px] font-bold text-black">Reservation Not Found</h2>
          <p className="text-[13px] text-black/60 leading-relaxed">
            {error || 'We could not locate this accommodation booking reference.'}
          </p>
          <div className="pt-2">
            <Link
              href="/last-dance/accommodations"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5e2590] text-white text-[13px] font-medium hover:bg-[#762e99] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Accommodations</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = booking.paymentStatus === 'completed';
  const listing = booking.listing || {};
  
  // Strictly reveal host contact ONLY if booking payment is completed
  const host = isCompleted
    ? (booking.hostDetails || booking.hostSnapshot || {})
    : {};
  const rules = listing.houseRules || {};

  const rawWa = isCompleted ? (host?.whatsApp || host?.phone || '') : '';
  const cleanWhatsApp = rawWa ? String(rawWa).replace(/[^0-9]/g, '') : '';
  const whatsappUrl = (isCompleted && cleanWhatsApp)
    ? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`Hi ${host?.name || 'Host'}, I have confirmed booking ${booking.bookingRef} for "${listing?.title || 'your property'}" on Last Dance Accommodations. Connecting regarding check-in & directions.`)}`
    : null;

  return (
    <div 
      className="min-h-screen bg-[#f7f7f7] py-10 sm:py-14 print:bg-white print:py-0"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Navigation & Action Bar (Hidden on Print) */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href="/last-dance/accommodations"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-black/60 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Accommodations Marketplace</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 bg-white text-[12px] font-medium text-black/70 hover:bg-black/5 transition shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-black/50" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 bg-white text-[12px] font-medium text-black/70 hover:bg-black/5 transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-black/50" />
              <span>Print Details</span>
            </button>
          </div>
        </div>

        {/* Main Stay Pass / Receipt Card */}
        <div className="bg-white rounded-3xl border border-black/[0.08] shadow-sm overflow-hidden space-y-0">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-purple-200 bg-white/10 px-3 py-1 rounded-full mb-2">
                Last Dance Festival 2026 • Stay Confirmation
              </span>
              <h1 className="text-[22px] sm:text-[26px] font-normal leading-tight">
                Verified Stay Reservation
              </h1>
              <p className="text-[13px] text-purple-100/80 mt-1">
                Ref: <strong className="text-white font-mono">{booking.bookingRef}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              {isCompleted ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[12.5px] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Connection Verified</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[12.5px] font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-300" />
                  <span>Pending Payment</span>
                </div>
              )}
            </div>
          </div>

          {/* Host Contact Section: Unlocked (Paid) vs Locked (Pending / Unpaid) */}
          <div className="p-6 sm:p-8 space-y-6">
            {isCompleted ? (
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-emerald-950">
                        Unlocked Host Contact &amp; Location
                      </h3>
                      <p className="text-[12px] text-emerald-800">
                        Connect directly with the host to coordinate arrival and keys
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-medium transition shadow-sm shrink-0"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    )}

                    {host.phone && (
                      <a
                        href={`tel:${host.phone}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-[13px] font-medium transition shadow-2xs shrink-0"
                      >
                        <Phone className="w-4 h-4 text-emerald-700" />
                        <span>Call Host</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Host Name</p>
                    <p className="font-bold text-black text-[15px]">{host.name || 'Verified Property Host'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Calling Handset</p>
                    <p className="font-bold text-black text-[15px] flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-700" />
                      {host.phone ? (
                        <a href={`tel:${host.phone}`} className="hover:underline text-emerald-950 font-bold">{host.phone}</a>
                      ) : (
                        <span className="text-black/60 font-medium">Provided via SMS</span>
                      )}
                    </p>
                  </div>

                  {(host.whatsApp || whatsappUrl) && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">WhatsApp Number</p>
                      <p className="font-bold text-black text-[15px] flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-700" />
                        {whatsappUrl ? (
                          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-950 font-bold">
                            {host.whatsApp || host.phone}
                          </a>
                        ) : (
                          <span>{host.whatsApp || host.phone}</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="sm:col-span-2 space-y-1 pt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Exact Specific Address &amp; Landmarks</span>
                    </p>
                    <p className="text-black/85 text-[14px] bg-white p-3 rounded-xl border border-emerald-200/80 leading-relaxed font-medium">
                      {host.specificAddress || listing.specificAddress || `Zone: ${listing.locationZone}`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-amber-950">
                        Host Contact &amp; Exact Location Locked
                      </h3>
                      <p className="text-[12px] text-amber-800">
                        Awaiting confirmed KES 100 connection fee payment to reveal host credentials
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 self-start sm:self-auto">
                    Payment Required
                  </span>
                </div>

                <p className="text-[13px] text-amber-900 leading-relaxed">
                  To protect property hosts from unsolicited inquiries and ensure verified student reservations, direct calling numbers, WhatsApp messaging links, and specific house landmarks are unlocked only after successful payment confirmation.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/last-dance/accommodations"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13px] font-medium transition shadow-sm"
                  >
                    <span>Back to Accommodations</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                  <button
                    type="button"
                    onClick={fetchBooking}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 text-[13px] font-medium transition shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Payment Status</span>
                  </button>
                </div>
              </div>
            )}

            {/* Property Stay Details */}
            <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-5 sm:p-6 space-y-4">
              <h3 className="text-[15px] font-bold text-black flex items-center gap-2">
                <Home className="w-4 h-4 text-[#5e2590]" />
                <span>Accommodation Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] text-black/80">
                <div>
                  <p className="text-[11px] text-black/50 uppercase font-medium">Property</p>
                  <p className="font-bold text-black text-[15px]">{listing.title || 'Reserved Property'}</p>
                  <p className="text-[12px] text-black/60">{listing.propertyType} • Zone: {listing.locationZone}</p>
                </div>

                <div>
                  <p className="text-[11px] text-black/50 uppercase font-medium">Stay Duration</p>
                  <p className="font-bold text-black text-[14px]">
                    {booking.checkInDate} &rarr; {booking.checkOutDate}
                  </p>
                  <p className="text-[12px] text-black/60">Occupants: {booking.guestCount} guest(s)</p>
                </div>
              </div>

              {booking.guestNotes && (
                <div className="pt-2 text-[12.5px] text-black/70">
                  <span className="font-bold text-black">Guest Notes:</span> {booking.guestNotes}
                </div>
              )}
            </div>

            {/* Strict House Rules Review */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-3 text-[12.5px]">
              <h4 className="text-[13px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Strict House Rules For This Property</span>
              </h4>

              <div className="space-y-1.5 text-amber-900">
                {rules.noParties && <p>• <strong>Parties:</strong> Strictly no parties or loud gatherings.</p>}
                {rules.noSmoking && <p>• <strong>Smoking:</strong> Strictly no indoor smoking or vaping.</p>}
                {rules.quietHours && <p>• <strong>Quiet Hours:</strong> {rules.quietHours}</p>}
                {rules.extraVisitors && <p>• <strong>Visitors:</strong> {rules.extraVisitors}</p>}
                {rules.customRules && <p>• <strong>Host Notice:</strong> {rules.customRules}</p>}
              </div>
            </div>

            {/* Financial Ledger & Payment Proof */}
            <div className="rounded-2xl border border-black/[0.08] p-5 space-y-3">
              <h4 className="text-[13px] font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#5e2590]" />
                <span>Payment &amp; Connection Fee Audit</span>
              </h4>

              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between py-1 border-b border-black/[0.06]">
                  <span className="text-black/60">Connection Fee Paid</span>
                  <span className="font-bold text-black">KES {booking.connectionFeeKES || 100}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.06]">
                  <span className="text-black/60">M-Pesa Receipt Code</span>
                  <span className="font-mono font-bold text-emerald-700">{booking.mpesaReceiptNumber || 'Verified by Gateway'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.06]">
                  <span className="text-black/60">Nightly Stay Fee (Payable directly to host upon arrival)</span>
                  <span className="font-bold text-black">KES {Number(listing.pricePerNightKES || 0).toLocaleString()} / night</span>
                </div>
              </div>
            </div>

            {/* Platform Terms Connector Reminder */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-[12px] text-purple-950 leading-relaxed">
              <strong>Platform Notice:</strong> Last Dance Festival acts solely as a connector and is not the property owner or insurer. All stay logistics, security deposits, and keys are managed directly between host and guest.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
